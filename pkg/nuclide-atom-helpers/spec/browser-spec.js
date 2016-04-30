'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import browser from '../lib/browser';

describe('browser', () => {

  describe('getCookies', () => {
    it('gets cookies for a domain', () => waitsForPromise(async () => {
      const cookies = await browser.getCookies('example.com');
      expect(typeof cookies).toBe('object');
    }));
  });

  describe('setCookies', () => {
    it('can set cookies for a domain/URL', () => waitsForPromise(async () => {
      const now = Date.now().toString();
      const cookiesBefore = await browser.getCookies('example.com');
      expect(cookiesBefore.now).not.toBe(now);
      await browser.setCookie('http://example.com', 'example.com', 'now', now);
      const cookiesAfter = await browser.getCookies('example.com');
      expect(cookiesAfter.now).toBe(now);
    }));
  });

});
