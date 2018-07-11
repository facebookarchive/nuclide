"use strict";

var _atom = require("atom");

var _fs = _interopRequireDefault(require("fs"));

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
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

function _Refactoring() {
  const data = _interopRequireDefault(require("../lib/Refactoring"));

  _Refactoring = function () {
    return data;
  };

  return data;
}

function _libclang() {
  const data = require("../lib/libclang");

  _libclang = function () {
    return data;
  };

  return data;
}

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
 */
const TEST_PATH = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures', 'references.cpp');

const fakeEditor = {
  getPath: () => TEST_PATH,
  getText: () => _fs.default.readFileSync(TEST_PATH, 'utf8')
};
describe('Refactoring', () => {
  beforeEach(async () => {
    _featureConfig().default.set('nuclide-clang', {
      libclangPath: '',
      enableDefaultFlags: true,
      defaultFlags: ['-std=c++14', '-x', 'c++'],
      defaultDiagnostics: false,
      serverProcessMemoryLimit: 15
    }); // Ensure that the file is compiled.


    await (0, _libclang().getDiagnostics)(fakeEditor);
  });
  describe('Refactoring.refactoringsAtPoint', () => {
    it('returns refactorings for a variable', async () => {
      const point = new _atom.Point(2, 6);
      const refactorings = await _Refactoring().default.refactorings(fakeEditor, new _atom.Range(point, point));
      expect(refactorings).toEqual([{
        kind: 'rename',
        symbolAtPoint: {
          text: 'var2',
          range: new _atom.Range([2, 2], [2, 17])
        }
      }]);
    });
    it('returns nothing for a function', async () => {
      const point = new _atom.Point(1, 5);
      const refactorings = await _Refactoring().default.refactorings(fakeEditor, new _atom.Range(point, point));
      expect(refactorings).toEqual([]);
    });
  });
  describe('Refactoring.refactor', () => {
    it('refactors a parameter', async () => {
      const response = await _Refactoring().default.refactor({
        editor: fakeEditor,
        kind: 'rename',
        newName: 'new_var',
        symbolAtPoint: {
          range: new _atom.Range([1, 21], [1, 28]),
          text: 'var1'
        },
        originalPoint: new _atom.Point(1, 25)
      }).toPromise();

      if (!(response.type === 'edit')) {
        throw new Error('Must be a standard edit');
      }

      expect(Array.from(response.edits)).toEqual([[TEST_PATH, [{
        // param declaration
        oldRange: new _atom.Range([1, 25], [1, 29]),
        oldText: 'var1',
        newText: 'new_var'
      }, {
        // int var2 = var1
        oldRange: new _atom.Range([2, 13], [2, 17]),
        oldText: 'var1',
        newText: 'new_var'
      }]]]);
    });
  });
});