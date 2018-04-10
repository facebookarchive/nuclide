"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const settings = require("./configSettings");
const helpers_1 = require("./helpers");
const utils_1 = require("./utils");
const os = require("os");
const constants_1 = require("./constants");
var Product;
(function (Product) {
    Product[Product["pytest"] = 0] = "pytest";
    Product[Product["nosetest"] = 1] = "nosetest";
    Product[Product["pylint"] = 2] = "pylint";
    Product[Product["flake8"] = 3] = "flake8";
    Product[Product["pep8"] = 4] = "pep8";
    Product[Product["pylama"] = 5] = "pylama";
    Product[Product["prospector"] = 6] = "prospector";
    Product[Product["pydocstyle"] = 7] = "pydocstyle";
    Product[Product["yapf"] = 8] = "yapf";
    Product[Product["autopep8"] = 9] = "autopep8";
    Product[Product["mypy"] = 10] = "mypy";
    Product[Product["unittest"] = 11] = "unittest";
    Product[Product["ctags"] = 12] = "ctags";
})(Product = exports.Product || (exports.Product = {}));
const ProductInstallScripts = new Map();
ProductInstallScripts.set(Product.autopep8, ['-m', 'pip', 'install', 'autopep8']);
ProductInstallScripts.set(Product.flake8, ['-m', 'pip', 'install', 'flake8']);
ProductInstallScripts.set(Product.mypy, ['-m', 'pip', 'install', 'mypy']);
ProductInstallScripts.set(Product.nosetest, ['-m', 'pip', 'install', 'nose']);
ProductInstallScripts.set(Product.pep8, ['-m', 'pip', 'install', 'pep8']);
ProductInstallScripts.set(Product.pylama, ['-m', 'pip', 'install', 'pylama']);
ProductInstallScripts.set(Product.prospector, ['-m', 'pip', 'install', 'prospector']);
ProductInstallScripts.set(Product.pydocstyle, ['-m', 'pip', 'install', 'pydocstyle']);
ProductInstallScripts.set(Product.pylint, ['-m', 'pip', 'install', 'pylint']);
ProductInstallScripts.set(Product.pytest, ['-m', 'pip', 'install', '-U', 'pytest']);
ProductInstallScripts.set(Product.yapf, ['-m', 'pip', 'install', 'yapf']);
const ProductUninstallScripts = new Map();
ProductUninstallScripts.set(Product.autopep8, ['-m', 'pip', 'uninstall', 'autopep8', '--yes']);
ProductUninstallScripts.set(Product.flake8, ['-m', 'pip', 'uninstall', 'flake8', '--yes']);
ProductUninstallScripts.set(Product.mypy, ['-m', 'pip', 'uninstall', 'mypy', '--yes']);
ProductUninstallScripts.set(Product.nosetest, ['-m', 'pip', 'uninstall', 'nose', '--yes']);
ProductUninstallScripts.set(Product.pep8, ['-m', 'pip', 'uninstall', 'pep8', '--yes']);
ProductUninstallScripts.set(Product.pylama, ['-m', 'pip', 'uninstall', 'pylama', '--yes']);
ProductUninstallScripts.set(Product.prospector, ['-m', 'pip', 'uninstall', 'prospector', '--yes']);
ProductUninstallScripts.set(Product.pydocstyle, ['-m', 'pip', 'uninstall', 'pydocstyle', '--yes']);
ProductUninstallScripts.set(Product.pylint, ['-m', 'pip', 'uninstall', 'pylint', '--yes']);
ProductUninstallScripts.set(Product.pytest, ['-m', 'pip', 'uninstall', 'pytest', '--yes']);
ProductUninstallScripts.set(Product.yapf, ['-m', 'pip', 'uninstall', 'yapf', '--yes']);
exports.ProductExecutableAndArgs = new Map();
exports.ProductExecutableAndArgs.set(Product.mypy, { executable: 'python', args: ['-m', 'mypy'] });
exports.ProductExecutableAndArgs.set(Product.nosetest, { executable: 'python', args: ['-m', 'nose'] });
exports.ProductExecutableAndArgs.set(Product.pylama, { executable: 'python', args: ['-m', 'pylama'] });
exports.ProductExecutableAndArgs.set(Product.prospector, { executable: 'python', args: ['-m', 'prospector'] });
exports.ProductExecutableAndArgs.set(Product.pylint, { executable: 'python', args: ['-m', 'pylint'] });
exports.ProductExecutableAndArgs.set(Product.pytest, { executable: 'python', args: ['-m', 'pytest'] });
exports.ProductExecutableAndArgs.set(Product.autopep8, { executable: 'python', args: ['-m', 'autopep8'] });
exports.ProductExecutableAndArgs.set(Product.pep8, { executable: 'python', args: ['-m', 'pep8'] });
exports.ProductExecutableAndArgs.set(Product.pydocstyle, { executable: 'python', args: ['-m', 'pydocstyle'] });
exports.ProductExecutableAndArgs.set(Product.yapf, { executable: 'python', args: ['-m', 'yapf'] });
exports.ProductExecutableAndArgs.set(Product.flake8, { executable: 'python', args: ['-m', 'flake8'] });
switch (os.platform()) {
    case 'win32': {
        // Nothing
        break;
    }
    case 'darwin': {
        ProductInstallScripts.set(Product.ctags, ['brew install ctags']);
    }
    default: {
        ProductInstallScripts.set(Product.ctags, ['sudo apt-get install exuberant-ctags']);
    }
}
exports.Linters = [
    Product.flake8,
    Product.pep8,
    Product.pylama,
    Product.prospector,
    Product.pylint,
    Product.mypy,
    Product.pydocstyle
];
const Formatters = [Product.autopep8, Product.yapf];
const TestFrameworks = [Product.pytest, Product.nosetest, Product.unittest];
const ProductNames = new Map();
ProductNames.set(Product.autopep8, 'autopep8');
ProductNames.set(Product.flake8, 'flake8');
ProductNames.set(Product.mypy, 'mypy');
ProductNames.set(Product.nosetest, 'nosetest');
ProductNames.set(Product.pep8, 'pep8');
ProductNames.set(Product.pylama, 'pylama');
ProductNames.set(Product.prospector, 'prospector');
ProductNames.set(Product.pydocstyle, 'pydocstyle');
ProductNames.set(Product.pylint, 'pylint');
ProductNames.set(Product.pytest, 'py.test');
ProductNames.set(Product.yapf, 'yapf');
exports.SettingToDisableProduct = new Map();
exports.SettingToDisableProduct.set(Product.flake8, 'linting.flake8Enabled');
exports.SettingToDisableProduct.set(Product.mypy, 'linting.mypyEnabled');
exports.SettingToDisableProduct.set(Product.nosetest, 'unitTest.nosetestsEnabled');
exports.SettingToDisableProduct.set(Product.pep8, 'linting.pep8Enabled');
exports.SettingToDisableProduct.set(Product.pylama, 'linting.pylamaEnabled');
exports.SettingToDisableProduct.set(Product.prospector, 'linting.prospectorEnabled');
exports.SettingToDisableProduct.set(Product.pydocstyle, 'linting.pydocstyleEnabled');
exports.SettingToDisableProduct.set(Product.pylint, 'linting.pylintEnabled');
exports.SettingToDisableProduct.set(Product.pytest, 'unitTest.pyTestEnabled');
class Installer {
    constructor(outputChannel = null) {
        this.outputChannel = outputChannel;
        this.disposables = [];
        this.disposables.push(vscode.window.onDidCloseTerminal(term => {
            if (term === Installer.terminal) {
                Installer.terminal = null;
            }
        }));
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
    promptToInstall(product) {
        let productType = exports.Linters.indexOf(product) >= 0 ? 'Linter' : (Formatters.indexOf(product) >= 0 ? 'Formatter' : 'Test Framework');
        const productName = ProductNames.get(product);
        const installOption = 'Install ' + productName;
        const disableOption = 'Disable this ' + productType;
        const alternateFormatter = product === Product.autopep8 ? 'yapf' : 'autopep8';
        const useOtherFormatter = `Use '${alternateFormatter}' formatter`;
        const options = [];
        if (Formatters.indexOf(product) === -1) {
            options.push(...[installOption, disableOption]);
        }
        else {
            options.push(...[installOption, useOtherFormatter]);
        }
        return vscode.window.showErrorMessage(`${productType} ${productName} is not installed`, ...options).then(item => {
            switch (item) {
                case installOption: {
                    return this.install(product);
                }
                case disableOption: {
                    if (exports.Linters.indexOf(product) >= 0) {
                        return disableLinter(product);
                    }
                    else {
                        const pythonConfig = vscode.workspace.getConfiguration('python');
                        const settingToDisable = exports.SettingToDisableProduct.get(product);
                        return pythonConfig.update(settingToDisable, false);
                    }
                }
                case useOtherFormatter: {
                    const pythonConfig = vscode.workspace.getConfiguration('python');
                    return pythonConfig.update('formatting.provider', alternateFormatter);
                }
                case 'Help': {
                    return Promise.resolve();
                }
            }
        });
    }
    install(product) {
        if (!this.outputChannel && !Installer.terminal) {
            Installer.terminal = vscode.window.createTerminal('Python Installer');
        }
        if (product === Product.ctags && os.platform() === 'win32') {
            vscode.commands.executeCommand('python.displayHelp', constants_1.Documentation.Workspace.InstallOnWindows);
            return Promise.resolve();
        }
        let installArgs = ProductInstallScripts.get(product);
        let pipIndex = installArgs.indexOf('pip');
        if (pipIndex > 0) {
            installArgs = installArgs.slice();
            let proxy = vscode.workspace.getConfiguration('http').get('proxy', '');
            if (proxy.length > 0) {
                installArgs.splice(2, 0, proxy);
                installArgs.splice(2, 0, '--proxy');
            }
        }
        if (this.outputChannel && installArgs[0] === '-m') {
            // Errors are just displayed to the user
            this.outputChannel.show();
            return utils_1.execPythonFile(settings.PythonSettings.getInstance().pythonPath, installArgs, vscode.workspace.rootPath, true, (data) => {
                this.outputChannel.append(data);
            });
        }
        else {
            // When using terminal get the fully qualitified path
            // Cuz people may launch vs code from terminal when they have activated the appropriate virtual env
            // Problem is terminal doesn't use the currently activated virtual env
            // Must have something to do with the process being launched in the terminal
            return utils_1.getFullyQualifiedPythonInterpreterPath()
                .then(pythonPath => {
                let installScript = installArgs.join(' ');
                if (installArgs[0] === '-m') {
                    if (pythonPath.indexOf(' ') >= 0) {
                        installScript = `"${pythonPath}" ${installScript}`;
                    }
                    else {
                        installScript = `${pythonPath} ${installScript}`;
                    }
                }
                Installer.terminal.sendText(installScript);
                Installer.terminal.show(false);
            });
        }
    }
    isInstalled(product) {
        return isProductInstalled(product);
    }
    uninstall(product) {
        return uninstallproduct(product);
    }
}
exports.Installer = Installer;
function disableLinter(product) {
    const pythonConfig = vscode.workspace.getConfiguration('python');
    const settingToDisable = exports.SettingToDisableProduct.get(product);
    if (vscode.workspace.rootPath) {
        return pythonConfig.update(settingToDisable, false);
    }
    else {
        return pythonConfig.update('linting.enabledWithoutWorkspace', false, true);
    }
}
exports.disableLinter = disableLinter;
function isProductInstalled(product) {
    const prodExec = exports.ProductExecutableAndArgs.get(product);
    return utils_1.execPythonFile(prodExec.executable, prodExec.args.concat(['--version']), vscode.workspace.rootPath, false)
        .then(() => {
        return true;
    }).catch(reason => {
        return !helpers_1.isNotInstalledError(reason);
    });
}
function uninstallproduct(product) {
    const uninstallArgs = ProductUninstallScripts.get(product);
    return utils_1.execPythonFile('python', uninstallArgs, vscode.workspace.rootPath, false);
}
//# sourceMappingURL=installer.js.map