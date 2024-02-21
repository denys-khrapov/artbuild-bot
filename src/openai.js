import {Configuration, OpenAIApi} from 'openai'
import config from 'config'
import {createReadStream} from 'fs'

class OpenAI {

	roles = {
		ASSISTANT: 'assistant',
		USER: 'user',
		SYSTEM: 'system'
	};

	constructor(apiKey) {
		const configuration = new Configuration({
			apiKey,
		})
		this.openai = new OpenAIApi(configuration)
	}

	// async chat(messages) {
	// 	try {
	// 		const response = await this.openai.createChatCompletion({
	// 			model: 'gpt-3.5-turbo',
	// 			messages
	// 		})
	// 		return response.data.choices[0].message
	// 	} catch (e) {
	// 		console.log('Error while gpt chat', e.message)
	// 	}
	// }
	async chat(messages, retryCount = 0) {
		try {
			const response = await this.openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages
			});
			return response.data.choices[0].message;
		} catch (e) {
			console.log('Error while gpt chat', e.message);
			if (e.response && e.response.status === 429) { // Check if the error is a rate limit error
				const delayTime = Math.min(Math.pow(2, retryCount) * 1000, 30000); // Exponential backoff with a max delay
				console.log(`Rate limited. Retrying in ${delayTime / 1000} seconds...`);
				await new Promise(resolve => setTimeout(resolve, delayTime)); // Wait for the delayTime
				return this.chat(messages, retryCount + 1); // Retry the request
			} else {
				throw e; // Re-throw the error if it's not a rate limit error
			}
		}
	}


	async transcription(filepath) {
		try {
			const response = await this.openai.createTranscription(
					createReadStream(filepath),
					'whisper-1'
			)
			return response.data.text
		} catch (e) {
			console.log('Error while transcription', e.message)
		}
	}
}


export const openai = new OpenAI(config.get('OPENAI_KEY'));


