'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable: no-any one-line no-suspicious-comment prefer-template prefer-const no-unnecessary-callback-wrapper no-function-expression no-string-literal no-control-regex no-shadowed-variable
const fs = require("fs");
const os = require("os");
const path = require("path");
const vscode_1 = require("vscode");
exports.IS_WINDOWS = /^win/.test(process.platform);
exports.Is_64Bit = os.arch() === 'x64';
exports.PATH_VARIABLE_NAME = exports.IS_WINDOWS ? 'Path' : 'PATH';
function fsExistsAsync(filePath) {
    return new Promise(resolve => {
        fs.exists(filePath, exists => {
            return resolve(exists);
        });
    });
}
exports.fsExistsAsync = fsExistsAsync;
function fsReaddirAsync(root) {
    return new Promise(resolve => {
        // Now look for Interpreters in this directory
        fs.readdir(root, (err, subDirs) => {
            if (err) {
                return resolve([]);
            }
            resolve(subDirs.map(subDir => path.join(root, subDir)));
        });
    });
}
exports.fsReaddirAsync = fsReaddirAsync;
function formatErrorForLogging(error) {
    let message = '';
    if (typeof error === 'string') {
        message = error;
    }
    else {
        if (error.message) {
            message = `Error Message: ${error.message}`;
        }
        if (error.name && error.message.indexOf(error.name) === -1) {
            message += `, (${error.name})`;
        }
        const innerException = error.innerException;
        if (innerException && (innerException.message || innerException.name)) {
            if (innerException.message) {
                message += `, Inner Error Message: ${innerException.message}`;
            }
            if (innerException.name && innerException.message.indexOf(innerException.name) === -1) {
                message += `, (${innerException.name})`;
            }
        }
    }
    return message;
}
exports.formatErrorForLogging = formatErrorForLogging;
function getSubDirectories(rootDir) {
    return new Promise(resolve => {
        fs.readdir(rootDir, (error, files) => {
            if (error) {
                return resolve([]);
            }
            const subDirs = [];
            files.forEach(name => {
                const fullPath = path.join(rootDir, name);
                try {
                    if (fs.statSync(fullPath).isDirectory()) {
                        subDirs.push(fullPath);
                    }
                }
                // tslint:disable-next-line:no-empty
                catch (ex) { }
            });
            resolve(subDirs);
        });
    });
}
exports.getSubDirectories = getSubDirectories;
function getWindowsLineEndingCount(document, offset) {
    const eolPattern = new RegExp('\r\n', 'g');
    const readBlock = 1024;
    let count = 0;
    let offsetDiff = offset.valueOf();
    // In order to prevent the one-time loading of large files from taking up too much memory
    for (let pos = 0; pos < offset; pos += readBlock) {
        let startAt = document.positionAt(pos);
        let endAt;
        if (offsetDiff >= readBlock) {
            endAt = document.positionAt(pos + readBlock);
            offsetDiff = offsetDiff - readBlock;
        }
        else {
            endAt = document.positionAt(pos + offsetDiff);
        }
        let text = document.getText(new vscode_1.Range(startAt, endAt));
        let cr = text.match(eolPattern);
        count += cr ? cr.length : 0;
    }
    return count;
}
exports.getWindowsLineEndingCount = getWindowsLineEndingCount;
function arePathsSame(path1, path2) {
    path1 = path.normalize(path1);
    path2 = path.normalize(path2);
    if (exports.IS_WINDOWS) {
        return path1.toUpperCase() === path2.toUpperCase();
    }
    else {
        return path1 === path2;
    }
}
exports.arePathsSame = arePathsSame;
//# sourceMappingURL=utils.js.map