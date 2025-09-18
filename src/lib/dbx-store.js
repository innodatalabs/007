import { writable, derived } from 'svelte/store';
import { Dbx, DbxAuth } from '$lib/dbx.js';

// persistent reactive variable, holding dropbox API_KEY and API_SECRET values
export const dropboxSettings = writable(JSON.parse(localStorage.getItem('dropbox-settings') || "{}"));
dropboxSettings.subscribe(value => localStorage.setItem('dropbox-settings', JSON.stringify(value)));

const refreshToken = writable(localStorage.getItem('dropbox-refresh-token'));
refreshToken.subscribe(value => {
    if (value) {
        localStorage.setItem('dropbox-refresh-token', value)
    } else {
        localStorage.removeItem('dropbox-refresh-token');
    }
});

// reactive variable, holding Dropbox user display name (if connected)
export const user = writable();

// reactive variable that can have one of three states:
// "not-configured", "disconnected", "connected", reflecting state of Dropbox
// also has utility methods to perform OAuth2 authorization with Dropbox.
export const dropbox = (() => {
    const { set, subscribe, update } = writable('not-configured');

    const params = {};

    derived([dropboxSettings, refreshToken], ([settings, token]) => {
        params.appKey = settings.appKey;
        params.appSecret = settings.appSecret;
        params.refreshToken = token;
        return params;
    }).subscribe(x => {
        if (x.appKey && x.appSecret && x.refreshToken) {
            // maybe already logged in?
            dbx().getUser().then(userName => {
                user.set(userName)
                set('connected');
            }).catch(() => {
                refreshToken.set();
                user.set()
                set('disconnected');
            });
        } else {
            user.set()
            set('not-configured');
        }
    });

    async function authStart (redirectUrl) {
        console.log({params})
        const auth = new DbxAuth({ appKey: params.appKey, appSecret: params.appSecret, redirectUrl });
        return await auth.start()
    }

    async function authFinish (redirectUrl, code) {
        const auth = new DbxAuth({ appKey: params.appKey, appSecret: params.appSecret, redirectUrl });
        const token = await auth.finish(code);
        refreshToken.set(token);
        set('connected');
    }

    async function authLogout () {
        if (params.refreshToken) {
            const auth = new DbxAuth({ appKey: params.appKey, appSecret: params.appSecret });
            await auth.logout(params.refreshToken);
            refreshToken.set(null);
            set('disconnected');
        }
    }

    function dbx () {
        return new Dbx(params);
    }

    return { subscribe, authStart, authFinish, authLogout, dbx };
})();


// reactive varibale holding the list of Dropbox files. Its updated in background as file are being changed by LLM or user
export const files = (() => {
    let currentFiles = [];
    const { subscribe, set, update } = writable(currentFiles);

    dropbox.subscribe(s => {
        if (s === 'connected') {
            const dbx = dropbox.dbx();
            (async () => {
                try {
                    for await (const msg of await dbx.watch()) {
                        if (msg.type === 'init') {
                            currentFiles = msg.files.map(f => ({path: f}));
                            set(currentFiles);
                        } else if (msg.type === 'deleted') {
                            currentFiles = msg.files.map(f => ({path: f}));
                            set(currentFiles);
                        } else if (msg.type === 'created') {
                            currentFiles = msg.files.map(f => ({path: f}));
                            set(currentFiles);
                        } else if (msg.type === 'modified') {
                            const existingIndex = currentFiles.findIndex(f => f.path === msg.path);
                            if (existingIndex >= 0) {
                                currentFiles[existingIndex] = msg;
                                set(currentFiles);
                            } else {
                                currentFiles = [...currentFiles, msg];
                                set(currentFiles);
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error watching files:", e);
                }
            })();
        }
    })

    return {
        subscribe,
    };
})();