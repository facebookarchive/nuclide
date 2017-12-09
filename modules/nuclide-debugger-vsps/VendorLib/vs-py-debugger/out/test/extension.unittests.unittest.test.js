"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path='../../node_modules/@types/mocha/index.d.ts'/>
//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
// Place this right on top
const initialize_1 = require("./initialize");
// The module \'assert\' provides assertion methods from node
const assert = require("assert");
const unittest = require("../client/unittests/unittest/main");
const main_1 = require("../client/unittests/display/main");
const path = require("path");
const configSettings = require("../client/common/configSettings");
const mockClasses_1 = require("./mockClasses");
let pythonSettings = configSettings.PythonSettings.getInstance();
const disposable = initialize_1.setPythonExecutable(pythonSettings);
const UNITTEST_TEST_FILES_PATH = path.join(__dirname, '..', '..', 'src', 'test', 'pythonFiles', 'testFiles', 'standard');
const UNITTEST_SINGLE_TEST_FILE_PATH = path.join(__dirname, '..', '..', 'src', 'test', 'pythonFiles', 'testFiles', 'single');
suite('Unit Tests (unittest)', () => {
    suiteSetup(done => {
        initialize_1.initialize().then(() => {
            done();
        });
    });
    suiteTeardown(() => {
        disposable.dispose();
    });
    setup(() => {
        outChannel = new mockClasses_1.MockOutputChannel('Python Test Log');
        testResultDisplay = new main_1.TestResultDisplay(outChannel);
    });
    teardown(() => {
        outChannel.dispose();
        testManager.dispose();
        testResultDisplay.dispose();
    });
    function createTestManager() {
        testManager = new unittest.TestManager(rootDirectory, outChannel);
    }
    const rootDirectory = UNITTEST_TEST_FILES_PATH;
    let testManager;
    let testResultDisplay;
    let outChannel;
    test('Discover Tests (single test file)', done => {
        pythonSettings.unitTest.unittestArgs = [
            '-s=./tests',
            '-p=test_*.py'
        ];
        testManager = new unittest.TestManager(UNITTEST_SINGLE_TEST_FILE_PATH, outChannel);
        testManager.discoverTests(true, true).then(tests => {
            assert.equal(tests.testFiles.length, 1, 'Incorrect number of test files');
            assert.equal(tests.testFunctions.length, 3, 'Incorrect number of test functions');
            assert.equal(tests.testSuits.length, 1, 'Incorrect number of test suites');
            assert.equal(tests.testFiles.some(t => t.name === 'test_one.py' && t.nameToRun === 'Test_test1.test_A'), true, 'Test File not found');
        }).then(done).catch(done);
    });
    test('Discover Tests', done => {
        pythonSettings.unitTest.unittestArgs = [
            '-s=./tests',
            '-p=test_*.py'
        ];
        createTestManager();
        testManager.discoverTests(true, true).then(tests => {
            assert.equal(tests.testFiles.length, 2, 'Incorrect number of test files');
            assert.equal(tests.testFunctions.length, 9, 'Incorrect number of test functions');
            assert.equal(tests.testSuits.length, 3, 'Incorrect number of test suites');
            assert.equal(tests.testFiles.some(t => t.name === 'test_unittest_one.py' && t.nameToRun === 'Test_test1.test_A'), true, 'Test File not found');
            assert.equal(tests.testFiles.some(t => t.name === 'test_unittest_two.py' && t.nameToRun === 'Test_test2.test_A2'), true, 'Test File not found');
        }).then(done).catch(done);
    });
    test('Discover Tests (pattern = *_test_*.py)', done => {
        pythonSettings.unitTest.unittestArgs = [
            '-s=./tests',
            '-p=*_test*.py'
        ];
        createTestManager();
        testManager.discoverTests(true, true).then(tests => {
            assert.equal(tests.testFiles.length, 1, 'Incorrect number of test files');
            assert.equal(tests.testFunctions.length, 2, 'Incorrect number of test functions');
            assert.equal(tests.testSuits.length, 1, 'Incorrect number of test suites');
            assert.equal(tests.testFiles.some(t => t.name === 'unittest_three_test.py' && t.nameToRun === 'Test_test3.test_A'), true, 'Test File not found');
        }).then(done).catch(done);
    });
    test('Run Tests', done => {
        pythonSettings.unitTest.unittestArgs = [
            '-s=./tests',
            '-p=*test*.py'
        ];
        createTestManager();
        testManager.runTest().then(results => {
            assert.equal(results.summary.errors, 1, 'Errors');
            assert.equal(results.summary.failures, 5, 'Failures');
            assert.equal(results.summary.passed, 4, 'Passed');
            assert.equal(results.summary.skipped, 1, 'skipped');
        }).then(done).catch(done);
    });
    // test('Fail Fast', done => {
    //     pythonSettings.unitTest.unittestArgs = [
    //         '-s=./tests',
    //         '-p=*test*.py',
    //         '--failfast'
    //     ];
    //     createTestManager();
    //     testManager.runTest().then(results => {
    //         assert.equal(results.summary.errors, 1, 'Errors');
    //         assert.equal(results.summary.failures, 5, 'Failures');
    //         assert.equal(results.summary.passed, 4, 'Passed');
    //         assert.equal(results.summary.skipped, 1, 'skipped');
    //         done();
    //     }).catch(done);
    // });
    test('Run Failed Tests', done => {
        pythonSettings.unitTest.unittestArgs = [
            '-s=./tests',
            '-p=*test*.py'
        ];
        createTestManager();
        testManager.runTest().then(results => {
            assert.equal(results.summary.errors, 1, 'Errors');
            assert.equal(results.summary.failures, 5, 'Failures');
            assert.equal(results.summary.passed, 4, 'Passed');
            assert.equal(results.summary.skipped, 1, 'skipped');
            return testManager.runTest(true).then(tests => {
                assert.equal(results.summary.errors, 1, 'Failed Errors');
                assert.equal(results.summary.failures, 5, 'Failed Failures');
                assert.equal(results.summary.passed, 0, 'Failed Passed');
                assert.equal(results.summary.skipped, 0, 'Failed skipped');
            });
        }).then(done).catch(done);
    });
    test('Run Specific Test File', done => {
        pythonSettings.unitTest.unittestArgs = [
            '-s=./tests',
            '-p=*test*.py'
        ];
        createTestManager();
        testManager.discoverTests(true, true).then(tests => {
            const testFile = { testFile: [tests.testFiles[0]], testFolder: [], testFunction: [], testSuite: [] };
            return testManager.runTest(testFile).then(tests => {
                assert.equal(tests.summary.errors, 0, 'Errors');
                assert.equal(tests.summary.failures, 1, 'Failures');
                assert.equal(tests.summary.passed, 1, 'Passed');
                assert.equal(tests.summary.skipped, 1, 'skipped');
            });
        }).then(done).catch(done);
    });
    test('Run Specific Test Suite', done => {
        pythonSettings.unitTest.unittestArgs = [
            '-s=./tests',
            '-p=*test*.py'
        ];
        createTestManager();
        testManager.discoverTests(true, true).then(tests => {
            const testSuite = { testFile: [], testFolder: [], testFunction: [], testSuite: [tests.testSuits[0].testSuite] };
            return testManager.runTest(testSuite).then(tests => {
                assert.equal(tests.summary.errors, 0, 'Errors');
                assert.equal(tests.summary.failures, 1, 'Failures');
                assert.equal(tests.summary.passed, 1, 'Passed');
                assert.equal(tests.summary.skipped, 1, 'skipped');
            });
        }).then(done).catch(done);
    });
    test('Run Specific Test Function', done => {
        pythonSettings.unitTest.unittestArgs = [
            '-s=./tests',
            '-p=*test*.py'
        ];
        createTestManager();
        testManager.discoverTests(true, true).then(tests => {
            const testFn = { testFile: [], testFolder: [], testFunction: [tests.testFunctions[0].testFunction], testSuite: [] };
            return testManager.runTest(testFn).then(tests => {
                assert.equal(tests.summary.errors, 0, 'Errors');
                assert.equal(tests.summary.failures, 1, 'Failures');
                assert.equal(tests.summary.passed, 0, 'Passed');
                assert.equal(tests.summary.skipped, 0, 'skipped');
            });
        }).then(done).catch(done);
    });
});
//# sourceMappingURL=extension.unittests.unittest.test.js.map