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

  observeStream: function observeStream(process) {
    return requireFromCache('./process').observeStream(process);
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
//# sourceMappingURL=data:application/json;base64,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QUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ3BDOzs7O0FBRUcsU0FBTztTQUFBLGVBQUc7QUFDWixhQUFPLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ3RDOzs7O0FBRUcsV0FBUztTQUFBLGVBQUc7QUFDZCxhQUFPLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQ3hDOzs7O0FBRUcsZ0JBQWM7U0FBQSxlQUFHO0FBQ25CLGFBQU8sZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztLQUM3Qzs7OztBQUVHLHFCQUFtQjtTQUFBLGVBQUc7QUFDeEIsYUFBTyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQztLQUMxRDs7OztBQUVHLFlBQVU7U0FBQSxlQUFHO0FBQ2YsYUFBTyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUN6Qzs7OztBQUVHLFlBQVU7U0FBQSxlQUFHO0FBQ2YsYUFBTyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUN6Qzs7OztBQUVHLGFBQVc7U0FBQSxlQUFHO0FBQ2hCLGFBQU8sZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDMUM7Ozs7QUFFRyxlQUFhO1NBQUEsZUFBRztBQUNsQixhQUFPLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQUMsYUFBYSxDQUFDO0tBQzFEOzs7O0FBRUcscUJBQW1CO1NBQUEsZUFBRztBQUN4QixhQUFPLGdCQUFnQixDQUFDLHVCQUF1QixDQUFDLENBQUMsbUJBQW1CLENBQUM7S0FDdEU7Ozs7QUFFRyxpQkFBZTtTQUFBLGVBQUc7QUFDcEIsYUFBTyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0tBQzlDOzs7O0VBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge09ic2VydmFibGV9IGZyb20gJ3J4JztcblxuZXhwb3J0IHR5cGUgcHJvY2VzcyRhc3luY0V4ZWN1dGVSZXQgPSB7XG4gIGNvbW1hbmQ/OiBzdHJpbmc7XG4gIGVycm9yTWVzc2FnZT86IHN0cmluZztcbiAgZXhpdENvZGU6IG51bWJlcjtcbiAgc3RkZXJyOiBzdHJpbmc7XG4gIHN0ZG91dDogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgUHJvY2Vzc01lc3NhZ2UgPSBTdGRvdXRNZXNzYWdlIHwgU3RkZXJyTWVzc2FnZSB8IEV4aXRNZXNzYWdlIHwgRXJyb3JNZXNzYWdlO1xuZXhwb3J0IHR5cGUgU3Rkb3V0TWVzc2FnZSA9IHtcbiAga2luZDogJ3N0ZG91dCc7XG4gIGRhdGE6IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBTdGRlcnJNZXNzYWdlID0ge1xuICBraW5kOiAnc3RkZXJyJztcbiAgZGF0YTogc3RyaW5nO1xufTtcbmV4cG9ydCB0eXBlIEV4aXRNZXNzYWdlID0ge1xuICBraW5kOiAnZXhpdCc7XG4gIGV4aXRDb2RlOiBudW1iZXI7XG59O1xuZXhwb3J0IHR5cGUgRXJyb3JNZXNzYWdlID0ge1xuICBraW5kOiAnZXJyb3InO1xuICBlcnJvcjogT2JqZWN0O1xufTtcblxuLy8gSXQncyBpbXBhY3RmdWwgdG8gbWVtb2l6ZSBvdXIgcmVxdWlyZXMgaGVyZSBzaW5jZSB0aGVzZSBjb21tb25zIGFyZSBzbyBvZnRlbiB1c2VkLlxuY29uc3QgcmVxdWlyZUNhY2hlOiB7W2lkOiBzdHJpbmddOiBhbnl9ID0ge307XG5mdW5jdGlvbiByZXF1aXJlRnJvbUNhY2hlKGlkOiBzdHJpbmcpOiBhbnkge1xuICBpZiAoIXJlcXVpcmVDYWNoZS5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIHJlcXVpcmVDYWNoZVtpZF0gPSByZXF1aXJlKGlkKTtcbiAgfVxuICByZXR1cm4gcmVxdWlyZUNhY2hlW2lkXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgYXN5bmNGaW5kPFQ+KGl0ZW1zOiBBcnJheTxUPiwgdGVzdDogYW55LCB0aGlzQXJnOiBhbnkpOiBQcm9taXNlPD9UPiB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvbWlzZXMnKS5hc3luY0ZpbmQoaXRlbXMsIHRlc3QsIHRoaXNBcmcpO1xuICB9LFxuXG4gIGFzeW5jRXhlY3V0ZShjb21tYW5kOiBzdHJpbmcsIGFyZ3M6IEFycmF5PHN0cmluZz4sIG9wdGlvbnM6IGFueSk6XG4gICAgICBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvY2VzcycpLmFzeW5jRXhlY3V0ZShjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcbiAgfSxcblxuICBjaGVja091dHB1dChjb21tYW5kOiBzdHJpbmcsIGFyZ3M6IEFycmF5PHN0cmluZz4sIG9wdGlvbnM6ID9PYmplY3QpOlxuICAgICAgUHJvbWlzZTxwcm9jZXNzJGFzeW5jRXhlY3V0ZVJldD4ge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Byb2Nlc3MnKS5jaGVja091dHB1dChjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcbiAgfSxcblxuICBjcmVhdGVBcmdzRm9yU2NyaXB0Q29tbWFuZChjb21tYW5kOiBzdHJpbmcsIGFyZ3M/OiBBcnJheTxzdHJpbmc+ID0gW10pOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9wcm9jZXNzJykuY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQoY29tbWFuZCwgYXJncyk7XG4gIH0sXG5cbiAgY3JlYXRlRXhlY0Vudmlyb25tZW50KG9yaWdpbmFsRW52OiBPYmplY3QsIGNvbW1vbkJpbmFyeVBhdGhzOiBBcnJheTxzdHJpbmc+KTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9wcm9jZXNzJykuY3JlYXRlRXhlY0Vudmlyb25tZW50KG9yaWdpbmFsRW52LCBjb21tb25CaW5hcnlQYXRocyk7XG4gIH0sXG5cbiAgZGVub2RlaWZ5KGY6ICguLi5hcmdzOiBBcnJheTxhbnk+KSA9PiBhbnkpOiAoLi4uYXJnczogQXJyYXk8YW55PikgPT4gUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9wcm9taXNlcycpLmRlbm9kZWlmeShmKTtcbiAgfSxcblxuICBzYWZlU3Bhd24oY29tbWFuZDogc3RyaW5nLCBhcmdzPzogQXJyYXk8c3RyaW5nPiwgb3B0aW9ucz86IE9iamVjdCA9IHt9KTpcbiAgICAgIFByb21pc2U8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+IHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9wcm9jZXNzJykuc2FmZVNwYXduKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuICB9LFxuXG4gIHNjcmlwdFNhZmVTcGF3bihcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSxcbiAgICBvcHRpb25zPzogT2JqZWN0ID0ge30sXG4gICk6IFByb21pc2U8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+IHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9wcm9jZXNzJykuc2NyaXB0U2FmZVNwYXduKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuICB9LFxuXG4gIHNjcmlwdFNhZmVTcGF3bkFuZE9ic2VydmVPdXRwdXQoXG4gICAgY29tbWFuZDogc3RyaW5nLFxuICAgIGFyZ3M/OiBBcnJheTxzdHJpbmc+ID0gW10sXG4gICAgb3B0aW9ucz86IE9iamVjdCA9IHt9LFxuICApOiBPYnNlcnZhYmxlPHtzdGRvdXQ/OiBzdHJpbmc7IHN0ZGVycj86IHN0cmluZzt9PiB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvY2VzcycpLnNjcmlwdFNhZmVTcGF3bkFuZE9ic2VydmVPdXRwdXQoY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG4gIH0sXG5cbiAgb2JzZXJ2ZVN0cmVhbShwcm9jZXNzOiBzdHJlYW0kUmVhZGFibGUpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Byb2Nlc3MnKS5vYnNlcnZlU3RyZWFtKHByb2Nlc3MpO1xuICB9LFxuXG4gIG9ic2VydmVQcm9jZXNzRXhpdChjcmVhdGVQcm9jZXNzOiAoKSA9PiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcyk6IE9ic2VydmFibGU8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvY2VzcycpLm9ic2VydmVQcm9jZXNzRXhpdChjcmVhdGVQcm9jZXNzKTtcbiAgfSxcblxuICBvYnNlcnZlUHJvY2VzcyhjcmVhdGVQcm9jZXNzOiAoKSA9PiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcyk6IE9ic2VydmFibGU8UHJvY2Vzc01lc3NhZ2U+IHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9wcm9jZXNzJykub2JzZXJ2ZVByb2Nlc3MoY3JlYXRlUHJvY2Vzcyk7XG4gIH0sXG5cbiAgcmVhZEZpbGUoZmlsZVBhdGg6IHN0cmluZywgb3B0aW9ucz86IGFueSk6IFByb21pc2U8c3RyaW5nIHwgQnVmZmVyPiB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vZmlsZXN5c3RlbScpLnJlYWRGaWxlKGZpbGVQYXRoLCBvcHRpb25zKTtcbiAgfSxcblxuICB0b0pzU3RyaW5nKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi90b0pzU3RyaW5nJykoc3RyKTtcbiAgfSxcblxuICBmaW5kTmVhcmVzdEZpbGUoZmlsZU5hbWU6IHN0cmluZywgcGF0aFRvRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9maWxlc3lzdGVtJykuZmluZE5lYXJlc3RGaWxlKGZpbGVOYW1lLCBwYXRoVG9EaXJlY3RvcnkpO1xuICB9LFxuXG4gIGdldCBhcnJheSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9hcnJheScpO1xuICB9LFxuXG4gIGdldCBzZXQoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vc2V0Jyk7XG4gIH0sXG5cbiAgZ2V0IG1hcCgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9tYXAnKTtcbiAgfSxcblxuICBnZXQgb2JqZWN0KCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL29iamVjdCcpO1xuICB9LFxuXG4gIGdldCBmc1Byb21pc2UoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vZmlsZXN5c3RlbScpO1xuICB9LFxuXG4gIGdldCBodHRwUHJvbWlzZSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9odHRwJyk7XG4gIH0sXG5cbiAgZ2V0IHN0cmluZ3MoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vc3RyaW5ncycpO1xuICB9LFxuXG4gIGdldCBwYXRocygpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9wYXRocycpO1xuICB9LFxuXG4gIGdldCBQcm9taXNlUG9vbCgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9Qcm9taXNlRXhlY3V0b3JzJykuUHJvbWlzZVBvb2w7XG4gIH0sXG5cbiAgZ2V0IFByb21pc2VRdWV1ZSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9Qcm9taXNlRXhlY3V0b3JzJykuUHJvbWlzZVF1ZXVlO1xuICB9LFxuXG4gIGdldCBleHRlbmQoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vZXh0ZW5kJyk7XG4gIH0sXG5cbiAgZ2V0IGRlYm91bmNlKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2RlYm91bmNlJyk7XG4gIH0sXG5cbiAgZ2V0IG9uY2UoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vb25jZScpO1xuICB9LFxuXG4gIGdldCB2Y3MoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vdmNzJyk7XG4gIH0sXG5cbiAgZ2V0IGRuc1V0aWxzKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2Ruc191dGlscycpO1xuICB9LFxuXG4gIGdldCBlbnYoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vZW52aXJvbm1lbnQnKTtcbiAgfSxcblxuICBnZXQgcHJvbWlzZXMoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvbWlzZXMnKTtcbiAgfSxcblxuICBnZXQgcmVnZXhwKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3JlZ2V4cCcpO1xuICB9LFxuXG4gIGdldCBlcnJvcigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9lcnJvcicpO1xuICB9LFxuXG4gIGdldCBldmVudCgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9ldmVudCcpO1xuICB9LFxuXG4gIGdldCBzZXNzaW9uKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Nlc3Npb24nKTtcbiAgfSxcblxuICBnZXQgc2luZ2xldG9uKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3NpbmdsZXRvbicpO1xuICB9LFxuXG4gIGdldCBDaXJjdWxhckJ1ZmZlcigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9DaXJjdWxhckJ1ZmZlcicpO1xuICB9LFxuXG4gIGdldCBDT01NT05fQklOQVJZX1BBVEhTKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Byb2Nlc3MnKS5DT01NT05fQklOQVJZX1BBVEhTO1xuICB9LFxuXG4gIGdldCBjbGllbnRJbmZvKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2NsaWVudEluZm8nKTtcbiAgfSxcblxuICBnZXQgc3lzdGVtSW5mbygpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9zeXN0ZW1JbmZvJyk7XG4gIH0sXG5cbiAgZ2V0IHJ1bnRpbWVJbmZvKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3J1bnRpbWVJbmZvJyk7XG4gIH0sXG5cbiAgZ2V0IFNjcmliZVByb2Nlc3MoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vU2NyaWJlUHJvY2VzcycpLlNjcmliZVByb2Nlc3M7XG4gIH0sXG5cbiAgZ2V0IEJhdGNoUHJvY2Vzc2VkUXVldWUoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vQmF0Y2hQcm9jZXNzZWRRdWV1ZScpLkJhdGNoUHJvY2Vzc2VkUXVldWU7XG4gIH0sXG5cbiAgZ2V0IEV4dGVuZGFibGVFcnJvcigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9FeHRlbmRhYmxlRXJyb3InKTtcbiAgfSxcbn07XG4iXX0=