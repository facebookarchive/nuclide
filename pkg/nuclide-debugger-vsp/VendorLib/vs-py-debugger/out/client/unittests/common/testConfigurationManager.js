"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const helpers_1 = require("../../common/helpers");
const utils_1 = require("../../common/utils");
const path = require("path");
class TestConfigurationManager {
    constructor(outputChannel) {
        this.outputChannel = outputChannel;
    }
    selectTestDir(rootDir, subDirs, customOptions = []) {
        const options = {
            matchOnDescription: true,
            matchOnDetail: true,
            placeHolder: 'Select the directory containing the unit tests'
        };
        let items = subDirs.map(dir => {
            const dirName = path.relative(rootDir, dir);
            if (dirName.indexOf('.') === 0) {
                return null;
            }
            return {
                label: dirName,
                description: '',
            };
        }).filter(item => item !== null);
        items = [{ label: '.', description: 'Root directory' }, ...items];
        items = customOptions.concat(items);
        const def = helpers_1.createDeferred();
        vscode.window.showQuickPick(items, options).then(item => {
            if (!item) {
                return def.resolve();
            }
            def.resolve(item.label);
        });
        return def.promise;
    }
    selectTestFilePattern() {
        const options = {
            matchOnDescription: true,
            matchOnDetail: true,
            placeHolder: 'Select the pattern to identify test files'
        };
        let items = [
            { label: '*test.py', description: `Python Files ending with 'test'` },
            { label: '*_test.py', description: `Python Files ending with '_test'` },
            { label: 'test*.py', description: `Python Files begining with 'test'` },
            { label: 'test_*.py', description: `Python Files begining with 'test_'` },
            { label: '*test*.py', description: `Python Files containing the word 'test'` }
        ];
        const def = helpers_1.createDeferred();
        vscode.window.showQuickPick(items, options).then(item => {
            if (!item) {
                return def.resolve();
            }
            def.resolve(item.label);
        });
        return def.promise;
    }
    getTestDirs(rootDir) {
        return utils_1.getSubDirectories(rootDir).then(subDirs => {
            subDirs.sort();
            // Find out if there are any dirs with the name test and place them on the top
            let possibleTestDirs = subDirs.filter(dir => dir.match(/test/i));
            let nonTestDirs = subDirs.filter(dir => possibleTestDirs.indexOf(dir) === -1);
            possibleTestDirs.push(...nonTestDirs);
            // The test dirs are now on top
            return possibleTestDirs;
        });
    }
}
exports.TestConfigurationManager = TestConfigurationManager;
//# sourceMappingURL=testConfigurationManager.js.map