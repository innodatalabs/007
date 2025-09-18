import { derived } from 'svelte/store';
import { llmSettings } from './llm-store.js';
import { dropbox } from './dbx-store.js';
import { Agent } from './agent.js';


// reactive variable that hold initialized agent if LLM is configured and Dropbox is connected. Else is null.
export const agent = derived([llmSettings, dropbox], ([settings, box]) => {
    if (box !== 'connected') {
        return;
    }
    if (!settings.apiKey) {
        return;
    }
    return new Agent(settings, dropbox.dbx());
});
