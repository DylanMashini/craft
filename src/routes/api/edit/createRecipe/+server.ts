import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { PrismaClient } from "@prisma/client";

let prisma = new PrismaClient();

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return { $bigint: this.toString() };
};

export const POST: RequestHandler = async ({ request }) => {
  if (import.meta.env.MODE !== "development")
    return new Response("Not Availible");
  const { item1Id, item2Id, outputItemId } = await request.json();

  // Get Recipe if Exists
  let recipe = await prisma.recipe.findFirst({
    where: {
      OR: [
        {
          inputItem1: {
            id: item1Id,
          },
          inputItem2: {
            id: item2Id,
          },
        },
        {
          inputItem1: {
            id: item2Id,
          },
          inputItem2: {
            id: item1Id,
          },
        },
      ],
    },
  });

  if (recipe) {
    let res = await prisma.recipe.update({
      where: {
        id: recipe.id,
      },
      data: {
        outputItem: { connect: { id: outputItemId } },
      },
      include: {
        inputItem1: true,
        inputItem2: true,
        outputItem: true,

      }
    });
    return json(res);
  } else {
    let res = await prisma.recipe.create({
      data: {
        inputItem1: { connect: { id: item1Id } },
        inputItem2: { connect: { id: item2Id } },
        outputItem: { connect: outputItemId },
      },
      include: {
        inputItem1: true,
        inputItem2: true,
        outputItem: true,
      },
    });

    interface BigInt {
      /** Convert to BigInt to string form in JSON.stringify */
      toJSON: () => string;
    }

    return json(res);
  }
};
