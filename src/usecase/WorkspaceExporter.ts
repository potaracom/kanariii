import * as Blockly from "blockly";
import "blockly/javascript";
import { CustomizeJsUpdater } from "../CustomizeJsUpdater";

export class WorkspaceExporter {
    exportXml(workspace: Blockly.Workspace) {
        const filename = 'kintone-blockly.xml';
        const xmlData = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
        const blob = new Blob([xmlData], { "type": "application/xml" });
        this.download(filename, blob);
    }

    exportJavaScript(workspace: Blockly.Workspace) {
        const filename = 'kintone-blockly-app.js';
        const jsCode = new CustomizeJsUpdater().generateCode(
            Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace)),
            // @ts-ignore Blockly.JavaScript は型定義がまだ未対応。
            Blockly.JavaScript.workspaceToCode(workspace)
        );
        const blob = new Blob([jsCode], { "type": "application/javascript" });
        this.download(filename, blob);
    }

    private download(filename: string, blob: Blob) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = window.URL.createObjectURL(blob);
        link.click();
    }
}