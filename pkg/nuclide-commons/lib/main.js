Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// It's impactful to memoize our requires here since these commons are so often used.
var requireCache = {};
function requireFromCache(id) {
  if (!requireCache.hasOwnProperty(id)) {
    // $FlowIgnore
    requireCache[id] = require(id);
  }
  return requireCache[id];
}

function requirePromises() {
  return requireFromCache('./promises');
}

function requireObservables() {
  return requireFromCache('./observables');
}

function requireProcess() {
  return requireFromCache('./process');
}

function requireStream() {
  return requireFromCache('./stream');
}

function requirePromiseExecutors() {
  return requireFromCache('./PromiseExecutors');
}

module.exports = Object.defineProperties({}, {
  asyncFind: {
    get: function get() {
      return requirePromises().asyncFind;
    },
    configurable: true,
    enumerable: true
  },
  asyncExecute: {
    get: function get() {
      return requireProcess().asyncExecute;
    },
    configurable: true,
    enumerable: true
  },
  bufferUntil: {
    get: function get() {
      return requireStream().bufferUntil;
    },
    configurable: true,
    enumerable: true
  },
  checkOutput: {
    get: function get() {
      return requireProcess().checkOutput;
    },
    configurable: true,
    enumerable: true
  },
  CompositeSubscription: {
    get: function get() {
      return requireStream().CompositeSubscription;
    },
    configurable: true,
    enumerable: true
  },
  createArgsForScriptCommand: {
    get: function get() {
      return requireProcess().createArgsForScriptCommand;
    },
    configurable: true,
    enumerable: true
  },
  createExecEnvironment: {
    get: function get() {
      return requireProcess().createExecEnvironment;
    },
    configurable: true,
    enumerable: true
  },
  Deferred: {

    /**
     * IMPORTANT: You should almost never use this!! See `./promises.js`.
     */

    get: function get() {
      return requirePromises().Deferred;
    },
    configurable: true,
    enumerable: true
  },
  denodeify: {
    get: function get() {
      return requirePromises().denodeify;
    },
    configurable: true,
    enumerable: true
  },
  DisposableSubscription: {
    get: function get() {
      return requireStream().DisposableSubscription;
    },
    configurable: true,
    enumerable: true
  },
  forkWithExecEnvironment: {
    get: function get() {
      return requireProcess().forkWithExecEnvironment;
    },
    configurable: true,
    enumerable: true
  },
  safeSpawn: {
    get: function get() {
      return requireProcess().safeSpawn;
    },
    configurable: true,
    enumerable: true
  },
  scriptSafeSpawn: {
    get: function get() {
      return requireProcess().scriptSafeSpawn;
    },
    configurable: true,
    enumerable: true
  },
  scriptSafeSpawnAndObserveOutput: {
    get: function get() {
      return requireProcess().scriptSafeSpawnAndObserveOutput;
    },
    configurable: true,
    enumerable: true
  },
  splitStream: {
    get: function get() {
      return requireStream().splitStream;
    },
    configurable: true,
    enumerable: true
  },
  observeStream: {
    get: function get() {
      return requireStream().observeStream;
    },
    configurable: true,
    enumerable: true
  },
  observeProcessExit: {
    get: function get() {
      return requireProcess().observeProcessExit;
    },
    configurable: true,
    enumerable: true
  },
  observeProcess: {
    get: function get() {
      return requireProcess().observeProcess;
    },
    configurable: true,
    enumerable: true
  },
  relativeDate: {
    get: function get() {
      return requireFromCache('./relativeDate').relativeDate;
    },
    configurable: true,
    enumerable: true
  },
  toJsString: {
    get: function get() {
      return requireFromCache('./toJsString').toJsString;
    },
    configurable: true,
    enumerable: true
  },
  array: {
    get: function get() {
      return requireFromCache('./array');
    },
    configurable: true,
    enumerable: true
  },
  set: {
    get: function get() {
      return requireFromCache('./set');
    },
    configurable: true,
    enumerable: true
  },
  map: {
    get: function get() {
      return requireFromCache('./map');
    },
    configurable: true,
    enumerable: true
  },
  object: {
    get: function get() {
      return requireFromCache('./object');
    },
    configurable: true,
    enumerable: true
  },
  fsPromise: {
    get: function get() {
      return requireFromCache('./fsPromise').fsPromise;
    },
    configurable: true,
    enumerable: true
  },
  httpPromise: {
    get: function get() {
      return requireFromCache('./http');
    },
    configurable: true,
    enumerable: true
  },
  paths: {
    get: function get() {
      return requireFromCache('./paths');
    },
    configurable: true,
    enumerable: true
  },
  PromisePool: {
    get: function get() {
      return requirePromiseExecutors().PromisePool;
    },
    configurable: true,
    enumerable: true
  },
  PromiseQueue: {
    get: function get() {
      return requirePromiseExecutors().PromiseQueue;
    },
    configurable: true,
    enumerable: true
  },
  debounce: {
    get: function get() {
      return requireFromCache('./debounce').debounce;
    },
    configurable: true,
    enumerable: true
  },
  once: {
    get: function get() {
      return requireFromCache('./once').once;
    },
    configurable: true,
    enumerable: true
  },
  toolbar: {
    get: function get() {
      return requireFromCache('./toolbar');
    },
    configurable: true,
    enumerable: true
  },
  vcs: {
    get: function get() {
      return requireFromCache('./vcs');
    },
    configurable: true,
    enumerable: true
  },
  dnsUtils: {
    get: function get() {
      return requireFromCache('./dns_utils');
    },
    configurable: true,
    enumerable: true
  },
  env: {
    get: function get() {
      return requireFromCache('./environment');
    },
    configurable: true,
    enumerable: true
  },
  promises: {
    get: function get() {
      return requirePromises();
    },
    configurable: true,
    enumerable: true
  },
  observables: {
    get: function get() {
      return requireObservables();
    },
    configurable: true,
    enumerable: true
  },
  regexp: {
    get: function get() {
      return requireFromCache('./regexp');
    },
    configurable: true,
    enumerable: true
  },
  error: {
    get: function get() {
      return requireFromCache('./error');
    },
    configurable: true,
    enumerable: true
  },
  event: {
    get: function get() {
      return requireFromCache('./event');
    },
    configurable: true,
    enumerable: true
  },
  session: {
    get: function get() {
      return requireFromCache('./session');
    },
    configurable: true,
    enumerable: true
  },
  singleton: {
    get: function get() {
      return requireFromCache('./singleton');
    },
    configurable: true,
    enumerable: true
  },
  CircularBuffer: {
    get: function get() {
      return requireFromCache('./CircularBuffer').CircularBuffer;
    },
    configurable: true,
    enumerable: true
  },
  COMMON_BINARY_PATHS: {
    get: function get() {
      return requireProcess().COMMON_BINARY_PATHS;
    },
    configurable: true,
    enumerable: true
  },
  clientInfo: {
    get: function get() {
      return requireFromCache('./clientInfo');
    },
    configurable: true,
    enumerable: true
  },
  systemInfo: {
    get: function get() {
      return requireFromCache('./systemInfo');
    },
    configurable: true,
    enumerable: true
  },
  runtimeInfo: {
    get: function get() {
      return requireFromCache('./runtimeInfo');
    },
    configurable: true,
    enumerable: true
  },
  ScribeProcess: {
    get: function get() {
      return requireFromCache('./ScribeProcess').ScribeProcess;
    },
    configurable: true,
    enumerable: true
  },
  BatchProcessedQueue: {
    get: function get() {
      return requireFromCache('./BatchProcessedQueue').BatchProcessedQueue;
    },
    configurable: true,
    enumerable: true
  },
  ExtendableError: {
    get: function get() {
      return requireFromCache('./ExtendableError');
    },
    configurable: true,
    enumerable: true
  },
  passesGK: {
    get: function get() {
      return requireFromCache('./gatekeeper').passesGK;
    },
    configurable: true,
    enumerable: true
  }
});