'use strict';

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _HyperclickProvider;

function _load_HyperclickProvider() {
  return _HyperclickProvider = require('../lib/HyperclickProvider');
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

describe('HyperclickProvider', () => {
  let projectPath = null;

  beforeEach(() => {
    projectPath = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures/test-project') + '/';
    atom.project.setPaths([projectPath]);
  });

  describe('parseTarget', () => {
    it('searches //Apps/TestApp/BUCK-rename', async () => {
      let target = await (0, (_HyperclickProvider || _load_HyperclickProvider()).parseTarget)([':target1', null, 'target1'], null, projectPath);
      expect(target).toBe(null);

      target = await (0, (_HyperclickProvider || _load_HyperclickProvider()).parseTarget)([':target1', null, 'target1'], projectPath + 'test/BUCK', projectPath);
      expect(target).toEqual({
        path: projectPath + 'test/BUCK',
        name: 'target1'
      });

      target = await (0, (_HyperclickProvider || _load_HyperclickProvider()).parseTarget)(['//Apps/TestApp:w3ird', '//Apps/TestApp', 'w3ird'], null, projectPath);
      expect(target).toEqual(null);

      target = await (0, (_HyperclickProvider || _load_HyperclickProvider()).parseTarget)(['//Apps/TestApp:w3ird', '//Apps/TestApp', 'w3ird'], '//test/BUCK', projectPath);
      expect(target).toEqual({
        path: projectPath + 'Apps/TestApp/BUCK',
        name: 'w3ird'
      });
    });
  });

  describe('parseLoadTarget', () => {
    it('resolves a path for //pkg/subpkg:ext.bzl', async () => {
      await (async () => {
        const target = await (0, (_HyperclickProvider || _load_HyperclickProvider()).resolveLoadTargetPath)(['//pkg/subpkg:ext.bzl', '', '//pkg/subpkg', 'ext.bzl'], projectPath);
        expect(target).toEqual(projectPath + 'pkg/subpkg/ext.bzl');
      })();
    });
  });

  describe('findTargetLocation', () => {
    const targetsByFile = {
      'Apps/TestApp/BUCK-rename': {
        Target1: 1,
        'w3ird_target-name': 7,
        Target2: 13,
        TestsTarget: 27,
        'non-existing-target': -1
      },
      'Apps/BUCK-rename': {
        test_target123: 1
      },
      'Libraries/TestLib1/BUCK-rename': {
        target_with_no_trailling_comma: 1,
        target_with_no_trailling_commas: -1,
        lib_target1: 5,
        'lib_target-test': 12,
        lib_target: -1,
        TestsTarget: 23,
        PUBLIC: -1,
        '[]': -1
      },
      'Libraries/TestLib1/test-ios-sdk/sdk-v.1.2.3/BUCK-rename': {
        'target-v.1': 1,
        target: 7,
        targett: -1,
        arget: -1
      }
    };

    for (const file in targetsByFile) {
      for (const targetName in targetsByFile[file]) {
        it('asks for a location of the target', async () => {
          await (() => {
            return (0, (_HyperclickProvider || _load_HyperclickProvider()).findTargetLocation)({
              path: projectPath + file,
              name: targetName
            }).then(location => {
              const line = targetsByFile[file][targetName];
              if (line !== -1) {
                expect(location).toEqual({
                  path: projectPath + file,
                  line,
                  column: 0
                });
              } else {
                expect(location).toEqual({
                  path: projectPath + file,
                  line: 0,
                  column: 0
                });
              }
            });
          })();
        });
      }
    }
  });
});