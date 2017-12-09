'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./../common/utils");
const settings = require("./../common/configSettings");
const installer_1 = require("../common/installer");
const vscode = require("vscode");
const main_1 = require("./errorHandlers/main");
let NamedRegexp = null;
const REGEX = '(?<line>\\d+),(?<column>\\d+),(?<type>\\w+),(?<code>\\w\\d+):(?<message>.*)\\r?(\\n|$)';
var LintMessageSeverity;
(function (LintMessageSeverity) {
    LintMessageSeverity[LintMessageSeverity["Hint"] = 0] = "Hint";
    LintMessageSeverity[LintMessageSeverity["Error"] = 1] = "Error";
    LintMessageSeverity[LintMessageSeverity["Warning"] = 2] = "Warning";
    LintMessageSeverity[LintMessageSeverity["Information"] = 3] = "Information";
})(LintMessageSeverity = exports.LintMessageSeverity || (exports.LintMessageSeverity = {}));
function matchNamedRegEx(data, regex) {
    if (NamedRegexp === null) {
        NamedRegexp = require('named-js-regexp');
    }
    let compiledRegexp = NamedRegexp(regex, 'g');
    let rawMatch = compiledRegexp.exec(data);
    if (rawMatch !== null) {
        return rawMatch.groups();
    }
    return null;
}
exports.matchNamedRegEx = matchNamedRegEx;
class BaseLinter {
    constructor(id, product, outputChannel, workspaceRootPath) {
        this.product = product;
        this.outputChannel = outputChannel;
        this._columnOffset = 0;
        this.Id = id;
        this._workspaceRootPath = workspaceRootPath;
        this.pythonSettings = settings.PythonSettings.getInstance();
        this._errorHandler = new main_1.ErrorHandler(this.Id, product, new installer_1.Installer(), this.outputChannel);
    }
    get workspaceRootPath() {
        return typeof this._workspaceRootPath === 'string' ? this._workspaceRootPath : vscode.workspace.rootPath;
    }
    parseMessagesSeverity(error, categorySeverity) {
        if (categorySeverity[error]) {
            let severityName = categorySeverity[error];
            switch (severityName) {
                case 'Error':
                    return LintMessageSeverity.Error;
                case 'Hint':
                    return LintMessageSeverity.Hint;
                case 'Information':
                    return LintMessageSeverity.Information;
                case 'Warning':
                    return LintMessageSeverity.Warning;
                default: {
                    if (LintMessageSeverity[severityName]) {
                        return LintMessageSeverity[severityName];
                    }
                }
            }
        }
        return LintMessageSeverity.Information;
    }
    parseLine(line, regEx) {
        let match = matchNamedRegEx(line, regEx);
        if (!match) {
            return;
        }
        match.line = Number(match.line);
        match.column = Number(match.column);
        return {
            code: match.code,
            message: match.message,
            column: isNaN(match.column) || match.column === 0 ? 0 : match.column - this._columnOffset,
            line: match.line,
            type: match.type,
            provider: this.Id
        };
    }
    parseLines(outputLines, regEx) {
        let diagnostics = [];
        outputLines.filter((value, index) => index <= this.pythonSettings.linting.maxNumberOfProblems).forEach(line => {
            try {
                let msg = this.parseLine(line, regEx);
                if (msg) {
                    diagnostics.push(msg);
                }
            }
            catch (ex) {
                // Hmm, need to handle this later
                // TODO:
            }
        });
        return diagnostics;
    }
    displayLinterResultHeader(data) {
        this.outputChannel.append('#'.repeat(10) + 'Linting Output - ' + this.Id + '#'.repeat(10) + '\n');
        this.outputChannel.append(data);
    }
    run(command, args, document, cwd, cancellation, regEx = REGEX) {
        return utils_1.execPythonFile(command, args, cwd, true, null, cancellation).then(data => {
            if (!data) {
                data = '';
            }
            this.displayLinterResultHeader(data);
            let outputLines = data.split(/\r?\n/g);
            return this.parseLines(outputLines, regEx);
        }).catch(error => {
            this.handleError(this.Id, command, error);
            return [];
        });
    }
    handleError(expectedFileName, fileName, error) {
        this._errorHandler.handleError(expectedFileName, fileName, error);
    }
}
exports.BaseLinter = BaseLinter;
//# sourceMappingURL=baseLinter.js.map