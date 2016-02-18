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

  forkWithExecEnvironment: function forkWithExecEnvironment(modulePath, args) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    return requireFromCache('./process').forkWithExecEnvironment(modulePath, args, options);
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
//# sourceMappingURL=data:application/json;base64,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dUJBQXVCLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQztLQUN0RTs7OztBQUVHLGlCQUFlO1NBQUEsZUFBRztBQUNwQixhQUFPLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLENBQUM7S0FDOUM7Ozs7RUFDRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7T2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuXG5leHBvcnQgdHlwZSBwcm9jZXNzJGFzeW5jRXhlY3V0ZVJldCA9IHtcbiAgY29tbWFuZD86IHN0cmluZyxcbiAgZXJyb3JNZXNzYWdlPzogc3RyaW5nLFxuICBleGl0Q29kZTogbnVtYmVyLFxuICBzdGRlcnI6IHN0cmluZyxcbiAgc3Rkb3V0OiBzdHJpbmcsXG59O1xuXG5leHBvcnQgdHlwZSBQcm9jZXNzTWVzc2FnZSA9IFN0ZG91dE1lc3NhZ2UgfCBTdGRlcnJNZXNzYWdlIHwgRXhpdE1lc3NhZ2UgfCBFcnJvck1lc3NhZ2U7XG5leHBvcnQgdHlwZSBTdGRvdXRNZXNzYWdlID0ge1xuICBraW5kOiAnc3Rkb3V0JyxcbiAgZGF0YTogc3RyaW5nLFxufTtcbmV4cG9ydCB0eXBlIFN0ZGVyck1lc3NhZ2UgPSB7XG4gIGtpbmQ6ICdzdGRlcnInLFxuICBkYXRhOiBzdHJpbmcsXG59O1xuZXhwb3J0IHR5cGUgRXhpdE1lc3NhZ2UgPSB7XG4gIGtpbmQ6ICdleGl0JyxcbiAgZXhpdENvZGU6IG51bWJlcixcbn07XG5leHBvcnQgdHlwZSBFcnJvck1lc3NhZ2UgPSB7XG4gIGtpbmQ6ICdlcnJvcicsXG4gIGVycm9yOiBPYmplY3QsXG59O1xuXG4vLyBJdCdzIGltcGFjdGZ1bCB0byBtZW1vaXplIG91ciByZXF1aXJlcyBoZXJlIHNpbmNlIHRoZXNlIGNvbW1vbnMgYXJlIHNvIG9mdGVuIHVzZWQuXG5jb25zdCByZXF1aXJlQ2FjaGU6IHtbaWQ6IHN0cmluZ106IGFueX0gPSB7fTtcbmZ1bmN0aW9uIHJlcXVpcmVGcm9tQ2FjaGUoaWQ6IHN0cmluZyk6IGFueSB7XG4gIGlmICghcmVxdWlyZUNhY2hlLmhhc093blByb3BlcnR5KGlkKSkge1xuICAgIC8vICRGbG93SWdub3JlXG4gICAgcmVxdWlyZUNhY2hlW2lkXSA9IHJlcXVpcmUoaWQpO1xuICB9XG4gIHJldHVybiByZXF1aXJlQ2FjaGVbaWRdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBhc3luY0ZpbmQ8VD4oaXRlbXM6IEFycmF5PFQ+LCB0ZXN0OiBhbnksIHRoaXNBcmc6IGFueSk6IFByb21pc2U8P1Q+IHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9wcm9taXNlcycpLmFzeW5jRmluZChpdGVtcywgdGVzdCwgdGhpc0FyZyk7XG4gIH0sXG5cbiAgYXN5bmNFeGVjdXRlKGNvbW1hbmQ6IHN0cmluZywgYXJnczogQXJyYXk8c3RyaW5nPiwgb3B0aW9uczogYW55KTpcbiAgICAgIFByb21pc2U8cHJvY2VzcyRhc3luY0V4ZWN1dGVSZXQ+IHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9wcm9jZXNzJykuYXN5bmNFeGVjdXRlKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuICB9LFxuXG4gIGNoZWNrT3V0cHV0KGNvbW1hbmQ6IHN0cmluZywgYXJnczogQXJyYXk8c3RyaW5nPiwgb3B0aW9uczogP09iamVjdCk6XG4gICAgICBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvY2VzcycpLmNoZWNrT3V0cHV0KGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuICB9LFxuXG4gIGNyZWF0ZUFyZ3NGb3JTY3JpcHRDb21tYW5kKGNvbW1hbmQ6IHN0cmluZywgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSk6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Byb2Nlc3MnKS5jcmVhdGVBcmdzRm9yU2NyaXB0Q29tbWFuZChjb21tYW5kLCBhcmdzKTtcbiAgfSxcblxuICBjcmVhdGVFeGVjRW52aXJvbm1lbnQob3JpZ2luYWxFbnY6IE9iamVjdCwgY29tbW9uQmluYXJ5UGF0aHM6IEFycmF5PHN0cmluZz4pOiBQcm9taXNlPE9iamVjdD4ge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Byb2Nlc3MnKS5jcmVhdGVFeGVjRW52aXJvbm1lbnQob3JpZ2luYWxFbnYsIGNvbW1vbkJpbmFyeVBhdGhzKTtcbiAgfSxcblxuICBkZW5vZGVpZnkoZjogKC4uLmFyZ3M6IEFycmF5PGFueT4pID0+IGFueSk6ICguLi5hcmdzOiBBcnJheTxhbnk+KSA9PiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Byb21pc2VzJykuZGVub2RlaWZ5KGYpO1xuICB9LFxuXG4gIGZvcmtXaXRoRXhlY0Vudmlyb25tZW50KG1vZHVsZVBhdGg6IHN0cmluZywgYXJncz86IEFycmF5PHN0cmluZz4sIG9wdGlvbnM/OiBPYmplY3QgPSB7fSk6XG4gICAgICBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPiB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvY2VzcycpLmZvcmtXaXRoRXhlY0Vudmlyb25tZW50KG1vZHVsZVBhdGgsIGFyZ3MsIG9wdGlvbnMpO1xuICB9LFxuXG4gIHNhZmVTcGF3bihjb21tYW5kOiBzdHJpbmcsIGFyZ3M/OiBBcnJheTxzdHJpbmc+LCBvcHRpb25zPzogT2JqZWN0ID0ge30pOlxuICAgICAgUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Byb2Nlc3MnKS5zYWZlU3Bhd24oY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG4gIH0sXG5cbiAgc2NyaXB0U2FmZVNwYXduKFxuICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICBhcmdzPzogQXJyYXk8c3RyaW5nPiA9IFtdLFxuICAgIG9wdGlvbnM/OiBPYmplY3QgPSB7fSxcbiAgKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Byb2Nlc3MnKS5zY3JpcHRTYWZlU3Bhd24oY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG4gIH0sXG5cbiAgc2NyaXB0U2FmZVNwYXduQW5kT2JzZXJ2ZU91dHB1dChcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSxcbiAgICBvcHRpb25zPzogT2JqZWN0ID0ge30sXG4gICk6IE9ic2VydmFibGU8e3N0ZG91dD86IHN0cmluZywgc3RkZXJyPzogc3RyaW5nLH0+IHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9wcm9jZXNzJykuc2NyaXB0U2FmZVNwYXduQW5kT2JzZXJ2ZU91dHB1dChjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcbiAgfSxcblxuICBzcGxpdFN0cmVhbShpbnB1dDogT2JzZXJ2YWJsZTxzdHJpbmc+KTogT2JzZXJ2YWJsZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9zdHJlYW0nKS5zcGxpdFN0cmVhbShpbnB1dCk7XG4gIH0sXG5cbiAgb2JzZXJ2ZVN0cmVhbShzdHJlYW06IHN0cmVhbSRSZWFkYWJsZSk6IE9ic2VydmFibGU8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vc3RyZWFtJykub2JzZXJ2ZVN0cmVhbShzdHJlYW0pO1xuICB9LFxuXG4gIG9ic2VydmVQcm9jZXNzRXhpdChcbiAgICBjcmVhdGVQcm9jZXNzOiAoKSA9PiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcyB8IFByb21pc2U8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+LFxuICApOiBPYnNlcnZhYmxlPG51bWJlcj4ge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Byb2Nlc3MnKS5vYnNlcnZlUHJvY2Vzc0V4aXQoY3JlYXRlUHJvY2Vzcyk7XG4gIH0sXG5cbiAgb2JzZXJ2ZVByb2Nlc3MoXG4gICAgY3JlYXRlUHJvY2VzczogKCkgPT4gY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3MgfCBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPixcbiAgKTogT2JzZXJ2YWJsZTxQcm9jZXNzTWVzc2FnZT4ge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Byb2Nlc3MnKS5vYnNlcnZlUHJvY2VzcyhjcmVhdGVQcm9jZXNzKTtcbiAgfSxcblxuICByZWFkRmlsZShmaWxlUGF0aDogc3RyaW5nLCBvcHRpb25zPzogYW55KTogUHJvbWlzZTxzdHJpbmcgfCBCdWZmZXI+IHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9maWxlc3lzdGVtJykucmVhZEZpbGUoZmlsZVBhdGgsIG9wdGlvbnMpO1xuICB9LFxuXG4gIHRvSnNTdHJpbmcoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3RvSnNTdHJpbmcnKShzdHIpO1xuICB9LFxuXG4gIGZpbmROZWFyZXN0RmlsZShmaWxlTmFtZTogc3RyaW5nLCBwYXRoVG9EaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2ZpbGVzeXN0ZW0nKS5maW5kTmVhcmVzdEZpbGUoZmlsZU5hbWUsIHBhdGhUb0RpcmVjdG9yeSk7XG4gIH0sXG5cbiAgZ2V0IGFycmF5KCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2FycmF5Jyk7XG4gIH0sXG5cbiAgZ2V0IHNldCgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9zZXQnKTtcbiAgfSxcblxuICBnZXQgbWFwKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL21hcCcpO1xuICB9LFxuXG4gIGdldCBvYmplY3QoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vb2JqZWN0Jyk7XG4gIH0sXG5cbiAgZ2V0IGZzUHJvbWlzZSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9maWxlc3lzdGVtJyk7XG4gIH0sXG5cbiAgZ2V0IGh0dHBQcm9taXNlKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2h0dHAnKTtcbiAgfSxcblxuICBnZXQgc3RyaW5ncygpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9zdHJpbmdzJyk7XG4gIH0sXG5cbiAgZ2V0IHBhdGhzKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3BhdGhzJyk7XG4gIH0sXG5cbiAgZ2V0IFByb21pc2VQb29sKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL1Byb21pc2VFeGVjdXRvcnMnKS5Qcm9taXNlUG9vbDtcbiAgfSxcblxuICBnZXQgUHJvbWlzZVF1ZXVlKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL1Byb21pc2VFeGVjdXRvcnMnKS5Qcm9taXNlUXVldWU7XG4gIH0sXG5cbiAgZ2V0IGV4dGVuZCgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9leHRlbmQnKTtcbiAgfSxcblxuICBnZXQgZGVib3VuY2UoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vZGVib3VuY2UnKTtcbiAgfSxcblxuICBnZXQgb25jZSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9vbmNlJyk7XG4gIH0sXG5cbiAgZ2V0IHZjcygpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi92Y3MnKTtcbiAgfSxcblxuICBnZXQgZG5zVXRpbHMoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vZG5zX3V0aWxzJyk7XG4gIH0sXG5cbiAgZ2V0IGVudigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9lbnZpcm9ubWVudCcpO1xuICB9LFxuXG4gIGdldCBwcm9taXNlcygpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9wcm9taXNlcycpO1xuICB9LFxuXG4gIGdldCByZWdleHAoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcmVnZXhwJyk7XG4gIH0sXG5cbiAgZ2V0IGVycm9yKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2Vycm9yJyk7XG4gIH0sXG5cbiAgZ2V0IGV2ZW50KCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2V2ZW50Jyk7XG4gIH0sXG5cbiAgZ2V0IHNlc3Npb24oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vc2Vzc2lvbicpO1xuICB9LFxuXG4gIGdldCBzaW5nbGV0b24oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vc2luZ2xldG9uJyk7XG4gIH0sXG5cbiAgZ2V0IENpcmN1bGFyQnVmZmVyKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL0NpcmN1bGFyQnVmZmVyJyk7XG4gIH0sXG5cbiAgZ2V0IENPTU1PTl9CSU5BUllfUEFUSFMoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvY2VzcycpLkNPTU1PTl9CSU5BUllfUEFUSFM7XG4gIH0sXG5cbiAgZ2V0IGNsaWVudEluZm8oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vY2xpZW50SW5mbycpO1xuICB9LFxuXG4gIGdldCBzeXN0ZW1JbmZvKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3N5c3RlbUluZm8nKTtcbiAgfSxcblxuICBnZXQgcnVudGltZUluZm8oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcnVudGltZUluZm8nKTtcbiAgfSxcblxuICBnZXQgU2NyaWJlUHJvY2VzcygpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9TY3JpYmVQcm9jZXNzJykuU2NyaWJlUHJvY2VzcztcbiAgfSxcblxuICBnZXQgQmF0Y2hQcm9jZXNzZWRRdWV1ZSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9CYXRjaFByb2Nlc3NlZFF1ZXVlJykuQmF0Y2hQcm9jZXNzZWRRdWV1ZTtcbiAgfSxcblxuICBnZXQgRXh0ZW5kYWJsZUVycm9yKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL0V4dGVuZGFibGVFcnJvcicpO1xuICB9LFxufTtcbiJdfQ==