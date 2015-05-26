'use babel';
/* flow */

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

type EventMethodTestCase = {
  methodName: string;
  callback: (payload: mixed) => void;
  expectations: () => void;
  timeoutMs: number
}

function testEventServiceWithServiceFramworkRegistered(
  definitionClassAbsolutePath: string,
  implementationClassPathAbsolutePath: string,
  definitionClassName: string,
  testCases: Array<EventMethodTestCase>,
): void {
  waitsForPromise(async () => {
    var server = new NuclideServer({port: 8176});

    server._serviceWithServiceFrameworkConfigs = [{
      name: definitionClassName,
      definition: definitionClassAbsolutePath,
      implementation: implementationClassPathAbsolutePath,
    }];

    await server.connect();
    var client = new NuclideClient('test', new NuclideRemoteEventbus('http://localhost:8176'));

    await Promise.all(testCases.map(async(testCase) => {
      await client.registerEventListener(
        definitionClassName + '/' + testCase.methodName,
        testCase.callback, {});

      await new Promise((resolve, reject) => {
        setTimeout(() => resolve(testCase.expectations()), testCase.timeoutMs);
      });
    }));

    client.eventbus.socket.close();
    server.close();
  });
}

describe('Nuclide serivce with service framework event test suite', () => {
  beforeEach(() => {
    jasmine.unspy(window, 'setTimeout');
    jasmine.getEnv().defaultTimeoutInterval = 10000;
  });

  it('subscribes to event and callback is triggered', () => {
    var onceEventTriggered = false;
    var truthValid = false;
    var repeatEvents = [];
    testEventServiceWithServiceFramworkRegistered(
      path.resolve(__dirname, 'fixtures/EventService.js'),
      path.resolve(__dirname, 'fixtures/LocalEventService.js'),
      'EventService',
      [
        {
          methodName: 'onOnceEvent',
          callback: () => {
            onceEventTriggered = true;
          },
          expectations: () => {
            expect(onceEventTriggered).toBe(true);
          },
          timeoutMs: 500,
        },
        {
          methodName: 'onRevealTruthOnceEvent',
          callback: (augend: number, addend: number, sum: number) => {
            truthValid = (augend + addend) === sum;
          },
          expectations: () => {
            expect(truthValid).toBe(true);
          },
          timeoutMs: 200,
        },
        {
          methodName: 'onRepeatEvent',
          callback: (id: number) => {
            repeatEvents.push(id);
          },
          expectations: () => {
            expect(repeatEvents.length).toBe(4);

            var previousId = -1;
            repeatEvents.forEach(sequenceId => {
              expect(sequenceId > previousId).toBe(true);
              previousId = sequenceId;
            });
          },
          timeoutMs: 490,
        },
      ],
    );
  });
});
