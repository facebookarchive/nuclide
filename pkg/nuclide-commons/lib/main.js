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

function requireProcess() {
  return requireFromCache('./process');
}

function requireStream() {
  return requireFromCache('./stream');
}

function requireFileSystem() {
  return requireFromCache('./filesystem');
}

function requrePromiseExecutors() {
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
  checkOutput: {
    get: function get() {
      return requireProcess().checkOutput;
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
  denodeify: {
    get: function get() {
      return requirePromises().denodeify;
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
  readFile: {
    get: function get() {
      return requireFileSystem().readFile;
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
  findNearestFile: {
    get: function get() {
      return requireFileSystem().findNearestFile;
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
      return requireFromCache('./filesystem');
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
  strings: {
    get: function get() {
      return requireFromCache('./strings');
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
      return requrePromiseExecutors().PromisePool;
    },
    configurable: true,
    enumerable: true
  },
  PromiseQueue: {
    get: function get() {
      return requrePromiseExecutors().PromiseQueue;
    },
    configurable: true,
    enumerable: true
  },
  extend: {
    get: function get() {
      return requireFromCache('./extend');
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
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQXFFQSxJQUFNLFlBQWlDLEdBQUcsRUFBRSxDQUFDO0FBQzdDLFNBQVMsZ0JBQWdCLENBQUMsRUFBVSxFQUFPO0FBQ3pDLE1BQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxFQUFFOztBQUVwQyxnQkFBWSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztHQUNoQztBQUNELFNBQU8sWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3pCOztBQUVELFNBQVMsZUFBZSxHQUFpQjtBQUN2QyxTQUFPLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO0NBQ3ZDOztBQUVELFNBQVMsY0FBYyxHQUFnQjtBQUNyQyxTQUFPLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0NBQ3RDOztBQUVELFNBQVMsYUFBYSxHQUFlO0FBQ25DLFNBQU8sZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7Q0FDckM7O0FBRUQsU0FBUyxpQkFBaUIsR0FBbUI7QUFDM0MsU0FBTyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztDQUN6Qzs7QUFFRCxTQUFTLHNCQUFzQixHQUF5QjtBQUN0RCxTQUFPLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLENBQUM7Q0FDL0M7O0FBRUQsTUFBTSxDQUFDLE9BQU8sMkJBQUcsRUErTGhCO0FBN0xLLFdBQVM7U0FBQSxlQUFHO0FBQ2QsYUFBTyxlQUFlLEVBQUUsQ0FBQyxTQUFTLENBQUM7S0FDcEM7Ozs7QUFFRyxjQUFZO1NBQUEsZUFBRztBQUNqQixhQUFPLGNBQWMsRUFBRSxDQUFDLFlBQVksQ0FBQztLQUN0Qzs7OztBQUVHLGFBQVc7U0FBQSxlQUFHO0FBQ2hCLGFBQU8sY0FBYyxFQUFFLENBQUMsV0FBVyxDQUFDO0tBQ3JDOzs7O0FBRUcsNEJBQTBCO1NBQUEsZUFBRztBQUMvQixhQUFPLGNBQWMsRUFBRSxDQUFDLDBCQUEwQixDQUFDO0tBQ3BEOzs7O0FBRUcsdUJBQXFCO1NBQUEsZUFBRztBQUMxQixhQUFPLGNBQWMsRUFBRSxDQUFDLHFCQUFxQixDQUFDO0tBQy9DOzs7O0FBRUcsV0FBUztTQUFBLGVBQUc7QUFDZCxhQUFPLGVBQWUsRUFBRSxDQUFDLFNBQVMsQ0FBQztLQUNwQzs7OztBQUVHLHlCQUF1QjtTQUFBLGVBQUc7QUFDNUIsYUFBTyxjQUFjLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQztLQUNqRDs7OztBQUVHLFdBQVM7U0FBQSxlQUFHO0FBQ2QsYUFBTyxjQUFjLEVBQUUsQ0FBQyxTQUFTLENBQUM7S0FDbkM7Ozs7QUFFRyxpQkFBZTtTQUFBLGVBQUc7QUFDcEIsYUFBTyxjQUFjLEVBQUUsQ0FBQyxlQUFlLENBQUM7S0FDekM7Ozs7QUFFRyxpQ0FBK0I7U0FBQSxlQUFHO0FBQ3BDLGFBQU8sY0FBYyxFQUFFLENBQUMsK0JBQStCLENBQUM7S0FDekQ7Ozs7QUFFRyxhQUFXO1NBQUEsZUFBRztBQUNoQixhQUFPLGFBQWEsRUFBRSxDQUFDLFdBQVcsQ0FBQztLQUNwQzs7OztBQUVHLGVBQWE7U0FBQSxlQUFHO0FBQ2xCLGFBQU8sYUFBYSxFQUFFLENBQUMsYUFBYSxDQUFDO0tBQ3RDOzs7O0FBRUcsb0JBQWtCO1NBQUEsZUFBRztBQUN2QixhQUFPLGNBQWMsRUFBRSxDQUFDLGtCQUFrQixDQUFDO0tBQzVDOzs7O0FBRUcsZ0JBQWM7U0FBQSxlQUFHO0FBQ25CLGFBQU8sY0FBYyxFQUFFLENBQUMsY0FBYyxDQUFDO0tBQ3hDOzs7O0FBRUcsVUFBUTtTQUFBLGVBQUc7QUFDYixhQUFPLGlCQUFpQixFQUFFLENBQUMsUUFBUSxDQUFDO0tBQ3JDOzs7O0FBRUcsWUFBVTtTQUFBLGVBQUc7QUFDZixhQUFPLEFBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQWtCLFVBQVUsQ0FBQztLQUN0RTs7OztBQUVHLGlCQUFlO1NBQUEsZUFBRztBQUNwQixhQUFPLGlCQUFpQixFQUFFLENBQUMsZUFBZSxDQUFDO0tBQzVDOzs7O0FBRUcsT0FBSztTQUFBLGVBQWM7QUFDckIsYUFBTyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNwQzs7OztBQUVHLEtBQUc7U0FBQSxlQUFZO0FBQ2pCLGFBQU8sZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDbEM7Ozs7QUFFRyxLQUFHO1NBQUEsZUFBWTtBQUNqQixhQUFPLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ2xDOzs7O0FBRUcsUUFBTTtTQUFBLGVBQWU7QUFDdkIsYUFBTyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUNyQzs7OztBQUVHLFdBQVM7U0FBQSxlQUFtQjtBQUM5QixhQUFPLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQ3pDOzs7O0FBRUcsYUFBVztTQUFBLGVBQWE7QUFDMUIsYUFBTyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNuQzs7OztBQUVHLFNBQU87U0FBQSxlQUFnQjtBQUN6QixhQUFPLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ3RDOzs7O0FBRUcsT0FBSztTQUFBLGVBQWM7QUFDckIsYUFBTyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNwQzs7OztBQUVHLGFBQVc7U0FBQSxlQUFHO0FBQ2hCLGFBQU8sc0JBQXNCLEVBQUUsQ0FBQyxXQUFXLENBQUM7S0FDN0M7Ozs7QUFFRyxjQUFZO1NBQUEsZUFBRztBQUNqQixhQUFPLHNCQUFzQixFQUFFLENBQUMsWUFBWSxDQUFDO0tBQzlDOzs7O0FBRUcsUUFBTTtTQUFBLGVBQWU7QUFDdkIsYUFBTyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUNyQzs7OztBQUVHLFVBQVE7U0FBQSxlQUFHO0FBQ2IsYUFBTyxBQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFnQixRQUFRLENBQUM7S0FDaEU7Ozs7QUFFRyxNQUFJO1NBQUEsZUFBRztBQUNULGFBQU8sQUFBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBWSxJQUFJLENBQUM7S0FDcEQ7Ozs7QUFFRyxLQUFHO1NBQUEsZUFBWTtBQUNqQixhQUFPLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ2xDOzs7O0FBRUcsVUFBUTtTQUFBLGVBQWlCO0FBQzNCLGFBQU8sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDeEM7Ozs7QUFFRyxLQUFHO1NBQUEsZUFBb0I7QUFDekIsYUFBTyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUMxQzs7OztBQUVHLFVBQVE7U0FBQSxlQUFHO0FBQ2IsYUFBTyxlQUFlLEVBQUUsQ0FBQztLQUMxQjs7OztBQUVHLFFBQU07U0FBQSxlQUFlO0FBQ3ZCLGFBQU8sZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDckM7Ozs7QUFFRyxPQUFLO1NBQUEsZUFBYztBQUNyQixhQUFPLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ3BDOzs7O0FBRUcsT0FBSztTQUFBLGVBQWM7QUFDckIsYUFBTyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNwQzs7OztBQUVHLFNBQU87U0FBQSxlQUFnQjtBQUN6QixhQUFPLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ3RDOzs7O0FBRUcsV0FBUztTQUFBLGVBQUc7QUFDZCxhQUFPLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQ3hDOzs7O0FBRUcsZ0JBQWM7U0FBQSxlQUFHO0FBQ25CLGFBQU8sQUFBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFzQixjQUFjLENBQUM7S0FDbEY7Ozs7QUFFRyxxQkFBbUI7U0FBQSxlQUFHO0FBQ3hCLGFBQU8sY0FBYyxFQUFFLENBQUMsbUJBQW1CLENBQUM7S0FDN0M7Ozs7QUFFRyxZQUFVO1NBQUEsZUFBbUI7QUFDL0IsYUFBTyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUN6Qzs7OztBQUVHLFlBQVU7U0FBQSxlQUFtQjtBQUMvQixhQUFPLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQ3pDOzs7O0FBRUcsYUFBVztTQUFBLGVBQW9CO0FBQ2pDLGFBQU8sZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDMUM7Ozs7QUFFRyxlQUFhO1NBQUEsZUFBRztBQUNsQixhQUFPLEFBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsQ0FBcUIsYUFBYSxDQUFDO0tBQy9FOzs7O0FBRUcscUJBQW1CO1NBQUEsZUFBRztBQUN4QixhQUFPLEFBQ0wsZ0JBQWdCLENBQUMsdUJBQXVCLENBQUMsQ0FDekMsbUJBQW1CLENBQUM7S0FDdkI7Ozs7QUFFRyxpQkFBZTtTQUFBLGVBQXdCO0FBQ3pDLGFBQU8sZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztLQUM5Qzs7OztFQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmV4cG9ydCB0eXBlIHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0ID0ge1xuICBjb21tYW5kPzogc3RyaW5nO1xuICBlcnJvck1lc3NhZ2U/OiBzdHJpbmc7XG4gIGV4aXRDb2RlOiBudW1iZXI7XG4gIHN0ZGVycjogc3RyaW5nO1xuICBzdGRvdXQ6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFByb2Nlc3NNZXNzYWdlID0gU3Rkb3V0TWVzc2FnZSB8IFN0ZGVyck1lc3NhZ2UgfCBFeGl0TWVzc2FnZSB8IEVycm9yTWVzc2FnZTtcbmV4cG9ydCB0eXBlIFN0ZG91dE1lc3NhZ2UgPSB7XG4gIGtpbmQ6ICdzdGRvdXQnO1xuICBkYXRhOiBzdHJpbmc7XG59O1xuZXhwb3J0IHR5cGUgU3RkZXJyTWVzc2FnZSA9IHtcbiAga2luZDogJ3N0ZGVycic7XG4gIGRhdGE6IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBFeGl0TWVzc2FnZSA9IHtcbiAga2luZDogJ2V4aXQnO1xuICBleGl0Q29kZTogbnVtYmVyO1xufTtcbmV4cG9ydCB0eXBlIEVycm9yTWVzc2FnZSA9IHtcbiAga2luZDogJ2Vycm9yJztcbiAgZXJyb3I6IE9iamVjdDtcbn07XG5cbmltcG9ydCB0eXBlb2YgKiBhcyBQcm9jZXNzVHlwZSBmcm9tICcuL3Byb2Nlc3MnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIFN0cmVhbVR5cGUgZnJvbSAnLi9zdHJlYW0nO1xuaW1wb3J0IHR5cGVvZiAqIGFzIEZpbGVzeXN0ZW1UeXBlIGZyb20gJy4vZmlsZXN5c3RlbSc7XG5pbXBvcnQgdHlwZW9mICogYXMgVG9Kc1N0cmluZ1R5cGUgZnJvbSAnLi90b0pzU3RyaW5nJztcbmltcG9ydCB0eXBlb2YgKiBhcyBTZXRUeXBlIGZyb20gJy4vc2V0JztcbmltcG9ydCB0eXBlb2YgKiBhcyBNYXBUeXBlIGZyb20gJy4vbWFwJztcbmltcG9ydCB0eXBlb2YgKiBhcyBBcnJheVR5cGUgZnJvbSAnLi9hcnJheSc7XG5pbXBvcnQgdHlwZW9mICogYXMgT2JqZWN0VHlwZSBmcm9tICcuL29iamVjdCc7XG5pbXBvcnQgdHlwZW9mICogYXMgSHR0cFR5cGUgZnJvbSAnLi9odHRwJztcbmltcG9ydCB0eXBlb2YgKiBhcyBTdHJpbmdzVHlwZSBmcm9tICcuL3N0cmluZ3MnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIFBhdGhzVHlwZSBmcm9tICcuL3BhdGhzJztcbmltcG9ydCB0eXBlb2YgKiBhcyBQcm9taXNlRXhlY3V0b3JzVHlwZSBmcm9tICcuL1Byb21pc2VFeGVjdXRvcnMnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIEV4dGVuZFR5cGUgZnJvbSAnLi9leHRlbmQnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIERlYm91bmNlVHlwZSBmcm9tICcuL2RlYm91bmNlJztcbmltcG9ydCB0eXBlb2YgKiBhcyBPbmNlVHlwZSBmcm9tICcuL29uY2UnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIFZjc1R5cGUgZnJvbSAnLi92Y3MnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIERuc1V0aWxzVHlwZSBmcm9tICcuL2Ruc191dGlscyc7XG5pbXBvcnQgdHlwZW9mICogYXMgUHJvbWlzZXNUeXBlIGZyb20gJy4vcHJvbWlzZXMnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIFJlZ0V4cFR5cGUgZnJvbSAnLi9yZWdleHAnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIEVycm9yVHlwZSBmcm9tICcuL2Vycm9yJztcbmltcG9ydCB0eXBlb2YgKiBhcyBFdmVudFR5cGUgZnJvbSAnLi9ldmVudCc7XG5pbXBvcnQgdHlwZW9mICogYXMgU2Vzc2lvblR5cGUgZnJvbSAnLi9zZXNzaW9uJztcbmltcG9ydCB0eXBlb2YgKiBhcyBDaXJjdWxhckJ1ZmZlclR5cGUgZnJvbSAnLi9DaXJjdWxhckJ1ZmZlcic7XG5pbXBvcnQgdHlwZW9mICogYXMgQ2xpZW50SW5mb1R5cGUgZnJvbSAnLi9jbGllbnRJbmZvJztcbmltcG9ydCB0eXBlb2YgKiBhcyBTeXN0ZW1JbmZvVHlwZSBmcm9tICcuL3N5c3RlbUluZm8nO1xuaW1wb3J0IHR5cGVvZiAqIGFzIFJ1bnRpbWVJbmZvVHlwZSBmcm9tICcuL3J1bnRpbWVJbmZvJztcbmltcG9ydCB0eXBlb2YgKiBhcyBTY3JpYmVQcm9jZXNzVHlwZSBmcm9tICcuL1NjcmliZVByb2Nlc3MnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIEJhdGNoUHJvY2Vzc2VkUXVldWVUeXBlIGZyb20gJy4vQmF0Y2hQcm9jZXNzZWRRdWV1ZSc7XG5pbXBvcnQgdHlwZW9mICogYXMgRXh0ZW5kYWJsZUVycm9yVHlwZSBmcm9tICcuL0V4dGVuZGFibGVFcnJvcic7XG5pbXBvcnQgdHlwZSB7RW52aXJvbm1lbnQgYXMgRW52aXJvbm1lbnRUeXBlfSBmcm9tICcuL2Vudmlyb25tZW50JztcblxuLy8gSXQncyBpbXBhY3RmdWwgdG8gbWVtb2l6ZSBvdXIgcmVxdWlyZXMgaGVyZSBzaW5jZSB0aGVzZSBjb21tb25zIGFyZSBzbyBvZnRlbiB1c2VkLlxuY29uc3QgcmVxdWlyZUNhY2hlOiB7W2lkOiBzdHJpbmddOiBhbnl9ID0ge307XG5mdW5jdGlvbiByZXF1aXJlRnJvbUNhY2hlKGlkOiBzdHJpbmcpOiBhbnkge1xuICBpZiAoIXJlcXVpcmVDYWNoZS5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIHJlcXVpcmVDYWNoZVtpZF0gPSByZXF1aXJlKGlkKTtcbiAgfVxuICByZXR1cm4gcmVxdWlyZUNhY2hlW2lkXTtcbn1cblxuZnVuY3Rpb24gcmVxdWlyZVByb21pc2VzKCk6IFByb21pc2VzVHlwZSB7XG4gIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Byb21pc2VzJyk7XG59XG5cbmZ1bmN0aW9uIHJlcXVpcmVQcm9jZXNzKCk6IFByb2Nlc3NUeXBlIHtcbiAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvY2VzcycpO1xufVxuXG5mdW5jdGlvbiByZXF1aXJlU3RyZWFtKCk6IFN0cmVhbVR5cGUge1xuICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9zdHJlYW0nKTtcbn1cblxuZnVuY3Rpb24gcmVxdWlyZUZpbGVTeXN0ZW0oKTogRmlsZXN5c3RlbVR5cGUge1xuICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9maWxlc3lzdGVtJyk7XG59XG5cbmZ1bmN0aW9uIHJlcXVyZVByb21pc2VFeGVjdXRvcnMoKTogUHJvbWlzZUV4ZWN1dG9yc1R5cGUge1xuICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9Qcm9taXNlRXhlY3V0b3JzJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGdldCBhc3luY0ZpbmQoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9taXNlcygpLmFzeW5jRmluZDtcbiAgfSxcblxuICBnZXQgYXN5bmNFeGVjdXRlKCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvY2VzcygpLmFzeW5jRXhlY3V0ZTtcbiAgfSxcblxuICBnZXQgY2hlY2tPdXRwdXQoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9jZXNzKCkuY2hlY2tPdXRwdXQ7XG4gIH0sXG5cbiAgZ2V0IGNyZWF0ZUFyZ3NGb3JTY3JpcHRDb21tYW5kKCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvY2VzcygpLmNyZWF0ZUFyZ3NGb3JTY3JpcHRDb21tYW5kO1xuICB9LFxuXG4gIGdldCBjcmVhdGVFeGVjRW52aXJvbm1lbnQoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9jZXNzKCkuY3JlYXRlRXhlY0Vudmlyb25tZW50O1xuICB9LFxuXG4gIGdldCBkZW5vZGVpZnkoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9taXNlcygpLmRlbm9kZWlmeTtcbiAgfSxcblxuICBnZXQgZm9ya1dpdGhFeGVjRW52aXJvbm1lbnQoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9jZXNzKCkuZm9ya1dpdGhFeGVjRW52aXJvbm1lbnQ7XG4gIH0sXG5cbiAgZ2V0IHNhZmVTcGF3bigpIHtcbiAgICByZXR1cm4gcmVxdWlyZVByb2Nlc3MoKS5zYWZlU3Bhd247XG4gIH0sXG5cbiAgZ2V0IHNjcmlwdFNhZmVTcGF3bigpIHtcbiAgICByZXR1cm4gcmVxdWlyZVByb2Nlc3MoKS5zY3JpcHRTYWZlU3Bhd247XG4gIH0sXG5cbiAgZ2V0IHNjcmlwdFNhZmVTcGF3bkFuZE9ic2VydmVPdXRwdXQoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9jZXNzKCkuc2NyaXB0U2FmZVNwYXduQW5kT2JzZXJ2ZU91dHB1dDtcbiAgfSxcblxuICBnZXQgc3BsaXRTdHJlYW0oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVTdHJlYW0oKS5zcGxpdFN0cmVhbTtcbiAgfSxcblxuICBnZXQgb2JzZXJ2ZVN0cmVhbSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZVN0cmVhbSgpLm9ic2VydmVTdHJlYW07XG4gIH0sXG5cbiAgZ2V0IG9ic2VydmVQcm9jZXNzRXhpdCgpIHtcbiAgICByZXR1cm4gcmVxdWlyZVByb2Nlc3MoKS5vYnNlcnZlUHJvY2Vzc0V4aXQ7XG4gIH0sXG5cbiAgZ2V0IG9ic2VydmVQcm9jZXNzKCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvY2VzcygpLm9ic2VydmVQcm9jZXNzO1xuICB9LFxuXG4gIGdldCByZWFkRmlsZSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZpbGVTeXN0ZW0oKS5yZWFkRmlsZTtcbiAgfSxcblxuICBnZXQgdG9Kc1N0cmluZygpIHtcbiAgICByZXR1cm4gKHJlcXVpcmVGcm9tQ2FjaGUoJy4vdG9Kc1N0cmluZycpOiBUb0pzU3RyaW5nVHlwZSkudG9Kc1N0cmluZztcbiAgfSxcblxuICBnZXQgZmluZE5lYXJlc3RGaWxlKCkge1xuICAgIHJldHVybiByZXF1aXJlRmlsZVN5c3RlbSgpLmZpbmROZWFyZXN0RmlsZTtcbiAgfSxcblxuICBnZXQgYXJyYXkoKTogQXJyYXlUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9hcnJheScpO1xuICB9LFxuXG4gIGdldCBzZXQoKTogU2V0VHlwZSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vc2V0Jyk7XG4gIH0sXG5cbiAgZ2V0IG1hcCgpOiBNYXBUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9tYXAnKTtcbiAgfSxcblxuICBnZXQgb2JqZWN0KCk6IE9iamVjdFR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL29iamVjdCcpO1xuICB9LFxuXG4gIGdldCBmc1Byb21pc2UoKTogRmlsZXN5c3RlbVR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2ZpbGVzeXN0ZW0nKTtcbiAgfSxcblxuICBnZXQgaHR0cFByb21pc2UoKTogSHR0cFR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2h0dHAnKTtcbiAgfSxcblxuICBnZXQgc3RyaW5ncygpOiBTdHJpbmdzVHlwZSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vc3RyaW5ncycpO1xuICB9LFxuXG4gIGdldCBwYXRocygpOiBQYXRoc1R5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3BhdGhzJyk7XG4gIH0sXG5cbiAgZ2V0IFByb21pc2VQb29sKCkge1xuICAgIHJldHVybiByZXF1cmVQcm9taXNlRXhlY3V0b3JzKCkuUHJvbWlzZVBvb2w7XG4gIH0sXG5cbiAgZ2V0IFByb21pc2VRdWV1ZSgpIHtcbiAgICByZXR1cm4gcmVxdXJlUHJvbWlzZUV4ZWN1dG9ycygpLlByb21pc2VRdWV1ZTtcbiAgfSxcblxuICBnZXQgZXh0ZW5kKCk6IEV4dGVuZFR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2V4dGVuZCcpO1xuICB9LFxuXG4gIGdldCBkZWJvdW5jZSgpIHtcbiAgICByZXR1cm4gKHJlcXVpcmVGcm9tQ2FjaGUoJy4vZGVib3VuY2UnKTogRGVib3VuY2VUeXBlKS5kZWJvdW5jZTtcbiAgfSxcblxuICBnZXQgb25jZSgpIHtcbiAgICByZXR1cm4gKHJlcXVpcmVGcm9tQ2FjaGUoJy4vb25jZScpOiBPbmNlVHlwZSkub25jZTtcbiAgfSxcblxuICBnZXQgdmNzKCk6IFZjc1R5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3ZjcycpO1xuICB9LFxuXG4gIGdldCBkbnNVdGlscygpOiBEbnNVdGlsc1R5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2Ruc191dGlscycpO1xuICB9LFxuXG4gIGdldCBlbnYoKTogRW52aXJvbm1lbnRUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9lbnZpcm9ubWVudCcpO1xuICB9LFxuXG4gIGdldCBwcm9taXNlcygpIHtcbiAgICByZXR1cm4gcmVxdWlyZVByb21pc2VzKCk7XG4gIH0sXG5cbiAgZ2V0IHJlZ2V4cCgpOiBSZWdFeHBUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9yZWdleHAnKTtcbiAgfSxcblxuICBnZXQgZXJyb3IoKTogRXJyb3JUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9lcnJvcicpO1xuICB9LFxuXG4gIGdldCBldmVudCgpOiBFdmVudFR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2V2ZW50Jyk7XG4gIH0sXG5cbiAgZ2V0IHNlc3Npb24oKTogU2Vzc2lvblR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Nlc3Npb24nKTtcbiAgfSxcblxuICBnZXQgc2luZ2xldG9uKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3NpbmdsZXRvbicpO1xuICB9LFxuXG4gIGdldCBDaXJjdWxhckJ1ZmZlcigpIHtcbiAgICByZXR1cm4gKHJlcXVpcmVGcm9tQ2FjaGUoJy4vQ2lyY3VsYXJCdWZmZXInKTogQ2lyY3VsYXJCdWZmZXJUeXBlKS5DaXJjdWxhckJ1ZmZlcjtcbiAgfSxcblxuICBnZXQgQ09NTU9OX0JJTkFSWV9QQVRIUygpIHtcbiAgICByZXR1cm4gcmVxdWlyZVByb2Nlc3MoKS5DT01NT05fQklOQVJZX1BBVEhTO1xuICB9LFxuXG4gIGdldCBjbGllbnRJbmZvKCk6IENsaWVudEluZm9UeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9jbGllbnRJbmZvJyk7XG4gIH0sXG5cbiAgZ2V0IHN5c3RlbUluZm8oKTogU3lzdGVtSW5mb1R5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3N5c3RlbUluZm8nKTtcbiAgfSxcblxuICBnZXQgcnVudGltZUluZm8oKTogUnVudGltZUluZm9UeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9ydW50aW1lSW5mbycpO1xuICB9LFxuXG4gIGdldCBTY3JpYmVQcm9jZXNzKCkge1xuICAgIHJldHVybiAocmVxdWlyZUZyb21DYWNoZSgnLi9TY3JpYmVQcm9jZXNzJyk6IFNjcmliZVByb2Nlc3NUeXBlKS5TY3JpYmVQcm9jZXNzO1xuICB9LFxuXG4gIGdldCBCYXRjaFByb2Nlc3NlZFF1ZXVlKCkge1xuICAgIHJldHVybiAoXG4gICAgICByZXF1aXJlRnJvbUNhY2hlKCcuL0JhdGNoUHJvY2Vzc2VkUXVldWUnKTogQmF0Y2hQcm9jZXNzZWRRdWV1ZVR5cGVcbiAgICApLkJhdGNoUHJvY2Vzc2VkUXVldWU7XG4gIH0sXG5cbiAgZ2V0IEV4dGVuZGFibGVFcnJvcigpOiBFeHRlbmRhYmxlRXJyb3JUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9FeHRlbmRhYmxlRXJyb3InKTtcbiAgfSxcbn07XG4iXX0=