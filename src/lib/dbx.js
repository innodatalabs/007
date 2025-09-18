import { Dropbox } from 'dropbox';


export class DbxAuth {
    constructor({ appKey, appSecret, redirectUrl }) {
        this.appKey = appKey;
        this.appSecret = appSecret;
        this.redirectUrl = redirectUrl;
    }

    async start () {
        const dbx = new Dropbox({ clientId: this.appKey });
        const authUrl = await dbx.auth.getAuthenticationUrl(this.redirectUrl, null, 'code', 'offline');
        return authUrl;
    }

    async finish (code) {
        const dbx = new Dropbox({ clientId: this.appKey, clientSecret: this.appSecret })
        const { result, status } = await dbx.auth.getAccessTokenFromCode(this.redirectUrl, code);
        if (status !== 200) {
            throw new Error(`Authentication failed with ${status}`);
        }

        // await dbx.auth.authTokenRevoke();
        const { refresh_token: refreshToken } = result;
        console.log({refreshToken})
        return refreshToken;
    }

    async logout (refreshToken) {
        if (refreshToken) {
            const dbx = new Dropbox({ clientId: this.appKey, clientSecret: this.appSecret, refreshToken })
            const { result, status } = await dbx.authTokenRevoke();
            if (status !== 200) {
                throw new Error(`Authentication failed with ${status}`);
            }
        }
    }
}

export class Dbx {
    constructor( { appKey, appSecret, refreshToken }) {
        this.appKey = appKey;
        this.appSecret = appSecret;
        this.refreshToken = refreshToken;
        this.dbx = new Dropbox({ clientId: this.appKey, clientSecret: this.appSecret, refreshToken: this.refreshToken });
    }

    async listFiles() {
        const { result, status } = await this.dbx.filesListFolder({ path: '' });
        if (status !== 200) {
            throw new Error(`API call failed: ${status}, ${result}`);
        }
        if (result.has_more) {
            throw new Error("Pagination not implemented yet");  // TODO
        }

        return result.entries.filter(x => x['.tag'] === 'file').map(x => x.name);
    }

    async readFile({name}) {
        const { result, status } = await this.dbx.filesDownload({ path: `/${name}` });
        if (status !== 200) {
            throw new Error(`API call failed: ${status}, ${result}`);
        }
        return await result.fileBlob.text();
    }

    async writeFile({name, contents}) {
        const { result, status } = await this.dbx.filesUpload({ path: `/${name}`, contents, mode:'overwrite' });
        if (status !== 200) {
            throw new Error(`API call failed: ${status}, ${result}`);
        }
    }

    async deleteFile({name}) {
        const { result, status } = await this.dbx.filesDeleteV2({ path: `/${name}` });
        if (status !== 200) {
            throw new Error(`API call failed: ${status}, ${result}`);
        }
    }

    async getUser() {
        const { result, status } = await this.dbx.usersGetCurrentAccount();
        if (status !== 200) {
            throw new Error(`API call failed: ${status}, ${result}`);
        }
        return result.name.display_name;
    }

    async * watch() {
        const { result, status } = await this.dbx.filesListFolder({ path: '' });
        if (status !== 200) {
            throw new Error(`API call failed: ${status}, ${result}`);
        }
        if (result.has_more) {
            throw new Error("Pagination not implemented yet");  // TODO
        }

        const files = result.entries.filter(x => x['.tag'] === 'file').map(x => x.name);
        files.sort();

        yield { type: 'init', files }

        let cursor = result.cursor;
        while (true) {
            const { result, status } = await this.dbx.filesListFolderLongpoll({ cursor,  });
            if (status !== 200) {
                throw new Error(`API call failed: ${status}, ${result}`);
            }
            if (!result.changes) continue;
            const r = await this.dbx.filesListFolderContinue({ cursor });
            for (const entry of r.result.entries) {
                console.log(entry)
                if (entry['.tag'] === 'deleted') {
                    const index = files.indexOf(entry.name);
                    if (index >= 0) {
                        files.splice(index, 1);
                        yield { type: 'deleted', name: entry.name, files: [...files] }
                    }
                } else if (entry['.tag'] === 'folder') {
                    // ignore folder events
                } else if (entry['.tag'] === 'file') {
                    const index = files.indexOf(entry.name);
                    if (index >= 0) {
                        yield { type: 'modified', name: entry.name, files: [...files] }
                    } else {
                        files.push(entry.name);
                        files.sort();
                        yield { type: 'created', name: entry.name, files: [...files] }
                    }
                } else {
                    console.error(entry)
                }
            }
            cursor = r.result.cursor
        }
    }
}
