'use strict';

var _fs = _interopRequireDefault(require('fs'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _testHelpers;

function _load_testHelpers() {
  return _testHelpers = require('../../../modules/nuclide-commons/test-helpers');
}

var _refactorEpics;

function _load_refactorEpics() {
  return _refactorEpics = require('../lib/refactorEpics');
}

var _path = _interopRequireDefault(require('path'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('applyRefactoring', () => {
  let testDir;
  let testFile1;
  let testFile2;
  beforeEach(async () => {
    const fixturesPath = _path.default.resolve(__dirname, '../__mocks__/fixtures');
    atom.project.setPaths([fixturesPath]);
    testDir = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('refactoring', new Map([['test1.txt', 'abcdefghi'], ['test2.txt', '123456789']]));
    testFile1 = (_nuclideUri || _load_nuclideUri()).default.join(testDir, 'test1.txt');
    testFile2 = (_nuclideUri || _load_nuclideUri()).default.join(testDir, 'test2.txt');
  });

  it('is able to apply refactors to external files', async () => {
    const actions = await (0, (_refactorEpics || _load_refactorEpics()).applyRefactoring)({
      type: 'apply',
      payload: {
        response: {
          type: 'external-edit',
          edits: new Map([[testFile1, [{
            startOffset: 0,
            endOffset: 3,
            oldText: 'abc',
            newText: 'aaa'
          }, {
            startOffset: 3,
            endOffset: 6,
            oldText: 'def',
            newText: 'ddd'
          }]], [testFile2, [{
            startOffset: 6,
            endOffset: 9,
            oldText: '789',
            newText: '000'
          }]]])
        }
      }
    }).toArray().toPromise();

    const message = 'Applying edits...';
    expect(actions).toEqual([{ type: 'progress', payload: { message, value: 0, max: 2 } }, { type: 'progress', payload: { message, value: 1, max: 2 } }, { type: 'progress', payload: { message, value: 2, max: 2 } }, { type: 'close' }]);
    expect(_fs.default.readFileSync(testFile1, 'utf8')).toBe('aaadddghi');
    expect(_fs.default.readFileSync(testFile2, 'utf8')).toBe('123456000');
  });

  it('errors on mismatch', async () => {
    const actions = await (0, (_refactorEpics || _load_refactorEpics()).applyRefactoring)({
      type: 'apply',
      payload: {
        response: {
          type: 'external-edit',
          edits: new Map([[testFile1, [{
            startOffset: 0,
            endOffset: 3,
            oldText: 'abb',
            newText: 'aaa'
          }]]])
        }
      }
    }).toPromise().catch(err => err);

    expect(actions instanceof Error).toBe(true);
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