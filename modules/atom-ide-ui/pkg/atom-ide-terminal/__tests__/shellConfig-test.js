"use strict";

function _shellConfig() {
  const data = require("../lib/pty-service/shellConfig");

  _shellConfig = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
describe('shellConfig', () => {
  describe('parseConfig', () => {
    it('throws on non-JSON', () => {
      const parse = () => (0, _shellConfig().parseConfig)('#include <stdio.h>');

      expect(parse).toThrow();
    });
    it('throws on non-object', () => {
      const parse = () => (0, _shellConfig().parseConfig)('[3]');

      expect(parse).toThrow();
    });
    it('parses space-separated command string', () => {
      const config = (0, _shellConfig().parseConfig)(JSON.stringify({
        command: 'a b c'
      }));
      expect(config.command).toEqual({
        file: 'a',
        args: ['b', 'c']
      });
    });
    it('parses explicit command array', () => {
      const config = (0, _shellConfig().parseConfig)(JSON.stringify({
        command: ['a', 'b', 'c']
      }));
      expect(config.command).toEqual({
        file: 'a',
        args: ['b', 'c']
      });
    });
    it('throws on non-string argument', () => {
      const config = JSON.stringify({
        command: ['a', 3]
      });
      expect(() => (0, _shellConfig().parseConfig)(config)).toThrow();
    });
  });
});