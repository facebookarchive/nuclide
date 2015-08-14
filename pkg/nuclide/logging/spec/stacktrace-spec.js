'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import addPrepareStackTraceHook from '../lib/stacktrace';
import {__test__} from '../lib/stacktrace';

var STACK_FRAME_PROPERTIES = [
  'functionName', 'methodName', 'fileName', 'lineNumber', 'columnNumer', 'evalOrgin',
  'isTopLevel', 'isEval', 'isNative', 'isConstructor',
];

function validateStructuredStackTraceCreated(e: Error): void {
  expect(e.stackTrace instanceof Array).toBe(true);
  e.stackTrace.forEach(frame => {
    var keys = Object.keys(frame);
    STACK_FRAME_PROPERTIES.forEach(property => {
      expect(keys.indexOf(property) >= 0).toBe(true);
    });
  });
}

describe('stacktrace hook', () => {
  afterEach(() => {
    delete Error['prepareStackTrace'];
    __test__.resetPrepareStackTraceHooked();
  });

  it('generates structured stacktrace', () => {
    addPrepareStackTraceHook();
    var e = new Error();
    // e.stackTrace won't be availabe until e.stack is called.
    expect(e.stackTrace).toBe(undefined);
    expect(typeof e.stack).toBe('string');
    validateStructuredStackTraceCreated(e);
  });

  it('doesn\'t screw up previous customization', () => {

    var customizedStack = 'There is no spoon';
    Error.prepareStackTrace = (_, frames) => {
      return customizedStack;
    };

    var e = new Error();
    // e.stack is customized.
    expect(e.stack).toBe(customizedStack);
    expect(e.stackTrace).toBe(undefined);

    addPrepareStackTraceHook();

    e = new Error();
    expect(e.stackTrace).toBe(undefined);
    // e.stack is still customized.
    expect(e.stack).toBe(customizedStack);
    validateStructuredStackTraceCreated(e);
  });

  it('support following up customization', () => {
    addPrepareStackTraceHook();

    var e = new Error();
    expect(e.stackTrace).toBe(undefined);
    expect(typeof e.stack).toBe('string');
    validateStructuredStackTraceCreated(e);

    var customizedStack = 'There is no spoon';
    Error.prepareStackTrace = (_, frames) => {
      return customizedStack;
    };

    e = new Error();
    // e.stack is customized.
    expect(e.stack).toBe(customizedStack);
    validateStructuredStackTraceCreated(e);
  });
});
