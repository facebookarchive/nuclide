'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var parseServiceApiSync = require('../lib/service-parser');

function testParseServiceApi(sourceFilePath: string, expected: any): void {
  var parsed = parseServiceApiSync(require.resolve(sourceFilePath));
  expect(parsed.rpcMethodNames.sort()).toEqual(expected.rpcMethodNames.sort());
  expect(parsed.eventMethodNames.sort()).toEqual(expected.eventMethodNames.sort());
}

describe('Nuclide service parser test suite.', function() {
  it('parse service api', function() {
    testParseServiceApi('./fixtures/TestService', {
      className: 'TestService',
      rpcMethodNames: ['foo', 'bar', 'qux', 'onetimeRegistration'],
      eventMethodNames: ['onNorf'],
    });
  });
});
