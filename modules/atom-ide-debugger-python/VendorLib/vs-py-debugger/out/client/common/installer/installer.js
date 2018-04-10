"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const os = require("os");
const path = require("path");
const vscode_1 = require("vscode");
const types_1 = require("../../formatters/types");
const types_2 = require("../../ioc/types");
const types_3 = require("../../linters/types");
const types_4 = require("../../unittests/common/types");
const configSettings_1 = require("../configSettings");
const constants_1 = require("../constants");
const types_5 = require("../platform/types");
const types_6 = require("../process/types");
const types_7 = require("../terminal/types");
const types_8 = require("../types");
const types_9 = require("./types");
var types_10 = require("../types");
exports.Product = types_10.Product;
const CTagsInsllationScript = os.platform() === 'darwin' ? 'brew install ctags' : 'sudo apt-get install exuberant-ctags';
// tslint:disable-next-line:variable-name
const ProductNames = new Map();
ProductNames.set(types_8.Product.autopep8, 'autopep8');
ProductNames.set(types_8.Product.flake8, 'flake8');
ProductNames.set(types_8.Product.mypy, 'mypy');
ProductNames.set(types_8.Product.nosetest, 'nosetest');
ProductNames.set(types_8.Product.pep8, 'pep8');
ProductNames.set(types_8.Product.pylama, 'pylama');
ProductNames.set(types_8.Product.prospector, 'prospector');
ProductNames.set(types_8.Product.pydocstyle, 'pydocstyle');
ProductNames.set(types_8.Product.pylint, 'pylint');
ProductNames.set(types_8.Product.pytest, 'pytest');
ProductNames.set(types_8.Product.yapf, 'yapf');
ProductNames.set(types_8.Product.rope, 'rope');
// tslint:disable-next-line:variable-name
const ProductInstallationPrompt = new Map();
ProductInstallationPrompt.set(types_8.Product.ctags, 'Install CTags to enable Python workspace symbols');
var ProductType;
(function (ProductType) {
    ProductType[ProductType["Linter"] = 0] = "Linter";
    ProductType[ProductType["Formatter"] = 1] = "Formatter";
    ProductType[ProductType["TestFramework"] = 2] = "TestFramework";
    ProductType[ProductType["RefactoringLibrary"] = 3] = "RefactoringLibrary";
    ProductType[ProductType["WorkspaceSymbols"] = 4] = "WorkspaceSymbols";
})(ProductType || (ProductType = {}));
const ProductTypeNames = new Map();
ProductTypeNames.set(ProductType.Formatter, 'Formatter');
ProductTypeNames.set(ProductType.Linter, 'Linter');
ProductTypeNames.set(ProductType.RefactoringLibrary, 'Refactoring library');
ProductTypeNames.set(ProductType.TestFramework, 'Test Framework');
ProductTypeNames.set(ProductType.WorkspaceSymbols, 'Workspace Symbols');
const ProductTypes = new Map();
ProductTypes.set(types_8.Product.flake8, ProductType.Linter);
ProductTypes.set(types_8.Product.mypy, ProductType.Linter);
ProductTypes.set(types_8.Product.pep8, ProductType.Linter);
ProductTypes.set(types_8.Product.prospector, ProductType.Linter);
ProductTypes.set(types_8.Product.pydocstyle, ProductType.Linter);
ProductTypes.set(types_8.Product.pylama, ProductType.Linter);
ProductTypes.set(types_8.Product.pylint, ProductType.Linter);
ProductTypes.set(types_8.Product.ctags, ProductType.WorkspaceSymbols);
ProductTypes.set(types_8.Product.nosetest, ProductType.TestFramework);
ProductTypes.set(types_8.Product.pytest, ProductType.TestFramework);
ProductTypes.set(types_8.Product.unittest, ProductType.TestFramework);
ProductTypes.set(types_8.Product.autopep8, ProductType.Formatter);
ProductTypes.set(types_8.Product.yapf, ProductType.Formatter);
ProductTypes.set(types_8.Product.rope, ProductType.RefactoringLibrary);
let Installer = class Installer {
    constructor(serviceContainer, outputChannel) {
        this.serviceContainer = serviceContainer;
        this.outputChannel = outputChannel;
    }
    // tslint:disable-next-line:no-empty
    dispose() { }
    promptToInstall(product, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const productType = ProductTypes.get(product);
            const productTypeName = ProductTypeNames.get(productType);
            const productName = ProductNames.get(product);
            const installOption = ProductInstallationPrompt.has(product) ? ProductInstallationPrompt.get(product) : `Install ${productName}`;
            const alternateFormatter = product === types_8.Product.autopep8 ? 'yapf' : 'autopep8';
            const useOtherFormatter = `Use '${alternateFormatter}' formatter`;
            const options = [];
            options.push(installOption);
            if (productType === ProductType.Formatter) {
                options.push(...[useOtherFormatter]);
            }
            const item = yield vscode_1.window.showErrorMessage(`${productTypeName} ${productName} is not installed`, ...options);
            if (!item) {
                return types_8.InstallerResponse.Ignore;
            }
            switch (item) {
                case installOption: {
                    return this.install(product, resource);
                }
                case useOtherFormatter: {
                    return this.updateSetting('formatting.provider', alternateFormatter, resource)
                        .then(() => types_8.InstallerResponse.Installed);
                }
                default: {
                    throw new Error('Invalid selection');
                }
            }
        });
    }
    translateProductToModuleName(product, purpose) {
        switch (product) {
            case types_8.Product.mypy: return 'mypy';
            case types_8.Product.nosetest: {
                return purpose === types_8.ModuleNamePurpose.install ? 'nose' : 'nosetests';
            }
            case types_8.Product.pylama: return 'pylama';
            case types_8.Product.prospector: return 'prospector';
            case types_8.Product.pylint: return 'pylint';
            case types_8.Product.pytest: return 'pytest';
            case types_8.Product.autopep8: return 'autopep8';
            case types_8.Product.pep8: return 'pep8';
            case types_8.Product.pydocstyle: return 'pydocstyle';
            case types_8.Product.yapf: return 'yapf';
            case types_8.Product.flake8: return 'flake8';
            case types_8.Product.unittest: return 'unittest';
            case types_8.Product.rope: return 'rope';
            default: {
                throw new Error(`Product ${product} cannot be installed as a Python Module.`);
            }
        }
    }
    install(product, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            if (product === types_8.Product.unittest) {
                return types_8.InstallerResponse.Installed;
            }
            if (product === types_8.Product.ctags) {
                return this.installCTags();
            }
            const channels = this.serviceContainer.get(types_9.IInstallationChannelManager);
            const installer = yield channels.getInstallationChannel(product, resource);
            if (!installer) {
                return types_8.InstallerResponse.Ignore;
            }
            const moduleName = this.translateProductToModuleName(product, types_8.ModuleNamePurpose.install);
            const logger = this.serviceContainer.get(types_8.ILogger);
            yield installer.installModule(moduleName, resource)
                .catch(logger.logError.bind(logger, `Error in installing the module '${moduleName}'`));
            return this.isInstalled(product)
                .then(isInstalled => isInstalled ? types_8.InstallerResponse.Installed : types_8.InstallerResponse.Ignore);
        });
    }
    isInstalled(product, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            if (product === types_8.Product.unittest) {
                return true;
            }
            let moduleName;
            try {
                moduleName = this.translateProductToModuleName(product, types_8.ModuleNamePurpose.run);
                // tslint:disable-next-line:no-empty
            }
            catch (_a) { }
            // User may have customized the module name or provided the fully qualifieid path.
            const executableName = this.getExecutableNameFromSettings(product, resource);
            const isModule = typeof moduleName === 'string' && moduleName.length > 0 && path.basename(executableName) === executableName;
            // Prospector is an exception, it can be installed as a module, but not run as one.
            if (product !== types_8.Product.prospector && isModule) {
                const pythonProcess = yield this.serviceContainer.get(types_6.IPythonExecutionFactory).create(resource);
                return pythonProcess.isModuleInstalled(executableName);
            }
            else {
                const process = this.serviceContainer.get(types_6.IProcessService);
                const prospectorPath = configSettings_1.PythonSettings.getInstance(resource).linting.prospectorPath;
                return process.exec(prospectorPath, ['--version'], { mergeStdOutErr: true })
                    .then(() => true)
                    .catch(() => false);
            }
        });
    }
    installCTags() {
        if (this.serviceContainer.get(types_5.IPlatformService).isWindows) {
            this.outputChannel.appendLine('Install Universal Ctags Win32 to enable support for Workspace Symbols');
            this.outputChannel.appendLine('Download the CTags binary from the Universal CTags site.');
            this.outputChannel.appendLine('Option 1: Extract ctags.exe from the downloaded zip to any folder within your PATH so that Visual Studio Code can run it.');
            this.outputChannel.appendLine('Option 2: Extract to any folder and add the path to this folder to the command setting.');
            this.outputChannel.appendLine('Option 3: Extract to any folder and define that path in the python.workspaceSymbols.ctagsPath setting of your user settings file (settings.json).');
            this.outputChannel.show();
        }
        else {
            const terminalServiceFactory = this.serviceContainer.get(types_7.ITerminalServiceFactory);
            const terminalService = terminalServiceFactory.getTerminalService();
            const logger = this.serviceContainer.get(types_8.ILogger);
            terminalService.sendCommand(CTagsInsllationScript, [])
                .catch(logger.logError.bind(logger, `Failed to install ctags. Script sent '${CTagsInsllationScript}'.`));
        }
        return types_8.InstallerResponse.Ignore;
    }
    // tslint:disable-next-line:no-any
    updateSetting(setting, value, resource) {
        if (resource && vscode_1.workspace.getWorkspaceFolder(resource)) {
            const pythonConfig = vscode_1.workspace.getConfiguration('python', resource);
            return pythonConfig.update(setting, value, vscode_1.ConfigurationTarget.Workspace);
        }
        else {
            const pythonConfig = vscode_1.workspace.getConfiguration('python');
            return pythonConfig.update(setting, value, true);
        }
    }
    getExecutableNameFromSettings(product, resource) {
        const settings = configSettings_1.PythonSettings.getInstance(resource);
        const productType = ProductTypes.get(product);
        switch (productType) {
            case ProductType.WorkspaceSymbols: return settings.workspaceSymbols.ctagsPath;
            case ProductType.TestFramework: {
                const testHelper = this.serviceContainer.get(types_4.ITestsHelper);
                const settingsPropNames = testHelper.getSettingsPropertyNames(product);
                if (!settingsPropNames.pathName) {
                    // E.g. in the case of UnitTests we don't allow customizing the paths.
                    return this.translateProductToModuleName(product, types_8.ModuleNamePurpose.run);
                }
                return settings.unitTest[settingsPropNames.pathName];
            }
            case ProductType.Formatter: {
                const formatHelper = this.serviceContainer.get(types_1.IFormatterHelper);
                const settingsPropNames = formatHelper.getSettingsPropertyNames(product);
                return settings.formatting[settingsPropNames.pathName];
            }
            case ProductType.RefactoringLibrary: return this.translateProductToModuleName(product, types_8.ModuleNamePurpose.run);
            case ProductType.Linter: {
                const linterManager = this.serviceContainer.get(types_3.ILinterManager);
                return linterManager.getLinterInfo(product).pathName(resource);
            }
            default: {
                throw new Error(`Unrecognized Product '${product}'`);
            }
        }
    }
};
Installer = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_2.IServiceContainer)),
    __param(1, inversify_1.inject(types_8.IOutputChannel)), __param(1, inversify_1.named(constants_1.STANDARD_OUTPUT_CHANNEL))
], Installer);
exports.Installer = Installer;
//# sourceMappingURL=installer.js.map