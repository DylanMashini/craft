<script lang="ts">
	import { draggable } from "@neodrag/svelte";
	import { availibleItems } from "$lib/stores";
	import type { DragEventData } from "@neodrag/svelte";

	let itemParent: HTMLDivElement;

	let draggedElements: {
		emoji: string;
		name: string;
		id: string;
		X: number;
		Y: number;
		controlled: boolean;
	}[] = [];

	// $: console.log(draggedElements);

	const dragStart = (
		emoji: string,
		name: string,
		startX: number,
		startY: number
	) => {
		console.log(startX);
		draggedElements = [
			{
				emoji: emoji,
				name: name,
				id: Date.now().toString(),
				X: startX,
				Y: startY,
				controlled: true,
			},
			...draggedElements,
		];

		document.body.style.userSelect = "none";
		draggedElements = draggedElements;

		let index = 0;

		let id = draggedElements[index].id;

		function updatePosition(event: any) {
			if (draggedElements[index].id !== id) {
				index = draggedElements.findIndex(val => (val.id = id));
				if (index === -1) {
					return;
				}
			}
			draggedElements[index].X = event.clientX - itemParent.offsetLeft;
			draggedElements[index].Y = event.clientY - itemParent.offsetTop;
			draggedElements = draggedElements;
		}

		addEventListener("mousemove", updatePosition);

		addEventListener("mouseup", () => {
			removeEventListener("mousemove", updatePosition);
			document.body.style.userSelect = "";
		});
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
					class="item absolute"
					use:draggable={{
						position: {
							x: element.X,
							y: element.Y,
						},
					}}
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
		@apply px-4 py-2 border rounded-md;
	}
</style>
