<script lang="ts">
	import { draggable } from "@neodrag/svelte";
	import {
		availibleItems,
		type Item,
		showNewDiscoveryPopup,
	} from "$lib/stores";
	import { isTouching, craft } from "$lib/utils";
	import { PUBLIC_SERVER_URL } from "$env/static/public";
	import Info from "$lib/icons/Info.svelte";
	import Github from "$lib/icons/Github.svelte";
	import Search from "$lib/icons/Search.svelte";
	import Trash from "$lib/icons/Trash.svelte";
	import { fade } from "svelte/transition";

	let itemParent: HTMLDivElement;
	let deleteBox: HTMLDivElement;

	let timedMode = false;
	let startTime: number;
	let remainingTime: number;
	let selectedItemTimed: Item;

	let search = "";

	let deleting = false;

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
		deleting = false;
		for (let i = 0; i < draggedElements.length; i++) {
			if (!draggedElements[i].element) continue;

			// Check for each item if it is intersecting trash
			// @ts-ignore
			if (isTouching(draggedElements[i].element, deleteBox)) {
				deleting = true;
			}

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
					setTimeout(() => {
						alert("You Won!!!");
						clearInterval(interval1ID);
						clearInterval(interval2ID);
						timedMode = false;
						document.body.style.backgroundColor = "green";
						setTimeout(() => {
							document.body.style.backgroundColor = "white";
						}, 5000);
					}, 100);
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

	const filterSearch = (items: Item[], query: string) => {
		if (query === "") {
			return items;
		}
		return items.filter(val => val.name.includes(query));
	};

	$: console.log(filteredAvailibleItems);

	$: filteredAvailibleItems = filterSearch($availibleItems, search);
</script>

<svelte:head>
	<title>Infininty Craft</title>
</svelte:head>

<div class="w-screen h-screen flex max-h-screen">
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
					To play, start with the fundamental building blocks, and drag
					and drop them onto the crafting area. Combine two things to make
					something new. Once you find something new, it will popup in
					your availible items. After you get the hang of things, you can
					try the timed mode, where you race against the clock to find
					a random item's crafting recipe. If you want to delete something
					you dragged out, just drag it into the grey box on the right.

					<br />
					<br />

					Don't worry, your discoveries are saved in your browser, so
					you can come back and continue where you left off.
				</div>
				<div class="">
					<Info />
				</div>
			</div>
		</div>
		<div class="absolute bottom-4 right-4">
			<a
				href="https://github.com/DylanMashini/craft"
				target="_blank"
				rel="noopener noreferrer"><Github /></a
			>
		</div>
	</div>
	<div class="w-[30%] bg-gray-100 overflow-y-scroll mb-8">
		{#if deleting}
			<div
				class="absolute translate-x-1/2 right-[15%] top-1/2 -translate-y-1/2"
				transition:fade={{ delay: 0, duration: 100 }}
			>
				<Trash />
			</div>
		{/if}
		<div
			class="overflow-y-scroll overflow-x-visible w-full [scrollbar-width:none]"
			bind:this={deleteBox}
		>
			<h2 class="text-4xl w-full text-center mt-4">Unlocked Items</h2>
			<div class="gap-4 flex flex-wrap w-full p-2" bind:this={itemParent}>
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
				{#each filteredAvailibleItems as item}
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
		<div
			class="h-8 bg-white absolute bottom-0 w-[30%] flex items-center overflow-x-clip right-0"
		>
			<div class="mr-3 ml-2">
				<Search />
			</div>
			<input
				class="w-[calc(30%-1.25rem-1em)] my-0 text-sm h-full rounded-md search"
				bind:value={search}
				placeholder="Search"
			/>
		</div>
	</div>
	{#if typeof $showNewDiscoveryPopup === "string"}
		<div
			class="absolute w-96 h-36 bottom-6 left-6 bg-white border rounded-md p-4 flex items-center justify-center popup"
			transition:fade={{ duration: 400 }}
		>
			<div class="text-center">
				<h2 class="text-xl font-bold mb-2">New Discovery!</h2>
				<p class="text-gray-700">You have discovered a new item:</p>
				<p class="text-lg font-semibold text-blue-600">
					{$showNewDiscoveryPopup}
				</p>
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	.item {
		@apply px-4 py-2 border rounded-md bg-white cursor-grab;
	}

	:global(.dragging) {
		@apply !cursor-grabbing;
	}

	.search:focus {
		outline: none;
	}
</style>
