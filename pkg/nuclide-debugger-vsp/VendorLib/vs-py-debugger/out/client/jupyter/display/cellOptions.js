"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../../common/constants");
const cellHelper_1 = require("../common/cellHelper");
class CellOptions extends vscode.Disposable {
    constructor(cellCodeLenses) {
        super(() => { });
        this.cellCodeLenses = cellCodeLenses;
        this.cellHelper = new cellHelper_1.CellHelper(this.cellCodeLenses);
        this.disposables = [];
        this.registerCommands();
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
    registerCommands() {
        this.disposables.push(vscode.commands.registerCommand(constants_1.Commands.Jupyter.Cell.DisplayCellMenu, this.displayCellOptions.bind(this)));
        this.disposables.push(vscode.commands.registerCommand(constants_1.Commands.Jupyter.Cell.AdcanceToCell, this.cellHelper.advanceToCell.bind(this.cellHelper)));
        this.disposables.push(vscode.commands.registerCommand(constants_1.Commands.Jupyter.Cell.ExecuteCurrentCell, this.executeCell.bind(this, false)));
        this.disposables.push(vscode.commands.registerCommand(constants_1.Commands.Jupyter.Cell.ExecuteCurrentCellAndAdvance, this.executeCell.bind(this, true)));
        this.disposables.push(vscode.commands.registerCommand(constants_1.Commands.Jupyter.Cell.GoToNextCell, this.cellHelper.goToNextCell.bind(this.cellHelper)));
        this.disposables.push(vscode.commands.registerCommand(constants_1.Commands.Jupyter.Cell.GoToPreviousCell, this.cellHelper.goToPreviousCell.bind(this.cellHelper)));
    }
    executeCell(advanceToNext) {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || !activeEditor.document) {
            return Promise.resolve();
        }
        return this.cellHelper.getActiveCell().then(cellInfo => {
            if (!cellInfo || !cellInfo.cell) {
                return;
            }
            return vscode.commands.executeCommand(constants_1.Commands.Jupyter.ExecuteRangeInKernel, activeEditor.document, cellInfo.cell).then(() => {
                if (!advanceToNext) {
                    return;
                }
                return this.cellHelper.advanceToCell(activeEditor.document, cellInfo.nextCell);
            });
        });
    }
    displayCellOptions(document, range, nextCellRange) {
        const items = [
            {
                label: 'Run cell',
                description: '',
                command: constants_1.Commands.Jupyter.ExecuteRangeInKernel,
                args: [document, range]
            }
        ];
        if (nextCellRange) {
            items.push({
                label: 'Run cell and advance',
                description: '',
                command: constants_1.Commands.Jupyter.ExecuteRangeInKernel,
                args: [document, range],
                postCommand: constants_1.Commands.Jupyter.Cell.AdcanceToCell,
                postArgs: [document, nextCellRange]
            });
        }
        vscode.window.showQuickPick(items).then(item => {
            if (item) {
                vscode.commands.executeCommand(item.command, ...item.args).then(() => {
                    if (item.postCommand) {
                        vscode.commands.executeCommand(item.postCommand, ...item.postArgs);
                    }
                });
            }
        });
    }
}
exports.CellOptions = CellOptions;
//# sourceMappingURL=cellOptions.js.map