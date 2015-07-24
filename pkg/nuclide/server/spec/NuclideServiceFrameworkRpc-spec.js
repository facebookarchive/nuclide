'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var path = require('path');
var NuclideServer = require('../lib/NuclideServer');
var NuclideRemoteEventbus = require('../lib/NuclideRemoteEventbus');
var NuclideClient = require('../lib/NuclideClient');

function testRpcServiceWithServiceFrameworkRegistered(
  definitionClassAbsolutePath: string,
  implementationClassPathAbsolutePath: string,
  definitionClassName: string,
  testCases: Array<{methodName: string; args: Array<any>; expected: any}>,
): void {
  waitsForPromise(async () => {
    var server = new NuclideServer({port: 8176});

    server._registerServiceWithServiceFramework({
      name: definitionClassName,
      definition: definitionClassAbsolutePath,
      implementation: implementationClassPathAbsolutePath,
    });

    await server.connect();
    var client = new NuclideClient('test', new NuclideRemoteEventbus('http://localhost:8176'));

    await Promise.all(testCases.map(testCase => {
      return client.makeRpc(
        definitionClassName + '/' + testCase.methodName,
        testCase.args,
        {},
      ).then(result => {
        expect(result).toEqual(testCase.expected);
      });
    }));

    client.eventbus.socket.close();
    server.close();
  });
}

describe('Nuclide serivce with service framework RPC test suite', () => {
  beforeEach(() => {
    jasmine.getEnv().defaultTimeoutInterval = 10000;
  });
  it('call registered service', () => {
    testRpcServiceWithServiceFrameworkRegistered(
      path.resolve(__dirname, 'fixtures/MathService.js'),
      path.resolve(__dirname, 'fixtures/LocalMathService.js'),
      'MathService',
      [
        {
          methodName: 'pi',
          args: [],
          expected: Math.PI,
        },
        {
          methodName: 'abs',
          args: [-1],
          expected: 1,
        },
        {
          methodName: 'sum',
          args: [1, 2],
          expected: 3,
        },
      ],
    );
  });

  it('can call a service in a file with multiple services.', () => {
    testRpcServiceWithServiceFrameworkRegistered(
      path.resolve(__dirname, 'fixtures/MultipleServices.js'),
      path.resolve(__dirname, 'fixtures/LocalMultipleServices.js'),
      'TestServiceA',
      [
        {
          methodName: 'method',
          args: [],
          expected: 'A',
        },
      ],
    );
  });
});
