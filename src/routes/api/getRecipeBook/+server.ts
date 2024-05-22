import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import { PrismaClient } from "@prisma/client";
import {dev} from "$app/environment"

const prisma = new PrismaClient();

async function getAllRecipesFormatted(): Promise<string> {
	const recipes = await prisma.recipe.findMany({
		include: {
			inputItem1: true,
			inputItem2: true,
			outputItem: true,
		},
	});

	const formattedRecipes = recipes.map(recipe => {
		const recipeId = recipe.id;
		const input1 = `${recipe.inputItem1.emoji} ${recipe.inputItem1.name}`;
		const input2 = `${recipe.inputItem2.emoji} ${recipe.inputItem2.name}`;
		const output = `${recipe.outputItem.emoji} ${recipe.outputItem.name}`;
		return `ID: ${recipeId} - ${input1} + ${input2} = ${output}`;
	});

	return formattedRecipes.join("\n");
}

export const GET: RequestHandler = async ({}) => {
	if (!dev) return new Response("Not Authorized")
	let res = await getAllRecipesFormatted();
	return new Response(res);
};
