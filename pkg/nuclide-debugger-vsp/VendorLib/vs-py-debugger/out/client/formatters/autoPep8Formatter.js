'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const baseFormatter_1 = require("./baseFormatter");
const installer_1 = require("../common/installer");
class AutoPep8Formatter extends baseFormatter_1.BaseFormatter {
    constructor(outputChannel, pythonSettings, workspaceRootPath) {
        super('autopep8', installer_1.Product.autopep8, outputChannel, pythonSettings, workspaceRootPath);
    }
    formatDocument(document, options, token, range) {
        let autopep8Path = this.pythonSettings.formatting.autopep8Path;
        let autoPep8Args = Array.isArray(this.pythonSettings.formatting.autopep8Args) ? this.pythonSettings.formatting.autopep8Args : [];
        autoPep8Args = autoPep8Args.concat(['--diff']);
        if (range && !range.isEmpty) {
            autoPep8Args = autoPep8Args.concat(['--line-range', (range.start.line + 1).toString(), (range.end.line + 1).toString()]);
        }
        return super.provideDocumentFormattingEdits(document, options, token, autopep8Path, autoPep8Args);
    }
}
exports.AutoPep8Formatter = AutoPep8Formatter;
//# sourceMappingURL=autoPep8Formatter.js.map