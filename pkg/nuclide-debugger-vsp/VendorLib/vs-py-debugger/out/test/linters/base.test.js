// //
// // Note: This example test is leveraging the Mocha test framework.
// // Please refer to their documentation on https://mochajs.org/ for help.
// // Place this right on top
// import { initialize, IS_TRAVIS, PYTHON_PATH, closeActiveWindows, setPythonExecutable } from '../initialize';
// // The module \'assert\' provides assertion methods from node
// import * as assert from 'assert';
// // You can import and use all API from the \'vscode\' module
// // as well as import your extension to test it
// import { EnumEx } from '../../client/common/enumUtils';
// import { LinterFactor } from '../../client/linters/main';
// import { SettingToDisableProduct, Product } from '../../client/common/installer';
// import * as baseLinter from '../../client/linters/baseLinter';
// import * as path from 'path';
// import * as settings from '../../client/common/configSettings';
// import { MockOutputChannel } from '../mockClasses';
// import { Disposable } from 'vscode';
// const pythonSettings = settings.PythonSettings.getInstance();
// const pythoFilesPath = path.join(__dirname, '..', '..', '..', 'src', 'test', 'pythonFiles', 'linting');
// let disposable: Disposable;
// suite('Linting', () => {
//     suiteSetup(() => {
//         disposable = setPythonExecutable(pythonSettings);
//     });
//     setup(() => {
//         pythonSettings.linting.enabled = true;
//         pythonSettings.linting.pylintEnabled = true;
//         pythonSettings.linting.flake8Enabled = true;
//         pythonSettings.linting.pep8Enabled = true;
//         pythonSettings.linting.prospectorEnabled = true;
//         pythonSettings.linting.pydocstyleEnabled = true;
//         pythonSettings.linting.mypyEnabled = true;
//         pythonSettings.linting.pylamaEnabled = true;
//     });
//     suiteTeardown(done => {
//         if (disposable) { disposable.dispose(); }
//         closeActiveWindows().then(() => done(), () => done());
//     });
//     teardown(done => {
//         closeActiveWindows().then(() => done(), () => done());
//     });
//     function testEnablingDisablingOfLinter(linter: baseLinter.BaseLinter, propertyName: string) {
//         pythonSettings.linting[propertyName] = true;
//         assert.equal(true, linter.isEnabled());
//         pythonSettings.linting[propertyName] = false;
//         assert.equal(false, linter.isEnabled());
//     }
//     EnumEx.getNamesAndValues(Product).forEach(product => {
//         if (product.value === Product.autopep8 ||
//             product.value === Product.ctags ||
//             product.value === Product.pytest ||
//             product.value === Product.unittest ||
//             product.value === Product.yapf ||
//             product.value === Product.nosetest) {
//             return;
//         }
//         test(`Enable and Disable ${product.name}`, () => {
//             let ch = new MockOutputChannel('Lint');
//             const settingPath = SettingToDisableProduct.get(product.value);
//             const settingName = path.extname(settingPath).substring(1);
//             testEnablingDisablingOfLinter(LinterFactor.createLinter(product.value, ch, pythoFilesPath), settingName);
//         });
//     });
// }); 
//# sourceMappingURL=base.test.js.map