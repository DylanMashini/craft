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

if (typeof window !== "undefined") {
	let storedRecipes = localStorage.getItem("unlockedRecipes");
	if (storedRecipes) {
		availibleItems.set(JSON.parse(storedRecipes));
	}

	availibleItems.subscribe(val => {
		localStorage.setItem("unlockedRecipes", JSON.stringify(val));
	});
}
