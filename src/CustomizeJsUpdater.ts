/// <reference path="../node_modules/@kintone/dts-gen/kintone.d.ts" />
import * as parserBabel from 'prettier/parser-babylon';
import * as prettier from 'prettier/standalone';

interface CustomizeSetting {
    app: string;
    scope: "ALL";
    desktop: SettingForDevice;
    revision: string;
}

interface SettingForDevice {
    css: Array<any>;
    js: Array<UrlSource | FileSource>;
}

interface UrlSource {
    type: 'URL';
    url: string;
}

interface FileSource {
    type: 'FILE'
    file: FileBlob | UploadFileBlob;
}

interface FileBlob {
    contentType: string;
    fileKey: string;
    name: string;
    size: string;
}

interface UploadFileBlob {
    fileKey: string;
}

export class CustomizeJsUpdater {

    readonly fileName = 'kintone-blockly-app.js';

    async uploadCustomizeCode(xmlCode: string, jsCode: string) {
        const customizeSetting: CustomizeSetting = await this.getCustomizeSetting();
        const uploadToBlob = await this.uploadToBlob(this.generateCode(xmlCode, jsCode));
        customizeSetting.desktop.js = customizeSetting.desktop.js.filter((source) => {
            if (source.type === 'FILE') {
                let fileSource = source as FileSource;
                return (fileSource.file as FileBlob).name !== this.fileName
            }
            return true;
        });
        customizeSetting.desktop.js.push({ type: 'FILE', file: { fileKey: uploadToBlob["fileKey"] } });
        customizeSetting.app = kintone.app.getId().toString();
        await this.putCustomizeSetting(customizeSetting);
        await this.deployApp();
        while (await this.deployAppProgress() !== 'SUCCESS') {
            await this.sleep(250);
        }
    }

    public generateCode(xmlCode: string, jsCode: string): string {
        const customizeCode = `
KintoneBlockly = {};
KintoneBlockly.sourceXml=${JSON.stringify(xmlCode)};
(function(){
${jsCode}
})();
`;
        return prettier.format(customizeCode, {
            parser: "babel",
            plugins: [parserBabel]
        });
    }

    private getCustomizeSetting() {
        return kintone.api(this.url('/k/v1/app/customize'), 'GET', { app: kintone.app.getId() });
    }

    private putCustomizeSetting(customizeSetting: CustomizeSetting) {
        return kintone.api(this.url('/k/v1/preview/app/customize'), 'PUT', customizeSetting);
    }

    private sleep(waitMsec: number) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, waitMsec)
        });
    }

    private deployApp() {
        return kintone.api(this.url('/k/v1/preview/app/deploy'), 'POST', {
            apps: [
                { app: kintone.app.getId(), revision: -1 }
            ]
        });
    }

    private async deployAppProgress() {
        const resp = await kintone.api(this.url('/k/v1/preview/app/deploy'), 'GET', {
            apps: [kintone.app.getId()]
        });
        return resp.apps[0].status;
    }

    private uploadToBlob(code: string) {
        return new Promise((resolve, reject) => {
            const blob = new Blob([code], { type: "application/xml" });
            const formData = new FormData();
            formData.append("__REQUEST_TOKEN__", kintone.getRequestToken());
            formData.append("file", blob, this.fileName);

            const url = this.url('/k/v1/file');
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.onload = function () {
                if (xhr.status === 200) {
                    // success
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    // error
                    reject(JSON.parse(xhr.responseText));
                }
            };
            xhr.send(formData);
        });
    }

    private url(path: string): string {
        return kintone.api.url(path, true);
    }
}
