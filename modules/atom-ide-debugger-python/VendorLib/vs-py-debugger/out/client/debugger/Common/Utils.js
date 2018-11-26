// tslint:disable:quotemark no-var-requires no-require-imports max-func-body-length prefer-const no-function-expression cyclomatic-complexity no-increment-decrement one-line
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const untildify = require("untildify");
exports.IS_WINDOWS = /^win/.test(process.platform);
exports.PATH_VARIABLE_NAME = exports.IS_WINDOWS ? 'Path' : 'PATH';
const PathValidity = new Map();
function validatePath(filePath) {
    if (filePath.length === 0) {
        return Promise.resolve('');
    }
    if (PathValidity.has(filePath)) {
        return Promise.resolve(PathValidity.get(filePath) ? filePath : '');
    }
    return new Promise(resolve => {
        fs.exists(filePath, exists => {
            PathValidity.set(filePath, exists);
            return resolve(exists ? filePath : '');
        });
    });
}
exports.validatePath = validatePath;
function validatePathSync(filePath) {
    if (filePath.length === 0) {
        return false;
    }
    if (PathValidity.has(filePath)) {
        return PathValidity.get(filePath);
    }
    const exists = fs.existsSync(filePath);
    PathValidity.set(filePath, exists);
    return exists;
}
exports.validatePathSync = validatePathSync;
function CreatePythonThread(id, isWorker, process, name = '', int32Id = 0) {
    return {
        IsWorkerThread: isWorker,
        Process: process,
        Name: name,
        Id: id,
        Frames: [],
        Int32Id: int32Id
    };
}
exports.CreatePythonThread = CreatePythonThread;
function CreatePythonModule(id, fileName) {
    let name = fileName;
    if (typeof fileName === 'string') {
        try {
            name = path.basename(fileName);
            // tslint:disable-next-line:no-empty
        }
        catch (_a) { }
    }
    else {
        name = '';
    }
    return {
        ModuleId: id,
        Name: name,
        Filename: fileName
    };
}
exports.CreatePythonModule = CreatePythonModule;
function FixupEscapedUnicodeChars(value) {
    return value;
}
exports.FixupEscapedUnicodeChars = FixupEscapedUnicodeChars;
function getPythonExecutable(pythonPath) {
    pythonPath = untildify(pythonPath);
    // If only 'python'.
    if (pythonPath === 'python' ||
        pythonPath.indexOf(path.sep) === -1 ||
        path.basename(pythonPath) === path.dirname(pythonPath)) {
        return pythonPath;
    }
    if (isValidPythonPath(pythonPath)) {
        return pythonPath;
    }
    // Keep python right on top, for backwards compatibility.
    const KnownPythonExecutables = ['python', 'python4', 'python3.6', 'python3.5', 'python3', 'python2.7', 'python2'];
    for (let executableName of KnownPythonExecutables) {
        // Suffix with 'python' for linux and 'osx', and 'python.exe' for 'windows'.
        if (exports.IS_WINDOWS) {
            executableName = `${executableName}.exe`;
            if (isValidPythonPath(path.join(pythonPath, executableName))) {
                return path.join(pythonPath, executableName);
            }
            if (isValidPythonPath(path.join(pythonPath, 'scripts', executableName))) {
                return path.join(pythonPath, 'scripts', executableName);
            }
        }
        else {
            if (isValidPythonPath(path.join(pythonPath, executableName))) {
                return path.join(pythonPath, executableName);
            }
            if (isValidPythonPath(path.join(pythonPath, 'bin', executableName))) {
                return path.join(pythonPath, 'bin', executableName);
            }
        }
    }
    return pythonPath;
}
exports.getPythonExecutable = getPythonExecutable;
function isValidPythonPath(pythonPath) {
    try {
        const output = child_process.execFileSync(pythonPath, ['-c', 'print(1234)'], { encoding: 'utf8' });
        return output.startsWith('1234');
    }
    catch (_a) {
        return false;
    }
}
//# sourceMappingURL=Utils.js.map