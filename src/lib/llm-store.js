import { writable } from 'svelte/store';
import { DbxAuth } from '$lib/dbx.js';

const _DEFAULT_LLM_PROMPT = 'You are a helpful writing assistant';

const _DEFAULT_LLM_SETTINGS = JSON.stringify({
    openai: {
        model: 'gpt-4o',
        temperature: 0.0,
        maxTokens: null,
        maxRetries: 2,
        prompt: _DEFAULT_LLM_PROMPT,
        apiKey: null,
        endpoint: null,
    },
    anthropic: {
        model: "claude-3-5-sonnet-20240620",
        temperature: 0,
        maxTokens: null,
        maxRetries: 2,
        prompt: _DEFAULT_LLM_PROMPT,
        apiKey: null,
        baseUrl: null,
    },
});

// persistent reactive variable holding OpenAI llm settings
export const llmSettings = writable(JSON.parse(localStorage.getItem('llm-settings2') || _DEFAULT_LLM_SETTINGS));
llmSettings.subscribe(value => {
    localStorage.setItem('llm-settings2', JSON.stringify(value));
});

export const llmSelection = writable(localStorage.getItem('llm-selection') || 'openai');
llmSelection.subscribe(value => {
    localStorage.setItem('llm-selection', value);
});