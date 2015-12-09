'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BuckProject} from '../../base/lib/BuckProject';

const {findTargetLocation, parseTarget} = require('../lib/HyperclickProvider');

describe('HyperclickProvider', () => {
  let projectPath: string = (null: any);

  beforeEach(() => {
    projectPath = require('path').join(__dirname, 'fixtures/test-project') + '/';
    atom.project.setPaths([projectPath]);
  });

  describe('parseTarget', () => {
    it('searches //Apps/TestApp/BUCK.test', () => {
      const buckProject: BuckProject = {
        getPath() {
          return Promise.resolve(projectPath);
        },
      };
      waitsForPromise(async () => {
        let target = await parseTarget(
            [':target1', null, 'target1'],
            null,
            buckProject);
        expect(target).toBe(null);

        target = await parseTarget(
            [':target1', null, 'target1'],
            projectPath + 'test/BUCK',
            buckProject);
        expect(target).toEqual({path: projectPath + 'test/BUCK', name: 'target1'});

        target = await parseTarget(
            ['//Apps/TestApp:w3ird', '//Apps/TestApp', 'w3ird'],
            null,
            buckProject);
        expect(target).toEqual(null);

        target = await parseTarget(
            ['//Apps/TestApp:w3ird', '//Apps/TestApp', 'w3ird'],
            '//test/BUCK',
            buckProject);
        expect(target).toEqual({path: projectPath + 'Apps/TestApp/BUCK', name: 'w3ird'});
      });
    });
  });

  describe('findTargetLocation', () => {
    const targetsByFile = {
      'Apps/TestApp/BUCK.test': {
        'Target1': 1,
        'w3ird_target-name': 7,
        'Target2': 13,
        'TestsTarget': 27,
        'non-existing-target': -1,
      },
      'Apps/BUCK.test': {
        'test_target123': 1,
      },
      'Libraries/TestLib1/BUCK.test': {
        'target_with_no_trailling_comma': 1,
        'target_with_no_trailling_commas': -1,
        'lib_target1': 5,
        'lib_target-test': 12,
        'lib_target': -1,
        'TestsTarget': 23,
        'PUBLIC': -1,
        '[]': -1,
      },
      'Libraries/TestLib1/test-ios-sdk/sdk-v.1.2.3/BUCK.test': {
        'target-v.1': 1,
        'target': 7,
        'targett': -1,
        'arget': -1,
      },
    };

    for (const file in targetsByFile) {
      for (const targetName in targetsByFile[file]) {
        it('asks for a location of the target', () => {
          waitsForPromise(() => {
            return findTargetLocation({path: projectPath + file, name: targetName})
            .then((location) => {
              const line = targetsByFile[file][targetName];
              if (line !== -1) {
                expect(location).toEqual(
                  {
                    path: projectPath + file,
                    line: line,
                    column: 0,
                  });
              } else {
                expect(location).toEqual({path: projectPath + file, line: 0, column: 0});
              }
            });
          });
        });
      }
    }
  });
});
