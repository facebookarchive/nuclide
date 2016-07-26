'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import crypto from 'crypto';

import keytarWrapper, {__TEST__} from '../lib/keytarWrapper';

// This test is excluded from CI because depending on the machine that runs on
// it hangs. It might have something to do with how the `keytar` binary tries
// to access the keychain.

// eslint-disable-next-line jasmine/no-disabled-tests
xdescribe('Keytar Wrapper', () => {
  describe('getApmNodePath', () => {
    it('returns path to apm copy of node', () => {
      if (process.platform === 'darwin') {
        expect(__TEST__.getApmNodePath())
          .toMatch(/.*Contents\/Resources\/app\/apm\/bin\/node$/);
      }
    });
  });

  describe('getApmNodeModulesPath', () => {
    it('returns path to apm copy of node_modules', () => {
      if (process.platform === 'darwin') {
        expect(__TEST__.getApmNodeModulesPath())
          .toMatch(/.*Contents\/Resources\/app\/apm\/node_modules$/);
      }
    });
  });

  describe('runScriptInApmNode', () => {
    it('runs a string as a script in apm node', () => {
      const result = __TEST__.runScriptInApmNode('require("keytar");console.log("true")');
      expect(result).toEqual('true\n');
    });
  });

  describe('*Password', () => {
    it('sets password in keychain', () => {
      const randomString = crypto.pseudoRandomBytes(32).toString('hex');
      keytarWrapper.replacePassword('nuclide-keytar-wrapper', 'fake user', randomString);
      const actual = keytarWrapper.getPassword('nuclide-keytar-wrapper', 'fake user');
      expect(actual).toEqual(randomString);
    });
  });
});
