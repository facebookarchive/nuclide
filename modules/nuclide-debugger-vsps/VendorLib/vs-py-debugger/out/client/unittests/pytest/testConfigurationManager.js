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
        return pythonConfig.update('unitTest.pyTestEnabled', true);
    }
    disable() {
        const pythonConfig = vscode.workspace.getConfiguration('python');
        return pythonConfig.update('unitTest.pyTestEnabled', false);
    }
    static configFilesExist(rootDir) {
        const promises = ['pytest.ini', 'tox.ini', 'setup.cfg'].map(cfg => {
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
        const options = [];
        let installer = new installer_1.Installer(this.outputChannel);
        return ConfigurationManager.configFilesExist(rootDir).then(configFiles => {
            if (configFiles.length > 0 && configFiles.length !== 1 && configFiles[0] !== 'setup.cfg') {
                return Promise.resolve();
            }
            if (configFiles.length === 1 && configFiles[0] === 'setup.cfg') {
                options.push({
                    label: configFileOptionLabel,
                    description: 'setup.cfg'
                });
            }
            return this.getTestDirs(rootDir).then(subDirs => {
                return this.selectTestDir(rootDir, subDirs, options);
            }).then(testDir => {
                if (typeof testDir === 'string' && testDir !== configFileOptionLabel) {
                    args.push(testDir);
                }
            });
        }).then(() => {
            return installer.isInstalled(installer_1.Product.pytest);
        }).then(installed => {
            if (!installed) {
                return installer.install(installer_1.Product.pytest);
            }
        }).then(() => {
            const pythonConfig = vscode.workspace.getConfiguration('python');
            return pythonConfig.update('unitTest.pyTestArgs', args);
        });
    }
}
exports.ConfigurationManager = ConfigurationManager;
//# sourceMappingURL=testConfigurationManager.js.map