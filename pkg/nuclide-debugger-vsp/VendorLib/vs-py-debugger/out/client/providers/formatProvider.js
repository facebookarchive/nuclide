'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const yapfFormatter_1 = require("./../formatters/yapfFormatter");
const autoPep8Formatter_1 = require("./../formatters/autoPep8Formatter");
const dummyFormatter_1 = require("./../formatters/dummyFormatter");
class PythonFormattingEditProvider {
    constructor(context, outputChannel, settings) {
        this.settings = settings;
        this.formatters = new Map();
        let yapfFormatter = new yapfFormatter_1.YapfFormatter(outputChannel, settings);
        let autoPep8 = new autoPep8Formatter_1.AutoPep8Formatter(outputChannel, settings);
        let dummy = new dummyFormatter_1.DummyFormatter(outputChannel, settings);
        this.formatters.set(yapfFormatter.Id, yapfFormatter);
        this.formatters.set(autoPep8.Id, autoPep8);
        this.formatters.set(dummy.Id, dummy);
    }
    provideDocumentFormattingEdits(document, options, token) {
        return this.provideDocumentRangeFormattingEdits(document, null, options, token);
    }
    provideDocumentRangeFormattingEdits(document, range, options, token) {
        let formatter = this.formatters.get(this.settings.formatting.provider);
        return formatter.formatDocument(document, options, token, range);
    }
}
exports.PythonFormattingEditProvider = PythonFormattingEditProvider;
//# sourceMappingURL=formatProvider.js.map