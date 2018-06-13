/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import invariant from 'assert';
import {Point, Range} from 'atom';
import fs from 'fs';

import featureConfig from 'nuclide-commons-atom/feature-config';
import nuclideUri from 'nuclide-commons/nuclideUri';
import Refactoring from '../lib/Refactoring';
import {getDiagnostics} from '../lib/libclang';

const TEST_PATH = nuclideUri.join(
  __dirname,
  '../__mocks__/fixtures',
  'references.cpp',
);

const fakeEditor: any = {
  getPath: () => TEST_PATH,
  getText: () => fs.readFileSync(TEST_PATH, 'utf8'),
};

describe('Refactoring', () => {
  beforeEach(async () => {
    featureConfig.set('nuclide-clang', {
      libclangPath: '',
      enableDefaultFlags: true,
      defaultFlags: ['-std=c++14', '-x', 'c++'],
      defaultDiagnostics: false,
      serverProcessMemoryLimit: 15,
    });
    // Ensure that the file is compiled.
    await getDiagnostics(fakeEditor);
  });

  describe('Refactoring.refactoringsAtPoint', () => {
    it('returns refactorings for a variable', async () => {
      await (async () => {
        const point = new Point(2, 6);
        const refactorings = await Refactoring.refactorings(
          fakeEditor,
          new Range(point, point),
        );
        expect(refactorings).toEqual([
          {
            kind: 'rename',
            symbolAtPoint: {
              text: 'var2',
              range: new Range([2, 2], [2, 17]),
            },
          },
        ]);
      })();
    });

    it('returns nothing for a function', async () => {
      await (async () => {
        const point = new Point(1, 5);
        const refactorings = await Refactoring.refactorings(
          fakeEditor,
          new Range(point, point),
        );
        expect(refactorings).toEqual([]);
      })();
    });
  });

  describe('Refactoring.refactor', () => {
    it('refactors a parameter', async () => {
      await (async () => {
        const response = await Refactoring.refactor({
          editor: fakeEditor,
          kind: 'rename',
          newName: 'new_var',
          symbolAtPoint: {
            range: new Range([1, 21], [1, 28]),
            text: 'var1',
          },
          originalPoint: new Point(1, 25),
        }).toPromise();
        invariant(response.type === 'edit', 'Must be a standard edit');
        expect(Array.from(response.edits)).toEqual([
          [
            TEST_PATH,
            [
              {
                // param declaration
                oldRange: new Range([1, 25], [1, 29]),
                oldText: 'var1',
                newText: 'new_var',
              },
              {
                // int var2 = var1
                oldRange: new Range([2, 13], [2, 17]),
                oldText: 'var1',
                newText: 'new_var',
              },
            ],
          ],
        ]);
      })();
    });
  });
});
