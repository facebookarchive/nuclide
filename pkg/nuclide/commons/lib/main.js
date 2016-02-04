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

module.exports = Object.defineProperties({

  asyncFind: function asyncFind(items, test, thisArg) {
    return requireFromCache('./promises').asyncFind(items, test, thisArg);
  },

  asyncExecute: function asyncExecute(command, args, options) {
    return requireFromCache('./process').asyncExecute(command, args, options);
  },

  checkOutput: function checkOutput(command, args, options) {
    return requireFromCache('./process').checkOutput(command, args, options);
  },

  createArgsForScriptCommand: function createArgsForScriptCommand(command) {
    var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    return requireFromCache('./process').createArgsForScriptCommand(command, args);
  },

  createExecEnvironment: function createExecEnvironment(originalEnv, commonBinaryPaths) {
    return requireFromCache('./process').createExecEnvironment(originalEnv, commonBinaryPaths);
  },

  denodeify: function denodeify(f) {
    return requireFromCache('./promises').denodeify(f);
  },

  safeSpawn: function safeSpawn(command, args) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    return requireFromCache('./process').safeSpawn(command, args, options);
  },

  scriptSafeSpawn: function scriptSafeSpawn(command) {
    var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    return requireFromCache('./process').scriptSafeSpawn(command, args, options);
  },

  scriptSafeSpawnAndObserveOutput: function scriptSafeSpawnAndObserveOutput(command) {
    var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    return requireFromCache('./process').scriptSafeSpawnAndObserveOutput(command, args, options);
  },

  splitStream: function splitStream(input) {
    return requireFromCache('./stream').splitStream(input);
  },

  observeStream: function observeStream(stream) {
    return requireFromCache('./stream').observeStream(stream);
  },

  observeProcessExit: function observeProcessExit(createProcess) {
    return requireFromCache('./process').observeProcessExit(createProcess);
  },

  observeProcess: function observeProcess(createProcess) {
    return requireFromCache('./process').observeProcess(createProcess);
  },

  readFile: function readFile(filePath, options) {
    return requireFromCache('./filesystem').readFile(filePath, options);
  },

  toJsString: function toJsString(str) {
    return requireFromCache('./toJsString')(str);
  },

  findNearestFile: function findNearestFile(fileName, pathToDirectory) {
    return requireFromCache('./filesystem').findNearestFile(fileName, pathToDirectory);
  }

}, {
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
      return requireFromCache('./PromiseExecutors').PromisePool;
    },
    configurable: true,
    enumerable: true
  },
  PromiseQueue: {
    get: function get() {
      return requireFromCache('./PromiseExecutors').PromiseQueue;
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
      return requireFromCache('./debounce');
    },
    configurable: true,
    enumerable: true
  },
  once: {
    get: function get() {
      return requireFromCache('./once');
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
      return requireFromCache('./promises');
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
      return requireFromCache('./CircularBuffer');
    },
    configurable: true,
    enumerable: true
  },
  COMMON_BINARY_PATHS: {
    get: function get() {
      return requireFromCache('./process').COMMON_BINARY_PATHS;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQXdDQSxJQUFNLFlBQWlDLEdBQUcsRUFBRSxDQUFDO0FBQzdDLFNBQVMsZ0JBQWdCLENBQUMsRUFBVSxFQUFPO0FBQ3pDLE1BQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxFQUFFOztBQUVwQyxnQkFBWSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztHQUNoQztBQUNELFNBQU8sWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3pCOztBQUVELE1BQU0sQ0FBQyxPQUFPLDJCQUFHOztBQUVmLFdBQVMsRUFBRyxtQkFBQyxLQUFlLEVBQUUsSUFBUyxFQUFFLE9BQVksRUFBZTtBQUNsRSxXQUFPLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQ3ZFOztBQUVELGNBQVksRUFBQSxzQkFBQyxPQUFlLEVBQUUsSUFBbUIsRUFBRSxPQUFZLEVBQzFCO0FBQ25DLFdBQU8sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDM0U7O0FBRUQsYUFBVyxFQUFBLHFCQUFDLE9BQWUsRUFBRSxJQUFtQixFQUFFLE9BQWdCLEVBQzdCO0FBQ25DLFdBQU8sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDMUU7O0FBRUQsNEJBQTBCLEVBQUEsb0NBQUMsT0FBZSxFQUE0QztRQUExQyxJQUFvQix5REFBRyxFQUFFOztBQUNuRSxXQUFPLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLDBCQUEwQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztHQUNoRjs7QUFFRCx1QkFBcUIsRUFBQSwrQkFBQyxXQUFtQixFQUFFLGlCQUFnQyxFQUFtQjtBQUM1RixXQUFPLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0dBQzVGOztBQUVELFdBQVMsRUFBQSxtQkFBQyxDQUErQixFQUF5QztBQUNoRixXQUFPLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNwRDs7QUFFRCxXQUFTLEVBQUEsbUJBQUMsT0FBZSxFQUFFLElBQW9CLEVBQ1A7UUFEUyxPQUFnQix5REFBRyxFQUFFOztBQUVwRSxXQUFPLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQ3hFOztBQUVELGlCQUFlLEVBQUEseUJBQ2IsT0FBZSxFQUdzQjtRQUZyQyxJQUFvQix5REFBRyxFQUFFO1FBQ3pCLE9BQWdCLHlEQUFHLEVBQUU7O0FBRXJCLFdBQU8sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDOUU7O0FBRUQsaUNBQStCLEVBQUEseUNBQzdCLE9BQWUsRUFHa0M7UUFGakQsSUFBb0IseURBQUcsRUFBRTtRQUN6QixPQUFnQix5REFBRyxFQUFFOztBQUVyQixXQUFPLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLCtCQUErQixDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDOUY7O0FBRUQsYUFBVyxFQUFBLHFCQUFDLEtBQXlCLEVBQXNCO0FBQ3pELFdBQU8sZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ3hEOztBQUVELGVBQWEsRUFBQSx1QkFBQyxNQUF1QixFQUFzQjtBQUN6RCxXQUFPLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUMzRDs7QUFFRCxvQkFBa0IsRUFBQSw0QkFBQyxhQUErQyxFQUFzQjtBQUN0RixXQUFPLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0dBQ3hFOztBQUVELGdCQUFjLEVBQUEsd0JBQUMsYUFBK0MsRUFBOEI7QUFDMUYsV0FBTyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7R0FDcEU7O0FBRUQsVUFBUSxFQUFBLGtCQUFDLFFBQWdCLEVBQUUsT0FBYSxFQUE0QjtBQUNsRSxXQUFPLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDckU7O0FBRUQsWUFBVSxFQUFBLG9CQUFDLEdBQVcsRUFBVTtBQUM5QixXQUFPLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQzlDOztBQUVELGlCQUFlLEVBQUEseUJBQUMsUUFBZ0IsRUFBRSxlQUF1QixFQUFvQjtBQUMzRSxXQUFPLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsZUFBZSxDQUFDLENBQUM7R0FDcEY7O0NBeUhGO0FBdkhLLE9BQUs7U0FBQSxlQUFHO0FBQ1YsYUFBTyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNwQzs7OztBQUVHLEtBQUc7U0FBQSxlQUFHO0FBQ1IsYUFBTyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNsQzs7OztBQUVHLEtBQUc7U0FBQSxlQUFHO0FBQ1IsYUFBTyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNsQzs7OztBQUVHLFFBQU07U0FBQSxlQUFHO0FBQ1gsYUFBTyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUNyQzs7OztBQUVHLFdBQVM7U0FBQSxlQUFHO0FBQ2QsYUFBTyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUN6Qzs7OztBQUVHLGFBQVc7U0FBQSxlQUFHO0FBQ2hCLGFBQU8sZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDbkM7Ozs7QUFFRyxTQUFPO1NBQUEsZUFBRztBQUNaLGFBQU8sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDdEM7Ozs7QUFFRyxPQUFLO1NBQUEsZUFBRztBQUNWLGFBQU8sZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDcEM7Ozs7QUFFRyxhQUFXO1NBQUEsZUFBRztBQUNoQixhQUFPLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLENBQUMsV0FBVyxDQUFDO0tBQzNEOzs7O0FBRUcsY0FBWTtTQUFBLGVBQUc7QUFDakIsYUFBTyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLFlBQVksQ0FBQztLQUM1RDs7OztBQUVHLFFBQU07U0FBQSxlQUFHO0FBQ1gsYUFBTyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUNyQzs7OztBQUVHLFVBQVE7U0FBQSxlQUFHO0FBQ2IsYUFBTyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUN2Qzs7OztBQUVHLE1BQUk7U0FBQSxlQUFHO0FBQ1QsYUFBTyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNuQzs7OztBQUVHLEtBQUc7U0FBQSxlQUFHO0FBQ1IsYUFBTyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNsQzs7OztBQUVHLFVBQVE7U0FBQSxlQUFHO0FBQ2IsYUFBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUN4Qzs7OztBQUVHLEtBQUc7U0FBQSxlQUFHO0FBQ1IsYUFBTyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUMxQzs7OztBQUVHLFVBQVE7U0FBQSxlQUFHO0FBQ2IsYUFBTyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUN2Qzs7OztBQUVHLFFBQU07U0FBQSxlQUFHO0FBQ1gsYUFBTyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUNyQzs7OztBQUVHLE9BQUs7U0FBQSxlQUFHO0FBQ1YsYUFBTyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNwQzs7OztBQUVHLE9BQUs7U0FBQSxlQUFHO0FBQ1YsYUFBTyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNwQzs7OztBQUVHLFNBQU87U0FBQSxlQUFHO0FBQ1osYUFBTyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUN0Qzs7OztBQUVHLFdBQVM7U0FBQSxlQUFHO0FBQ2QsYUFBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUN4Qzs7OztBQUVHLGdCQUFjO1NBQUEsZUFBRztBQUNuQixhQUFPLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLENBQUM7S0FDN0M7Ozs7QUFFRyxxQkFBbUI7U0FBQSxlQUFHO0FBQ3hCLGFBQU8sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUMsbUJBQW1CLENBQUM7S0FDMUQ7Ozs7QUFFRyxZQUFVO1NBQUEsZUFBRztBQUNmLGFBQU8sZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7S0FDekM7Ozs7QUFFRyxZQUFVO1NBQUEsZUFBRztBQUNmLGFBQU8sZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7S0FDekM7Ozs7QUFFRyxhQUFXO1NBQUEsZUFBRztBQUNoQixhQUFPLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQzFDOzs7O0FBRUcsZUFBYTtTQUFBLGVBQUc7QUFDbEIsYUFBTyxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLGFBQWEsQ0FBQztLQUMxRDs7OztBQUVHLHFCQUFtQjtTQUFBLGVBQUc7QUFDeEIsYUFBTyxnQkFBZ0IsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLG1CQUFtQixDQUFDO0tBQ3RFOzs7O0FBRUcsaUJBQWU7U0FBQSxlQUFHO0FBQ3BCLGFBQU8sZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztLQUM5Qzs7OztFQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5cbmV4cG9ydCB0eXBlIHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0ID0ge1xuICBjb21tYW5kPzogc3RyaW5nO1xuICBlcnJvck1lc3NhZ2U/OiBzdHJpbmc7XG4gIGV4aXRDb2RlOiBudW1iZXI7XG4gIHN0ZGVycjogc3RyaW5nO1xuICBzdGRvdXQ6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFByb2Nlc3NNZXNzYWdlID0gU3Rkb3V0TWVzc2FnZSB8IFN0ZGVyck1lc3NhZ2UgfCBFeGl0TWVzc2FnZSB8IEVycm9yTWVzc2FnZTtcbmV4cG9ydCB0eXBlIFN0ZG91dE1lc3NhZ2UgPSB7XG4gIGtpbmQ6ICdzdGRvdXQnO1xuICBkYXRhOiBzdHJpbmc7XG59O1xuZXhwb3J0IHR5cGUgU3RkZXJyTWVzc2FnZSA9IHtcbiAga2luZDogJ3N0ZGVycic7XG4gIGRhdGE6IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBFeGl0TWVzc2FnZSA9IHtcbiAga2luZDogJ2V4aXQnO1xuICBleGl0Q29kZTogbnVtYmVyO1xufTtcbmV4cG9ydCB0eXBlIEVycm9yTWVzc2FnZSA9IHtcbiAga2luZDogJ2Vycm9yJztcbiAgZXJyb3I6IE9iamVjdDtcbn07XG5cbi8vIEl0J3MgaW1wYWN0ZnVsIHRvIG1lbW9pemUgb3VyIHJlcXVpcmVzIGhlcmUgc2luY2UgdGhlc2UgY29tbW9ucyBhcmUgc28gb2Z0ZW4gdXNlZC5cbmNvbnN0IHJlcXVpcmVDYWNoZToge1tpZDogc3RyaW5nXTogYW55fSA9IHt9O1xuZnVuY3Rpb24gcmVxdWlyZUZyb21DYWNoZShpZDogc3RyaW5nKTogYW55IHtcbiAgaWYgKCFyZXF1aXJlQ2FjaGUuaGFzT3duUHJvcGVydHkoaWQpKSB7XG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICByZXF1aXJlQ2FjaGVbaWRdID0gcmVxdWlyZShpZCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVpcmVDYWNoZVtpZF07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGFzeW5jRmluZDxUPihpdGVtczogQXJyYXk8VD4sIHRlc3Q6IGFueSwgdGhpc0FyZzogYW55KTogUHJvbWlzZTw/VD4ge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Byb21pc2VzJykuYXN5bmNGaW5kKGl0ZW1zLCB0ZXN0LCB0aGlzQXJnKTtcbiAgfSxcblxuICBhc3luY0V4ZWN1dGUoY29tbWFuZDogc3RyaW5nLCBhcmdzOiBBcnJheTxzdHJpbmc+LCBvcHRpb25zOiBhbnkpOlxuICAgICAgUHJvbWlzZTxwcm9jZXNzJGFzeW5jRXhlY3V0ZVJldD4ge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Byb2Nlc3MnKS5hc3luY0V4ZWN1dGUoY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG4gIH0sXG5cbiAgY2hlY2tPdXRwdXQoY29tbWFuZDogc3RyaW5nLCBhcmdzOiBBcnJheTxzdHJpbmc+LCBvcHRpb25zOiA/T2JqZWN0KTpcbiAgICAgIFByb21pc2U8cHJvY2VzcyRhc3luY0V4ZWN1dGVSZXQ+IHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9wcm9jZXNzJykuY2hlY2tPdXRwdXQoY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG4gIH0sXG5cbiAgY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQoY29tbWFuZDogc3RyaW5nLCBhcmdzPzogQXJyYXk8c3RyaW5nPiA9IFtdKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvY2VzcycpLmNyZWF0ZUFyZ3NGb3JTY3JpcHRDb21tYW5kKGNvbW1hbmQsIGFyZ3MpO1xuICB9LFxuXG4gIGNyZWF0ZUV4ZWNFbnZpcm9ubWVudChvcmlnaW5hbEVudjogT2JqZWN0LCBjb21tb25CaW5hcnlQYXRoczogQXJyYXk8c3RyaW5nPik6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvY2VzcycpLmNyZWF0ZUV4ZWNFbnZpcm9ubWVudChvcmlnaW5hbEVudiwgY29tbW9uQmluYXJ5UGF0aHMpO1xuICB9LFxuXG4gIGRlbm9kZWlmeShmOiAoLi4uYXJnczogQXJyYXk8YW55PikgPT4gYW55KTogKC4uLmFyZ3M6IEFycmF5PGFueT4pID0+IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvbWlzZXMnKS5kZW5vZGVpZnkoZik7XG4gIH0sXG5cbiAgc2FmZVNwYXduKGNvbW1hbmQ6IHN0cmluZywgYXJncz86IEFycmF5PHN0cmluZz4sIG9wdGlvbnM/OiBPYmplY3QgPSB7fSk6XG4gICAgICBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPiB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvY2VzcycpLnNhZmVTcGF3bihjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcbiAgfSxcblxuICBzY3JpcHRTYWZlU3Bhd24oXG4gICAgY29tbWFuZDogc3RyaW5nLFxuICAgIGFyZ3M/OiBBcnJheTxzdHJpbmc+ID0gW10sXG4gICAgb3B0aW9ucz86IE9iamVjdCA9IHt9LFxuICApOiBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPiB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvY2VzcycpLnNjcmlwdFNhZmVTcGF3bihjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcbiAgfSxcblxuICBzY3JpcHRTYWZlU3Bhd25BbmRPYnNlcnZlT3V0cHV0KFxuICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICBhcmdzPzogQXJyYXk8c3RyaW5nPiA9IFtdLFxuICAgIG9wdGlvbnM/OiBPYmplY3QgPSB7fSxcbiAgKTogT2JzZXJ2YWJsZTx7c3Rkb3V0Pzogc3RyaW5nOyBzdGRlcnI/OiBzdHJpbmc7fT4ge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Byb2Nlc3MnKS5zY3JpcHRTYWZlU3Bhd25BbmRPYnNlcnZlT3V0cHV0KGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuICB9LFxuXG4gIHNwbGl0U3RyZWFtKGlucHV0OiBPYnNlcnZhYmxlPHN0cmluZz4pOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3N0cmVhbScpLnNwbGl0U3RyZWFtKGlucHV0KTtcbiAgfSxcblxuICBvYnNlcnZlU3RyZWFtKHN0cmVhbTogc3RyZWFtJFJlYWRhYmxlKTogT2JzZXJ2YWJsZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9zdHJlYW0nKS5vYnNlcnZlU3RyZWFtKHN0cmVhbSk7XG4gIH0sXG5cbiAgb2JzZXJ2ZVByb2Nlc3NFeGl0KGNyZWF0ZVByb2Nlc3M6ICgpID0+IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzKTogT2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9wcm9jZXNzJykub2JzZXJ2ZVByb2Nlc3NFeGl0KGNyZWF0ZVByb2Nlc3MpO1xuICB9LFxuXG4gIG9ic2VydmVQcm9jZXNzKGNyZWF0ZVByb2Nlc3M6ICgpID0+IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzKTogT2JzZXJ2YWJsZTxQcm9jZXNzTWVzc2FnZT4ge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Byb2Nlc3MnKS5vYnNlcnZlUHJvY2VzcyhjcmVhdGVQcm9jZXNzKTtcbiAgfSxcblxuICByZWFkRmlsZShmaWxlUGF0aDogc3RyaW5nLCBvcHRpb25zPzogYW55KTogUHJvbWlzZTxzdHJpbmcgfCBCdWZmZXI+IHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9maWxlc3lzdGVtJykucmVhZEZpbGUoZmlsZVBhdGgsIG9wdGlvbnMpO1xuICB9LFxuXG4gIHRvSnNTdHJpbmcoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3RvSnNTdHJpbmcnKShzdHIpO1xuICB9LFxuXG4gIGZpbmROZWFyZXN0RmlsZShmaWxlTmFtZTogc3RyaW5nLCBwYXRoVG9EaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2ZpbGVzeXN0ZW0nKS5maW5kTmVhcmVzdEZpbGUoZmlsZU5hbWUsIHBhdGhUb0RpcmVjdG9yeSk7XG4gIH0sXG5cbiAgZ2V0IGFycmF5KCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2FycmF5Jyk7XG4gIH0sXG5cbiAgZ2V0IHNldCgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9zZXQnKTtcbiAgfSxcblxuICBnZXQgbWFwKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL21hcCcpO1xuICB9LFxuXG4gIGdldCBvYmplY3QoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vb2JqZWN0Jyk7XG4gIH0sXG5cbiAgZ2V0IGZzUHJvbWlzZSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9maWxlc3lzdGVtJyk7XG4gIH0sXG5cbiAgZ2V0IGh0dHBQcm9taXNlKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2h0dHAnKTtcbiAgfSxcblxuICBnZXQgc3RyaW5ncygpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9zdHJpbmdzJyk7XG4gIH0sXG5cbiAgZ2V0IHBhdGhzKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3BhdGhzJyk7XG4gIH0sXG5cbiAgZ2V0IFByb21pc2VQb29sKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL1Byb21pc2VFeGVjdXRvcnMnKS5Qcm9taXNlUG9vbDtcbiAgfSxcblxuICBnZXQgUHJvbWlzZVF1ZXVlKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL1Byb21pc2VFeGVjdXRvcnMnKS5Qcm9taXNlUXVldWU7XG4gIH0sXG5cbiAgZ2V0IGV4dGVuZCgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9leHRlbmQnKTtcbiAgfSxcblxuICBnZXQgZGVib3VuY2UoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vZGVib3VuY2UnKTtcbiAgfSxcblxuICBnZXQgb25jZSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9vbmNlJyk7XG4gIH0sXG5cbiAgZ2V0IHZjcygpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi92Y3MnKTtcbiAgfSxcblxuICBnZXQgZG5zVXRpbHMoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vZG5zX3V0aWxzJyk7XG4gIH0sXG5cbiAgZ2V0IGVudigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9lbnZpcm9ubWVudCcpO1xuICB9LFxuXG4gIGdldCBwcm9taXNlcygpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9wcm9taXNlcycpO1xuICB9LFxuXG4gIGdldCByZWdleHAoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcmVnZXhwJyk7XG4gIH0sXG5cbiAgZ2V0IGVycm9yKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2Vycm9yJyk7XG4gIH0sXG5cbiAgZ2V0IGV2ZW50KCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2V2ZW50Jyk7XG4gIH0sXG5cbiAgZ2V0IHNlc3Npb24oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vc2Vzc2lvbicpO1xuICB9LFxuXG4gIGdldCBzaW5nbGV0b24oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vc2luZ2xldG9uJyk7XG4gIH0sXG5cbiAgZ2V0IENpcmN1bGFyQnVmZmVyKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL0NpcmN1bGFyQnVmZmVyJyk7XG4gIH0sXG5cbiAgZ2V0IENPTU1PTl9CSU5BUllfUEFUSFMoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvY2VzcycpLkNPTU1PTl9CSU5BUllfUEFUSFM7XG4gIH0sXG5cbiAgZ2V0IGNsaWVudEluZm8oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vY2xpZW50SW5mbycpO1xuICB9LFxuXG4gIGdldCBzeXN0ZW1JbmZvKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3N5c3RlbUluZm8nKTtcbiAgfSxcblxuICBnZXQgcnVudGltZUluZm8oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcnVudGltZUluZm8nKTtcbiAgfSxcblxuICBnZXQgU2NyaWJlUHJvY2VzcygpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9TY3JpYmVQcm9jZXNzJykuU2NyaWJlUHJvY2VzcztcbiAgfSxcblxuICBnZXQgQmF0Y2hQcm9jZXNzZWRRdWV1ZSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9CYXRjaFByb2Nlc3NlZFF1ZXVlJykuQmF0Y2hQcm9jZXNzZWRRdWV1ZTtcbiAgfSxcblxuICBnZXQgRXh0ZW5kYWJsZUVycm9yKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL0V4dGVuZGFibGVFcnJvcicpO1xuICB9LFxufTtcbiJdfQ==