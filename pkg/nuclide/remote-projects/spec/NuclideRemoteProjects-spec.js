'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {encryptString, decryptString} = require('../lib/main').__test__;

describe('Nuclide Remote Projects', () => {
  describe('encryptString and decryptString', () => {
    it('can encrypt and dycrypt strings', () => {
      var text = 'This little piggy went to market';
      var {
        password,
        salt,
        encryptedString,
      } = encryptString(text);

      expect(encryptedString).not.toEqual(text);
      expect(decryptString(encryptedString, password, salt)).toEqual(text);

    });
  });
});
