import { tools } from "./tools.js";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from '@langchain/langgraph-checkpoint';


export class Agent {
    constructor (llmSettings, dbx) {
        console.log('Creating agent with options:', llmSettings);
        let options = { ... llmSettings }
        const baseURL = options.endpoint;
        delete options.endpoint;
        if (baseURL) {
            options = {...options, configuration: { baseURL }};
        }

        const llm = new ChatOpenAI(options);
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
