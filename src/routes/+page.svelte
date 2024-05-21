<script lang="ts">
	import { draggable } from "@neodrag/svelte";
	import { availibleItems } from "$lib/stores";
	import { isTouching, craft } from "$lib/utils";
	import type { DragEventData } from "@neodrag/svelte";

	let itemParent: HTMLDivElement;

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

		addEventListener("mouseup", () => {
			removeEventListener("mousemove", updatePosition);
			document.body.style.userSelect = "";
			if (draggedElements[index].id !== id) {
				index = draggedElements.findIndex(val => val.id === id);
				if (index === -1) {
					return;
				}
			}
			draggedElements[index].controlled = false;
			checkCollisionsToCraft();
		});
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
		draggedElements.forEach(val => (val.highlighted = false));
		if (collidedElements.length !== 0) {
			draggedElements[collidedElements[0]].highlighted = true;
			draggedElements[collidedElements[1]].highlighted = true;
		}
	};

	const checkCollisionsToCraft = async () => {
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
	};
</script>

<div class="w-screen h-screen flex">
	<div class="gap-4 flex flex-wrap p-2"></div>
	<div class="w-[70%]"></div>
	<div class="w-[30%] bg-gray-100">
		<h2 class="text-4xl w-full text-center mt-4">Items</h2>
		<div
			class="gap-4 flex flex-wrap w-full p-2 relative"
			bind:this={itemParent}
		>
			{#each draggedElements as element (element.id)}
				<div
					bind:this={element.element}
					class="item absolute {element.highlighted
						? '!bg-gray-100'
						: ''}"
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
		@apply px-4 py-2 border rounded-md bg-white;
	}
</style>
