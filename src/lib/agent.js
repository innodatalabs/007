import { tools } from "./tools.js";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { MemorySaver } from '@langchain/langgraph-checkpoint';


function createLlm(selection, options) {
    if (selection === 'openai') {
        let llmOptions = { ... options }
        const baseURL = llmOptions.endpoint;
        delete llmOptions.endpoint;
        if (baseURL) {
            llmOptions = {...llmOptions, configuration: { baseURL }};
        }

        return new ChatOpenAI(llmOptions);
    } else if (selection === 'anthropic') {
        let llmOptions = { ... options }
        const baseURL = llmOptions.endpoint;
        delete llmOptions.endpoint;
        if (baseURL) {
            llmOptions = {...llmOptions, clientOptions: { baseURL }};
        }
        return new ChatAnthropic(llmOptions);
    } else {
        throw new Error(`Unsupported LLM selection: ${selection}`);
    }
}

export class Agent {
    constructor (llmSelection, llmSettings, dbx) {
        console.log('Creating agent with options:', {llmSelection, llmSettings});
        const llm = createLlm(llmSelection, llmSettings);

        this.agent = createReactAgent({
            llm,
            tools: tools(dbx),
            checkpointer: new MemorySaver(),
        });
        this.conversationId = crypto.randomUUID();
    }

    resetConversation () {
        this.conversationId = crypto.randomUUID();
    }

    async * stream(userMessage) {
        for await (const event of await this.agent.stream({
            messages: [
                {
                    role: "user",
                    content: userMessage,
                },
            ],
        }, { streamMode: 'updates', configurable: { thread_id: this.conversationId } })) {
            if (event.agent) {
                for (const m of event.agent.messages) yield m.toJSON();
            } else if (event.tools) {
                for (const m of event.tools.messages) yield m.toJSON();
            }
        }
    }
}
