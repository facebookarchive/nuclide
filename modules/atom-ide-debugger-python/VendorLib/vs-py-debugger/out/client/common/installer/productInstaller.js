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
const types_1 = require("../../formatters/types");
const types_2 = require("../../ioc/types");
const types_3 = require("../../linters/types");
const types_4 = require("../../unittests/common/types");
const types_5 = require("../application/types");
const constants_1 = require("../constants");
const types_6 = require("../platform/types");
const types_7 = require("../process/types");
const types_8 = require("../terminal/types");
const types_9 = require("../types");
const productNames_1 = require("./productNames");
const types_10 = require("./types");
var types_11 = require("../types");
exports.Product = types_11.Product;
const CTagsInsllationScript = os.platform() === 'darwin' ? 'brew install ctags' : 'sudo apt-get install exuberant-ctags';
var ProductType;
(function (ProductType) {
    ProductType[ProductType["Linter"] = 0] = "Linter";
    ProductType[ProductType["Formatter"] = 1] = "Formatter";
    ProductType[ProductType["TestFramework"] = 2] = "TestFramework";
    ProductType[ProductType["RefactoringLibrary"] = 3] = "RefactoringLibrary";
    ProductType[ProductType["WorkspaceSymbols"] = 4] = "WorkspaceSymbols";
})(ProductType || (ProductType = {}));
// tslint:disable-next-line:max-classes-per-file
class BaseInstaller {
    constructor(serviceContainer, outputChannel) {
        this.serviceContainer = serviceContainer;
        this.outputChannel = outputChannel;
        this.appShell = serviceContainer.get(types_5.IApplicationShell);
        this.configService = serviceContainer.get(types_9.IConfigurationService);
    }
    install(product, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            if (product === types_9.Product.unittest) {
                return types_9.InstallerResponse.Installed;
            }
            const channels = this.serviceContainer.get(types_10.IInstallationChannelManager);
            const installer = yield channels.getInstallationChannel(product, resource);
            if (!installer) {
                return types_9.InstallerResponse.Ignore;
            }
            const moduleName = translateProductToModule(product, types_9.ModuleNamePurpose.install);
            const logger = this.serviceContainer.get(types_9.ILogger);
            yield installer.installModule(moduleName, resource)
                .catch(logger.logError.bind(logger, `Error in installing the module '${moduleName}'`));
            return this.isInstalled(product)
                .then(isInstalled => isInstalled ? types_9.InstallerResponse.Installed : types_9.InstallerResponse.Ignore);
        });
    }
    isInstalled(product, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            let moduleName;
            try {
                moduleName = translateProductToModule(product, types_9.ModuleNamePurpose.run);
                // tslint:disable-next-line:no-empty
            }
            catch (_a) { }
            // User may have customized the module name or provided the fully qualifieid path.
            const executableName = this.getExecutableNameFromSettings(product, resource);
            const isModule = typeof moduleName === 'string' && moduleName.length > 0 && path.basename(executableName) === executableName;
            // Prospector is an exception, it can be installed as a module, but not run as one.
            if (product !== types_9.Product.prospector && isModule) {
                const pythonProcess = yield this.serviceContainer.get(types_7.IPythonExecutionFactory).create(resource);
                return pythonProcess.isModuleInstalled(executableName);
            }
            else {
                const process = this.serviceContainer.get(types_7.IProcessService);
                const prospectorPath = this.configService.getSettings(resource).linting.prospectorPath;
                return process.exec(prospectorPath, ['--version'], { mergeStdOutErr: true })
                    .then(() => true)
                    .catch(() => false);
            }
        });
    }
    getExecutableNameFromSettings(product, resource) {
        throw new Error('getExecutableNameFromSettings is not supported on this object');
    }
}
class CTagsInstaller extends BaseInstaller {
    constructor(serviceContainer, outputChannel) {
        super(serviceContainer, outputChannel);
    }
    promptToInstall(product, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield this.appShell.showErrorMessage('Install CTags to enable Python workspace symbols?', 'Yes', 'No');
            return item === 'Yes' ? this.install(product, resource) : types_9.InstallerResponse.Ignore;
        });
    }
    install(product, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.serviceContainer.get(types_6.IPlatformService).isWindows) {
                this.outputChannel.appendLine('Install Universal Ctags Win32 to enable support for Workspace Symbols');
                this.outputChannel.appendLine('Download the CTags binary from the Universal CTags site.');
                this.outputChannel.appendLine('Option 1: Extract ctags.exe from the downloaded zip to any folder within your PATH so that Visual Studio Code can run it.');
                this.outputChannel.appendLine('Option 2: Extract to any folder and add the path to this folder to the command setting.');
                this.outputChannel.appendLine('Option 3: Extract to any folder and define that path in the python.workspaceSymbols.ctagsPath setting of your user settings file (settings.json).');
                this.outputChannel.show();
            }
            else {
                const terminalService = this.serviceContainer.get(types_8.ITerminalServiceFactory).getTerminalService();
                const logger = this.serviceContainer.get(types_9.ILogger);
                terminalService.sendCommand(CTagsInsllationScript, [])
                    .catch(logger.logError.bind(logger, `Failed to install ctags. Script sent '${CTagsInsllationScript}'.`));
            }
            return types_9.InstallerResponse.Ignore;
        });
    }
    getExecutableNameFromSettings(product, resource) {
        const settings = this.configService.getSettings(resource);
        return settings.workspaceSymbols.ctagsPath;
    }
}
class FormatterInstaller extends BaseInstaller {
    promptToInstall(product, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const productName = productNames_1.ProductNames.get(product);
            const installThis = `Install ${productName}`;
            const alternateFormatter = product === types_9.Product.autopep8 ? 'yapf' : 'autopep8';
            const useOtherFormatter = `Use '${alternateFormatter}' formatter`;
            const item = yield this.appShell.showErrorMessage(`Formatter ${productName} is not installed.`, installThis, useOtherFormatter);
            if (item === installThis) {
                return this.install(product, resource);
            }
            if (item === useOtherFormatter) {
                yield this.configService.updateSettingAsync('formatting.provider', alternateFormatter, resource);
                return types_9.InstallerResponse.Installed;
            }
            return types_9.InstallerResponse.Ignore;
        });
    }
    getExecutableNameFromSettings(product, resource) {
        const settings = this.configService.getSettings(resource);
        const formatHelper = this.serviceContainer.get(types_1.IFormatterHelper);
        const settingsPropNames = formatHelper.getSettingsPropertyNames(product);
        return settings.formatting[settingsPropNames.pathName];
    }
}
// tslint:disable-next-line:max-classes-per-file
class LinterInstaller extends BaseInstaller {
    promptToInstall(product, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const productName = productNames_1.ProductNames.get(product);
            const install = 'Install';
            const disableAllLinting = 'Disable linting';
            const disableThisLinter = `Disable ${productName}`;
            const response = yield this.appShell
                .showErrorMessage(`Linter ${productName} is not installed.`, install, disableThisLinter, disableAllLinting);
            if (response === install) {
                return this.install(product, resource);
            }
            const lm = this.serviceContainer.get(types_3.ILinterManager);
            if (response === disableAllLinting) {
                yield lm.enableLintingAsync(false);
                return types_9.InstallerResponse.Disabled;
            }
            else if (response === disableThisLinter) {
                yield lm.getLinterInfo(product).enableAsync(false);
                return types_9.InstallerResponse.Disabled;
            }
            return types_9.InstallerResponse.Ignore;
        });
    }
    getExecutableNameFromSettings(product, resource) {
        const linterManager = this.serviceContainer.get(types_3.ILinterManager);
        return linterManager.getLinterInfo(product).pathName(resource);
    }
}
// tslint:disable-next-line:max-classes-per-file
class TestFrameworkInstaller extends BaseInstaller {
    promptToInstall(product, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const productName = productNames_1.ProductNames.get(product);
            const item = yield this.appShell.showErrorMessage(`Test framework ${productName} is not installed. Install?`, 'Yes', 'No');
            return item === 'Yes' ? this.install(product, resource) : types_9.InstallerResponse.Ignore;
        });
    }
    getExecutableNameFromSettings(product, resource) {
        const testHelper = this.serviceContainer.get(types_4.ITestsHelper);
        const settingsPropNames = testHelper.getSettingsPropertyNames(product);
        if (!settingsPropNames.pathName) {
            // E.g. in the case of UnitTests we don't allow customizing the paths.
            return translateProductToModule(product, types_9.ModuleNamePurpose.run);
        }
        const settings = this.configService.getSettings(resource);
        return settings.unitTest[settingsPropNames.pathName];
    }
}
// tslint:disable-next-line:max-classes-per-file
class RefactoringLibraryInstaller extends BaseInstaller {
    promptToInstall(product, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const productName = productNames_1.ProductNames.get(product);
            const item = yield this.appShell.showErrorMessage(`Refactoring library ${productName} is not installed. Install?`, 'Yes', 'No');
            return item === 'Yes' ? this.install(product, resource) : types_9.InstallerResponse.Ignore;
        });
    }
    getExecutableNameFromSettings(product, resource) {
        return translateProductToModule(product, types_9.ModuleNamePurpose.run);
    }
}
// tslint:disable-next-line:max-classes-per-file
let ProductInstaller = class ProductInstaller {
    constructor(serviceContainer, outputChannel) {
        this.serviceContainer = serviceContainer;
        this.outputChannel = outputChannel;
        this.ProductTypes = new Map();
        this.ProductTypes.set(types_9.Product.flake8, ProductType.Linter);
        this.ProductTypes.set(types_9.Product.mypy, ProductType.Linter);
        this.ProductTypes.set(types_9.Product.pep8, ProductType.Linter);
        this.ProductTypes.set(types_9.Product.prospector, ProductType.Linter);
        this.ProductTypes.set(types_9.Product.pydocstyle, ProductType.Linter);
        this.ProductTypes.set(types_9.Product.pylama, ProductType.Linter);
        this.ProductTypes.set(types_9.Product.pylint, ProductType.Linter);
        this.ProductTypes.set(types_9.Product.ctags, ProductType.WorkspaceSymbols);
        this.ProductTypes.set(types_9.Product.nosetest, ProductType.TestFramework);
        this.ProductTypes.set(types_9.Product.pytest, ProductType.TestFramework);
        this.ProductTypes.set(types_9.Product.unittest, ProductType.TestFramework);
        this.ProductTypes.set(types_9.Product.autopep8, ProductType.Formatter);
        this.ProductTypes.set(types_9.Product.yapf, ProductType.Formatter);
        this.ProductTypes.set(types_9.Product.rope, ProductType.RefactoringLibrary);
    }
    // tslint:disable-next-line:no-empty
    dispose() { }
    promptToInstall(product, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createInstaller(product).promptToInstall(product, resource);
        });
    }
    install(product, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createInstaller(product).install(product, resource);
        });
    }
    isInstalled(product, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createInstaller(product).isInstalled(product, resource);
        });
    }
    translateProductToModuleName(product, purpose) {
        return translateProductToModule(product, purpose);
    }
    createInstaller(product) {
        const productType = this.ProductTypes.get(product);
        switch (productType) {
            case ProductType.Formatter:
                return new FormatterInstaller(this.serviceContainer, this.outputChannel);
            case ProductType.Linter:
                return new LinterInstaller(this.serviceContainer, this.outputChannel);
            case ProductType.WorkspaceSymbols:
                return new CTagsInstaller(this.serviceContainer, this.outputChannel);
            case ProductType.TestFramework:
                return new TestFrameworkInstaller(this.serviceContainer, this.outputChannel);
            case ProductType.RefactoringLibrary:
                return new RefactoringLibraryInstaller(this.serviceContainer, this.outputChannel);
            default:
                break;
        }
        throw new Error(`Unknown product ${product}`);
    }
};
ProductInstaller = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_2.IServiceContainer)),
    __param(1, inversify_1.inject(types_9.IOutputChannel)), __param(1, inversify_1.named(constants_1.STANDARD_OUTPUT_CHANNEL))
], ProductInstaller);
exports.ProductInstaller = ProductInstaller;
function translateProductToModule(product, purpose) {
    switch (product) {
        case types_9.Product.mypy: return 'mypy';
        case types_9.Product.nosetest: {
            return purpose === types_9.ModuleNamePurpose.install ? 'nose' : 'nosetests';
        }
        case types_9.Product.pylama: return 'pylama';
        case types_9.Product.prospector: return 'prospector';
        case types_9.Product.pylint: return 'pylint';
        case types_9.Product.pytest: return 'pytest';
        case types_9.Product.autopep8: return 'autopep8';
        case types_9.Product.pep8: return 'pep8';
        case types_9.Product.pydocstyle: return 'pydocstyle';
        case types_9.Product.yapf: return 'yapf';
        case types_9.Product.flake8: return 'flake8';
        case types_9.Product.unittest: return 'unittest';
        case types_9.Product.rope: return 'rope';
        default: {
            throw new Error(`Product ${product} cannot be installed as a Python Module.`);
        }
    }
}
//# sourceMappingURL=productInstaller.js.map