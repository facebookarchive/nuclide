'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__test__ = undefined;
exports.default = addPrepareStackTraceHook;

var _singleton;

function _load_singleton() {
  return _singleton = _interopRequireDefault(require('../../commons-node/singleton'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const PREPARE_STACK_TRACE_HOOKED_KEY = '_nuclide_error_stack_trace_hooked'; /**
                                                                             * Copyright (c) 2015-present, Facebook, Inc.
                                                                             * All rights reserved.
                                                                             *
                                                                             * This source code is licensed under the license found in the LICENSE file in
                                                                             * the root directory of this source tree.
                                                                             *
                                                                             * 
                                                                             */

let hookedPrepareStackTrace;

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
function addPrepareStackTraceHook() {
  (_singleton || _load_singleton()).default.get(PREPARE_STACK_TRACE_HOOKED_KEY, () => {
    hookedPrepareStackTrace = createHookedPrepareStackTrace(Error.prepareStackTrace || defaultPrepareStackTrace);

    // Hook Error.prepareStackTrace by leveraging get/set accessor. In this way, writing to
    // Error.prepareStackTrace will put the new prepareStackTrace functions in a wrapper that
    // calls the hook.
    // $FlowIssue
    Object.defineProperty(Error, 'prepareStackTrace', {
      get() {
        return hookedPrepareStackTrace;
      },
      set(newValue) {
        hookedPrepareStackTrace = createHookedPrepareStackTrace(newValue || defaultPrepareStackTrace);
      },
      enumerable: false,
      configurable: true
    });

    // TODO (chenshen) t8789330.
    // Atom added getRawStack to Error.prototype to get Error's structured stacktrace
    // (https://github.com/atom/grim/blob/master/src/grim.coffee#L43). However, this
    // doesn't work well with our customization of stacktrace. So here we temporarily
    // walk around this by following hack, until https://github.com/atom/atom/issues/9641
    // get addressed.
    /* $FlowFixMe */ // eslint-disable-next-line no-extend-native
    Error.prototype.getRawStack = null;
    return true;
  });
}

/**
 * Create a wrapper that calls to structuredStackTraceHook first, then return the result of
 * prepareStackTrace.
 */
function createHookedPrepareStackTrace(prepareStackTrace) {
  // If the prepareStackTrace is already been hooked, just return it.
  if (prepareStackTrace.name === 'nuclideHookedPrepareStackTrace') {
    return prepareStackTrace;
  }

  const hookedFunction = function nuclideHookedPrepareStackTrace(error, frames) {
    structuredStackTraceHook(error, frames);
    return prepareStackTrace(error, frames);
  };

  return hookedFunction;
}

function structuredStackTraceHook(error, frames) {
  // $FlowFixMe
  error.stackTrace = frames.map(frame => {
    const scriptNameOrUrl = frame.getScriptNameOrSourceURL();
    const evalOrigin = scriptNameOrUrl == null ? null : frame.getEvalOrigin();
    return {
      functionName: frame.getFunctionName(),
      methodName: frame.getMethodName(),
      fileName: frame.getFileName(),
      lineNumber: frame.getLineNumber(),
      columnNumber: frame.getColumnNumber(),
      evalOrigin,
      isTopLevel: frame.isToplevel(),
      isEval: frame.isEval(),
      isNative: frame.isNative(),
      isConstructor: frame.isConstructor()
    };
  });
}

function defaultPrepareStackTrace(error, frames) {
  let formattedStackTrace = error.message ? `${error.name}: ${error.message}` : `${error.name}`;
  frames.forEach(frame => {
    // Do not use `maybeToString` here since lazily loading it (inline-imports) may
    // result in a circular load of `babel-core` via `nuclide-node-transpiler`.
    // https://github.com/babel/babel/blob/c2b3ea7/packages/babel-template/src/index.js#L21
    formattedStackTrace += `\n    at ${String(frame.toString())}`;
  });
  return formattedStackTrace;
}

const __test__ = exports.__test__ = {
  createHookedPrepareStackTrace,
  resetPrepareStackTraceHooked() {
    (_singleton || _load_singleton()).default.clear(PREPARE_STACK_TRACE_HOOKED_KEY);
  }
};