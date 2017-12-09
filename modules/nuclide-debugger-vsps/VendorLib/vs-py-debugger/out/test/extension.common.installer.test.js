"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
// Place this right on top
const initialize_1 = require("./initialize");
// The module \'assert\' provides assertion methods from node
const assert = require("assert");
// You can import and use all API from the \'vscode\' module
// as well as import your extension to test it
const settings = require("../client/common/configSettings");
const mockClasses_1 = require("./mockClasses");
const installer_1 = require("../client/common/installer");
const enumUtils_1 = require("../client/common/enumUtils");
let pythonSettings = settings.PythonSettings.getInstance();
suite('Installer', () => {
    let outputChannel;
    let installer;
    let setPythonPathDisposable;
    suiteSetup(() => {
        setPythonPathDisposable = initialize_1.setPythonExecutable(pythonSettings);
        outputChannel = new mockClasses_1.MockOutputChannel('Installer');
        installer = new installer_1.Installer(outputChannel);
    });
    suiteTeardown(done => {
        setPythonPathDisposable.dispose();
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    teardown(done => {
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    function testUninstallingProduct(product) {
        return __awaiter(this, void 0, void 0, function* () {
            const isInstalled = yield installer.isInstalled(product);
            if (isInstalled) {
                yield installer.uninstall(product);
                const isInstalled = yield installer.isInstalled(product);
                assert.equal(isInstalled, false, `Product uninstall failed`);
            }
        });
    }
    enumUtils_1.EnumEx.getNamesAndValues(installer_1.Product).forEach(prod => {
        test(`${prod.name} : Uninstall`, () => __awaiter(this, void 0, void 0, function* () {
            if (prod.value === installer_1.Product.unittest || prod.value === installer_1.Product.ctags) {
                return;
            }
            yield testUninstallingProduct(prod.value);
        }));
    });
    function testInstallingProduct(product) {
        return __awaiter(this, void 0, void 0, function* () {
            const isInstalled = yield installer.isInstalled(product);
            if (!isInstalled) {
                yield installer.install(product);
            }
            const checkIsInstalledAgain = yield installer.isInstalled(product);
            assert.equal(checkIsInstalledAgain, true, `Product installation failed`);
        });
    }
    enumUtils_1.EnumEx.getNamesAndValues(installer_1.Product).forEach(prod => {
        test(`${prod.name} : Install`, () => __awaiter(this, void 0, void 0, function* () {
            if (prod.value === installer_1.Product.unittest || prod.value === installer_1.Product.ctags) {
                return;
            }
            yield testInstallingProduct(prod.value);
        }));
    });
});
//# sourceMappingURL=extension.common.installer.test.js.map