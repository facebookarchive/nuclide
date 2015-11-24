'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import {getClassPrefix} from '../lib/class-prefix';

const fs = require('fs');
const {addMatchers} = require('nuclide-test-helpers');
const path = require('path');
const {requireRemoteServiceSync} = require('../lib/main');

function testGenerateRemoteService(
  serviceName: string,
  sourceFilePath: string,
  expectedFilePath: string,
  testDesc: string,
  isDecorator: boolean = false,
): void {
  it(testDesc, () => {
    sourceFilePath = require.resolve(sourceFilePath);
    expectedFilePath = require.resolve(expectedFilePath);

    const transpiledFilePath = path.join(
        __dirname,
        '../gen/',
        getClassPrefix(isDecorator) + path.basename(sourceFilePath));

    if (fs.existsSync(transpiledFilePath)) {
      fs.unlinkSync(transpiledFilePath);
    }

    requireRemoteServiceSync(sourceFilePath, serviceName, isDecorator);

    const generatedCode = fs.readFileSync(transpiledFilePath, 'utf8');
    const expectedCode = fs.readFileSync(path.resolve(__dirname, expectedFilePath), 'utf8')
        .replace(/REQUIRE_PLACE_HOLDER/g, sourceFilePath);
    expect(generatedCode).diffLines(expectedCode);
  });
}

describe('Nuclide service transformer test suite.', function() {
  beforeEach(function() {
    addMatchers(this);
  });

  describe('test requireRemoteServiceSync() generate and load remote service', function() {
    testGenerateRemoteService(
      'TestService',
      './fixtures/TestService',
      './fixtures/TestService.js.expected',
      'transforms a service with basic types.');
    testGenerateRemoteService(
      'NuclideTypedTestService',
      './fixtures/NuclideTypedTestService',
      './fixtures/NuclideTypedTestService.js.expected',
      'transforms a service with NuclideUri arguments / retuns.');
    testGenerateRemoteService(
      'NestedNuclideTypedTestService',
      './fixtures/NestedNuclideTypedTestService',
      './fixtures/NestedNuclideTypedTestService.js.expected',
      'transforms a service with nested NuclideUris');
    testGenerateRemoteService(
      'TestServiceA',
      './fixtures/MultipleServiceDefinition',
      './fixtures/MultipleServiceDefinition.js.expected',
      'supports multiple service definitions in one file.');
  });

  describe('test requireRemoteServiceSync() generates appropriate decorator classes', () => {
    testGenerateRemoteService(
      'TestService',
      './fixtures/TestService',
      './fixtures/DecoratorTestService.expected.js',
      'Creates a decorator service for a service with basic types.',
      /* isDecorator */ true);
    testGenerateRemoteService(
      'NuclideTypedTestService',
      './fixtures/NuclideTypedTestService',
      './fixtures/DecoratorNuclideTypedTestService.expected.js',
      'Creates a decorator service with NuclideUri arguments / retuns.',
    /* isDecorator */ true);
  });
});
