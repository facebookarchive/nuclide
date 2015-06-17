'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {replacePassword, getPassword, __test__} = require('../lib/main');
var {
  runScriptInApmNode,
  getApmNodePath,
  getApmNodeModulesPath,
} = __test__;

describe('Keytar Wrapper', () => {

  describe('getApmNodePath', () => {
    it('returns path to apm copy of node', () => {
      if (process.platform === 'darwin') {
        expect(getApmNodePath()).toMatch(/.*Contents\/Resources\/app\/apm\/bin\/node$/);
      }
    });
  });

  describe('getApmNodeModulesPath', () => {
    it('returns path to apm copy of node_modules', () => {
      if (process.platform === 'darwin') {
        expect(getApmNodeModulesPath()).toMatch(/.*Contents\/Resources\/app\/apm\/node_modules$/);
      }
    });
  });

  describe('runScriptInApmNode', () => {
    it('runs a string as a script in apm node', () => {
      var result = runScriptInApmNode('require("keytar");console.log("true")');
      expect(result).toEqual('true\n');
    });
  });

  describe('*Password', () => {
    it('sets password in keychain', () => {
      var crypto = require('crypto');
      var randomString = crypto.pseudoRandomBytes(32).toString('hex');
      replacePassword('nuclide-keytar-wrapper', 'fake user', randomString);
      expect(getPassword('nuclide-keytar-wrapper', 'fake user')).toEqual(randomString);
    });
  });

});
