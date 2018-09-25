"use strict";

var _fs = _interopRequireDefault(require("fs"));

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _atom = require("atom");

function _testHelpers() {
  const data = require("../../../../nuclide-commons/test-helpers");

  _testHelpers = function () {
    return data;
  };

  return data;
}

function _refactorEpics() {
  const data = require("../lib/refactorEpics");

  _refactorEpics = function () {
    return data;
  };

  return data;
}

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
describe('applyRefactoring', () => {
  let testDir;
  let testFile1;
  let testFile2;
  beforeEach(async () => {
    const fixturesPath = _path.default.resolve(__dirname, '../__mocks__/fixtures');

    atom.project.setPaths([fixturesPath]);
    testDir = await (0, _testHelpers().generateFixture)('refactoring', new Map([['test1.txt', 'abcdefghi'], ['test2.txt', '123456789']]));
    testFile1 = _nuclideUri().default.join(testDir, 'test1.txt');
    testFile2 = _nuclideUri().default.join(testDir, 'test2.txt');
  });
  it('is able to apply refactors to external files', async () => {
    const actions = await (0, _refactorEpics().applyRefactoring)({
      type: 'apply',
      payload: {
        response: {
          type: 'rename-external-edit',
          edits: new Map([[testFile1, [{
            oldRange: new _atom.Range(new _atom.Point(0, 0), new _atom.Point(0, 3)),
            newText: 'aaa'
          }, {
            oldRange: new _atom.Range(new _atom.Point(0, 3), new _atom.Point(0, 6)),
            newText: 'ddd'
          }]], [testFile2, [{
            oldRange: new _atom.Range(new _atom.Point(0, 6), new _atom.Point(0, 9)),
            newText: '000'
          }]]])
        }
      }
    }).toArray().toPromise();
    const message = 'Applying edits...';
    expect(actions).toEqual([{
      type: 'progress',
      payload: {
        message,
        value: 0,
        max: 2
      }
    }, {
      type: 'progress',
      payload: {
        message,
        value: 1,
        max: 2
      }
    }, {
      type: 'progress',
      payload: {
        message,
        value: 2,
        max: 2
      }
    }, {
      type: 'close'
    }]);
    expect(_fs.default.readFileSync(testFile1, 'utf8')).toBe('aaadddghi');
    expect(_fs.default.readFileSync(testFile2, 'utf8')).toBe('123456000');
  }); // NOTE: `oldText` isn't used in LSP method `textDocument/rename`.
  //        So the Refactorizer isn't actually able to raise errors for this
  //        when it's being used.

  it('errors on mismatch', async () => {
    const actions = await (0, _refactorEpics().applyRefactoring)({
      type: 'apply',
      payload: {
        response: {
          type: 'rename-external-edit',
          edits: new Map([[testFile1, [{
            oldRange: new _atom.Range(new _atom.Point(0, 0), new _atom.Point(0, 3)),
            oldText: 'abb',
            newText: 'aaa'
          }]]])
        }
      }
    }).toPromise().catch(err => err);
    expect(actions instanceof Error).toBe(true);
  });
});