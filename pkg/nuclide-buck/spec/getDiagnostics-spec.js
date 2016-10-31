'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Range} from 'atom';
import * as nuclideRemoteConnection from '../../nuclide-remote-connection';
import getDiagnostics from '../lib/getDiagnostics';

describe('getDiagnostics', () => {
  beforeEach(() => {
    spyOn(nuclideRemoteConnection, 'getFileSystemServiceByNuclideUri').andReturn({
      exists(filename) {
        return Promise.resolve(filename.indexOf('good') !== -1);
      },
    });
  });

  it('matches all lines that look like errors', () => {
    waitsForPromise(async () => {
      const message =
        'good_file.cpp:1:2: test error\n' +
        'good_file.cpp:1:3: note: trace\n' +
        'good_file.cpp:1:4: note: trace2\n' +
        'good_file.cpp:1:2 bad line\n' +
        'good_file.cpp:12: bad line2\n' +
        ':12:2: bad line3\n' +
        'good_file2.cpp:2:3: test error2\n' +
        'good_file2.cpp:2:4: note: trace\n';

      expect(await getDiagnostics(message, 'error', '/')).toEqual([
        {
          scope: 'file',
          providerName: 'Buck',
          type: 'Error',
          filePath: '/good_file.cpp',
          text: 'test error',
          range: new Range([0, 0], [1, 0]),
          trace: [
            {
              type: 'Trace',
              text: 'note: trace',
              filePath: '/good_file.cpp',
              range: new Range([0, 2], [0, 2]),
            },
            {
              type: 'Trace',
              text: 'note: trace2',
              filePath: '/good_file.cpp',
              range: new Range([0, 3], [0, 3]),
            },
          ],
        },
        {
          scope: 'file',
          providerName: 'Buck',
          type: 'Error',
          filePath: '/good_file2.cpp',
          text: 'test error2',
          range: new Range([1, 0], [2, 0]),
          trace: [
            {
              type: 'Trace',
              text: 'note: trace',
              filePath: '/good_file2.cpp',
              range: new Range([1, 3], [1, 3]),
            },
          ],
        },
      ]);
    });
  });

  it('ignores non-existent files', () => {
    waitsForPromise(async () => {
      const message = 'bad_file.cpp:1:2: test error';
      expect(await getDiagnostics(message, 'error', '/')).toEqual([]);
    });
  });
});
