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

import {getDiagnostics} from '../lib/interfaces/getDiagnostics';

describe('getDiagnostics', () => {
  const fakePath = require.resolve('../lib/interfaces/getDiagnostics');

  it('catches syntax errors', () => {
    waitsForPromise(async () => {
      const error = (await getDiagnostics(fakePath, 'qeury'))[0];
      expect(error).toBeDefined();
      expect(error.text).toContain('Unexpected Name "qeury"');
      expect(error.filePath).toEqual(fakePath);
    });
  });
});
