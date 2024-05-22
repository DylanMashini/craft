<script lang="ts">
	import { draggable } from "@neodrag/svelte";
	import { availibleItems, type Item } from "$lib/stores";
	import { isTouching, craft } from "$lib/utils";
	import { PUBLIC_SERVER_URL } from "$env/static/public";
	import Info from "./Info.svelte";

	let itemParent: HTMLDivElement;
	let deleteBox: HTMLDivElement;

	let timedMode = false;
	let startTime: number;
	let remainingTime: number;
	let selectedItemTimed: Item;

	let draggedElements: {
		emoji: string;
		name: string;
		id: string;
		X: number;
		Y: number;
		controlled: boolean;
		element?: HTMLDivElement;
		highlighted: boolean;
		crafting?: boolean;
	}[] = [];

	const dragStart = (
		emoji: string,
		name: string,
		startX: number,
		startY: number
	) => {
		draggedElements = [
			...draggedElements,
			{
				emoji: emoji,
				name: name,
				id: Date.now().toString(),
				X: startX,
				Y: startY,
				controlled: true,
				highlighted: false,
			},
		];

		document.body.style.userSelect = "none";
		draggedElements = draggedElements;

		let index = draggedElements.length - 1;

		let id = draggedElements[index].id;

		document.body.classList.add("dragging");

		function updatePosition(event: any) {
			if (draggedElements[index].id !== id) {
				index = draggedElements.findIndex(val => val.id === id);
				if (index === -1) {
					return;
				}
			}
			draggedElements[index].X = event.clientX - itemParent.offsetLeft;
			draggedElements[index].Y = event.clientY - itemParent.offsetTop;

			checkCollisionsWhileDragging();
			draggedElements = draggedElements;
		}

		addEventListener("mousemove", updatePosition);

		addEventListener(
			"mouseup",
			() => {
				removeEventListener("mousemove", updatePosition);
				document.body.style.userSelect = "";
				document.body.classList.remove("dragging");
				if (draggedElements[index].id !== id) {
					index = draggedElements.findIndex(val => val.id === id);
					if (index === -1) {
						return;
					}
				}
				draggedElements[index].controlled = false;
				checkCollisionsToCraft();
			},
			{
				once: true,
			}
		);
	};

	// Returns Indexes of Collided Objects
	const checkCollisions = () => {
		for (let i = 0; i < draggedElements.length; i++) {
			if (!draggedElements[i].element) continue;

			for (let j = i + 1; j < draggedElements.length; j++) {
				if (!draggedElements[j].element) continue;

				if (
					isTouching(
						draggedElements[i].element!,
						draggedElements[j].element!
					)
				) {
					return [i, j];
				}
			}
		}
		return [];
	};

	const checkCollisionsWhileDragging = () => {
		let collidedElements = checkCollisions();
		for (let i = 0; i < draggedElements.length; i++) {
			draggedElements[i].highlighted = false;
		}
		if (collidedElements.length !== 0) {
			draggedElements[collidedElements[0]].highlighted = true;
			draggedElements[collidedElements[1]].highlighted = true;
		}
		draggedElements = draggedElements;
	};

	const checkCollisionsToCraft = async () => {
		// First, check if any of items are in gray box, if so delete
		let idsToDelete = [];
		for (let i = 0; i < draggedElements.length; i++) {
			if (typeof draggedElements[i].element === "undefined") continue;
			// @ts-ignore
			if (isTouching(draggedElements[i].element, deleteBox)) {
				idsToDelete.push(draggedElements[i].id);
			}
		}

		draggedElements = draggedElements.filter(
			val => !idsToDelete.includes(val.id)
		);

		let collisions = checkCollisions();
		if (
			collisions.length === 0 ||
			draggedElements[collisions[0]].crafting ||
			draggedElements[collisions[1]].crafting
		)
			return;
		draggedElements[collisions[0]].crafting = true;
		draggedElements[collisions[1]].crafting = true;
		let item1 = draggedElements[collisions[0]];
		let item2 = draggedElements[collisions[1]];
		let result = await craft(item1, item2);

		if (!item1.element || !item2.element) return;

		let avgX =
			Math.round(
				(item1.element?.getBoundingClientRect().left +
					item2.element?.getBoundingClientRect().left) /
					2
			) - itemParent.offsetLeft;
		let avgY = Math.round((item1.Y + item2.Y) / 2);

		draggedElements = draggedElements.filter(
			val =>
				val.id !== draggedElements[collisions[0]].id &&
				val.id !== draggedElements[collisions[1]].id
		);

		draggedElements = [
			...draggedElements,
			{
				emoji: result.emoji,
				name: result.name,
				controlled: false,
				highlighted: false,
				id: Date.now().toString(),
				X: avgX,
				Y: avgY,
			},
		];
		// Update highlights
		setTimeout(() => checkCollisionsWhileDragging(), 200);
	};

	const startTimedMode = async () => {
		// @ts-ignore
		selectedItemTimed = {
			name: "Water",
		};
		while (
			typeof $availibleItems.find(
				val => val.name === selectedItemTimed.name
			) !== "undefined"
		) {
			selectedItemTimed = (await (
				await fetch(PUBLIC_SERVER_URL + "/api/getRandomItem", {
					method: "GET",
				})
			).json()) as Item;
		}
		timedMode = true;
		startTime = Date.now();
		remainingTime = 120;
		let red = false;

		availibleItems.subscribe(val => {
			if (timedMode) {
				if (val.find(val => val.name === selectedItemTimed.name)) {
					// User Won!!
					alert("You Won!!!");
					clearInterval(interval1ID);
					clearInterval(interval2ID);
					timedMode = false;
					document.body.style.backgroundColor = "green";
					setTimeout(() => {
						document.body.style.backgroundColor = "white";
					}, 5000);
				}
			}
		});

		let interval1ID = setInterval(() => {
			remainingTime = Math.round(120 - (Date.now() - startTime) / 1000);
			if (remainingTime < 0) {
				clearInterval(interval1ID);
				clearInterval(interval2ID);
				document.body.style.backgroundColor = "red";
				timedMode = false;
				setTimeout(() => {
					document.body.style.backgroundColor = "white";
					remainingTime = 120;
				}, 5000);
			}
		}, 10);

		let interval2ID = setInterval(() => {
			if (remainingTime < 10) {
				if (red) {
					document.body.style.backgroundColor = "red";
				} else {
					document.body.style.backgroundColor = "white";
				}
				red = !red;
			}
		}, 250);
	};
</script>

<div class="w-screen h-screen flex">
	<div class="gap-4 flex flex-wrap p-2"></div>
	<div class="w-[70%] relative">
		{#if !timedMode}
			<button
				class="px-4 py-2 bg-blue-500 rounded-md mt-2 text-white"
				on:click={startTimedMode}>Play Timed Mode!</button
			>
		{:else if remainingTime > 0}
			<h1>Time Left: {remainingTime} seconds</h1>
			{#if selectedItemTimed}
				<div class="flex">
					<div class="item !cursor-default">
						{selectedItemTimed.emoji}
						{selectedItemTimed.name}
					</div>
				</div>
			{/if}
		{:else}
			<div class="flex">
				<h1 class="text-4xl">You Lost!</h1>
				<button
					class="px-4 py-2 bg-blue-500 rounded-md mt-2 text-white"
					on:click={startTimedMode}>Play Again!</button
				>
			</div>
		{/if}

		<div class="absolute bottom-4">
			<div class="group">
				<div
					class="group-hover:block hidden mb-4 w-96 border-2 rounded-md p-4"
				>
					Welcome to Infinite Craft, a game hevily inspired by the
					version on <a
						href="https://neal.fun/infinite-craft/"
						class="text-blue-500 underline">neal.fun</a
					>
					<br />
					<br />
					To Play...
				</div>
				<div class="">
					<Info />
				</div>
			</div>
		</div>
	</div>
	<div class="w-[30%] bg-gray-100" bind:this={deleteBox}>
		<h2 class="text-4xl w-full text-center mt-4">Unlocked Items</h2>
		<!-- Fix: When User has enough items to scroll, behavior is weird -->
		<div
			class="gap-4 flex flex-wrap w-full p-2 relative"
			bind:this={itemParent}
		>
			{#each draggedElements as element (element.id)}
				<div
					bind:this={element.element}
					class="item absolute {element.highlighted &&
						'!bg-gray-100'}"
					use:draggable={{
						position: element.controlled
							? {
									x: element.X,
									y: element.Y,
								}
							: undefined,
						defaultPosition: !element.controlled
							? {
									x: element.X,
									y: element.Y,
								}
							: undefined,
						defaultClassDragging: "dragging",
					}}
					on:neodrag={checkCollisionsWhileDragging}
					on:neodrag:end={checkCollisionsToCraft}
				>
					{element.emoji}
					{element.name}
				</div>
			{/each}
			{#each $availibleItems as item}
				<div id="item-parent-{item.name.replaceAll(' ', '_')}">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="item"
						on:mousedown={e =>
							dragStart(
								item.emoji,
								item.name,
								e.clientX - itemParent.offsetLeft,
								e.clientY - itemParent.offsetTop
							)}
					>
						{item.emoji}
						{item.name}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style lang="postcss">
	.item {
		@apply px-4 py-2 border rounded-md bg-white cursor-grab;
	}

	:global(.dragging) {
		@apply !cursor-grabbing;
	}
</style>
