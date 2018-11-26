// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const TypeMoq = require("typemoq");
const configSettings_1 = require("../../client/common/configSettings");
// tslint:disable-next-line:max-func-body-length
suite('Python Settings', () => {
    let config;
    setup(() => {
        config = TypeMoq.Mock.ofType(undefined, TypeMoq.MockBehavior.Strict);
    });
    function initializeConfig(settings) {
        // string settings
        for (const name of ['pythonPath', 'venvPath', 'condaPath', 'envFile']) {
            config.setup(c => c.get(name))
                .returns(() => settings[name]);
        }
        if (settings.jediEnabled) {
            config.setup(c => c.get('jediPath'))
                .returns(() => settings.jediPath);
        }
        for (const name of ['venvFolders']) {
            config.setup(c => c.get(name))
                .returns(() => settings[name]);
        }
        // boolean settings
        for (const name of ['downloadLanguageServer', 'jediEnabled', 'autoUpdateLanguageServer']) {
            config.setup(c => c.get(name, true))
                .returns(() => settings[name]);
        }
        for (const name of ['disableInstallationCheck', 'globalModuleInstallation']) {
            config.setup(c => c.get(name))
                .returns(() => settings[name]);
        }
        // number settings
        if (settings.jediEnabled) {
            config.setup(c => c.get('jediMemoryLimit'))
                .returns(() => settings.jediMemoryLimit);
        }
        // "any" settings
        // tslint:disable-next-line:no-any
        config.setup(c => c.get('devOptions'))
            .returns(() => settings.devOptions);
        // complex settings
        config.setup(c => c.get('linting'))
            .returns(() => settings.linting);
        config.setup(c => c.get('analysis'))
            .returns(() => settings.analysis);
        config.setup(c => c.get('sortImports'))
            .returns(() => settings.sortImports);
        config.setup(c => c.get('formatting'))
            .returns(() => settings.formatting);
        config.setup(c => c.get('autoComplete'))
            .returns(() => settings.autoComplete);
        config.setup(c => c.get('workspaceSymbols'))
            .returns(() => settings.workspaceSymbols);
        config.setup(c => c.get('unitTest'))
            .returns(() => settings.unitTest);
        config.setup(c => c.get('terminal'))
            .returns(() => settings.terminal);
    }
    test('condaPath updated', () => {
        const expected = new configSettings_1.PythonSettings(undefined, false);
        expected.pythonPath = 'python3';
        expected.condaPath = 'spam';
        initializeConfig(expected);
        config.setup(c => c.get('condaPath'))
            .returns(() => expected.condaPath)
            .verifiable(TypeMoq.Times.once());
        const settings = new configSettings_1.PythonSettings(undefined, false);
        settings.update(config.object);
        chai_1.expect(settings.condaPath).to.be.equal(expected.condaPath);
        config.verifyAll();
    });
});
//# sourceMappingURL=configSettings.unit.test.js.map