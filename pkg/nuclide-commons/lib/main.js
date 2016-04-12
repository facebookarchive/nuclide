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

function requireFileSystem() {
  return requireFromCache('./filesystem');
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
  }
});
//# sourceMappingURL=data:application/json;base64,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RyxZQUFVO1NBQUEsZUFBbUI7QUFDL0IsYUFBTyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUN6Qzs7OztBQUVHLFlBQVU7U0FBQSxlQUFtQjtBQUMvQixhQUFPLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQ3pDOzs7O0FBRUcsYUFBVztTQUFBLGVBQW9CO0FBQ2pDLGFBQU8sZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDMUM7Ozs7QUFFRyxlQUFhO1NBQUEsZUFBRztBQUNsQixhQUFPLEFBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsQ0FBcUIsYUFBYSxDQUFDO0tBQy9FOzs7O0FBRUcscUJBQW1CO1NBQUEsZUFBRztBQUN4QixhQUFPLEFBQ0wsZ0JBQWdCLENBQUMsdUJBQXVCLENBQUMsQ0FDekMsbUJBQW1CLENBQUM7S0FDdkI7Ozs7QUFFRyxpQkFBZTtTQUFBLGVBQXdCO0FBQ3pDLGFBQU8sZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztLQUM5Qzs7OztFQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmV4cG9ydCB0eXBlIHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0ID0ge1xuICBjb21tYW5kPzogc3RyaW5nO1xuICBlcnJvck1lc3NhZ2U/OiBzdHJpbmc7XG4gIGV4aXRDb2RlOiBudW1iZXI7XG4gIHN0ZGVycjogc3RyaW5nO1xuICBzdGRvdXQ6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFByb2Nlc3NNZXNzYWdlID0gU3Rkb3V0TWVzc2FnZSB8IFN0ZGVyck1lc3NhZ2UgfCBFeGl0TWVzc2FnZSB8IEVycm9yTWVzc2FnZTtcbmV4cG9ydCB0eXBlIFN0ZG91dE1lc3NhZ2UgPSB7XG4gIGtpbmQ6ICdzdGRvdXQnO1xuICBkYXRhOiBzdHJpbmc7XG59O1xuZXhwb3J0IHR5cGUgU3RkZXJyTWVzc2FnZSA9IHtcbiAga2luZDogJ3N0ZGVycic7XG4gIGRhdGE6IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBFeGl0TWVzc2FnZSA9IHtcbiAga2luZDogJ2V4aXQnO1xuICBleGl0Q29kZTogbnVtYmVyO1xufTtcbmV4cG9ydCB0eXBlIEVycm9yTWVzc2FnZSA9IHtcbiAga2luZDogJ2Vycm9yJztcbiAgZXJyb3I6IE9iamVjdDtcbn07XG5cbmltcG9ydCB0eXBlb2YgKiBhcyBQcm9jZXNzVHlwZSBmcm9tICcuL3Byb2Nlc3MnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIFN0cmVhbVR5cGUgZnJvbSAnLi9zdHJlYW0nO1xuaW1wb3J0IHR5cGVvZiAqIGFzIEZpbGVzeXN0ZW1UeXBlIGZyb20gJy4vZmlsZXN5c3RlbSc7XG5pbXBvcnQgdHlwZW9mICogYXMgVG9Kc1N0cmluZ1R5cGUgZnJvbSAnLi90b0pzU3RyaW5nJztcbmltcG9ydCB0eXBlb2YgKiBhcyBTZXRUeXBlIGZyb20gJy4vc2V0JztcbmltcG9ydCB0eXBlb2YgKiBhcyBNYXBUeXBlIGZyb20gJy4vbWFwJztcbmltcG9ydCB0eXBlb2YgKiBhcyBBcnJheVR5cGUgZnJvbSAnLi9hcnJheSc7XG5pbXBvcnQgdHlwZW9mICogYXMgT2JqZWN0VHlwZSBmcm9tICcuL29iamVjdCc7XG5pbXBvcnQgdHlwZW9mICogYXMgSHR0cFR5cGUgZnJvbSAnLi9odHRwJztcbmltcG9ydCB0eXBlb2YgKiBhcyBSZWxhdGl2ZURhdGVUeXBlIGZyb20gJy4vcmVsYXRpdmVEYXRlJztcbmltcG9ydCB0eXBlb2YgKiBhcyBQYXRoc1R5cGUgZnJvbSAnLi9wYXRocyc7XG5pbXBvcnQgdHlwZW9mICogYXMgUHJvbWlzZUV4ZWN1dG9yc1R5cGUgZnJvbSAnLi9Qcm9taXNlRXhlY3V0b3JzJztcbmltcG9ydCB0eXBlb2YgKiBhcyBEZWJvdW5jZVR5cGUgZnJvbSAnLi9kZWJvdW5jZSc7XG5pbXBvcnQgdHlwZW9mICogYXMgT25jZVR5cGUgZnJvbSAnLi9vbmNlJztcbmltcG9ydCB0eXBlb2YgKiBhcyBWY3NUeXBlIGZyb20gJy4vdmNzJztcbmltcG9ydCB0eXBlb2YgKiBhcyBEbnNVdGlsc1R5cGUgZnJvbSAnLi9kbnNfdXRpbHMnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIFByb21pc2VzVHlwZSBmcm9tICcuL3Byb21pc2VzJztcbmltcG9ydCB0eXBlb2YgKiBhcyBSZWdFeHBUeXBlIGZyb20gJy4vcmVnZXhwJztcbmltcG9ydCB0eXBlb2YgKiBhcyBFcnJvclR5cGUgZnJvbSAnLi9lcnJvcic7XG5pbXBvcnQgdHlwZW9mICogYXMgRXZlbnRUeXBlIGZyb20gJy4vZXZlbnQnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIFNlc3Npb25UeXBlIGZyb20gJy4vc2Vzc2lvbic7XG5pbXBvcnQgdHlwZW9mICogYXMgQ2lyY3VsYXJCdWZmZXJUeXBlIGZyb20gJy4vQ2lyY3VsYXJCdWZmZXInO1xuaW1wb3J0IHR5cGVvZiAqIGFzIENsaWVudEluZm9UeXBlIGZyb20gJy4vY2xpZW50SW5mbyc7XG5pbXBvcnQgdHlwZW9mICogYXMgU3lzdGVtSW5mb1R5cGUgZnJvbSAnLi9zeXN0ZW1JbmZvJztcbmltcG9ydCB0eXBlb2YgKiBhcyBSdW50aW1lSW5mb1R5cGUgZnJvbSAnLi9ydW50aW1lSW5mbyc7XG5pbXBvcnQgdHlwZW9mICogYXMgU2NyaWJlUHJvY2Vzc1R5cGUgZnJvbSAnLi9TY3JpYmVQcm9jZXNzJztcbmltcG9ydCB0eXBlb2YgKiBhcyBCYXRjaFByb2Nlc3NlZFF1ZXVlVHlwZSBmcm9tICcuL0JhdGNoUHJvY2Vzc2VkUXVldWUnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIEV4dGVuZGFibGVFcnJvclR5cGUgZnJvbSAnLi9FeHRlbmRhYmxlRXJyb3InO1xuaW1wb3J0IHR5cGVvZiAqIGFzIE9ic2VydmFibGVzVHlwZSBmcm9tICcuL29ic2VydmFibGVzJztcbmltcG9ydCB0eXBlIHtFbnZpcm9ubWVudCBhcyBFbnZpcm9ubWVudFR5cGV9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuXG4vLyBJdCdzIGltcGFjdGZ1bCB0byBtZW1vaXplIG91ciByZXF1aXJlcyBoZXJlIHNpbmNlIHRoZXNlIGNvbW1vbnMgYXJlIHNvIG9mdGVuIHVzZWQuXG5jb25zdCByZXF1aXJlQ2FjaGU6IHtbaWQ6IHN0cmluZ106IGFueX0gPSB7fTtcbmZ1bmN0aW9uIHJlcXVpcmVGcm9tQ2FjaGUoaWQ6IHN0cmluZyk6IGFueSB7XG4gIGlmICghcmVxdWlyZUNhY2hlLmhhc093blByb3BlcnR5KGlkKSkge1xuICAgIC8vICRGbG93SWdub3JlXG4gICAgcmVxdWlyZUNhY2hlW2lkXSA9IHJlcXVpcmUoaWQpO1xuICB9XG4gIHJldHVybiByZXF1aXJlQ2FjaGVbaWRdO1xufVxuXG5mdW5jdGlvbiByZXF1aXJlUHJvbWlzZXMoKTogUHJvbWlzZXNUeXBlIHtcbiAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvbWlzZXMnKTtcbn1cblxuZnVuY3Rpb24gcmVxdWlyZU9ic2VydmFibGVzKCk6IE9ic2VydmFibGVzVHlwZSB7XG4gIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL29ic2VydmFibGVzJyk7XG59XG5cbmZ1bmN0aW9uIHJlcXVpcmVQcm9jZXNzKCk6IFByb2Nlc3NUeXBlIHtcbiAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvY2VzcycpO1xufVxuXG5mdW5jdGlvbiByZXF1aXJlU3RyZWFtKCk6IFN0cmVhbVR5cGUge1xuICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9zdHJlYW0nKTtcbn1cblxuZnVuY3Rpb24gcmVxdWlyZUZpbGVTeXN0ZW0oKTogRmlsZXN5c3RlbVR5cGUge1xuICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9maWxlc3lzdGVtJyk7XG59XG5cbmZ1bmN0aW9uIHJlcXVpcmVQcm9taXNlRXhlY3V0b3JzKCk6IFByb21pc2VFeGVjdXRvcnNUeXBlIHtcbiAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vUHJvbWlzZUV4ZWN1dG9ycycpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBnZXQgYXN5bmNGaW5kKCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvbWlzZXMoKS5hc3luY0ZpbmQ7XG4gIH0sXG5cbiAgZ2V0IGFzeW5jRXhlY3V0ZSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZVByb2Nlc3MoKS5hc3luY0V4ZWN1dGU7XG4gIH0sXG5cbiAgZ2V0IGNoZWNrT3V0cHV0KCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvY2VzcygpLmNoZWNrT3V0cHV0O1xuICB9LFxuXG4gIGdldCBjcmVhdGVBcmdzRm9yU2NyaXB0Q29tbWFuZCgpIHtcbiAgICByZXR1cm4gcmVxdWlyZVByb2Nlc3MoKS5jcmVhdGVBcmdzRm9yU2NyaXB0Q29tbWFuZDtcbiAgfSxcblxuICBnZXQgY3JlYXRlRXhlY0Vudmlyb25tZW50KCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvY2VzcygpLmNyZWF0ZUV4ZWNFbnZpcm9ubWVudDtcbiAgfSxcblxuICBnZXQgZGVub2RlaWZ5KCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvbWlzZXMoKS5kZW5vZGVpZnk7XG4gIH0sXG5cbiAgZ2V0IGZvcmtXaXRoRXhlY0Vudmlyb25tZW50KCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvY2VzcygpLmZvcmtXaXRoRXhlY0Vudmlyb25tZW50O1xuICB9LFxuXG4gIGdldCBzYWZlU3Bhd24oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9jZXNzKCkuc2FmZVNwYXduO1xuICB9LFxuXG4gIGdldCBzY3JpcHRTYWZlU3Bhd24oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9jZXNzKCkuc2NyaXB0U2FmZVNwYXduO1xuICB9LFxuXG4gIGdldCBzY3JpcHRTYWZlU3Bhd25BbmRPYnNlcnZlT3V0cHV0KCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvY2VzcygpLnNjcmlwdFNhZmVTcGF3bkFuZE9ic2VydmVPdXRwdXQ7XG4gIH0sXG5cbiAgZ2V0IHNwbGl0U3RyZWFtKCkge1xuICAgIHJldHVybiByZXF1aXJlU3RyZWFtKCkuc3BsaXRTdHJlYW07XG4gIH0sXG5cbiAgZ2V0IG9ic2VydmVTdHJlYW0oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVTdHJlYW0oKS5vYnNlcnZlU3RyZWFtO1xuICB9LFxuXG4gIGdldCBvYnNlcnZlUHJvY2Vzc0V4aXQoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9jZXNzKCkub2JzZXJ2ZVByb2Nlc3NFeGl0O1xuICB9LFxuXG4gIGdldCBvYnNlcnZlUHJvY2VzcygpIHtcbiAgICByZXR1cm4gcmVxdWlyZVByb2Nlc3MoKS5vYnNlcnZlUHJvY2VzcztcbiAgfSxcblxuICBnZXQgcmVhZEZpbGUoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGaWxlU3lzdGVtKCkucmVhZEZpbGU7XG4gIH0sXG5cbiAgZ2V0IHJlbGF0aXZlRGF0ZSgpIHtcbiAgICByZXR1cm4gKHJlcXVpcmVGcm9tQ2FjaGUoJy4vcmVsYXRpdmVEYXRlJyk6IFJlbGF0aXZlRGF0ZVR5cGUpLnJlbGF0aXZlRGF0ZTtcbiAgfSxcblxuICBnZXQgdG9Kc1N0cmluZygpIHtcbiAgICByZXR1cm4gKHJlcXVpcmVGcm9tQ2FjaGUoJy4vdG9Kc1N0cmluZycpOiBUb0pzU3RyaW5nVHlwZSkudG9Kc1N0cmluZztcbiAgfSxcblxuICBnZXQgZmluZE5lYXJlc3RGaWxlKCkge1xuICAgIHJldHVybiByZXF1aXJlRmlsZVN5c3RlbSgpLmZpbmROZWFyZXN0RmlsZTtcbiAgfSxcblxuICBnZXQgYXJyYXkoKTogQXJyYXlUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9hcnJheScpO1xuICB9LFxuXG4gIGdldCBzZXQoKTogU2V0VHlwZSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vc2V0Jyk7XG4gIH0sXG5cbiAgZ2V0IG1hcCgpOiBNYXBUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9tYXAnKTtcbiAgfSxcblxuICBnZXQgb2JqZWN0KCk6IE9iamVjdFR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL29iamVjdCcpO1xuICB9LFxuXG4gIGdldCBmc1Byb21pc2UoKTogRmlsZXN5c3RlbVR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2ZpbGVzeXN0ZW0nKTtcbiAgfSxcblxuICBnZXQgaHR0cFByb21pc2UoKTogSHR0cFR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2h0dHAnKTtcbiAgfSxcblxuICBnZXQgcGF0aHMoKTogUGF0aHNUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9wYXRocycpO1xuICB9LFxuXG4gIGdldCBQcm9taXNlUG9vbCgpIHtcbiAgICByZXR1cm4gcmVxdWlyZVByb21pc2VFeGVjdXRvcnMoKS5Qcm9taXNlUG9vbDtcbiAgfSxcblxuICBnZXQgUHJvbWlzZVF1ZXVlKCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvbWlzZUV4ZWN1dG9ycygpLlByb21pc2VRdWV1ZTtcbiAgfSxcblxuICBnZXQgZGVib3VuY2UoKSB7XG4gICAgcmV0dXJuIChyZXF1aXJlRnJvbUNhY2hlKCcuL2RlYm91bmNlJyk6IERlYm91bmNlVHlwZSkuZGVib3VuY2U7XG4gIH0sXG5cbiAgZ2V0IG9uY2UoKSB7XG4gICAgcmV0dXJuIChyZXF1aXJlRnJvbUNhY2hlKCcuL29uY2UnKTogT25jZVR5cGUpLm9uY2U7XG4gIH0sXG5cbiAgZ2V0IHRvb2xiYXIoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vdG9vbGJhcicpO1xuICB9LFxuXG4gIGdldCB2Y3MoKTogVmNzVHlwZSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vdmNzJyk7XG4gIH0sXG5cbiAgZ2V0IGRuc1V0aWxzKCk6IERuc1V0aWxzVHlwZSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vZG5zX3V0aWxzJyk7XG4gIH0sXG5cbiAgZ2V0IGVudigpOiBFbnZpcm9ubWVudFR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2Vudmlyb25tZW50Jyk7XG4gIH0sXG5cbiAgZ2V0IHByb21pc2VzKCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvbWlzZXMoKTtcbiAgfSxcblxuICBnZXQgb2JzZXJ2YWJsZXMoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVPYnNlcnZhYmxlcygpO1xuICB9LFxuXG4gIGdldCByZWdleHAoKTogUmVnRXhwVHlwZSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcmVnZXhwJyk7XG4gIH0sXG5cbiAgZ2V0IGVycm9yKCk6IEVycm9yVHlwZSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vZXJyb3InKTtcbiAgfSxcblxuICBnZXQgZXZlbnQoKTogRXZlbnRUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9ldmVudCcpO1xuICB9LFxuXG4gIGdldCBzZXNzaW9uKCk6IFNlc3Npb25UeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9zZXNzaW9uJyk7XG4gIH0sXG5cbiAgZ2V0IHNpbmdsZXRvbigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9zaW5nbGV0b24nKTtcbiAgfSxcblxuICBnZXQgQ2lyY3VsYXJCdWZmZXIoKSB7XG4gICAgcmV0dXJuIChyZXF1aXJlRnJvbUNhY2hlKCcuL0NpcmN1bGFyQnVmZmVyJyk6IENpcmN1bGFyQnVmZmVyVHlwZSkuQ2lyY3VsYXJCdWZmZXI7XG4gIH0sXG5cbiAgZ2V0IENPTU1PTl9CSU5BUllfUEFUSFMoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9jZXNzKCkuQ09NTU9OX0JJTkFSWV9QQVRIUztcbiAgfSxcblxuICBnZXQgY2xpZW50SW5mbygpOiBDbGllbnRJbmZvVHlwZSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vY2xpZW50SW5mbycpO1xuICB9LFxuXG4gIGdldCBzeXN0ZW1JbmZvKCk6IFN5c3RlbUluZm9UeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9zeXN0ZW1JbmZvJyk7XG4gIH0sXG5cbiAgZ2V0IHJ1bnRpbWVJbmZvKCk6IFJ1bnRpbWVJbmZvVHlwZSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcnVudGltZUluZm8nKTtcbiAgfSxcblxuICBnZXQgU2NyaWJlUHJvY2VzcygpIHtcbiAgICByZXR1cm4gKHJlcXVpcmVGcm9tQ2FjaGUoJy4vU2NyaWJlUHJvY2VzcycpOiBTY3JpYmVQcm9jZXNzVHlwZSkuU2NyaWJlUHJvY2VzcztcbiAgfSxcblxuICBnZXQgQmF0Y2hQcm9jZXNzZWRRdWV1ZSgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgcmVxdWlyZUZyb21DYWNoZSgnLi9CYXRjaFByb2Nlc3NlZFF1ZXVlJyk6IEJhdGNoUHJvY2Vzc2VkUXVldWVUeXBlXG4gICAgKS5CYXRjaFByb2Nlc3NlZFF1ZXVlO1xuICB9LFxuXG4gIGdldCBFeHRlbmRhYmxlRXJyb3IoKTogRXh0ZW5kYWJsZUVycm9yVHlwZSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vRXh0ZW5kYWJsZUVycm9yJyk7XG4gIH0sXG59O1xuIl19