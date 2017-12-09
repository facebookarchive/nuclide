"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const testConfigurationManager_1 = require("../common/testConfigurationManager");
class ConfigurationManager extends testConfigurationManager_1.TestConfigurationManager {
    enable() {
        const pythonConfig = vscode.workspace.getConfiguration('python');
        return pythonConfig.update('unitTest.unittestEnabled', true);
    }
    disable() {
        const pythonConfig = vscode.workspace.getConfiguration('python');
        return pythonConfig.update('unitTest.unittestEnabled', false);
    }
    configure(rootDir) {
        const args = ['-v'];
        return this.getTestDirs(rootDir).then(subDirs => {
            return this.selectTestDir(rootDir, subDirs);
        }).then(testDir => {
            args.push('-s');
            if (typeof testDir === 'string' && testDir !== '.') {
                args.push(`.${path.sep}${testDir}`);
            }
            else {
                args.push('.');
            }
            return this.selectTestFilePattern();
        }).then(testfilePattern => {
            args.push('-p');
            if (typeof testfilePattern === 'string') {
                args.push(testfilePattern);
            }
            else {
                args.push('test*.py');
            }
        }).then(() => {
            const pythonConfig = vscode.workspace.getConfiguration('python');
            return pythonConfig.update('unitTest.unittestArgs', args);
        });
    }
}
exports.ConfigurationManager = ConfigurationManager;
//# sourceMappingURL=testConfigurationManager.js.map