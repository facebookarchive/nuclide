"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const vscode = require("vscode");
function extractSignatureAndDocumentation(definition, highlightCode = false) {
    // Somtimes the signature of the function, class (whatever) is broken into multiple lines
    // Here's an example
    // ```python
    // def __init__(self, group=None, target=None, name=None,
    //              args=(), kwargs=None, verbose=None):
    //     """This constructor should always be called with keyword arguments. Arguments are:
    //     *group* should be None; reserved for future extension when a ThreadGroup
    //     class is implemented.
    ///    """
    /// ```
    const txt = definition.description || definition.text;
    const rawDocString = typeof definition.raw_docstring === 'string' ? definition.raw_docstring.trim() : '';
    const firstLineOfRawDocString = rawDocString.length > 0 ? rawDocString.split(/\r?\n/)[0] : '';
    let lines = txt.split(/\r?\n/);
    const startIndexOfDocString = firstLineOfRawDocString === '' ? -1 : lines.findIndex(line => line.indexOf(firstLineOfRawDocString) === 0);
    let signatureLines = startIndexOfDocString === -1 ? [lines.shift()] : lines.splice(0, startIndexOfDocString);
    let signature = signatureLines.filter(line => line.trim().length > 0).join(os_1.EOL);
    switch (definition.type) {
        case vscode.CompletionItemKind.Constructor:
        case vscode.CompletionItemKind.Function:
        case vscode.CompletionItemKind.Method: {
            signature = 'def ' + signature;
            break;
        }
        case vscode.CompletionItemKind.Class: {
            signature = 'class ' + signature;
            break;
        }
    }
    // check if we have any sample code in the documentation
    if (highlightCode) {
        lines = lines.map(line => {
            if (line.trim().startsWith('>>> ')) {
                return '```python\n' + line.substring(4).trim() + '\n```';
            }
            return line;
        });
    }
    return [signature, lines.join(os_1.EOL).trim().replace(/^\s+|\s+$/g, '').trim()];
}
exports.extractSignatureAndDocumentation = extractSignatureAndDocumentation;
function highlightCode(docstring) {
    /**********
     *
     * Magic. Do not touch. [What is the best comment in source code](https://stackoverflow.com/a/185106)
     *
     * This method uses several regexs to 'translate' reStructruedText syntax (Python doc syntax) to Markdown syntax.
     *
     * Let's just keep it unchanged unless a better solution becomes possible.
     *
     **********/
    // Add 2 line break before and after docstring (used to match a blank line)
    docstring = os_1.EOL + os_1.EOL + docstring.trim() + os_1.EOL + os_1.EOL;
    // Section title -> heading level 2
    docstring = docstring.replace(/(.+\r?\n)[-=]+\r?\n/g, '## $1' + os_1.EOL);
    // Directives: '.. directive::' -> '**directive**'
    docstring = docstring.replace(/\.\. (.*)::/g, '**$1**');
    // Field lists: ':field:' -> '**field**'
    docstring = docstring.replace(/:(.+?):/g, '**$1** ');
    // Pattern of 'var : description'
    let paramLinePattern = '[\\*\\w_]+ ?:[^:\r\n]+';
    // Add new line after and before param line
    docstring = docstring.replace(new RegExp(`(${os_1.EOL + paramLinePattern})`, 'g'), `$1${os_1.EOL}`);
    docstring = docstring.replace(new RegExp(`(${os_1.EOL + paramLinePattern + os_1.EOL})`, 'g'), `${os_1.EOL}$1`);
    // 'var : description' -> '`var` description'
    docstring = docstring.replace(/\r?\n([\*\w]+) ?: ?([^:\r\n]+\r?\n)/g, `${os_1.EOL}\`$1\` $2`);
    // Doctest blocks: begin with `>>>` and end with blank line
    docstring = docstring.replace(/(>>>[\w\W]+?\r?\n)\r?\n/g, `${'```python' + os_1.EOL}$1${'```' + os_1.EOL + os_1.EOL}`);
    // Literal blocks: begin with `::` (literal blocks are indented or quoted; for simplicity, we end literal blocks with blank line)
    docstring = docstring.replace(/(\r?\n[^\.]*)::\r?\n\r?\n([\w\W]+?\r?\n)\r?\n/g, `$1${os_1.EOL + '```' + os_1.EOL}$2${'```' + os_1.EOL + os_1.EOL}`);
    // Remove indentation in Field lists and Literal blocks
    let inCodeBlock = false;
    let codeIndentation = 0;
    let lines = docstring.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            if (inCodeBlock) {
                codeIndentation = lines[i + 1].match(/^ */)[0].length;
            }
            continue;
        }
        if (!inCodeBlock) {
            lines[i] = line.replace(/^ {4,8}/, '');
        }
        else {
            if (codeIndentation != 0) {
                lines[i] = line.substring(codeIndentation);
            }
        }
    }
    docstring = lines.join(os_1.EOL);
    // Grid Tables
    docstring = docstring.replace(/\r?\n[\+-]+\r?\n/g, os_1.EOL);
    docstring = docstring.replace(/\r?\n[\+=]+\r?\n/g, s => s.replace(/\+/g, '|').replace(/=/g, '-'));
    return docstring.trim();
}
exports.highlightCode = highlightCode;
//# sourceMappingURL=jediHelpers.js.map