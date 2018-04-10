'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_1 = require("vscode");
const path = require("path");
const http = require("http");
const helpers_1 = require("./common/helpers");
const constants_1 = require("./common/constants");
const nodeStatic = require('node-static');
let serverAddress = "http://localhost:8080";
let helpPageToDisplay = constants_1.Documentation.Home;
class TextDocumentContentProvider extends vscode_1.Disposable {
    constructor() {
        super(() => { });
        this._onDidChange = new vscode.EventEmitter();
    }
    provideTextDocumentContent(uri, token) {
        this.lastUri = uri;
        return this.generateResultsView();
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    update() {
        this._onDidChange.fire(this.lastUri);
    }
    generateResultsView() {
        const addresss = serverAddress + helpPageToDisplay;
        const htmlContent = `
                    <!DOCTYPE html>
                    <head>
                    <style type="text/css"> html, body{ height:100%; width:100%; }</style>
                    </head>
                    <body>
                    <iframe frameborder="0" style="border: 0px solid transparent;height:100%;width:100%;background-color:white;" src="${addresss}"></iframe>
                    </body>
                    </html>`;
        return Promise.resolve(htmlContent);
    }
}
exports.TextDocumentContentProvider = TextDocumentContentProvider;
const helpSchema = 'help-viewer';
const previewUri = vscode.Uri.parse(helpSchema + '://authority/python');
class HelpProvider {
    constructor() {
        this.disposables = [];
        const textProvider = new TextDocumentContentProvider();
        this.disposables.push(vscode.workspace.registerTextDocumentContentProvider(helpSchema, textProvider));
        this.disposables.push(vscode.commands.registerCommand('python.displayHelp', (page) => {
            this.startServer().then(port => {
                let viewColumn = vscode.ViewColumn.Two;
                if (!page || typeof page !== 'string' || page.length === 0) {
                    helpPageToDisplay = constants_1.Documentation.Home;
                    viewColumn = vscode.ViewColumn.One;
                }
                else {
                    helpPageToDisplay = page;
                }
                vscode.commands.executeCommand('vscode.previewHtml', previewUri, viewColumn, 'Help');
            });
        }));
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.stop();
    }
    startServer() {
        if (this.port) {
            return Promise.resolve(this.port);
        }
        let def = helpers_1.createDeferred();
        var file = new nodeStatic.Server(path.join(__dirname, '..', '..', 'docs'));
        this.httpServer = http.createServer((request, response) => {
            request.addListener('end', function () {
                // 
                // Serve files! 
                // 
                file.serve(request, response);
            }).resume();
        });
        this.httpServer.listen(0, () => {
            this.port = this.httpServer.address().port;
            serverAddress = 'http://localhost:' + this.port.toString();
            def.resolve(this.port);
            def = null;
        });
        this.httpServer.on('error', error => {
            if (def) {
                def.reject(error);
                def = null;
            }
        });
        return def.promise;
    }
    stop() {
        if (!this.httpServer) {
            return;
        }
        this.httpServer.close();
        this.httpServer = null;
    }
}
exports.HelpProvider = HelpProvider;
//# sourceMappingURL=helpProvider.js.map