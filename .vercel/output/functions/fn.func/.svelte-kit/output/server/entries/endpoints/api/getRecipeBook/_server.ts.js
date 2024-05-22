import "../../../../chunks/index.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function getAllRecipesFormatted() {
  const recipes = await prisma.recipe.findMany({
    include: {
      inputItem1: true,
      inputItem2: true,
      outputItem: true
    }
  });
  const formattedRecipes = recipes.map((recipe) => {
    const recipeId = recipe.id;
    const input1 = `${recipe.inputItem1.emoji} ${recipe.inputItem1.name}`;
    const input2 = `${recipe.inputItem2.emoji} ${recipe.inputItem2.name}`;
    const output = `${recipe.outputItem.emoji} ${recipe.outputItem.name}`;
    return `ID: ${recipeId} - ${input1} + ${input2} = ${output}`;
  });
  return formattedRecipes.join("\n");
}
const GET = async ({}) => {
  let res = await getAllRecipesFormatted();
  return new Response(res);
};
export {
  GET
};
