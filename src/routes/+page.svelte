<script>
    import { agent } from "$lib/agent-store.js"
    import { dropbox, dropboxSettings, files } from '$lib/dbx-store.js';
    import { conversation, debugMessages } from '$lib/ui-store.js';
    import { marked } from "marked";

    $: console.log({agent: $agent})

    let userMessage = "";

    async function interact() {
        if (!userMessage) return;

        const message = userMessage;
        userMessage = "";

        // Add user message to conversation
        $conversation = [...$conversation, { sender: 'You', content: message }];

        let lastChunk = null;
        $debugMessages.push({id: 'HumanMessage', kwargs: {content: message}});
        $debugMessages = $debugMessages; // Trigger reactivity
        for await (const chunk of await $agent.stream(message)) {
            $debugMessages.push({id: chunk.id, kwargs: chunk.kwargs, tool: chunk.tool, tool_input: chunk.tool_input});
            $debugMessages = $debugMessages; // Trigger reactivity
            lastChunk = chunk;
        }

        // console.log({lastChunk, debugMessages: $debugMessages});
        $conversation = [...$conversation, { sender: 'Agent v0.0.7:', content: lastChunk['kwargs']?.['content'] || "No response from agent." }];
    }

    async function interactIfEnter(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            await interact();
        }
    }

    function clearDebug() {
        $debugMessages = [];
    }

    function scrollIntoView (node, what) {
        node.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
</script>

{#if !$agent}
<div>
    <p>Please <a href="/settings">go to Settings</a> and</p>
    <ul>
        <li>Select LLM engine and provide API Key</li>
        <li>Set Dropbox APP_KEY and APP_SECRET</li>
        <li>Connect your Dropbox</li>
    </ul>
</div>
{:else}
<div class="main-content">
    <!-- Chat Panel -->
    <div class="chat-container">
        <div class="chat-messages">
            {#each $conversation as msg, index (index)}
                <div class="message" class:sent={index % 2 == 0} class:received={index % 2 == 1}>
                    <div class="message-sender">{msg.sender}</div>
                    <div class="message-content" use:scrollIntoView={index===$conversation.length-1}>{@html marked(msg.content)}</div>
                </div>
            {/each}
        </div>

        <div class="chat-input">
            <input type="text" bind:value={userMessage} onkeydown={interactIfEnter} placeholder="Type your message here...">
            <button onclick={interact}><i class="fas fa-paper-plane"></i></button>
        </div>
    </div>

    <!-- Debug Panel -->
    <div class="debug-panel">
        <div class="debug-header">
            <div class="debug-title">Debug Information</div>
            <button onclick={clearDebug} class="debug-clear">
                <i class="fas fa-trash"></i> Clear
            </button>
        </div>
        <div class="debug-content">
            {#each $debugMessages as msg, index (index)}
                <div class="debug-entry">
                    <div class="debug-timestamp">{index+1}</div>
                    <div class="debug-message" use:scrollIntoView={index==$debugMessages.length-1}>{JSON.stringify(msg, null, 2)}</div>
                </div>
            {/each}
        </div>
    </div>
</div>

<div class="file-list">
    {#each $files as file (file)}
    <div>{file.path}</div>
    {/each}
</div>
{/if}
