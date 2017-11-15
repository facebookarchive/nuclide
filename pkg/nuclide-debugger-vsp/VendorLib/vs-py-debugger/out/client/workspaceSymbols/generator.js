"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const child_process = require("child_process");
const configSettings_1 = require("../common/configSettings");
const pythonSettings = configSettings_1.PythonSettings.getInstance();
class Generator {
    constructor(output) {
        this.output = output;
        this.disposables = [];
        this.optionsFile = path.join(__dirname, '..', '..', '..', 'resources', 'ctagOptions');
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
    buildCmdArgsg() {
        const optionsFile = this.optionsFile.indexOf(' ') > 0 ? `"${this.optionsFile}"` : this.optionsFile;
        const exclusions = pythonSettings.workspaceSymbols.exclusionPatterns;
        const excludes = exclusions.length === 0 ? [] : exclusions.map(pattern => `--exclude=${pattern}`);
        return [`--options=${optionsFile}`, '--languages=Python'].concat(excludes);
    }
    generateWorkspaceTags() {
        const tagFile = path.normalize(pythonSettings.workspaceSymbols.tagFilePath);
        return this.generateTags(tagFile, { directory: vscode.workspace.rootPath });
    }
    generateTags(outputFile, source) {
        const cmd = pythonSettings.workspaceSymbols.ctagsPath;
        const args = this.buildCmdArgsg();
        if (source.file && source.file.length > 0) {
            source.directory = path.dirname(source.file);
        }
        if (path.dirname(outputFile) === source.directory) {
            outputFile = path.basename(outputFile);
        }
        outputFile = outputFile.indexOf(' ') > 0 ? `"${outputFile}"` : outputFile;
        const outputDir = path.dirname(outputFile);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }
        args.push(`-o ${outputFile}`, '.');
        this.output.appendLine('-'.repeat(10) + 'Generating Tags' + '-'.repeat(10));
        this.output.appendLine(`${cmd} ${args.join(' ')}`);
        const promise = new Promise((resolve, reject) => {
            let options = {
                cwd: source.directory
            };
            let hasErrors = false;
            let errorMsg = '';
            const proc = child_process.spawn(cmd, args, options);
            proc.stderr.setEncoding('utf8');
            proc.stdout.setEncoding('utf8');
            proc.on('error', (error) => {
                reject(error);
            });
            proc.stderr.on('data', (data) => {
                errorMsg += data;
                this.output.append(data);
            });
            proc.stdout.on('data', (data) => {
                this.output.append(data);
            });
            proc.on('exit', () => {
                if (hasErrors) {
                    reject(errorMsg);
                }
                else {
                    resolve(outputFile);
                }
            });
        });
        vscode.window.setStatusBarMessage('Generating Tags', promise);
        return promise;
    }
}
exports.Generator = Generator;
//# sourceMappingURL=generator.js.map