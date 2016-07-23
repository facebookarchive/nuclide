'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// The tests for the nuclide-atom-script package cannot live in pkg/nuclide-atom-script/spec
// because nuclide-atom-script specifies a custom test runner as part of its implementation
// in its package.json. As such, any tests for it that need to use Atom's built-in test runner
// need to live elsewhere, which is why they are in the top-level spec/ directory.

import type {AsyncExecuteReturn} from '../pkg/commons-node/process';

import {asyncExecute} from '../pkg/commons-node/process';
import nuclideUri from '../pkg/commons-node/nuclideUri';

describe('atom-script', () => {
  describe('echo sample', () => {
    const echoScript = nuclideUri.join(__dirname, '../pkg/nuclide-atom-script/samples/echo.js');

    it('with zero arguments', () => {
      waitsForPromise(async () => {
        const result = await runAtomScript(echoScript);
        expect(result.stdout).toBe('Please pass me an arg!\n');
      });
    });

    it('with multiple arguments arguments', () => {
      waitsForPromise(async () => {
        const result = await runAtomScript(echoScript, ['one', 'two', 'three']);
        expect(result.stdout).toBe('one two three\n');
      });
    });
  });

  describe('markdown sample', () => {
    const markdownScript = nuclideUri.join(
      __dirname,
      '../pkg/nuclide-atom-script/samples/markdown.js',
    );

    it(
      'verify that all of the output has been written to stdout ' +
      '(Note this is important to verify because the logic for flushing a large amount of data ' +
      'is a bit shaky.)',
      () => {
        waitsForPromise(async () => {
          const readme = nuclideUri.join(__dirname, '../pkg/nuclide-atom-script/README.md');
          const result = await runAtomScript(markdownScript, [readme]);
          expect(result.stdout.endsWith('</body>\n</html>\n')).toBe(true);
        });
      },
    );
  });
});

function runAtomScript(script: string, args = []): Promise<AsyncExecuteReturn> {
  return asyncExecute(
    nuclideUri.join(__dirname, '../pkg/nuclide-atom-script/bin/atom-script'),
    [script].concat(args));
}
