'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const systemVariables_1 = require("./systemVariables");
const events_1 = require("events");
const path = require("path");
const child_process = require("child_process");
const untildify = require("untildify");
exports.IS_WINDOWS = /^win/.test(process.platform);
const IS_TEST_EXECUTION = process.env['PYTHON_DONJAYAMANNE_TEST'] === '1';
class PythonSettings extends events_1.EventEmitter {
    constructor() {
        super();
        this.disposables = [];
        if (PythonSettings.pythonSettings) {
            throw new Error('Singleton class, Use getInstance method');
        }
        this.disposables.push(vscode.workspace.onDidChangeConfiguration(() => {
            this.initializeSettings();
        }));
        this.initializeSettings();
    }
    static getInstance() {
        return PythonSettings.pythonSettings;
    }
    initializeSettings() {
        const systemVariables = new systemVariables_1.SystemVariables();
        const workspaceRoot = (IS_TEST_EXECUTION || typeof vscode.workspace.rootPath !== 'string') ? __dirname : vscode.workspace.rootPath;
        let pythonSettings = vscode.workspace.getConfiguration('python');
        this.pythonPath = systemVariables.resolveAny(pythonSettings.get('pythonPath'));
        this.pythonPath = getAbsolutePath(this.pythonPath, IS_TEST_EXECUTION ? __dirname : workspaceRoot);
        this.venvPath = systemVariables.resolveAny(pythonSettings.get('venvPath'));
        this.jediPath = systemVariables.resolveAny(pythonSettings.get('jediPath'));
        if (typeof this.jediPath === 'string' && this.jediPath.length > 0) {
            this.jediPath = getAbsolutePath(systemVariables.resolveAny(this.jediPath), IS_TEST_EXECUTION ? __dirname : workspaceRoot);
        }
        else {
            this.jediPath = '';
        }
        this.envFile = systemVariables.resolveAny(pythonSettings.get('envFile'));
        this.devOptions = systemVariables.resolveAny(pythonSettings.get('devOptions'));
        this.devOptions = Array.isArray(this.devOptions) ? this.devOptions : [];
        let lintingSettings = systemVariables.resolveAny(pythonSettings.get('linting'));
        if (this.linting) {
            Object.assign(this.linting, lintingSettings);
        }
        else {
            this.linting = lintingSettings;
        }
        let sortImportSettings = systemVariables.resolveAny(pythonSettings.get('sortImports'));
        if (this.sortImports) {
            Object.assign(this.sortImports, sortImportSettings);
        }
        else {
            this.sortImports = sortImportSettings;
        }
        // Support for travis
        this.sortImports = this.sortImports ? this.sortImports : { path: '', args: [] };
        // Support for travis
        this.linting = this.linting ? this.linting : {
            enabled: false,
            enabledWithoutWorkspace: false,
            ignorePatterns: [],
            flake8Args: [], flake8Enabled: false, flake8Path: 'flake',
            lintOnSave: false, lintOnTextChange: false, maxNumberOfProblems: 100,
            mypyArgs: [], mypyEnabled: false, mypyPath: 'mypy',
            outputWindow: 'python', pep8Args: [], pep8Enabled: false, pep8Path: 'pep8',
            pylamaArgs: [], pylamaEnabled: false, pylamaPath: 'pylama',
            prospectorArgs: [], prospectorEnabled: false, prospectorPath: 'prospector',
            pydocstyleArgs: [], pydocstyleEnabled: false, pydocstylePath: 'pydocstyle',
            pylintArgs: [], pylintEnabled: false, pylintPath: 'pylint',
            pylintCategorySeverity: {
                convention: vscode.DiagnosticSeverity.Hint,
                error: vscode.DiagnosticSeverity.Error,
                fatal: vscode.DiagnosticSeverity.Error,
                refactor: vscode.DiagnosticSeverity.Hint,
                warning: vscode.DiagnosticSeverity.Warning
            },
            pep8CategorySeverity: {
                E: vscode.DiagnosticSeverity.Error,
                W: vscode.DiagnosticSeverity.Warning
            },
            flake8CategorySeverity: {
                F: vscode.DiagnosticSeverity.Error,
                E: vscode.DiagnosticSeverity.Error,
                W: vscode.DiagnosticSeverity.Warning
            },
            mypyCategorySeverity: {
                error: vscode.DiagnosticSeverity.Error,
                note: vscode.DiagnosticSeverity.Hint
            }
        };
        this.linting.pylintPath = getAbsolutePath(systemVariables.resolveAny(this.linting.pylintPath), workspaceRoot);
        this.linting.flake8Path = getAbsolutePath(systemVariables.resolveAny(this.linting.flake8Path), workspaceRoot);
        this.linting.pep8Path = getAbsolutePath(systemVariables.resolveAny(this.linting.pep8Path), workspaceRoot);
        this.linting.pylamaPath = getAbsolutePath(systemVariables.resolveAny(this.linting.pylamaPath), workspaceRoot);
        this.linting.prospectorPath = getAbsolutePath(systemVariables.resolveAny(this.linting.prospectorPath), workspaceRoot);
        this.linting.pydocstylePath = getAbsolutePath(systemVariables.resolveAny(this.linting.pydocstylePath), workspaceRoot);
        let formattingSettings = systemVariables.resolveAny(pythonSettings.get('formatting'));
        if (this.formatting) {
            Object.assign(this.formatting, formattingSettings);
        }
        else {
            this.formatting = formattingSettings;
        }
        // Support for travis
        this.formatting = this.formatting ? this.formatting : {
            autopep8Args: [], autopep8Path: 'autopep8',
            outputWindow: 'python',
            provider: 'autopep8',
            yapfArgs: [], yapfPath: 'yapf',
            formatOnSave: false
        };
        this.formatting.autopep8Path = getAbsolutePath(systemVariables.resolveAny(this.formatting.autopep8Path), workspaceRoot);
        this.formatting.yapfPath = getAbsolutePath(systemVariables.resolveAny(this.formatting.yapfPath), workspaceRoot);
        let autoCompleteSettings = systemVariables.resolveAny(pythonSettings.get('autoComplete'));
        if (this.autoComplete) {
            Object.assign(this.autoComplete, autoCompleteSettings);
        }
        else {
            this.autoComplete = autoCompleteSettings;
        }
        // Support for travis
        this.autoComplete = this.autoComplete ? this.autoComplete : {
            extraPaths: [],
            addBrackets: false,
            preloadModules: []
        };
        let workspaceSymbolsSettings = systemVariables.resolveAny(pythonSettings.get('workspaceSymbols'));
        if (this.workspaceSymbols) {
            Object.assign(this.workspaceSymbols, workspaceSymbolsSettings);
        }
        else {
            this.workspaceSymbols = workspaceSymbolsSettings;
        }
        // Support for travis
        this.workspaceSymbols = this.workspaceSymbols ? this.workspaceSymbols : {
            ctagsPath: 'ctags',
            enabled: true,
            exclusionPatterns: [],
            rebuildOnFileSave: true,
            rebuildOnStart: true,
            tagFilePath: path.join(workspaceRoot, "tags")
        };
        this.workspaceSymbols.tagFilePath = getAbsolutePath(systemVariables.resolveAny(this.workspaceSymbols.tagFilePath), workspaceRoot);
        let unitTestSettings = systemVariables.resolveAny(pythonSettings.get('unitTest'));
        if (this.unitTest) {
            Object.assign(this.unitTest, unitTestSettings);
        }
        else {
            this.unitTest = unitTestSettings;
            if (IS_TEST_EXECUTION && !this.unitTest) {
                this.unitTest = { nosetestArgs: [], pyTestArgs: [], unittestArgs: [] };
            }
        }
        // Support for travis
        this.unitTest = this.unitTest ? this.unitTest : {
            promptToConfigure: true,
            debugPort: 3000,
            nosetestArgs: [], nosetestPath: 'nosetest', nosetestsEnabled: false,
            outputWindow: 'python',
            pyTestArgs: [], pyTestEnabled: false, pyTestPath: 'pytest',
            unittestArgs: [], unittestEnabled: false
        };
        this.unitTest.pyTestPath = getAbsolutePath(systemVariables.resolveAny(this.unitTest.pyTestPath), workspaceRoot);
        this.unitTest.nosetestPath = getAbsolutePath(systemVariables.resolveAny(this.unitTest.nosetestPath), workspaceRoot);
        // Resolve any variables found in the test arguments
        this.unitTest.nosetestArgs = this.unitTest.nosetestArgs.map(arg => systemVariables.resolveAny(arg));
        this.unitTest.pyTestArgs = this.unitTest.pyTestArgs.map(arg => systemVariables.resolveAny(arg));
        this.unitTest.unittestArgs = this.unitTest.unittestArgs.map(arg => systemVariables.resolveAny(arg));
        let terminalSettings = systemVariables.resolveAny(pythonSettings.get('terminal'));
        if (this.terminal) {
            Object.assign(this.terminal, terminalSettings);
        }
        else {
            this.terminal = terminalSettings;
            if (IS_TEST_EXECUTION && !this.terminal) {
                this.terminal = {};
            }
        }
        // Support for travis
        this.terminal = this.terminal ? this.terminal : {
            executeInFileDir: true,
            launchArgs: []
        };
        this.jupyter = pythonSettings.get('jupyter');
        // Support for travis
        this.jupyter = this.jupyter ? this.jupyter : {
            appendResults: true, defaultKernel: '', startupCode: []
        };
        this.emit('change');
    }
    get pythonPath() {
        return this._pythonPath;
    }
    set pythonPath(value) {
        if (this._pythonPath === value) {
            return;
        }
        // Add support for specifying just the directory where the python executable will be located
        // E.g. virtual directory name
        try {
            this._pythonPath = getPythonExecutable(value);
        }
        catch (ex) {
            this._pythonPath = value;
        }
    }
}
PythonSettings.pythonSettings = new PythonSettings();
exports.PythonSettings = PythonSettings;
function getAbsolutePath(pathToCheck, rootDir) {
    pathToCheck = untildify(pathToCheck);
    if (IS_TEST_EXECUTION && !pathToCheck) {
        return rootDir;
    }
    if (pathToCheck.indexOf(path.sep) === -1) {
        return pathToCheck;
    }
    return path.isAbsolute(pathToCheck) ? pathToCheck : path.resolve(rootDir, pathToCheck);
}
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
function isValidPythonPath(pythonPath) {
    try {
        let output = child_process.execFileSync(pythonPath, ['-c', 'print(1234)'], { encoding: 'utf8' });
        return output.startsWith('1234');
    }
    catch (ex) {
        return false;
    }
}
//# sourceMappingURL=configSettings.js.map