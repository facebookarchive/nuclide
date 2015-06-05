'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var fs = require('fs');
var path = require('path');
var {requireRemoteServiceSync} = require('../lib/main');

function testGenerateRemoteService(sourceFilePath: string, expectedFilePath: string): void {
  sourceFilePath = require.resolve(sourceFilePath);
  expectedFilePath = require.resolve(expectedFilePath);

  var transpiledFilePath = path.join(
      __dirname,
      '../gen/',
      path.basename(sourceFilePath));

  if (fs.existsSync(transpiledFilePath)) {
    fs.unlinkSync(transpiledFilePath);
  }

  requireRemoteServiceSync(sourceFilePath);

  var generatedCode = fs.readFileSync(transpiledFilePath, 'utf8');
  var expectedCode = fs.readFileSync(path.resolve(__dirname, expectedFilePath), 'utf8')
      .replace('REQUIRE_PLACE_HOLDER', sourceFilePath);

  expect(generatedCode).toEqual(expectedCode);
}

describe('Nuclide service transformer test suite.', function() {
  it('test requireRemoteServiceSync() generate and load remote service', function() {
    testGenerateRemoteService('./fixtures/TestService', './fixtures/RemoteTestService');
    testGenerateRemoteService('./fixtures/NuclideTypedTestService',
        './fixtures/RemoteNuclideTypedTestService');
    testGenerateRemoteService('./fixtures/NestedNuclideTypedTestService',
        './fixtures/RemoteNestedNuclideTypedTestService');
  });
});
