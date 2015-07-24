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
var {matchers} = require('nuclide-test-helpers');
var path = require('path');
var {requireRemoteServiceSync} = require('../lib/main');

function testGenerateRemoteService(serviceName: string, sourceFilePath: string, expectedFilePath: string, testDesc: ?string): void {
  it(testDesc || sourceFilePath, function() {
    sourceFilePath = require.resolve(sourceFilePath);
    expectedFilePath = require.resolve(expectedFilePath);

    var transpiledFilePath = path.join(
        __dirname,
        '../gen/',
        path.basename(sourceFilePath));

    if (fs.existsSync(transpiledFilePath)) {
      fs.unlinkSync(transpiledFilePath);
    }

    requireRemoteServiceSync(sourceFilePath, serviceName);

    var generatedCode = fs.readFileSync(transpiledFilePath, 'utf8');
    var expectedCode = fs.readFileSync(path.resolve(__dirname, expectedFilePath), 'utf8')
        .replace(/REQUIRE_PLACE_HOLDER/g, sourceFilePath);
    expect(generatedCode).diffLines(expectedCode);
  });
}

describe('Nuclide service transformer test suite.', function() {
  beforeEach(function() {
    this.addMatchers(matchers);
  });

  describe('test requireRemoteServiceSync() generate and load remote service', function() {
    testGenerateRemoteService('TestService',
      './fixtures/TestService',
      './fixtures/TestService.js.expected',
      'transforms a service with basic types.');
    testGenerateRemoteService('NuclideTypedTestService',
      './fixtures/NuclideTypedTestService',
      './fixtures/NuclideTypedTestService.js.expected',
      'transforms a service with NuclideUri arguments / retuns.');
    testGenerateRemoteService('NestedNuclideTypedTestService',
      './fixtures/NestedNuclideTypedTestService',
      './fixtures/NestedNuclideTypedTestService.js.expected',
      'transforms a service with nested NuclideUris');
    testGenerateRemoteService('TestServiceA',
      './fixtures/MultipleServiceDefinition',
      './fixtures/MultipleServiceDefinition.js.expected',
      'supports multiple service definitions in one file.');
  });
});
