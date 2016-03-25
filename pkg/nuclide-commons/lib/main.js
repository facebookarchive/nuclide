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
//# sourceMappingURL=data:application/json;base64,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S0FDekM7Ozs7QUFFRyxZQUFVO1NBQUEsZUFBbUI7QUFDL0IsYUFBTyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUN6Qzs7OztBQUVHLGFBQVc7U0FBQSxlQUFvQjtBQUNqQyxhQUFPLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQzFDOzs7O0FBRUcsZUFBYTtTQUFBLGVBQUc7QUFDbEIsYUFBTyxBQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQXFCLGFBQWEsQ0FBQztLQUMvRTs7OztBQUVHLHFCQUFtQjtTQUFBLGVBQUc7QUFDeEIsYUFBTyxBQUNMLGdCQUFnQixDQUFDLHVCQUF1QixDQUFDLENBQ3pDLG1CQUFtQixDQUFDO0tBQ3ZCOzs7O0FBRUcsaUJBQWU7U0FBQSxlQUF3QjtBQUN6QyxhQUFPLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLENBQUM7S0FDOUM7Ozs7RUFDRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5leHBvcnQgdHlwZSBwcm9jZXNzJGFzeW5jRXhlY3V0ZVJldCA9IHtcbiAgY29tbWFuZD86IHN0cmluZztcbiAgZXJyb3JNZXNzYWdlPzogc3RyaW5nO1xuICBleGl0Q29kZTogbnVtYmVyO1xuICBzdGRlcnI6IHN0cmluZztcbiAgc3Rkb3V0OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBQcm9jZXNzTWVzc2FnZSA9IFN0ZG91dE1lc3NhZ2UgfCBTdGRlcnJNZXNzYWdlIHwgRXhpdE1lc3NhZ2UgfCBFcnJvck1lc3NhZ2U7XG5leHBvcnQgdHlwZSBTdGRvdXRNZXNzYWdlID0ge1xuICBraW5kOiAnc3Rkb3V0JztcbiAgZGF0YTogc3RyaW5nO1xufTtcbmV4cG9ydCB0eXBlIFN0ZGVyck1lc3NhZ2UgPSB7XG4gIGtpbmQ6ICdzdGRlcnInO1xuICBkYXRhOiBzdHJpbmc7XG59O1xuZXhwb3J0IHR5cGUgRXhpdE1lc3NhZ2UgPSB7XG4gIGtpbmQ6ICdleGl0JztcbiAgZXhpdENvZGU6IG51bWJlcjtcbn07XG5leHBvcnQgdHlwZSBFcnJvck1lc3NhZ2UgPSB7XG4gIGtpbmQ6ICdlcnJvcic7XG4gIGVycm9yOiBPYmplY3Q7XG59O1xuXG5pbXBvcnQgdHlwZW9mICogYXMgUHJvY2Vzc1R5cGUgZnJvbSAnLi9wcm9jZXNzJztcbmltcG9ydCB0eXBlb2YgKiBhcyBTdHJlYW1UeXBlIGZyb20gJy4vc3RyZWFtJztcbmltcG9ydCB0eXBlb2YgKiBhcyBGaWxlc3lzdGVtVHlwZSBmcm9tICcuL2ZpbGVzeXN0ZW0nO1xuaW1wb3J0IHR5cGVvZiAqIGFzIFRvSnNTdHJpbmdUeXBlIGZyb20gJy4vdG9Kc1N0cmluZyc7XG5pbXBvcnQgdHlwZW9mICogYXMgU2V0VHlwZSBmcm9tICcuL3NldCc7XG5pbXBvcnQgdHlwZW9mICogYXMgTWFwVHlwZSBmcm9tICcuL21hcCc7XG5pbXBvcnQgdHlwZW9mICogYXMgQXJyYXlUeXBlIGZyb20gJy4vYXJyYXknO1xuaW1wb3J0IHR5cGVvZiAqIGFzIE9iamVjdFR5cGUgZnJvbSAnLi9vYmplY3QnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIEh0dHBUeXBlIGZyb20gJy4vaHR0cCc7XG5pbXBvcnQgdHlwZW9mICogYXMgU3RyaW5nc1R5cGUgZnJvbSAnLi9zdHJpbmdzJztcbmltcG9ydCB0eXBlb2YgKiBhcyBSZWxhdGl2ZURhdGVUeXBlIGZyb20gJy4vcmVsYXRpdmVEYXRlJztcbmltcG9ydCB0eXBlb2YgKiBhcyBQYXRoc1R5cGUgZnJvbSAnLi9wYXRocyc7XG5pbXBvcnQgdHlwZW9mICogYXMgUHJvbWlzZUV4ZWN1dG9yc1R5cGUgZnJvbSAnLi9Qcm9taXNlRXhlY3V0b3JzJztcbmltcG9ydCB0eXBlb2YgKiBhcyBFeHRlbmRUeXBlIGZyb20gJy4vZXh0ZW5kJztcbmltcG9ydCB0eXBlb2YgKiBhcyBEZWJvdW5jZVR5cGUgZnJvbSAnLi9kZWJvdW5jZSc7XG5pbXBvcnQgdHlwZW9mICogYXMgT25jZVR5cGUgZnJvbSAnLi9vbmNlJztcbmltcG9ydCB0eXBlb2YgKiBhcyBWY3NUeXBlIGZyb20gJy4vdmNzJztcbmltcG9ydCB0eXBlb2YgKiBhcyBEbnNVdGlsc1R5cGUgZnJvbSAnLi9kbnNfdXRpbHMnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIFByb21pc2VzVHlwZSBmcm9tICcuL3Byb21pc2VzJztcbmltcG9ydCB0eXBlb2YgKiBhcyBSZWdFeHBUeXBlIGZyb20gJy4vcmVnZXhwJztcbmltcG9ydCB0eXBlb2YgKiBhcyBFcnJvclR5cGUgZnJvbSAnLi9lcnJvcic7XG5pbXBvcnQgdHlwZW9mICogYXMgRXZlbnRUeXBlIGZyb20gJy4vZXZlbnQnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIFNlc3Npb25UeXBlIGZyb20gJy4vc2Vzc2lvbic7XG5pbXBvcnQgdHlwZW9mICogYXMgQ2lyY3VsYXJCdWZmZXJUeXBlIGZyb20gJy4vQ2lyY3VsYXJCdWZmZXInO1xuaW1wb3J0IHR5cGVvZiAqIGFzIENsaWVudEluZm9UeXBlIGZyb20gJy4vY2xpZW50SW5mbyc7XG5pbXBvcnQgdHlwZW9mICogYXMgU3lzdGVtSW5mb1R5cGUgZnJvbSAnLi9zeXN0ZW1JbmZvJztcbmltcG9ydCB0eXBlb2YgKiBhcyBSdW50aW1lSW5mb1R5cGUgZnJvbSAnLi9ydW50aW1lSW5mbyc7XG5pbXBvcnQgdHlwZW9mICogYXMgU2NyaWJlUHJvY2Vzc1R5cGUgZnJvbSAnLi9TY3JpYmVQcm9jZXNzJztcbmltcG9ydCB0eXBlb2YgKiBhcyBCYXRjaFByb2Nlc3NlZFF1ZXVlVHlwZSBmcm9tICcuL0JhdGNoUHJvY2Vzc2VkUXVldWUnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIEV4dGVuZGFibGVFcnJvclR5cGUgZnJvbSAnLi9FeHRlbmRhYmxlRXJyb3InO1xuaW1wb3J0IHR5cGUge0Vudmlyb25tZW50IGFzIEVudmlyb25tZW50VHlwZX0gZnJvbSAnLi9lbnZpcm9ubWVudCc7XG5cbi8vIEl0J3MgaW1wYWN0ZnVsIHRvIG1lbW9pemUgb3VyIHJlcXVpcmVzIGhlcmUgc2luY2UgdGhlc2UgY29tbW9ucyBhcmUgc28gb2Z0ZW4gdXNlZC5cbmNvbnN0IHJlcXVpcmVDYWNoZToge1tpZDogc3RyaW5nXTogYW55fSA9IHt9O1xuZnVuY3Rpb24gcmVxdWlyZUZyb21DYWNoZShpZDogc3RyaW5nKTogYW55IHtcbiAgaWYgKCFyZXF1aXJlQ2FjaGUuaGFzT3duUHJvcGVydHkoaWQpKSB7XG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICByZXF1aXJlQ2FjaGVbaWRdID0gcmVxdWlyZShpZCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVpcmVDYWNoZVtpZF07XG59XG5cbmZ1bmN0aW9uIHJlcXVpcmVQcm9taXNlcygpOiBQcm9taXNlc1R5cGUge1xuICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9wcm9taXNlcycpO1xufVxuXG5mdW5jdGlvbiByZXF1aXJlUHJvY2VzcygpOiBQcm9jZXNzVHlwZSB7XG4gIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Byb2Nlc3MnKTtcbn1cblxuZnVuY3Rpb24gcmVxdWlyZVN0cmVhbSgpOiBTdHJlYW1UeXBlIHtcbiAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vc3RyZWFtJyk7XG59XG5cbmZ1bmN0aW9uIHJlcXVpcmVGaWxlU3lzdGVtKCk6IEZpbGVzeXN0ZW1UeXBlIHtcbiAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vZmlsZXN5c3RlbScpO1xufVxuXG5mdW5jdGlvbiByZXF1cmVQcm9taXNlRXhlY3V0b3JzKCk6IFByb21pc2VFeGVjdXRvcnNUeXBlIHtcbiAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vUHJvbWlzZUV4ZWN1dG9ycycpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBnZXQgYXN5bmNGaW5kKCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvbWlzZXMoKS5hc3luY0ZpbmQ7XG4gIH0sXG5cbiAgZ2V0IGFzeW5jRXhlY3V0ZSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZVByb2Nlc3MoKS5hc3luY0V4ZWN1dGU7XG4gIH0sXG5cbiAgZ2V0IGNoZWNrT3V0cHV0KCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvY2VzcygpLmNoZWNrT3V0cHV0O1xuICB9LFxuXG4gIGdldCBjcmVhdGVBcmdzRm9yU2NyaXB0Q29tbWFuZCgpIHtcbiAgICByZXR1cm4gcmVxdWlyZVByb2Nlc3MoKS5jcmVhdGVBcmdzRm9yU2NyaXB0Q29tbWFuZDtcbiAgfSxcblxuICBnZXQgY3JlYXRlRXhlY0Vudmlyb25tZW50KCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvY2VzcygpLmNyZWF0ZUV4ZWNFbnZpcm9ubWVudDtcbiAgfSxcblxuICBnZXQgZGVub2RlaWZ5KCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvbWlzZXMoKS5kZW5vZGVpZnk7XG4gIH0sXG5cbiAgZ2V0IGZvcmtXaXRoRXhlY0Vudmlyb25tZW50KCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvY2VzcygpLmZvcmtXaXRoRXhlY0Vudmlyb25tZW50O1xuICB9LFxuXG4gIGdldCBzYWZlU3Bhd24oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9jZXNzKCkuc2FmZVNwYXduO1xuICB9LFxuXG4gIGdldCBzY3JpcHRTYWZlU3Bhd24oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9jZXNzKCkuc2NyaXB0U2FmZVNwYXduO1xuICB9LFxuXG4gIGdldCBzY3JpcHRTYWZlU3Bhd25BbmRPYnNlcnZlT3V0cHV0KCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvY2VzcygpLnNjcmlwdFNhZmVTcGF3bkFuZE9ic2VydmVPdXRwdXQ7XG4gIH0sXG5cbiAgZ2V0IHNwbGl0U3RyZWFtKCkge1xuICAgIHJldHVybiByZXF1aXJlU3RyZWFtKCkuc3BsaXRTdHJlYW07XG4gIH0sXG5cbiAgZ2V0IG9ic2VydmVTdHJlYW0oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVTdHJlYW0oKS5vYnNlcnZlU3RyZWFtO1xuICB9LFxuXG4gIGdldCBvYnNlcnZlUHJvY2Vzc0V4aXQoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9jZXNzKCkub2JzZXJ2ZVByb2Nlc3NFeGl0O1xuICB9LFxuXG4gIGdldCBvYnNlcnZlUHJvY2VzcygpIHtcbiAgICByZXR1cm4gcmVxdWlyZVByb2Nlc3MoKS5vYnNlcnZlUHJvY2VzcztcbiAgfSxcblxuICBnZXQgcmVhZEZpbGUoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGaWxlU3lzdGVtKCkucmVhZEZpbGU7XG4gIH0sXG5cbiAgZ2V0IHJlbGF0aXZlRGF0ZSgpIHtcbiAgICByZXR1cm4gKHJlcXVpcmVGcm9tQ2FjaGUoJy4vcmVsYXRpdmVEYXRlJyk6IFJlbGF0aXZlRGF0ZVR5cGUpLnJlbGF0aXZlRGF0ZTtcbiAgfSxcblxuICBnZXQgdG9Kc1N0cmluZygpIHtcbiAgICByZXR1cm4gKHJlcXVpcmVGcm9tQ2FjaGUoJy4vdG9Kc1N0cmluZycpOiBUb0pzU3RyaW5nVHlwZSkudG9Kc1N0cmluZztcbiAgfSxcblxuICBnZXQgZmluZE5lYXJlc3RGaWxlKCkge1xuICAgIHJldHVybiByZXF1aXJlRmlsZVN5c3RlbSgpLmZpbmROZWFyZXN0RmlsZTtcbiAgfSxcblxuICBnZXQgYXJyYXkoKTogQXJyYXlUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9hcnJheScpO1xuICB9LFxuXG4gIGdldCBzZXQoKTogU2V0VHlwZSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vc2V0Jyk7XG4gIH0sXG5cbiAgZ2V0IG1hcCgpOiBNYXBUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9tYXAnKTtcbiAgfSxcblxuICBnZXQgb2JqZWN0KCk6IE9iamVjdFR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL29iamVjdCcpO1xuICB9LFxuXG4gIGdldCBmc1Byb21pc2UoKTogRmlsZXN5c3RlbVR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2ZpbGVzeXN0ZW0nKTtcbiAgfSxcblxuICBnZXQgaHR0cFByb21pc2UoKTogSHR0cFR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2h0dHAnKTtcbiAgfSxcblxuICBnZXQgc3RyaW5ncygpOiBTdHJpbmdzVHlwZSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vc3RyaW5ncycpO1xuICB9LFxuXG4gIGdldCBwYXRocygpOiBQYXRoc1R5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3BhdGhzJyk7XG4gIH0sXG5cbiAgZ2V0IFByb21pc2VQb29sKCkge1xuICAgIHJldHVybiByZXF1cmVQcm9taXNlRXhlY3V0b3JzKCkuUHJvbWlzZVBvb2w7XG4gIH0sXG5cbiAgZ2V0IFByb21pc2VRdWV1ZSgpIHtcbiAgICByZXR1cm4gcmVxdXJlUHJvbWlzZUV4ZWN1dG9ycygpLlByb21pc2VRdWV1ZTtcbiAgfSxcblxuICBnZXQgZXh0ZW5kKCk6IEV4dGVuZFR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2V4dGVuZCcpO1xuICB9LFxuXG4gIGdldCBkZWJvdW5jZSgpIHtcbiAgICByZXR1cm4gKHJlcXVpcmVGcm9tQ2FjaGUoJy4vZGVib3VuY2UnKTogRGVib3VuY2VUeXBlKS5kZWJvdW5jZTtcbiAgfSxcblxuICBnZXQgb25jZSgpIHtcbiAgICByZXR1cm4gKHJlcXVpcmVGcm9tQ2FjaGUoJy4vb25jZScpOiBPbmNlVHlwZSkub25jZTtcbiAgfSxcblxuICBnZXQgdmNzKCk6IFZjc1R5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3ZjcycpO1xuICB9LFxuXG4gIGdldCBkbnNVdGlscygpOiBEbnNVdGlsc1R5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2Ruc191dGlscycpO1xuICB9LFxuXG4gIGdldCBlbnYoKTogRW52aXJvbm1lbnRUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9lbnZpcm9ubWVudCcpO1xuICB9LFxuXG4gIGdldCBwcm9taXNlcygpIHtcbiAgICByZXR1cm4gcmVxdWlyZVByb21pc2VzKCk7XG4gIH0sXG5cbiAgZ2V0IHJlZ2V4cCgpOiBSZWdFeHBUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9yZWdleHAnKTtcbiAgfSxcblxuICBnZXQgZXJyb3IoKTogRXJyb3JUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9lcnJvcicpO1xuICB9LFxuXG4gIGdldCBldmVudCgpOiBFdmVudFR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2V2ZW50Jyk7XG4gIH0sXG5cbiAgZ2V0IHNlc3Npb24oKTogU2Vzc2lvblR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Nlc3Npb24nKTtcbiAgfSxcblxuICBnZXQgc2luZ2xldG9uKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3NpbmdsZXRvbicpO1xuICB9LFxuXG4gIGdldCBDaXJjdWxhckJ1ZmZlcigpIHtcbiAgICByZXR1cm4gKHJlcXVpcmVGcm9tQ2FjaGUoJy4vQ2lyY3VsYXJCdWZmZXInKTogQ2lyY3VsYXJCdWZmZXJUeXBlKS5DaXJjdWxhckJ1ZmZlcjtcbiAgfSxcblxuICBnZXQgQ09NTU9OX0JJTkFSWV9QQVRIUygpIHtcbiAgICByZXR1cm4gcmVxdWlyZVByb2Nlc3MoKS5DT01NT05fQklOQVJZX1BBVEhTO1xuICB9LFxuXG4gIGdldCBjbGllbnRJbmZvKCk6IENsaWVudEluZm9UeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9jbGllbnRJbmZvJyk7XG4gIH0sXG5cbiAgZ2V0IHN5c3RlbUluZm8oKTogU3lzdGVtSW5mb1R5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3N5c3RlbUluZm8nKTtcbiAgfSxcblxuICBnZXQgcnVudGltZUluZm8oKTogUnVudGltZUluZm9UeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9ydW50aW1lSW5mbycpO1xuICB9LFxuXG4gIGdldCBTY3JpYmVQcm9jZXNzKCkge1xuICAgIHJldHVybiAocmVxdWlyZUZyb21DYWNoZSgnLi9TY3JpYmVQcm9jZXNzJyk6IFNjcmliZVByb2Nlc3NUeXBlKS5TY3JpYmVQcm9jZXNzO1xuICB9LFxuXG4gIGdldCBCYXRjaFByb2Nlc3NlZFF1ZXVlKCkge1xuICAgIHJldHVybiAoXG4gICAgICByZXF1aXJlRnJvbUNhY2hlKCcuL0JhdGNoUHJvY2Vzc2VkUXVldWUnKTogQmF0Y2hQcm9jZXNzZWRRdWV1ZVR5cGVcbiAgICApLkJhdGNoUHJvY2Vzc2VkUXVldWU7XG4gIH0sXG5cbiAgZ2V0IEV4dGVuZGFibGVFcnJvcigpOiBFeHRlbmRhYmxlRXJyb3JUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9FeHRlbmRhYmxlRXJyb3InKTtcbiAgfSxcbn07XG4iXX0=