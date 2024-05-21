import type { RequestHandler } from "./$types";
import type { Item } from "$lib/stores";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "$env/static/private";
import { json } from "@sveltejs/kit";

function splitEmojisAndText(str) {
	// Regular expression to match all emoji characters
	const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
	let emojiMatch;
	let emojiString = "";
	let textStartIndex = 0;

	while ((emojiMatch = emojiRegex.exec(str)) !== null) {
		// Append the matched emoji to the emoji string
		emojiString += emojiMatch[0];
		// Update the starting index of the remaining text
		textStartIndex = emojiRegex.lastIndex;
	}

	// Get the remaining text after the sequence of emojis
	const remainingText = str.slice(textStartIndex);

	return {
		emojis: emojiString,
		text: remainingText,
	};
}

export const POST: RequestHandler = async ({ request }) => {
	const { item1, item2 }: { item1: Item; item2: Item } = await request.json();

	const openai = new OpenAI({
		apiKey: OPENAI_API_KEY,
	});

	const response = await openai.chat.completions.create({
		model: "gpt-3.5-turbo",
		messages: [
			{
				role: "system",
				content: [
					{
						type: "text",
						text: 'You are an Artificial Intelligence For a Game where the user combines items to "craft" new ones. Each Item is a series of emojis, and has a name. Your input will consist of two items to be crafted into a third, new item. For example, "💧Water AND 🌎Earth"  might combine into "🌱Plant".  Your output should only consist of the output emojis, and the name. Here are a few tips for your generation:\n1. They should be interesting, and useful for further crafting. Try to avoid abstract ideas.\n2. They should follow common sense, but still be interesting. Prefer fundamental building blocks, instead of being correct. \n3. The series of emojis should be the ones that most accurately depict what you are trying to repersent. It is critical that the emoji used looks like what the word is. The emoji has nothing to do with combining the two inital emojis, it should repersent what the resultant word\'s meaning is.',
					},
				],
			},
			{
				role: "user",
				content: [
					{
						type: "text",
						text:
							item1.emoji +
							item1.name +
							" AND " +
							item2.emoji +
							item2.name,
					},
				],
			},
		],
		temperature: 0,
		max_tokens: 10,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: 0,
		seed: 69,
	});

	let res = response.choices[0].message.content;

	// Regular expression to match all emojis at the beginning of the string
	let emojiRegex =
		/^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{1F201}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2B1B}\u{2B1C}\u{25AA}\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}]+/gu;

	// Extract emojis from the beginning of the string
	let emojis = res.match(emojiRegex);

	// If emojis are found, join them into a single string, otherwise set to an empty string
	let emoji = emojis ? emojis.join("") : "";
	// Remove the emojis from the original string to get the text part
	let name = res.replace(emojiRegex, "");

	return json({
		emoji,
		name,
	});
};
