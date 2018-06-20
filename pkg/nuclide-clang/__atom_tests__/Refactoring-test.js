'use strict';

var _atom = require('atom');

var _fs = _interopRequireDefault(require('fs'));

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _Refactoring;

function _load_Refactoring() {
  return _Refactoring = _interopRequireDefault(require('../lib/Refactoring'));
}

var _libclang;

function _load_libclang() {
  return _libclang = require('../lib/libclang');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TEST_PATH = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures', 'references.cpp'); /**
                                                                                                                           * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                           * All rights reserved.
                                                                                                                           *
                                                                                                                           * This source code is licensed under the license found in the LICENSE file in
                                                                                                                           * the root directory of this source tree.
                                                                                                                           *
                                                                                                                           * 
                                                                                                                           * @format
                                                                                                                           */

const fakeEditor = {
  getPath: () => TEST_PATH,
  getText: () => _fs.default.readFileSync(TEST_PATH, 'utf8')
};

describe('Refactoring', () => {
  beforeEach(async () => {
    (_featureConfig || _load_featureConfig()).default.set('nuclide-clang', {
      libclangPath: '',
      enableDefaultFlags: true,
      defaultFlags: ['-std=c++14', '-x', 'c++'],
      defaultDiagnostics: false,
      serverProcessMemoryLimit: 15
    });
    // Ensure that the file is compiled.
    await (0, (_libclang || _load_libclang()).getDiagnostics)(fakeEditor);
  });

  describe('Refactoring.refactoringsAtPoint', () => {
    it('returns refactorings for a variable', async () => {
      await (async () => {
        const point = new _atom.Point(2, 6);
        const refactorings = await (_Refactoring || _load_Refactoring()).default.refactorings(fakeEditor, new _atom.Range(point, point));
        expect(refactorings).toEqual([{
          kind: 'rename',
          symbolAtPoint: {
            text: 'var2',
            range: new _atom.Range([2, 2], [2, 17])
          }
        }]);
      })();
    });

    it('returns nothing for a function', async () => {
      await (async () => {
        const point = new _atom.Point(1, 5);
        const refactorings = await (_Refactoring || _load_Refactoring()).default.refactorings(fakeEditor, new _atom.Range(point, point));
        expect(refactorings).toEqual([]);
      })();
    });
  });

  describe('Refactoring.refactor', () => {
    it('refactors a parameter', async () => {
      await (async () => {
        const response = await (_Refactoring || _load_Refactoring()).default.refactor({
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
      })();
    });
  });
});