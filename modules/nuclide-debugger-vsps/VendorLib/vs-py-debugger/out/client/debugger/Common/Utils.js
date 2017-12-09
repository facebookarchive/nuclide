"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const child_process = require("child_process");
const envFileParser_1 = require("../../common/envFileParser");
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
function CreatePythonThread(id, isWorker, process, name = "") {
    return {
        IsWorkerThread: isWorker,
        Process: process,
        Name: name,
        Id: id,
        Frames: []
    };
}
exports.CreatePythonThread = CreatePythonThread;
function CreatePythonModule(id, fileName) {
    let name = fileName;
    if (typeof fileName === "string") {
        try {
            name = path.basename(fileName);
        }
        catch (ex) {
        }
    }
    else {
        name = "";
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
    // If only 'python'
    if (pythonPath === 'python' ||
        pythonPath.indexOf(path.sep) === -1 ||
        path.basename(pythonPath) === path.dirname(pythonPath)) {
        return pythonPath;
    }
    if (isValidPythonPath(pythonPath)) {
        return pythonPath;
    }
    // Keep python right on top, for backwards compatibility
    const KnownPythonExecutables = ['python', 'python4', 'python3.6', 'python3.5', 'python3', 'python2.7', 'python2'];
    for (let executableName of KnownPythonExecutables) {
        // Suffix with 'python' for linux and 'osx', and 'python.exe' for 'windows'
        if (exports.IS_WINDOWS) {
            executableName = executableName + '.exe';
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
    if (fs.existsSync(pythonPath)) {
        return true;
    }
    try {
        let output = child_process.execFileSync(pythonPath, ['-c', 'print(1234)'], { encoding: 'utf8' });
        return output.startsWith('1234');
    }
    catch (ex) {
        return false;
    }
}
function getCustomEnvVars(envVars, envFile) {
    let envFileVars = null;
    if (typeof envFile === 'string' && envFile.length > 0 && fs.existsSync(envFile)) {
        try {
            envFileVars = envFileParser_1.parseEnvFile(envFile);
        }
        catch (ex) {
            console.error('Failed to load env file');
            console.error(ex);
        }
    }
    let configVars = null;
    if (envVars && Object.keys(envVars).length > 0 && envFileVars) {
        configVars = envFileParser_1.mergeEnvVariables(envVars, envFileVars);
    }
    if (envVars && Object.keys(envVars).length > 0) {
        configVars = envVars;
    }
    if (envFileVars) {
        configVars = envFileVars;
    }
    if (configVars && typeof configVars === 'object' && Object.keys(configVars).length > 0) {
        return configVars;
    }
    return null;
}
exports.getCustomEnvVars = getCustomEnvVars;
//# sourceMappingURL=Utils.js.map