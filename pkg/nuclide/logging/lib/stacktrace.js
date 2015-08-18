'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var PREPARE_STACK_TRACE_HOOKED_KEY = '_nuclide_stack_trace_hooked';

var customizedPrepareStackTrace: ?() => string = null;

/**
 * v8 provided a way to customize Error stacktrace generation by overwriting
 * Error.prepareStackTrace (https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi).
 * Here we added a hook to Error.prepareStackTrace to achieve following goals:
 *  1) Whenever `error.stack` is called, error.stackTrace will be generated.
 *  2) Other module's customization to Error.prepareStackTrace, no matter before or after the hook
 *     is added, will still work as expected.
 * In this way, other module could still overwrite Error.prepareStackTrace to customize stacktrace.
 * This is required as Atom's builtin coffeescript package need to show coffeescript stacktrace by
 * customize Error.prepareStackTrace.
 */
export default function addPrepareStackTraceHook(): void {
  if (global[PREPARE_STACK_TRACE_HOOKED_KEY]) {
    return;
  }

  // By default, Error.prepareStackTrace is null. However, if there is already a customization
  // attached to Error.prepareStackTrace, we save it to customizedPrepareStackTrace so it will be
  // called by by prepareStackTraceHook.
  if (Error.prepareStackTrace) {
    customizedPrepareStackTrace = Error.prepareStackTrace;
  }

  // Hook Error.prepareStackTrace by leveraging get/set accessor. In this way, all the call to
  // Error.prepareStackTrace will be handled by prepareStackTraceHook while writing to
  // it will be saved to customizedPrepareStackTrace.
  Object.defineProperty(Error, 'prepareStackTrace', {
    get: () => prepareStackTraceHook,
    set: newValue => {
      if (newValue !== prepareStackTraceHook) {
        customizedPrepareStackTrace = newValue;
      }
    },
    enumerable: false,
    configurable: true,
  });

  global[PREPARE_STACK_TRACE_HOOKED_KEY] = true;
}

// The hook that attaches 'stackTrace' to error and then fallback to
// customizedPrepareStackTrace/defaultPrepareStackTrace.
function prepareStackTraceHook(error: Error, frames: Array<node$CallSite>): string {
  error['stackTrace'] = frames.map(frame => {
    return {
      functionName: frame.getFunctionName(),
      methodName: frame.getMethodName(),
      fileName: frame.getFileName(),
      lineNumber: frame.getLineNumber(),
      columnNumer: frame.getColumnNumber(),
      evalOrgin: frame.getEvalOrigin(),
      isTopLevel: frame.isToplevel(),
      isEval: frame.isEval(),
      isNative: frame.isNative(),
      isConstructor: frame.isConstructor(),
    };
  });

  if (customizedPrepareStackTrace) {
    return customizedPrepareStackTrace(error, frames);
  }
  return defaultPrepareStackTrace(error, frames);
}

function defaultPrepareStackTrace(error: Error, frames: Array<node$CallSite>): string {
  var formattedStackTrace = error.message ? `${error.name}: ${error.message}` : `${error.name}`;
  frames.forEach(frame => {
    formattedStackTrace += `\n    at ${frame.toString()}`;
  });
  return formattedStackTrace;
}

export var __test__ = {
  resetPrepareStackTraceHooked: () => {
    global[PREPARE_STACK_TRACE_HOOKED_KEY] = false;
  },
};
