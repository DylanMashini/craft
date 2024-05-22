import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export const GET: RequestHandler = async () => {

    let items = (await prisma.item.findMany()).map((item) => {
        return {
            emoji: item.emoji,
            name: item.name,
        }
    })
    
    return json(items)
}