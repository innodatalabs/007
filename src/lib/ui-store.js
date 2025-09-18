import { writable } from 'svelte/store';

// reactive variable holding conversation messages
export const conversation = writable([]);

// reactive variable holding debug messages
export const debugMessages = writable([]);
