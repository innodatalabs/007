<script>
    import { llmSettings } from "$lib/llm-store.js";
    import  { dropbox, dropboxSettings } from '$lib/dbx-store.js';

    async function dropboxConnect() {
        const redirectUrl = `${window.location.origin}/auth/callback`;
        console.log({redirectUrl})
        const url = await dropbox.authStart(redirectUrl);
        window.location = url;
    }

    async function dropboxDisconnect() {
        await dropbox.authLogout();
    }

</script>

<div class="settings-content">
    <h1 class="settings-header">Settings</h1>

    <div class="form-group">
        <label class="form-label" for="model-select">Model</label>
        <input type="text" class="form-input" id="model-select" placeholder="Enter model name (e.g., gpt-4, gpt-3.5-turbo)" bind:value={$llmSettings.model}>
        <div class="form-help">Choose the language model you want to use for conversations</div>
    </div>

    <div class="form-group">
        <label class="form-label" for="api-key">API Key</label>
        <div class="api-key-container">
            <input type="password" class="form-input" id="api-key" placeholder="Enter your API key" bind:value={$llmSettings.apiKey}>
            <span class="toggle-visibility" id="toggle-visibility">
                <i class="fas fa-eye"></i>
            </span>
        </div>
        <div class="form-help">
            Your API key is stored locally and never stored on our servers.
        </div>
    </div>

    <div class="form-group">
        <label class="form-label" for="prompt">Prompt</label>
        <textarea type="text" class="form-input" id="prompt" placeholder="Your prompt here" bind:value={$llmSettings.prompt}>

        </textarea>
        <div class="form-help">Detailed prompt</div>
    </div>

    <div class="form-group">
        <label class="form-label" for="api-endpoint">API Endpoint (Optional)</label>
        <input type="text" class="form-input" id="api-endpoint" placeholder="https://api.example.com/v1/chat">
        <div class="form-help">Leave blank to use the default endpoint for the selected model</div>
    </div>

    <div class="form-group">
        <label class="form-label" for="dropbox-app-key">Dropbox APP_KEY</label>
        <input type="text" class="form-input" id="dropbox-app-key" bind:value={$dropboxSettings.appKey} disabled={$dropbox === 'connected'}>
        <div class="form-help">Required to connect to your Dropbox</div>
    </div>

    <div class="form-group">
        <label class="form-label" for="dropbox-app-secret">Dropbox APP_SECRET</label>
        <input type="password" class="form-input" id="dropbox-app-secret" bind:value={$dropboxSettings.appSecret} disabled={$dropbox === 'connected'}>
        <div class="form-help">Required to connect to your Dropbox</div>
    </div>

    {#if $dropbox === 'disconnected'}
        <button on:click={dropboxConnect}
            disabled={!$dropboxSettings.appKey || !$dropboxSettings.appSecret}>Connect Dropbox</button>
    {:else if $dropbox === 'connected'}
        <button on:click={dropboxDisconnect}>Disconnect Dropbox</button>
    {:else}
        <pre>{$dropbox}</pre>
    {/if}
</div>
