'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const configSettings_1 = require("../common/configSettings");
const installer_1 = require("../common/installer");
const nose = require("./nosetest/testConfigurationManager");
const pytest = require("./pytest/testConfigurationManager");
const unittest = require("./unittest/testConfigurationManager");
const utils_1 = require("../common/utils");
const path = require("path");
const settings = configSettings_1.PythonSettings.getInstance();
function promptToEnableAndConfigureTestFramework(outputChannel, messageToDisplay = 'Select a test framework/tool to enable', enableOnly = false) {
    const items = [{
            label: 'unittest',
            product: installer_1.Product.unittest,
            description: 'Standard Python test framework',
            detail: 'https://docs.python.org/2/library/unittest.html'
        },
        {
            label: 'pytest',
            product: installer_1.Product.pytest,
            description: 'Can run unittest (including trial) and nose test suites out of the box',
            detail: 'http://docs.pytest.org/en/latest/'
        },
        {
            label: 'nose',
            product: installer_1.Product.nosetest,
            description: 'nose framework',
            detail: 'https://docs.python.org/2/library/unittest.html'
        }];
    const options = {
        matchOnDescription: true,
        matchOnDetail: true,
        placeHolder: messageToDisplay
    };
    return vscode.window.showQuickPick(items, options).then(item => {
        if (!item) {
            return Promise.reject(null);
        }
        let configMgr;
        switch (item.product) {
            case installer_1.Product.unittest: {
                configMgr = new unittest.ConfigurationManager(outputChannel);
                break;
            }
            case installer_1.Product.pytest: {
                configMgr = new pytest.ConfigurationManager(outputChannel);
                break;
            }
            case installer_1.Product.nosetest: {
                configMgr = new nose.ConfigurationManager(outputChannel);
                break;
            }
            default: {
                throw new Error('Invalid test configuration');
            }
        }
        if (enableOnly) {
            // Ensure others are disabled
            if (item.product !== installer_1.Product.unittest) {
                (new unittest.ConfigurationManager(outputChannel)).disable();
            }
            if (item.product !== installer_1.Product.pytest) {
                (new pytest.ConfigurationManager(outputChannel)).disable();
            }
            if (item.product !== installer_1.Product.nosetest) {
                (new nose.ConfigurationManager(outputChannel)).disable();
            }
            return configMgr.enable();
        }
        // Configure everything before enabling
        // Cuz we don't want the test engine (in main.ts file - tests get discovered when config changes are detected) 
        // to start discovering tests when tests haven't been configured properly
        function enableTest() {
            const pythonConfig = vscode.workspace.getConfiguration('python');
            if (settings.unitTest.promptToConfigure) {
                return configMgr.enable();
            }
            return pythonConfig.update('unitTest.promptToConfigure', undefined).then(() => {
                return configMgr.enable();
            }, reason => {
                return configMgr.enable().then(() => Promise.reject(reason));
            });
        }
        return configMgr.configure(vscode.workspace.rootPath).then(() => {
            return enableTest();
        }).catch(reason => {
            return enableTest().then(() => Promise.reject(reason));
        });
    });
}
function displayTestFrameworkError(outputChannel) {
    let enabledCount = settings.unitTest.pyTestEnabled ? 1 : 0;
    enabledCount += settings.unitTest.nosetestsEnabled ? 1 : 0;
    enabledCount += settings.unitTest.unittestEnabled ? 1 : 0;
    if (enabledCount > 1) {
        return promptToEnableAndConfigureTestFramework(outputChannel, 'Enable only one of the test frameworks (unittest, pytest or nosetest).', true);
    }
    else {
        const option = 'Enable and configure a Test Framework';
        return vscode.window.showInformationMessage('No test framework configured (unittest, pytest or nosetest)', option).then(item => {
            if (item === option) {
                return promptToEnableAndConfigureTestFramework(outputChannel);
            }
            return Promise.reject(null);
        });
    }
}
exports.displayTestFrameworkError = displayTestFrameworkError;
function displayPromptToEnableTests(rootDir, outputChannel) {
    if (settings.unitTest.pyTestEnabled ||
        settings.unitTest.nosetestsEnabled ||
        settings.unitTest.unittestEnabled) {
        return Promise.reject(null);
    }
    if (!settings.unitTest.promptToConfigure) {
        return Promise.reject(null);
    }
    const yes = 'Yes';
    const no = `Later`;
    const noNotAgain = `No, don't ask again`;
    return checkIfHasTestDirs(rootDir).then(hasTests => {
        if (!hasTests) {
            return Promise.reject(null);
        }
        return vscode.window.showInformationMessage('You seem to have tests, would you like to enable a test framework?', yes, no, noNotAgain).then(item => {
            if (!item || item === no) {
                return Promise.reject(null);
            }
            if (item === yes) {
                return promptToEnableAndConfigureTestFramework(outputChannel);
            }
            else {
                const pythonConfig = vscode.workspace.getConfiguration('python');
                return pythonConfig.update('unitTest.promptToConfigure', false);
            }
        });
    });
}
exports.displayPromptToEnableTests = displayPromptToEnableTests;
function checkIfHasTestDirs(rootDir) {
    return utils_1.getSubDirectories(rootDir).then(subDirs => {
        return subDirs.map(dir => path.relative(rootDir, dir)).filter(dir => dir.match(/test/i)).length > 0;
    });
}
//# sourceMappingURL=configuration.js.map