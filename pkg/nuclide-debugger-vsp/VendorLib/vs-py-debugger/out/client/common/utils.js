/// <reference path="../../../node_modules/@types/node/index.d.ts" />
/// <reference path="../../../node_modules/vscode/vscode.d.ts" />
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: Cleanup this place
// Add options for execPythonFile
const path = require("path");
const fs = require("fs");
const child_process = require("child_process");
const settings = require("./configSettings");
const vscode_1 = require("vscode");
const helpers_1 = require("./helpers");
const envFileParser_1 = require("./envFileParser");
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
function fsExistsAsync(filePath) {
    return new Promise(resolve => {
        fs.exists(filePath, exists => {
            PathValidity.set(filePath, exists);
            return resolve(exists);
        });
    });
}
exports.fsExistsAsync = fsExistsAsync;
let pythonInterpretterDirectory = null;
let previouslyIdentifiedPythonPath = null;
let customEnvVariables = null;
// If config settings change then clear env variables that we have cached
// Remember, the path to the python interpreter can change, hence we need to re-set the paths
settings.PythonSettings.getInstance().on('change', function () {
    customEnvVariables = null;
});
function getPythonInterpreterDirectory() {
    // If we already have it and the python path hasn't changed, yay
    if (pythonInterpretterDirectory && previouslyIdentifiedPythonPath === settings.PythonSettings.getInstance().pythonPath) {
        return Promise.resolve(pythonInterpretterDirectory);
    }
    let pythonFileName = settings.PythonSettings.getInstance().pythonPath;
    // Check if we have the path
    if (path.basename(pythonFileName) === pythonFileName) {
        // No path provided, however we can get it by using sys.executableFile
        return getPathFromPythonCommand(["-c", "import sys;print(sys.executable)"])
            .then(pythonExecutablePath => pythonInterpretterDirectory = path.dirname(pythonExecutablePath))
            .catch(() => pythonInterpretterDirectory = '');
    }
    return new Promise(resolve => {
        // If we can execute the python, then get the path from the fully qualified name
        child_process.execFile(pythonFileName, ['-c', 'print(1234)'], (error, stdout, stderr) => {
            // Yes this is a valid python path
            if (stdout.startsWith('1234')) {
                previouslyIdentifiedPythonPath = path.dirname(pythonFileName);
            }
            else {
                previouslyIdentifiedPythonPath = '';
            }
            // No idea, didn't work, hence don't reject, but return empty path
            resolve(previouslyIdentifiedPythonPath);
        });
    });
}
exports.getPythonInterpreterDirectory = getPythonInterpreterDirectory;
function getFullyQualifiedPythonInterpreterPath() {
    return getPythonInterpreterDirectory()
        .then(pyPath => path.join(pyPath, path.basename(settings.PythonSettings.getInstance().pythonPath)));
}
exports.getFullyQualifiedPythonInterpreterPath = getFullyQualifiedPythonInterpreterPath;
function getPathFromPythonCommand(args) {
    return execPythonFile(settings.PythonSettings.getInstance().pythonPath, args, __dirname).then(stdout => {
        if (stdout.length === 0) {
            return "";
        }
        let lines = stdout.split(/\r?\n/g).filter(line => line.length > 0);
        return validatePath(lines[0]);
    }).catch(() => {
        return "";
    });
}
exports.getPathFromPythonCommand = getPathFromPythonCommand;
function execPythonFile(file, args, cwd, includeErrorAsResponse = false, stdOut = null, token) {
    const execAsModule = file.toUpperCase() === 'PYTHON' && args.length > 0 && args[0] === '-m';
    // If running the python file, then always revert to execFileInternal
    // Cuz python interpreter is always a file and we can and will always run it using child_process.execFile()
    if (file === settings.PythonSettings.getInstance().pythonPath) {
        if (stdOut) {
            return spawnFileInternal(file, args, { cwd }, includeErrorAsResponse, stdOut, token);
        }
        if (execAsModule) {
            return getFullyQualifiedPythonInterpreterPath()
                .then(p => execPythonModule(p, args, { cwd: cwd }, includeErrorAsResponse, token));
        }
        return execFileInternal(file, args, { cwd: cwd }, includeErrorAsResponse, token);
    }
    return getPythonInterpreterDirectory().then(pyPath => {
        // We don't have a path
        if (pyPath.length === 0) {
            let options = { cwd };
            const envVars = customEnvVariables || getCustomEnvVars();
            if (envVars) {
                options.env = envVars;
            }
            if (stdOut) {
                return spawnFileInternal(file, args, options, includeErrorAsResponse, stdOut, token);
            }
            return execFileInternal(file, args, options, includeErrorAsResponse, token);
        }
        if (customEnvVariables === null) {
            customEnvVariables = getCustomEnvVars();
            customEnvVariables = customEnvVariables ? customEnvVariables : {};
            // Ensure to include the path of the current python 
            let newPath = '';
            let currentPath = typeof customEnvVariables[exports.PATH_VARIABLE_NAME] === 'string' ? customEnvVariables[exports.PATH_VARIABLE_NAME] : process.env[exports.PATH_VARIABLE_NAME];
            if (exports.IS_WINDOWS) {
                newPath = pyPath + '\\' + path.delimiter + path.join(pyPath, 'Scripts\\') + path.delimiter + currentPath;
                // This needs to be done for windows
                process.env[exports.PATH_VARIABLE_NAME] = newPath;
            }
            else {
                newPath = pyPath + path.delimiter + currentPath;
            }
            customEnvVariables = envFileParser_1.mergeEnvVariables(customEnvVariables, process.env);
            customEnvVariables[exports.PATH_VARIABLE_NAME] = newPath;
        }
        if (stdOut) {
            return spawnFileInternal(file, args, { cwd, env: customEnvVariables }, includeErrorAsResponse, stdOut, token);
        }
        if (execAsModule) {
            return getFullyQualifiedPythonInterpreterPath()
                .then(p => execPythonModule(p, args, { cwd: cwd, env: customEnvVariables }, includeErrorAsResponse, token));
        }
        return execFileInternal(file, args, { cwd, env: customEnvVariables }, includeErrorAsResponse, token);
    });
}
exports.execPythonFile = execPythonFile;
function handleResponse(file, includeErrorAsResponse, error, stdout, stderr, token) {
    if (token && token.isCancellationRequested) {
        return Promise.resolve(undefined);
    }
    if (helpers_1.isNotInstalledError(error)) {
        return Promise.reject(error);
    }
    // pylint:
    //      In the case of pylint we have some messages (such as config file not found and using default etc...) being returned in stderr
    //      These error messages are useless when using pylint   
    if (includeErrorAsResponse && (stdout.length > 0 || stderr.length > 0)) {
        return Promise.resolve(stdout + '\n' + stderr);
    }
    let hasErrors = (error && error.message.length > 0) || (stderr && stderr.length > 0);
    if (hasErrors && (typeof stdout !== 'string' || stdout.length === 0)) {
        let errorMsg = (error && error.message) ? error.message : (stderr && stderr.length > 0 ? stderr + '' : '');
        return Promise.reject(errorMsg);
    }
    else {
        return Promise.resolve(stdout + '');
    }
}
function handlePythonModuleResponse(includeErrorAsResponse, error, stdout, stderr, token) {
    if (token && token.isCancellationRequested) {
        return Promise.resolve(undefined);
    }
    if (helpers_1.isNotInstalledError(error)) {
        return Promise.reject(error);
    }
    // pylint:
    //      In the case of pylint we have some messages (such as config file not found and using default etc...) being returned in stderr
    //      These error messages are useless when using pylint   
    if (includeErrorAsResponse && (stdout.length > 0 || stderr.length > 0)) {
        return Promise.resolve(stdout + '\n' + stderr);
    }
    if (!includeErrorAsResponse && stderr.length > 0) {
        return Promise.reject(stderr);
    }
    return Promise.resolve(stdout + '');
}
function execPythonModule(file, args, options, includeErrorAsResponse, token) {
    options.maxBuffer = options.maxBuffer ? options.maxBuffer : 1024 * 102400;
    return new Promise((resolve, reject) => {
        let proc = child_process.execFile(file, args, options, (error, stdout, stderr) => {
            handlePythonModuleResponse(includeErrorAsResponse, error, stdout, stderr, token)
                .then(resolve)
                .catch(reject);
        });
        if (token && token.onCancellationRequested) {
            token.onCancellationRequested(() => {
                if (proc) {
                    proc.kill();
                    proc = null;
                }
            });
        }
    });
}
function execFileInternal(file, args, options, includeErrorAsResponse, token) {
    options.maxBuffer = options.maxBuffer ? options.maxBuffer : 1024 * 102400;
    return new Promise((resolve, reject) => {
        let proc = child_process.execFile(file, args, options, (error, stdout, stderr) => {
            handleResponse(file, includeErrorAsResponse, error, stdout, stderr, token)
                .then(data => resolve(data))
                .catch(err => reject(err));
        });
        if (token && token.onCancellationRequested) {
            token.onCancellationRequested(() => {
                if (proc) {
                    proc.kill();
                    proc = null;
                }
            });
        }
    });
}
function spawnFileInternal(file, args, options, includeErrorAsResponse, stdOut, token) {
    return new Promise((resolve, reject) => {
        let proc = child_process.spawn(file, args, options);
        let error = '';
        let exited = false;
        if (token && token.onCancellationRequested) {
            token.onCancellationRequested(() => {
                if (!exited && proc) {
                    proc.kill();
                    proc = null;
                }
            });
        }
        proc.on('error', error => {
            reject(error);
        });
        proc.stdout.setEncoding('utf8');
        proc.stderr.setEncoding('utf8');
        proc.stdout.on('data', function (data) {
            if (token && token.isCancellationRequested) {
                return;
            }
            stdOut(data);
        });
        proc.stderr.on('data', function (data) {
            if (token && token.isCancellationRequested) {
                return;
            }
            if (includeErrorAsResponse) {
                stdOut(data);
            }
            else {
                error += data;
            }
        });
        proc.on('exit', function (code) {
            exited = true;
            if (token && token.isCancellationRequested) {
                return reject();
            }
            if (error.length > 0) {
                return reject(error);
            }
            resolve();
        });
    });
}
function execInternal(command, args, options, includeErrorAsResponse) {
    return new Promise((resolve, reject) => {
        child_process.exec([command].concat(args).join(' '), options, (error, stdout, stderr) => {
            handleResponse(command, includeErrorAsResponse, error, stdout, stderr)
                .then(data => resolve(data))
                .catch(err => reject(err));
        });
    });
}
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
                catch (ex) {
                }
            });
            resolve(subDirs);
        });
    });
}
exports.getSubDirectories = getSubDirectories;
function getCustomEnvVars() {
    const envFile = settings.PythonSettings.getInstance().envFile;
    if (typeof envFile === 'string' &&
        envFile.length > 0 &&
        fs.existsSync(envFile)) {
        try {
            let vars = envFileParser_1.parseEnvFile(envFile);
            if (vars && typeof vars === 'object' && Object.keys(vars).length > 0) {
                return vars;
            }
        }
        catch (ex) {
            console.error('Failed to load env file', ex);
        }
    }
    return null;
}
exports.getCustomEnvVars = getCustomEnvVars;
function getWindowsLineEndingCount(document, offset) {
    const eolPattern = new RegExp('\r\n', 'g');
    const readBlock = 1024;
    let count = 0;
    let offsetDiff = offset.valueOf();
    // In order to prevent the one-time loading of large files from taking up too much memory
    for (let pos = 0; pos < offset; pos += readBlock) {
        let startAt = document.positionAt(pos);
        let endAt = null;
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
//# sourceMappingURL=utils.js.map