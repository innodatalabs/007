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
<nav>
	<ul>
		<li class="logo" onclick={() => goto("/")}>
			<a href="#">
				<i class="fas fa-comment-dots"></i>
				<span>Agent v0.0.7</span>
			</a>
		</li>
		<li>
			<a href="/help/index.html" target="_blank">
				<i class="fas fa-question-circle"></i>
				<span>Help</span>
			</a>
		</li>
		<li>
			<span>{$user}</span>
		</li>
		<li onclick={() => goto("/settings")}>
			<a href="#">
				<i class="fas fa-cog"></i>
			</a>
		</li>
	</ul>
</nav>

{@render children?.()}

</div>