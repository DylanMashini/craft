import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { PrismaClient } from "@prisma/client";

let client = new PrismaClient();

export const GET: RequestHandler = async ({}) => {
	let allItems = await client.item.findMany();
	let item = allItems[Math.floor(Math.random() * allItems.length)];
	return json({
		emoji: item.emoji,
		name: item.name,
	});
};
