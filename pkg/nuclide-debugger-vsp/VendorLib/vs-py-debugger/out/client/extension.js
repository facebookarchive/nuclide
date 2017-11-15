'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const completionProvider_1 = require("./providers/completionProvider");
const hoverProvider_1 = require("./providers/hoverProvider");
const definitionProvider_1 = require("./providers/definitionProvider");
const referenceProvider_1 = require("./providers/referenceProvider");
const renameProvider_1 = require("./providers/renameProvider");
const formatProvider_1 = require("./providers/formatProvider");
const sortImports = require("./sortImports");
const autoImport = require("./autoImport");
const lintProvider_1 = require("./providers/lintProvider");
const symbolProvider_1 = require("./providers/symbolProvider");
const signatureProvider_1 = require("./providers/signatureProvider");
const settings = require("./common/configSettings");
const simpleRefactorProvider_1 = require("./providers/simpleRefactorProvider");
const setInterpreterProvider_1 = require("./providers/setInterpreterProvider");
const execInTerminalProvider_1 = require("./providers/execInTerminalProvider");
const constants_1 = require("./common/constants");
const tests = require("./unittests/main");
const jup = require("./jupyter/main");
const helpProvider_1 = require("./helpProvider");
const updateSparkLibraryProvider_1 = require("./providers/updateSparkLibraryProvider");
const formatOnSaveProvider_1 = require("./providers/formatOnSaveProvider");
const main_1 = require("./workspaceSymbols/main");
const blockFormatProvider_1 = require("./typeFormatters/blockFormatProvider");
const os = require("os");
const fs = require("fs");
const singleFileDebug_1 = require("./singleFileDebug");
const utils_1 = require("./common/utils");
const provider_1 = require("./jupyter/provider");
const objectDefinitionProvider_1 = require("./providers/objectDefinitionProvider");
const PYTHON = { language: 'python', scheme: 'file' };
let unitTestOutChannel;
let formatOutChannel;
let lintingOutChannel;
let jupMain;
function activate(context) {
    let pythonSettings = settings.PythonSettings.getInstance();
    let pythonExt = new PythonExt();
    const hasPySparkInCompletionPath = pythonSettings.autoComplete.extraPaths.some(p => p.toLowerCase().indexOf('spark') >= 0);
    // telemetryHelper.sendTelemetryEvent(telemetryContracts.EVENT_LOAD, {
    //     CodeComplete_Has_ExtraPaths: pythonSettings.autoComplete.extraPaths.length > 0 ? 'true' : 'false',
    //     Format_Has_Custom_Python_Path: pythonSettings.pythonPath.length !== 'python'.length ? 'true' : 'false',
    //     Has_PySpark_Path: hasPySparkInCompletionPath ? 'true' : 'false'
    // });
    lintingOutChannel = vscode.window.createOutputChannel(pythonSettings.linting.outputWindow);
    formatOutChannel = lintingOutChannel;
    if (pythonSettings.linting.outputWindow !== pythonSettings.formatting.outputWindow) {
        formatOutChannel = vscode.window.createOutputChannel(pythonSettings.formatting.outputWindow);
        formatOutChannel.clear();
    }
    if (pythonSettings.linting.outputWindow !== pythonSettings.unitTest.outputWindow) {
        unitTestOutChannel = vscode.window.createOutputChannel(pythonSettings.unitTest.outputWindow);
        unitTestOutChannel.clear();
    }
    sortImports.activate(context, formatOutChannel);
    autoImport.activate(context, formatOutChannel);
    context.subscriptions.push(setInterpreterProvider_1.activateSetInterpreterProvider());
    context.subscriptions.push(...execInTerminalProvider_1.activateExecInTerminalProvider());
    context.subscriptions.push(updateSparkLibraryProvider_1.activateUpdateSparkLibraryProvider());
    simpleRefactorProvider_1.activateSimplePythonRefactorProvider(context, formatOutChannel);
    context.subscriptions.push(formatOnSaveProvider_1.activateFormatOnSaveProvider(PYTHON, settings.PythonSettings.getInstance(), formatOutChannel));
    context.subscriptions.push(objectDefinitionProvider_1.activateGoToObjectDefinitionProvider(context));
    context.subscriptions.push(vscode.commands.registerCommand(constants_1.Commands.Start_REPL, () => {
        utils_1.getPathFromPythonCommand(["-c", "import sys;print(sys.executable)"]).catch(() => {
            return pythonSettings.pythonPath;
        }).then(pythonExecutablePath => {
            let term = vscode.window.createTerminal('Python', pythonExecutablePath);
            term.show();
            context.subscriptions.push(term);
        });
    }));
    // Enable indentAction
    vscode.languages.setLanguageConfiguration(PYTHON.language, {
        onEnterRules: [
            {
                beforeText: /^\s*(?:def|class|for|if|elif|else|while|try|with|finally|except|async).*?:\s*$/,
                action: { indentAction: vscode.IndentAction.Indent }
            },
            {
                beforeText: /^ *#.*$/,
                afterText: /.+$/,
                action: { indentAction: vscode.IndentAction.None, appendText: '# ' },
            },
            {
                beforeText: /^\s+(continue|break|return)\b.*$/,
                action: { indentAction: vscode.IndentAction.Outdent },
            }
        ]
    });
    context.subscriptions.push(vscode.languages.registerRenameProvider(PYTHON, new renameProvider_1.PythonRenameProvider(formatOutChannel)));
    const definitionProvider = new definitionProvider_1.PythonDefinitionProvider(context);
    const jediProx = definitionProvider.JediProxy;
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(PYTHON, definitionProvider));
    context.subscriptions.push(vscode.languages.registerHoverProvider(PYTHON, new hoverProvider_1.PythonHoverProvider(context, jediProx)));
    context.subscriptions.push(vscode.languages.registerReferenceProvider(PYTHON, new referenceProvider_1.PythonReferenceProvider(context, jediProx)));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(PYTHON, new completionProvider_1.PythonCompletionItemProvider(context, jediProx), '.'));
    const symbolProvider = new symbolProvider_1.PythonSymbolProvider(context, jediProx);
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(PYTHON, symbolProvider));
    if (pythonSettings.devOptions.indexOf('DISABLE_SIGNATURE') === -1) {
        context.subscriptions.push(vscode.languages.registerSignatureHelpProvider(PYTHON, new signatureProvider_1.PythonSignatureProvider(context, jediProx), '(', ','));
    }
    if (pythonSettings.formatting.provider !== 'none') {
        const formatProvider = new formatProvider_1.PythonFormattingEditProvider(context, formatOutChannel, pythonSettings);
        context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(PYTHON, formatProvider));
        context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider(PYTHON, formatProvider));
    }
    const jupyterExtInstalled = vscode.extensions.getExtension('donjayamanne.jupyter');
    let linterProvider = new lintProvider_1.LintProvider(context, lintingOutChannel, (a, b) => Promise.resolve(false));
    context.subscriptions.push();
    if (jupyterExtInstalled) {
        if (jupyterExtInstalled.isActive) {
            jupyterExtInstalled.exports.registerLanguageProvider(PYTHON.language, new provider_1.JupyterProvider());
            linterProvider.documentHasJupyterCodeCells = jupyterExtInstalled.exports.hasCodeCells;
        }
        jupyterExtInstalled.activate().then(() => {
            jupyterExtInstalled.exports.registerLanguageProvider(PYTHON.language, new provider_1.JupyterProvider());
            linterProvider.documentHasJupyterCodeCells = jupyterExtInstalled.exports.hasCodeCells;
        });
    }
    else {
        jupMain = new jup.Jupyter(lintingOutChannel);
        const documentHasJupyterCodeCells = jupMain.hasCodeCells.bind(jupMain);
        jupMain.activate();
        context.subscriptions.push(jupMain);
        linterProvider.documentHasJupyterCodeCells = documentHasJupyterCodeCells;
    }
    tests.activate(context, unitTestOutChannel, symbolProvider);
    context.subscriptions.push(new main_1.WorkspaceSymbols(lintingOutChannel));
    context.subscriptions.push(vscode.languages.registerOnTypeFormattingEditProvider(PYTHON, new blockFormatProvider_1.BlockFormatProviders(), ':'));
    // In case we have CR LF
    const triggerCharacters = os.EOL.split('');
    triggerCharacters.shift();
    const hepProvider = new helpProvider_1.HelpProvider();
    context.subscriptions.push(hepProvider);
    context.subscriptions.push(singleFileDebug_1.activateSingleFileDebug());
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
class PythonExt {
    constructor() {
        this._isDjangoProject = new ContextKey('python.isDjangoProject');
        this._ensureState();
    }
    _ensureState() {
        // context: python.isDjangoProject
        if (typeof vscode.workspace.rootPath === 'string') {
            this._isDjangoProject.set(fs.existsSync(vscode.workspace.rootPath.concat("/manage.py")));
        }
        else {
            this._isDjangoProject.set(false);
        }
    }
}
class ContextKey {
    constructor(name) {
        this._name = name;
    }
    set(value) {
        if (this._lastValue === value) {
            return;
        }
        this._lastValue = value;
        vscode.commands.executeCommand('setContext', this._name, this._lastValue);
    }
}
//# sourceMappingURL=extension.js.map