"use strict";

function _browserCookies() {
  const data = _interopRequireDefault(require("../browser-cookies"));

  _browserCookies = function () {
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
 *  strict
 * @format
 */
describe('browser', () => {
  describe('getCookies', () => {
    it('gets cookies for a domain', () => waitsForPromise(async () => {
      const cookies = await _browserCookies().default.getCookies('example.com');
      expect(typeof cookies).toBe('object');
    }));
  });
  describe('setCookies', () => {
    it('can set cookies for a domain/URL', () => waitsForPromise(async () => {
      const now = Date.now().toString();
      const cookiesBefore = await _browserCookies().default.getCookies('example.com');
      expect(cookiesBefore.now).not.toBe(now);
      await _browserCookies().default.setCookie('http://example.com', 'example.com', 'now', now);
      const cookiesAfter = await _browserCookies().default.getCookies('example.com');
      expect(cookiesAfter.now).toBe(now);
    }));
  });
});