import { writable } from 'svelte/store';
import { DbxAuth } from '$lib/dbx.js';

const _DEFAULT_LLM_PROMPT = 'You are a helpful writing assistant';

const _DEFAULT_LLM_SETTINGS = JSON.stringify({
    model: 'gpt-4o',
    temperature: 0.0,
    maxTokens: null,
    maxRetries: 2,
    prompt: _DEFAULT_LLM_PROMPT,
    apiKey: null,
});

// persistent reactive variable holding OpenAI llm settings
export const llmSettings = writable(JSON.parse(localStorage.getItem('llm-settings') || _DEFAULT_LLM_SETTINGS));
llmSettings.subscribe(value => {
    localStorage.setItem('llm-settings', JSON.stringify(value));
});

