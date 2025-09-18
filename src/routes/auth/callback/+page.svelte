<script>
    import { goto } from '$app/navigation';
    import { dropbox } from '$lib/dbx-store.js';

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    dropbox.authFinish('http://localhost:5173/auth/callback', code).then(goto('/'))
</script>

<p>...Redirecting in a moment...</p>