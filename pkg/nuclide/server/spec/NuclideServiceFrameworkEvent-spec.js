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
var ServiceIntegrationTestHelper = require('./ServiceIntegrationTestHelper');

type EventMethodTestCase = {
  methodName: string;
  callback: (payload: any) => void;
  expectations: () => void;
  timeoutMs: number;
}

function testEventServiceWithServiceFramworkRegistered(
  className: string,
  definitionClassAbsolutePath: string,
  implementationClassPathAbsolutePath: string,
  testCases: Array<EventMethodTestCase>,
): void {
  waitsForPromise(async () => {
    var testHelper = new ServiceIntegrationTestHelper(
        className,
        definitionClassAbsolutePath,
        implementationClassPathAbsolutePath);

    await testHelper.start();

    var remoteService = testHelper.getRemoteService();

    await Promise.all(testCases.map(async (testCase) => {
      remoteService[testCase.methodName](testCase.callback);

      await new Promise((resolve, reject) => {
        setTimeout(() => resolve(testCase.expectations()), testCase.timeoutMs);
      });
    }));

    testHelper.stop();
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
      'EventService',
      path.resolve(__dirname, 'fixtures/EventService.js'),
      path.resolve(__dirname, 'fixtures/LocalEventService.js'),
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
          timeoutMs: 500,
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

  it('works with files that contain multiple services.', () => {
    var eventTriggered = false;
    testEventServiceWithServiceFramworkRegistered(
      'TestServiceA',
      path.resolve(__dirname, 'fixtures/MultipleServices.js'),
      path.resolve(__dirname, 'fixtures/LocalMultipleServices.js'),
      [
        {
          methodName: 'onEvent',
          callback: () => {
            eventTriggered = true;
          },
          expectations: () => {
            expect(eventTriggered).toBe(true);
          },
          timeoutMs: 500,
        },
      ],
    );
  });
});
