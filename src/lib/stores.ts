import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

type Item = {
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
