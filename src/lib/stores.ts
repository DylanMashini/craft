import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

export type Item = {
	emoji: string;
	name: string;
};

let initalItems: Item[] = [
	{
		emoji: "💧",
		name: "Water",
	},
	{
		emoji: "🔥",
		name: "Fire",
	},
	{
		emoji: "🌎",
		name: "Earth",
	},
	{
		emoji: "💨",
		name: "Wind",
	},
];

export let availibleItems: Writable<Item[]> = writable(initalItems);

export let firstDiscoveries: Writable<number> = writable(0);

if (typeof window !== "undefined") {
	let storedRecipes = localStorage.getItem("unlockedRecipes");
	if (storedRecipes) {
		availibleItems.set(JSON.parse(storedRecipes));
	}

	availibleItems.subscribe(val => {
		localStorage.setItem("unlockedRecipes", JSON.stringify(val));
	});

	let storedFirstDiscoveries = localStorage.getItem("firstDiscoveries");
	if (storedFirstDiscoveries) {
		firstDiscoveries.set(JSON.parse(storedFirstDiscoveries));
	}

	firstDiscoveries.subscribe(val => {
		localStorage.setItem("firstDiscoveries", JSON.stringify(val));
	});
}
