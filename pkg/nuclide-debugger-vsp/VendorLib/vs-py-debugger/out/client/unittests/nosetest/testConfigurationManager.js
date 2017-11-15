"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const testConfigurationManager_1 = require("../common/testConfigurationManager");
const fs = require("fs");
const path = require("path");
const installer_1 = require("../../common/installer");
class ConfigurationManager extends testConfigurationManager_1.TestConfigurationManager {
    enable() {
        const pythonConfig = vscode.workspace.getConfiguration('python');
        return pythonConfig.update('unitTest.nosetestsEnabled', true);
    }
    disable() {
        const pythonConfig = vscode.workspace.getConfiguration('python');
        return pythonConfig.update('unitTest.nosetestsEnabled', false);
    }
    static configFilesExist(rootDir) {
        const promises = ['.noserc', 'nose.cfg'].map(cfg => {
            return new Promise(resolve => {
                fs.exists(path.join(rootDir, cfg), exists => { resolve(exists ? cfg : ''); });
            });
        });
        return Promise.all(promises).then(values => {
            return values.filter(exists => exists.length > 0);
        });
    }
    configure(rootDir) {
        const args = [];
        const configFileOptionLabel = 'Use existing config file';
        let installer = new installer_1.Installer(this.outputChannel);
        return ConfigurationManager.configFilesExist(rootDir).then(configFiles => {
            if (configFiles.length > 0) {
                return Promise.resolve();
            }
            return this.getTestDirs(rootDir).then(subDirs => {
                return this.selectTestDir(rootDir, subDirs);
            }).then(testDir => {
                if (typeof testDir === 'string' && testDir !== configFileOptionLabel) {
                    args.push(testDir);
                }
            });
        }).then(() => {
            return installer.isInstalled(installer_1.Product.nosetest);
        }).then(installed => {
            if (!installed) {
                return installer.install(installer_1.Product.nosetest);
            }
        }).then(() => {
            const pythonConfig = vscode.workspace.getConfiguration('python');
            return pythonConfig.update('unitTest.nosetestArgs', args);
        });
    }
}
exports.ConfigurationManager = ConfigurationManager;
//# sourceMappingURL=testConfigurationManager.js.map