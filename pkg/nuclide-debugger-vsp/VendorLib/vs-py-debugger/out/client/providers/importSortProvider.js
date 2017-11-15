"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const child_process = require("child_process");
const settings = require("../common/configSettings");
const editor_1 = require("../common/editor");
class PythonImportSortProvider {
    sortImports(extensionDir, document) {
        if (document.lineCount === 1) {
            return Promise.resolve([]);
        }
        return new Promise((resolve, reject) => {
            // isort does have the ability to read from the process input stream and return the formatted code out of the output stream
            // However they don't support returning the diff of the formatted text when reading data from the input stream
            // Yes getting text formatted that way avoids having to create a temporary file, however the diffing will have
            // to be done here in node (extension), i.e. extension cpu, i.e. les responsive solution
            let importScript = path.join(extensionDir, "pythonFiles", "sortImports.py");
            let tmpFileCreated = document.isDirty;
            let filePromise = tmpFileCreated ? editor_1.getTempFileWithDocumentContents(document) : Promise.resolve(document.fileName);
            filePromise.then(filePath => {
                const pythonPath = settings.PythonSettings.getInstance().pythonPath;
                const isort = settings.PythonSettings.getInstance().sortImports.path;
                const args = settings.PythonSettings.getInstance().sortImports.args.join(' ');
                let isort_cmd = '';
                if (typeof isort === 'string' && isort.length > 0) {
                    if (isort.indexOf(' ') > 0) {
                        isort_cmd = `"${isort}" "${filePath}" --diff ${args}`;
                    }
                    else {
                        isort_cmd = `${isort} "${filePath}" --diff ${args}`;
                    }
                }
                else {
                    if (pythonPath.indexOf(' ') > 0) {
                        isort_cmd = `"${pythonPath}" "${importScript}" "${filePath}" --diff ${args}`;
                    }
                    else {
                        isort_cmd = `${pythonPath} "${importScript}" "${filePath}" --diff ${args}`;
                    }
                }
                child_process.exec(isort_cmd, (error, stdout, stderr) => {
                    if (tmpFileCreated) {
                        fs.unlink(filePath);
                    }
                    if (error || (stderr && stderr.length > 0)) {
                        return reject(error ? error : stderr);
                    }
                    let edits = editor_1.getTextEditsFromPatch(document.getText(), stdout);
                    resolve(edits);
                });
            }).catch(reject);
        });
    }
}
exports.PythonImportSortProvider = PythonImportSortProvider;
//# sourceMappingURL=importSortProvider.js.map