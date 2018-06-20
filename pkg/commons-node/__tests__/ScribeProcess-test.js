'use strict';

var _fs = _interopRequireDefault(require('fs'));

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _ScribeProcess;

function _load_ScribeProcess() {
  return _ScribeProcess = _interopRequireDefault(require('../ScribeProcess'));
}

var _ScribeProcess2;

function _load_ScribeProcess2() {
  return _ScribeProcess2 = require('../ScribeProcess');
}

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// scripe process does not pass the ENV vars properly and scribe_cat_mock
// fails on os.environ['SCRIBE_MOCK_PATH']
describe.skip('scribe_cat test suites', () => {
  let tempDir = '';
  let originalCommand = '';

  function getContentOfScribeCategory(category) {
    const categoryFilePath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, category);
    const content = _fs.default.readFileSync(categoryFilePath, 'utf8');
    const result = content.split('\n').filter(item => item.length > 0);
    return result;
  }

  beforeEach(async () => {
    // Simulated scribe_cat script which saves data into:
    //   ${process.env['SCRIBE_MOCK_PATH'] + category_name}
    // It terminates once we cut off the stdin stream.
    const scribeCatMockCommandPath = (_nuclideUri || _load_nuclideUri()).default.join((_nuclideUri || _load_nuclideUri()).default.dirname(__filename), '../__mocks__/scripts', 'scribe_cat_mock');
    tempDir = await (_fsPromise || _load_fsPromise()).default.tempdir();
    originalCommand = (_ScribeProcess2 || _load_ScribeProcess2()).__test__.setScribeCatCommand(scribeCatMockCommandPath);
    process.env.SCRIBE_MOCK_PATH = tempDir;
  });

  afterEach(async () => {
    (_ScribeProcess2 || _load_ScribeProcess2()).__test__.setScribeCatCommand(originalCommand);
  });

  it('Saves data to scribe category', async () => {
    const localScribeProcess = new (_ScribeProcess || _load_ScribeProcess()).default('test');

    const messages = ['A', 'nuclide', 'is', 'an', 'atomic', 'species', 'characterized', 'by', 'the', 'specific', 'constitution', 'of', 'its', 'nucleus.'];
    messages.map(message => localScribeProcess.write(message));

    // Wait for `scribe_cat_mock` to flush data into disk.
    await localScribeProcess.join();
    expect(messages).toEqual(getContentOfScribeCategory('test'));
  });

  it('Saves data to scribe category and resume from error', async () => {
    const localScribeProcess = new (_ScribeProcess || _load_ScribeProcess()).default('test');

    const firstPart = 'A nuclide is an atomic species'.split(' ');
    const secondPart = 'characterized by the specific constitution of its nucleus.'.split(' ');

    firstPart.map(message => localScribeProcess.write(message));
    // Kill the existing process.
    await localScribeProcess.join();
    secondPart.map(message => localScribeProcess.write(message));
    // Wait for `scribe_cat_mock` to flush data into disk.
    await localScribeProcess.join();
    expect(firstPart.concat(secondPart)).toEqual(getContentOfScribeCategory('test'));
  });

  it('Can automatically join', async () => {
    const localScribeProcess = new (_ScribeProcess || _load_ScribeProcess()).default('test', 100);
    localScribeProcess.write('test1');

    await (0, (_waits_for || _load_waits_for()).default)(() => getContentOfScribeCategory('test').includes('test1'));

    localScribeProcess.write('test2');
    localScribeProcess.write('test3');
    expect(getContentOfScribeCategory('test')).toEqual(['test1']);

    await (0, (_waits_for || _load_waits_for()).default)(() => getContentOfScribeCategory('test').includes('test3'));

    expect(getContentOfScribeCategory('test')).toEqual(['test1', 'test2', 'test3']);
  });

  it('disables itself when spawning fails', async () => {
    (_ScribeProcess2 || _load_ScribeProcess2()).__test__.setScribeCatCommand('not a valid command');
    const scribeProcess = new (_ScribeProcess || _load_ScribeProcess()).default('test', 100);
    expect((await scribeProcess.write('hi'))).toBe(false);
    expect((_ScribeProcess || _load_ScribeProcess()).default.isEnabled()).toBe(false);
    expect((await scribeProcess.write('hi'))).toBe(false);
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */