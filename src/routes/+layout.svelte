<script>
    import { goto } from '$app/navigation';
	import favicon from '$lib/assets/favicon.svg';
	import { user } from '$lib/dbx-store.js';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="container">
<div class="top-bar">
	<div class="logo" onclick={() => goto("/")} >
		<i class="fas fa-comment-dots"></i>
		<span class="logo-text">Agent v0.0.7</span>
	</div>
	<a onclick={() => goto("/settings")} aria-role="button" aria-label="settings"><i class="fas fa-cog"></i></a>
</div>

{@render children?.()}

</div>