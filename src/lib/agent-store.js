import { derived } from 'svelte/store';
import { llmSettings, llmSelection } from './llm-store.js';
import { dropbox } from './dbx-store.js';
import { Agent } from './agent.js';


// reactive variable that hold initialized agent if LLM is configured and Dropbox is connected. Else is null.
export const agent = derived([llmSelection, llmSettings, dropbox], ([selection, settings, box]) => {
    console.log(selection, settings)
    if (box !== 'connected') {
        return;
    }
    if (!settings[selection]?.apiKey) {
        return;
    }

    return new Agent(selection, settings[selection], dropbox.dbx());
});
