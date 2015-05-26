'use babel';
/* flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var processLib = require('../lib/process.js');
var path = require('path');

describe('process.asyncExecute', () => {

  var {createCommand, createExecEnvironment} = processLib.__test__;

  describe('createCommand()', () => {
    it('escapes arguments with spaces properly', () => {
      var command = 'cp';
      var args = ['~/test project/source.js', '~/test project/src.js'];
      var {commandStringWithArgs} = createCommand(command, args);
      var expectedSuffix =
          'cp \'~/test project/source.js\' \'~/test project/src.js\'';
      expect(commandStringWithArgs.endsWith(expectedSuffix)).toBe(true);
    });

    it('escapes arguments with octothorpes properly', () => {
      var command = 'json-pretty-print';
      var args = [
        '-f',
        '~/test/source#compilation-database,iphonesimulator-86_64.json',
      ];
      var {commandStringWithArgs} = createCommand(command, args);
      var expectedSuffix =
          'json-pretty-print -f \'~/test/source#compilation-database,iphonesimulator-86_64.json\'';
      expect(commandStringWithArgs.endsWith(expectedSuffix)).toBe(true);
    });
  });

  describe('createExecEnvironment()', () => {
    it('combine the existing environment variables with the common paths passed', () => {
      var execEnvirnoment = createExecEnvironment({foo: 'bar', PATH:'/bin'}, ['/abc/def']);
      expect(execEnvirnoment).toEqual({foo: 'bar', PATH: '/bin' + path.delimiter + '/abc/def'});
    });
  });
});
