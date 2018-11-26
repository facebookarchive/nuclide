// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-any
const chai_1 = require("chai");
const path = require("path");
const typeMoq = require("typemoq");
const types_1 = require("../../client/common/platform/types");
const types_2 = require("../../client/common/process/types");
const executableValidator_1 = require("../../client/debugger/executableValidator");
suite('Debugger Executable Validator', () => {
    let fs;
    let processService;
    let validator;
    setup(() => {
        const serviceContainer = typeMoq.Mock.ofType();
        fs = typeMoq.Mock.ofType(undefined, typeMoq.MockBehavior.Strict);
        processService = typeMoq.Mock.ofType();
        processService.setup((p) => p.then).returns(() => undefined);
        const processFactory = typeMoq.Mock.ofType();
        processFactory.setup(p => p.create()).returns(() => Promise.resolve(processService.object));
        serviceContainer.setup(c => c.get(typeMoq.It.isValue(types_1.IFileSystem))).returns(() => fs.object);
        serviceContainer.setup(c => c.get(typeMoq.It.isValue(types_2.IProcessServiceFactory))).returns(() => processFactory.object);
        validator = new executableValidator_1.ExcutableValidator(serviceContainer.object);
    });
    function validate(pythonPath, expectedResult, fileExists, processOutput) {
        return __awaiter(this, void 0, void 0, function* () {
            fs.setup(f => f.fileExists(typeMoq.It.isValue(pythonPath))).returns(() => Promise.resolve(fileExists));
            processService.setup(p => p.exec(typeMoq.It.isValue(pythonPath), typeMoq.It.isValue(['-c', 'print("1")'])))
                .returns(() => Promise.resolve(processOutput))
                .verifiable(typeMoq.Times.once());
            const isValid = yield validator.validateExecutable(pythonPath);
            chai_1.expect(isValid).to.be.equal(expectedResult, 'Incorrect value');
            fs.verifyAll();
            processService.verifyAll();
        });
    }
    test('Validate \'python\' command', () => __awaiter(this, void 0, void 0, function* () {
        const pythonPath = 'python';
        const output = { stdout: '1' };
        yield validate(pythonPath, true, false, output);
    }));
    test('Validate \'python\' Executable with a valida path', () => __awaiter(this, void 0, void 0, function* () {
        const pythonPath = path.join('a', 'b', 'bin', 'python');
        const output = { stdout: '1' };
        yield validate(pythonPath, true, true, output);
    }));
    test('Validate \'spark-submit\'', () => __awaiter(this, void 0, void 0, function* () {
        const pythonPath = path.join('a', 'b', 'bin', 'spark-submit');
        const output = { stderr: 'ex', stdout: '' };
        yield validate(pythonPath, true, true, output);
    }));
    test('Validate invalid \'python\' command', () => __awaiter(this, void 0, void 0, function* () {
        const pythonPath = path.join('python');
        const output = { stderr: 'ex', stdout: '' };
        yield validate(pythonPath, false, false, output);
    }));
    test('Validate invalid executable', () => __awaiter(this, void 0, void 0, function* () {
        const pythonPath = path.join('a', 'b', 'bin', 'spark-submit');
        const output = { stderr: 'ex', stdout: '' };
        yield validate(pythonPath, false, false, output);
    }));
});
//# sourceMappingURL=excutableValidator.unit.test.js.map