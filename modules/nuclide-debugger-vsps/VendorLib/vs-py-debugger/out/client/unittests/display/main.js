'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const contracts_1 = require("../common/contracts");
const constants = require("../../common/constants");
const testUtils_1 = require("../common/testUtils");
const helpers_1 = require("../../common/helpers");
class TestResultDisplay {
    constructor(outputChannel, onDidChange = null) {
        this.outputChannel = outputChannel;
        this.onDidChange = onDidChange;
        this.discoverCounter = 0;
        this.ticker = ['|', '/', '-', '|', '/', '-', '\\'];
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    }
    dispose() {
        this.statusBar.dispose();
    }
    set enabled(enable) {
        if (enable) {
            this.statusBar.show();
        }
        else {
            this.statusBar.hide();
        }
    }
    DisplayProgressStatus(tests, debug = false) {
        this.displayProgress('Running Tests', `Running Tests (Click to Stop)`, constants.Commands.Tests_Ask_To_Stop_Test);
        tests
            .then(tests => this.updateTestRunWithSuccess(tests, debug))
            .catch(this.updateTestRunWithFailure.bind(this))
            .catch(() => { });
    }
    updateTestRunWithSuccess(tests, debug = false) {
        this.clearProgressTicker();
        // Treat errors as a special case, as we generally wouldn't have any errors
        const statusText = [];
        const toolTip = [];
        let foreColor = '';
        if (tests.summary.passed > 0) {
            statusText.push(`${constants.Octicons.Test_Pass} ${tests.summary.passed}`);
            toolTip.push(`${tests.summary.passed} Passed`);
            foreColor = '#66ff66';
        }
        if (tests.summary.skipped > 0) {
            statusText.push(`${constants.Octicons.Test_Skip} ${tests.summary.skipped}`);
            toolTip.push(`${tests.summary.skipped} Skipped`);
            foreColor = '#66ff66';
        }
        if (tests.summary.failures > 0) {
            statusText.push(`${constants.Octicons.Test_Fail} ${tests.summary.failures}`);
            toolTip.push(`${tests.summary.failures} Failed`);
            foreColor = 'yellow';
        }
        if (tests.summary.errors > 0) {
            statusText.push(`${constants.Octicons.Test_Error} ${tests.summary.errors}`);
            toolTip.push(`${tests.summary.errors} Error${tests.summary.errors > 1 ? 's' : ''}`);
            foreColor = 'yellow';
        }
        this.statusBar.tooltip = toolTip.length === 0 ? 'No Tests Ran' : toolTip.join(', ') + ' (Tests)';
        this.statusBar.text = statusText.length === 0 ? 'No Tests Ran' : statusText.join(' ');
        this.statusBar.color = foreColor;
        this.statusBar.command = constants.Commands.Tests_View_UI;
        if (this.onDidChange) {
            this.onDidChange.fire();
        }
        if (statusText.length === 0 && !debug) {
            vscode.window.showWarningMessage('No tests ran, please check the configuration settings for the tests.');
        }
        return tests;
    }
    updateTestRunWithFailure(reason) {
        this.clearProgressTicker();
        this.statusBar.command = constants.Commands.Tests_View_UI;
        if (reason === contracts_1.CANCELLATION_REASON) {
            this.statusBar.text = '$(zap) Run Tests';
            this.statusBar.tooltip = 'Run Tests';
        }
        else {
            this.statusBar.text = `$(alert) Tests Failed`;
            this.statusBar.tooltip = 'Running Tests Failed';
            testUtils_1.displayTestErrorMessage('There was an error in running the tests.');
        }
        return Promise.reject(reason);
    }
    displayProgress(message, tooltip, command) {
        this.progressPrefix = this.statusBar.text = '$(stop) ' + message;
        this.statusBar.command = command;
        this.statusBar.tooltip = tooltip;
        this.statusBar.show();
        this.clearProgressTicker();
        this.progressTimeout = setInterval(() => this.updateProgressTicker(), 150);
    }
    updateProgressTicker() {
        let text = `${this.progressPrefix} ${this.ticker[this.discoverCounter % 7]}`;
        this.discoverCounter += 1;
        this.statusBar.text = text;
    }
    clearProgressTicker() {
        if (this.progressTimeout) {
            clearInterval(this.progressTimeout);
        }
        this.progressTimeout = null;
        this.discoverCounter = 0;
    }
    DisplayDiscoverStatus(tests) {
        this.displayProgress('Discovering Tests', 'Discovering Tests (Click to Stop)', constants.Commands.Tests_Ask_To_Stop_Discovery);
        return tests.then(tests => {
            this.updateWithDiscoverSuccess(tests);
            return tests;
        }).catch(reason => {
            this.updateWithDiscoverFailure(reason);
            return Promise.reject(reason);
        });
    }
    disableTests() {
        const def = helpers_1.createDeferred();
        const pythonConfig = vscode.workspace.getConfiguration('python');
        let settingsToDisable = ['unitTest.promptToConfigure', 'unitTest.pyTestEnabled',
            'unitTest.unittestEnabled', 'unitTest.nosetestsEnabled'];
        function disableTest() {
            if (settingsToDisable.length === 0) {
                return def.resolve();
            }
            pythonConfig.update(settingsToDisable.shift(), false)
                .then(disableTest.bind(this), disableTest.bind(this));
        }
        disableTest();
        return def.promise;
    }
    updateWithDiscoverSuccess(tests) {
        this.clearProgressTicker();
        const haveTests = tests && (tests.testFunctions.length > 0);
        this.statusBar.text = '$(zap) Run Tests';
        this.statusBar.tooltip = 'Run Tests';
        this.statusBar.command = constants.Commands.Tests_View_UI;
        this.statusBar.show();
        if (this.onDidChange) {
            this.onDidChange.fire();
        }
        if (!haveTests) {
            vscode.window.showInformationMessage('No tests discovered, please check the configuration settings for the tests.', 'Disable Tests').then(item => {
                if (item === 'Disable Tests') {
                    this.disableTests();
                }
            });
        }
    }
    updateWithDiscoverFailure(reason) {
        this.clearProgressTicker();
        this.statusBar.text = `$(zap) Discover Tests`;
        this.statusBar.tooltip = 'Discover Tests';
        this.statusBar.command = constants.Commands.Tests_Discover;
        this.statusBar.show();
        this.statusBar.color = 'yellow';
        if (reason !== contracts_1.CANCELLATION_REASON) {
            this.statusBar.text = `$(alert) Test discovery failed`;
            this.statusBar.tooltip = `Discovering Tests failed (view 'Python Test Log' output panel for details)`;
            // TODO: ignore this quitemode, always display the error message (inform the user)
            if (!helpers_1.isNotInstalledError(reason)) {
                // TODO: show an option that will invoke a command 'python.test.configureTest' or similar
                // This will be hanlded by main.ts that will capture input from user and configure the tests
                vscode.window.showErrorMessage('There was an error in discovering tests, please check the configuration settings for the tests.');
            }
        }
    }
}
exports.TestResultDisplay = TestResultDisplay;
//# sourceMappingURL=main.js.map