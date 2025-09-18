<script>
    import { goto } from '$app/navigation';
    import { dropbox } from '$lib/dbx-store.js';

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const redirectUrl = `${window.location.origin}/auth/callback`;

    dropbox.authFinish(redirectUrl, code).then(goto('/'))
</script>

<p>...Redirecting in a moment...</p>