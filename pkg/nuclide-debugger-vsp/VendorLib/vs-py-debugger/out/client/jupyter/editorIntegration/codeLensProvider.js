'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const constants_1 = require("../../common/constants");
const cellHelper_1 = require("../common/cellHelper");
class JupyterCodeLensProvider {
    constructor() {
        this.cache = [];
    }
    provideCodeLenses(document, token) {
        // Implement our own cache for others to use
        // Yes VS Code also caches, but we want to cache for our own usage
        const index = this.cache.findIndex(item => item.fileName === document.fileName);
        if (index >= 0) {
            const item = this.cache[index];
            if (item.documentVersion === document.version) {
                return Promise.resolve(item.lenses);
            }
            this.cache.splice(index, 1);
        }
        const cells = cellHelper_1.CellHelper.getCells(document);
        if (cells.length === 0) {
            return Promise.resolve([]);
        }
        const lenses = [];
        cells.forEach((cell, index) => {
            const cmd = {
                arguments: [document, cell.range],
                title: 'Run cell',
                command: constants_1.Commands.Jupyter.ExecuteRangeInKernel
            };
            lenses.push(new vscode_1.CodeLens(cell.range, cmd));
        });
        this.cache.push({ fileName: document.fileName, documentVersion: document.version, lenses: lenses });
        return Promise.resolve(lenses);
    }
}
exports.JupyterCodeLensProvider = JupyterCodeLensProvider;
//# sourceMappingURL=codeLensProvider.js.map