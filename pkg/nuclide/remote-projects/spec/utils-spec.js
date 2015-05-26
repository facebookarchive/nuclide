'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {sanitizeNuclideUri} = require('../lib/utils');

describe('Utils Test Suite', () => {

  describe('sanitizeUri()', () => {
    it('returns a clean url from a normalized url version', () => {
      var normalizedUrl = 'nuclide:/abc.fb.com/some/path';
      var fixedUrl = sanitizeNuclideUri(normalizedUrl);
      expect(fixedUrl).toBe('nuclide://abc.fb.com/some/path');
    });

    it('returns a clean url from a normalized and path prepended url version', () => {
      var brokenUrl = '/some_path/abosolute/atom/nuclide:/abc.fb.com/some/path';
      var fixedUrl = sanitizeNuclideUri(brokenUrl);
      expect(fixedUrl).toBe('nuclide://abc.fb.com/some/path');
    });

    it('returns the same url if it is valid url', () => {
      var url = 'nuclide://abc.fb.com/some/path';
      expect(sanitizeNuclideUri(url)).toBe(url);
      var ftpUrl = 'ftp://abc.fb.com/some/path';
      expect(sanitizeNuclideUri(ftpUrl)).toBe(ftpUrl);
    });
  });

});
