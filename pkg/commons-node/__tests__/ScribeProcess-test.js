"use strict";

var _fs = _interopRequireDefault(require("fs"));

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _ScribeProcess() {
  const data = _interopRequireWildcard(require("../ScribeProcess"));

  _ScribeProcess = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../../../jest/waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
// scripe process does not pass the ENV vars properly and scribe_cat_mock
// fails on os.environ['SCRIBE_MOCK_PATH']
describe.skip('scribe_cat test suites', () => {
  let tempDir = '';
  let originalCommand = '';

  function getContentOfScribeCategory(category) {
    const categoryFilePath = _nuclideUri().default.join(tempDir, category);

    const content = _fs.default.readFileSync(categoryFilePath, 'utf8');

    const result = content.split('\n').filter(item => item.length > 0);
    return result;
  }

  beforeEach(async () => {
    // Simulated scribe_cat script which saves data into:
    //   ${process.env['SCRIBE_MOCK_PATH'] + category_name}
    // It terminates once we cut off the stdin stream.
    const scribeCatMockCommandPath = _nuclideUri().default.join(_nuclideUri().default.dirname(__filename), '../__mocks__/scripts', 'scribe_cat_mock');

    tempDir = await _fsPromise().default.tempdir();
    originalCommand = _ScribeProcess().__test__.setScribeCatCommand(scribeCatMockCommandPath);
    process.env.SCRIBE_MOCK_PATH = tempDir;
  });
  afterEach(async () => {
    _ScribeProcess().__test__.setScribeCatCommand(originalCommand);
  });
  it('Saves data to scribe category', async () => {
    const localScribeProcess = new (_ScribeProcess().default)('test');
    const messages = ['A', 'nuclide', 'is', 'an', 'atomic', 'species', 'characterized', 'by', 'the', 'specific', 'constitution', 'of', 'its', 'nucleus.'];
    messages.map(message => localScribeProcess.write(message)); // Wait for `scribe_cat_mock` to flush data into disk.

    await localScribeProcess.join();
    expect(messages).toEqual(getContentOfScribeCategory('test'));
  });
  it('Saves data to scribe category and resume from error', async () => {
    const localScribeProcess = new (_ScribeProcess().default)('test');
    const firstPart = 'A nuclide is an atomic species'.split(' ');
    const secondPart = 'characterized by the specific constitution of its nucleus.'.split(' ');
    firstPart.map(message => localScribeProcess.write(message)); // Kill the existing process.

    await localScribeProcess.join();
    secondPart.map(message => localScribeProcess.write(message)); // Wait for `scribe_cat_mock` to flush data into disk.

    await localScribeProcess.join();
    expect(firstPart.concat(secondPart)).toEqual(getContentOfScribeCategory('test'));
  });
  it('Can automatically join', async () => {
    const localScribeProcess = new (_ScribeProcess().default)('test', 100);
    localScribeProcess.write('test1');
    await (0, _waits_for().default)(() => getContentOfScribeCategory('test').includes('test1'));
    localScribeProcess.write('test2');
    localScribeProcess.write('test3');
    expect(getContentOfScribeCategory('test')).toEqual(['test1']);
    await (0, _waits_for().default)(() => getContentOfScribeCategory('test').includes('test3'));
    expect(getContentOfScribeCategory('test')).toEqual(['test1', 'test2', 'test3']);
  });
  it('disables itself when spawning fails', async () => {
    _ScribeProcess().__test__.setScribeCatCommand('not a valid command');

    const scribeProcess = new (_ScribeProcess().default)('test', 100);
    expect((await scribeProcess.write('hi'))).toBe(false);
    expect(_ScribeProcess().default.isEnabled()).toBe(false);
    expect((await scribeProcess.write('hi'))).toBe(false);
  });
});