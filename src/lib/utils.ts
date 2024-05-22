import { availibleItems, firstDiscoveries } from "./stores";
import type { Item } from "./stores";
import { PUBLIC_SERVER_URL } from "$env/static/public";

export function isTouching(el1: HTMLElement, el2: HTMLElement) {
	const rect1 = el1.getBoundingClientRect();
	const rect2 = el2.getBoundingClientRect();

	return !(
		rect1.right < rect2.left ||
		rect1.left > rect2.right ||
		rect1.bottom < rect2.top ||
		rect1.top > rect2.bottom
	);
}

export async function craft(item1: Item, item2: Item): Promise<Item> {
	let result = await (
		await fetch(PUBLIC_SERVER_URL + "/api/createNewItem", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				item1,
				item2,
			}),
		})
	).json();

	if (result.newDiscovery) {
		alert("You Just Made a First Discovery");
		firstDiscoveries.update(val => val + 1);
	}
	result.newDiscovery = undefined;
	result = result as Item;

	availibleItems.update(items => {
		if (
			typeof items.find(val => val.name === result.name) === "undefined"
		) {
			items.push(result);
		}
		return items;
	});

	return result;
}
