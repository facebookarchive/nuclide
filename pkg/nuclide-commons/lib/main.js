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
//# sourceMappingURL=data:application/json;base64,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Q0FBQztLQUNsRjs7OztBQUVHLHFCQUFtQjtTQUFBLGVBQUc7QUFDeEIsYUFBTyxjQUFjLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztLQUM3Qzs7OztBQUVHLFlBQVU7U0FBQSxlQUFtQjtBQUMvQixhQUFPLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQ3pDOzs7O0FBRUcsWUFBVTtTQUFBLGVBQW1CO0FBQy9CLGFBQU8sZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7S0FDekM7Ozs7QUFFRyxhQUFXO1NBQUEsZUFBb0I7QUFDakMsYUFBTyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUMxQzs7OztBQUVHLGVBQWE7U0FBQSxlQUFHO0FBQ2xCLGFBQU8sQUFBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFxQixhQUFhLENBQUM7S0FDL0U7Ozs7QUFFRyxxQkFBbUI7U0FBQSxlQUFHO0FBQ3hCLGFBQU8sQUFDTCxnQkFBZ0IsQ0FBQyx1QkFBdUIsQ0FBQyxDQUN6QyxtQkFBbUIsQ0FBQztLQUN2Qjs7OztBQUVHLGlCQUFlO1NBQUEsZUFBd0I7QUFDekMsYUFBTyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0tBQzlDOzs7O0FBRUcsVUFBUTtTQUFBLGVBQW1FO0FBQzdFLGFBQU8sZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxDQUFDO0tBQ2xEOzs7O0VBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuZXhwb3J0IHR5cGUgcHJvY2VzcyRhc3luY0V4ZWN1dGVSZXQgPSB7XG4gIGNvbW1hbmQ/OiBzdHJpbmc7XG4gIGVycm9yTWVzc2FnZT86IHN0cmluZztcbiAgZXhpdENvZGU6IG51bWJlcjtcbiAgc3RkZXJyOiBzdHJpbmc7XG4gIHN0ZG91dDogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgUHJvY2Vzc01lc3NhZ2UgPSBTdGRvdXRNZXNzYWdlIHwgU3RkZXJyTWVzc2FnZSB8IEV4aXRNZXNzYWdlIHwgRXJyb3JNZXNzYWdlO1xuZXhwb3J0IHR5cGUgU3Rkb3V0TWVzc2FnZSA9IHtcbiAga2luZDogJ3N0ZG91dCc7XG4gIGRhdGE6IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBTdGRlcnJNZXNzYWdlID0ge1xuICBraW5kOiAnc3RkZXJyJztcbiAgZGF0YTogc3RyaW5nO1xufTtcbmV4cG9ydCB0eXBlIEV4aXRNZXNzYWdlID0ge1xuICBraW5kOiAnZXhpdCc7XG4gIGV4aXRDb2RlOiBudW1iZXI7XG59O1xuZXhwb3J0IHR5cGUgRXJyb3JNZXNzYWdlID0ge1xuICBraW5kOiAnZXJyb3InO1xuICBlcnJvcjogT2JqZWN0O1xufTtcblxuaW1wb3J0IHR5cGVvZiAqIGFzIFByb2Nlc3NUeXBlIGZyb20gJy4vcHJvY2Vzcyc7XG5pbXBvcnQgdHlwZW9mICogYXMgU3RyZWFtVHlwZSBmcm9tICcuL3N0cmVhbSc7XG5pbXBvcnQgdHlwZW9mICogYXMgRlNQcm9taXNlVHlwZSBmcm9tICcuL2ZzUHJvbWlzZSc7XG5pbXBvcnQgdHlwZW9mICogYXMgVG9Kc1N0cmluZ1R5cGUgZnJvbSAnLi90b0pzU3RyaW5nJztcbmltcG9ydCB0eXBlb2YgKiBhcyBTZXRUeXBlIGZyb20gJy4vc2V0JztcbmltcG9ydCB0eXBlb2YgKiBhcyBNYXBUeXBlIGZyb20gJy4vbWFwJztcbmltcG9ydCB0eXBlb2YgKiBhcyBBcnJheVR5cGUgZnJvbSAnLi9hcnJheSc7XG5pbXBvcnQgdHlwZW9mICogYXMgT2JqZWN0VHlwZSBmcm9tICcuL29iamVjdCc7XG5pbXBvcnQgdHlwZW9mICogYXMgSHR0cFR5cGUgZnJvbSAnLi9odHRwJztcbmltcG9ydCB0eXBlb2YgKiBhcyBSZWxhdGl2ZURhdGVUeXBlIGZyb20gJy4vcmVsYXRpdmVEYXRlJztcbmltcG9ydCB0eXBlb2YgKiBhcyBQYXRoc1R5cGUgZnJvbSAnLi9wYXRocyc7XG5pbXBvcnQgdHlwZW9mICogYXMgUHJvbWlzZUV4ZWN1dG9yc1R5cGUgZnJvbSAnLi9Qcm9taXNlRXhlY3V0b3JzJztcbmltcG9ydCB0eXBlb2YgKiBhcyBEZWJvdW5jZVR5cGUgZnJvbSAnLi9kZWJvdW5jZSc7XG5pbXBvcnQgdHlwZW9mICogYXMgT25jZVR5cGUgZnJvbSAnLi9vbmNlJztcbmltcG9ydCB0eXBlb2YgKiBhcyBWY3NUeXBlIGZyb20gJy4vdmNzJztcbmltcG9ydCB0eXBlb2YgKiBhcyBEbnNVdGlsc1R5cGUgZnJvbSAnLi9kbnNfdXRpbHMnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIFByb21pc2VzVHlwZSBmcm9tICcuL3Byb21pc2VzJztcbmltcG9ydCB0eXBlb2YgKiBhcyBSZWdFeHBUeXBlIGZyb20gJy4vcmVnZXhwJztcbmltcG9ydCB0eXBlb2YgKiBhcyBFcnJvclR5cGUgZnJvbSAnLi9lcnJvcic7XG5pbXBvcnQgdHlwZW9mICogYXMgRXZlbnRUeXBlIGZyb20gJy4vZXZlbnQnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIFNlc3Npb25UeXBlIGZyb20gJy4vc2Vzc2lvbic7XG5pbXBvcnQgdHlwZW9mICogYXMgQ2lyY3VsYXJCdWZmZXJUeXBlIGZyb20gJy4vQ2lyY3VsYXJCdWZmZXInO1xuaW1wb3J0IHR5cGVvZiAqIGFzIENsaWVudEluZm9UeXBlIGZyb20gJy4vY2xpZW50SW5mbyc7XG5pbXBvcnQgdHlwZW9mICogYXMgU3lzdGVtSW5mb1R5cGUgZnJvbSAnLi9zeXN0ZW1JbmZvJztcbmltcG9ydCB0eXBlb2YgKiBhcyBSdW50aW1lSW5mb1R5cGUgZnJvbSAnLi9ydW50aW1lSW5mbyc7XG5pbXBvcnQgdHlwZW9mICogYXMgU2NyaWJlUHJvY2Vzc1R5cGUgZnJvbSAnLi9TY3JpYmVQcm9jZXNzJztcbmltcG9ydCB0eXBlb2YgKiBhcyBCYXRjaFByb2Nlc3NlZFF1ZXVlVHlwZSBmcm9tICcuL0JhdGNoUHJvY2Vzc2VkUXVldWUnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIEV4dGVuZGFibGVFcnJvclR5cGUgZnJvbSAnLi9FeHRlbmRhYmxlRXJyb3InO1xuaW1wb3J0IHR5cGVvZiAqIGFzIE9ic2VydmFibGVzVHlwZSBmcm9tICcuL29ic2VydmFibGVzJztcbmltcG9ydCB0eXBlIHtFbnZpcm9ubWVudCBhcyBFbnZpcm9ubWVudFR5cGV9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuXG4vLyBJdCdzIGltcGFjdGZ1bCB0byBtZW1vaXplIG91ciByZXF1aXJlcyBoZXJlIHNpbmNlIHRoZXNlIGNvbW1vbnMgYXJlIHNvIG9mdGVuIHVzZWQuXG5jb25zdCByZXF1aXJlQ2FjaGU6IHtbaWQ6IHN0cmluZ106IGFueX0gPSB7fTtcbmZ1bmN0aW9uIHJlcXVpcmVGcm9tQ2FjaGUoaWQ6IHN0cmluZyk6IGFueSB7XG4gIGlmICghcmVxdWlyZUNhY2hlLmhhc093blByb3BlcnR5KGlkKSkge1xuICAgIC8vICRGbG93SWdub3JlXG4gICAgcmVxdWlyZUNhY2hlW2lkXSA9IHJlcXVpcmUoaWQpO1xuICB9XG4gIHJldHVybiByZXF1aXJlQ2FjaGVbaWRdO1xufVxuXG5mdW5jdGlvbiByZXF1aXJlUHJvbWlzZXMoKTogUHJvbWlzZXNUeXBlIHtcbiAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvbWlzZXMnKTtcbn1cblxuZnVuY3Rpb24gcmVxdWlyZU9ic2VydmFibGVzKCk6IE9ic2VydmFibGVzVHlwZSB7XG4gIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL29ic2VydmFibGVzJyk7XG59XG5cbmZ1bmN0aW9uIHJlcXVpcmVQcm9jZXNzKCk6IFByb2Nlc3NUeXBlIHtcbiAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvY2VzcycpO1xufVxuXG5mdW5jdGlvbiByZXF1aXJlU3RyZWFtKCk6IFN0cmVhbVR5cGUge1xuICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9zdHJlYW0nKTtcbn1cblxuZnVuY3Rpb24gcmVxdWlyZVByb21pc2VFeGVjdXRvcnMoKTogUHJvbWlzZUV4ZWN1dG9yc1R5cGUge1xuICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9Qcm9taXNlRXhlY3V0b3JzJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGdldCBhc3luY0ZpbmQoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9taXNlcygpLmFzeW5jRmluZDtcbiAgfSxcblxuICBnZXQgYXN5bmNFeGVjdXRlKCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvY2VzcygpLmFzeW5jRXhlY3V0ZTtcbiAgfSxcblxuICBnZXQgYnVmZmVyVW50aWwoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVTdHJlYW0oKS5idWZmZXJVbnRpbDtcbiAgfSxcblxuICBnZXQgY2hlY2tPdXRwdXQoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9jZXNzKCkuY2hlY2tPdXRwdXQ7XG4gIH0sXG5cbiAgZ2V0IENvbXBvc2l0ZVN1YnNjcmlwdGlvbigpIHtcbiAgICByZXR1cm4gcmVxdWlyZVN0cmVhbSgpLkNvbXBvc2l0ZVN1YnNjcmlwdGlvbjtcbiAgfSxcblxuICBnZXQgY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9jZXNzKCkuY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQ7XG4gIH0sXG5cbiAgZ2V0IGNyZWF0ZUV4ZWNFbnZpcm9ubWVudCgpIHtcbiAgICByZXR1cm4gcmVxdWlyZVByb2Nlc3MoKS5jcmVhdGVFeGVjRW52aXJvbm1lbnQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIElNUE9SVEFOVDogWW91IHNob3VsZCBhbG1vc3QgbmV2ZXIgdXNlIHRoaXMhISBTZWUgYC4vcHJvbWlzZXMuanNgLlxuICAgKi9cbiAgZ2V0IERlZmVycmVkKCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvbWlzZXMoKS5EZWZlcnJlZDtcbiAgfSxcblxuICBnZXQgZGVub2RlaWZ5KCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvbWlzZXMoKS5kZW5vZGVpZnk7XG4gIH0sXG5cbiAgZ2V0IERpc3Bvc2FibGVTdWJzY3JpcHRpb24oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVTdHJlYW0oKS5EaXNwb3NhYmxlU3Vic2NyaXB0aW9uO1xuICB9LFxuXG4gIGdldCBmb3JrV2l0aEV4ZWNFbnZpcm9ubWVudCgpIHtcbiAgICByZXR1cm4gcmVxdWlyZVByb2Nlc3MoKS5mb3JrV2l0aEV4ZWNFbnZpcm9ubWVudDtcbiAgfSxcblxuICBnZXQgc2FmZVNwYXduKCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvY2VzcygpLnNhZmVTcGF3bjtcbiAgfSxcblxuICBnZXQgc2NyaXB0U2FmZVNwYXduKCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvY2VzcygpLnNjcmlwdFNhZmVTcGF3bjtcbiAgfSxcblxuICBnZXQgc2NyaXB0U2FmZVNwYXduQW5kT2JzZXJ2ZU91dHB1dCgpIHtcbiAgICByZXR1cm4gcmVxdWlyZVByb2Nlc3MoKS5zY3JpcHRTYWZlU3Bhd25BbmRPYnNlcnZlT3V0cHV0O1xuICB9LFxuXG4gIGdldCBzcGxpdFN0cmVhbSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZVN0cmVhbSgpLnNwbGl0U3RyZWFtO1xuICB9LFxuXG4gIGdldCBvYnNlcnZlU3RyZWFtKCkge1xuICAgIHJldHVybiByZXF1aXJlU3RyZWFtKCkub2JzZXJ2ZVN0cmVhbTtcbiAgfSxcblxuICBnZXQgb2JzZXJ2ZVByb2Nlc3NFeGl0KCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvY2VzcygpLm9ic2VydmVQcm9jZXNzRXhpdDtcbiAgfSxcblxuICBnZXQgb2JzZXJ2ZVByb2Nlc3MoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9jZXNzKCkub2JzZXJ2ZVByb2Nlc3M7XG4gIH0sXG5cbiAgZ2V0IHJlbGF0aXZlRGF0ZSgpIHtcbiAgICByZXR1cm4gKHJlcXVpcmVGcm9tQ2FjaGUoJy4vcmVsYXRpdmVEYXRlJyk6IFJlbGF0aXZlRGF0ZVR5cGUpLnJlbGF0aXZlRGF0ZTtcbiAgfSxcblxuICBnZXQgdG9Kc1N0cmluZygpIHtcbiAgICByZXR1cm4gKHJlcXVpcmVGcm9tQ2FjaGUoJy4vdG9Kc1N0cmluZycpOiBUb0pzU3RyaW5nVHlwZSkudG9Kc1N0cmluZztcbiAgfSxcblxuICBnZXQgYXJyYXkoKTogQXJyYXlUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9hcnJheScpO1xuICB9LFxuXG4gIGdldCBzZXQoKTogU2V0VHlwZSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vc2V0Jyk7XG4gIH0sXG5cbiAgZ2V0IG1hcCgpOiBNYXBUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9tYXAnKTtcbiAgfSxcblxuICBnZXQgb2JqZWN0KCk6IE9iamVjdFR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL29iamVjdCcpO1xuICB9LFxuXG4gIGdldCBmc1Byb21pc2UoKTogRlNQcm9taXNlVHlwZS5mc1Byb21pc2Uge1xuICAgIHJldHVybiAocmVxdWlyZUZyb21DYWNoZSgnLi9mc1Byb21pc2UnKTogRlNQcm9taXNlVHlwZSkuZnNQcm9taXNlO1xuICB9LFxuXG4gIGdldCBodHRwUHJvbWlzZSgpOiBIdHRwVHlwZSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vaHR0cCcpO1xuICB9LFxuXG4gIGdldCBwYXRocygpOiBQYXRoc1R5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3BhdGhzJyk7XG4gIH0sXG5cbiAgZ2V0IFByb21pc2VQb29sKCkge1xuICAgIHJldHVybiByZXF1aXJlUHJvbWlzZUV4ZWN1dG9ycygpLlByb21pc2VQb29sO1xuICB9LFxuXG4gIGdldCBQcm9taXNlUXVldWUoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9taXNlRXhlY3V0b3JzKCkuUHJvbWlzZVF1ZXVlO1xuICB9LFxuXG4gIGdldCBkZWJvdW5jZSgpIHtcbiAgICByZXR1cm4gKHJlcXVpcmVGcm9tQ2FjaGUoJy4vZGVib3VuY2UnKTogRGVib3VuY2VUeXBlKS5kZWJvdW5jZTtcbiAgfSxcblxuICBnZXQgb25jZSgpIHtcbiAgICByZXR1cm4gKHJlcXVpcmVGcm9tQ2FjaGUoJy4vb25jZScpOiBPbmNlVHlwZSkub25jZTtcbiAgfSxcblxuICBnZXQgdG9vbGJhcigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi90b29sYmFyJyk7XG4gIH0sXG5cbiAgZ2V0IHZjcygpOiBWY3NUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi92Y3MnKTtcbiAgfSxcblxuICBnZXQgZG5zVXRpbHMoKTogRG5zVXRpbHNUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9kbnNfdXRpbHMnKTtcbiAgfSxcblxuICBnZXQgZW52KCk6IEVudmlyb25tZW50VHlwZSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vZW52aXJvbm1lbnQnKTtcbiAgfSxcblxuICBnZXQgcHJvbWlzZXMoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVQcm9taXNlcygpO1xuICB9LFxuXG4gIGdldCBvYnNlcnZhYmxlcygpIHtcbiAgICByZXR1cm4gcmVxdWlyZU9ic2VydmFibGVzKCk7XG4gIH0sXG5cbiAgZ2V0IHJlZ2V4cCgpOiBSZWdFeHBUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9yZWdleHAnKTtcbiAgfSxcblxuICBnZXQgZXJyb3IoKTogRXJyb3JUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9lcnJvcicpO1xuICB9LFxuXG4gIGdldCBldmVudCgpOiBFdmVudFR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2V2ZW50Jyk7XG4gIH0sXG5cbiAgZ2V0IHNlc3Npb24oKTogU2Vzc2lvblR5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Nlc3Npb24nKTtcbiAgfSxcblxuICBnZXQgc2luZ2xldG9uKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3NpbmdsZXRvbicpO1xuICB9LFxuXG4gIGdldCBDaXJjdWxhckJ1ZmZlcigpIHtcbiAgICByZXR1cm4gKHJlcXVpcmVGcm9tQ2FjaGUoJy4vQ2lyY3VsYXJCdWZmZXInKTogQ2lyY3VsYXJCdWZmZXJUeXBlKS5DaXJjdWxhckJ1ZmZlcjtcbiAgfSxcblxuICBnZXQgQ09NTU9OX0JJTkFSWV9QQVRIUygpIHtcbiAgICByZXR1cm4gcmVxdWlyZVByb2Nlc3MoKS5DT01NT05fQklOQVJZX1BBVEhTO1xuICB9LFxuXG4gIGdldCBjbGllbnRJbmZvKCk6IENsaWVudEluZm9UeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9jbGllbnRJbmZvJyk7XG4gIH0sXG5cbiAgZ2V0IHN5c3RlbUluZm8oKTogU3lzdGVtSW5mb1R5cGUge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3N5c3RlbUluZm8nKTtcbiAgfSxcblxuICBnZXQgcnVudGltZUluZm8oKTogUnVudGltZUluZm9UeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9ydW50aW1lSW5mbycpO1xuICB9LFxuXG4gIGdldCBTY3JpYmVQcm9jZXNzKCkge1xuICAgIHJldHVybiAocmVxdWlyZUZyb21DYWNoZSgnLi9TY3JpYmVQcm9jZXNzJyk6IFNjcmliZVByb2Nlc3NUeXBlKS5TY3JpYmVQcm9jZXNzO1xuICB9LFxuXG4gIGdldCBCYXRjaFByb2Nlc3NlZFF1ZXVlKCkge1xuICAgIHJldHVybiAoXG4gICAgICByZXF1aXJlRnJvbUNhY2hlKCcuL0JhdGNoUHJvY2Vzc2VkUXVldWUnKTogQmF0Y2hQcm9jZXNzZWRRdWV1ZVR5cGVcbiAgICApLkJhdGNoUHJvY2Vzc2VkUXVldWU7XG4gIH0sXG5cbiAgZ2V0IEV4dGVuZGFibGVFcnJvcigpOiBFeHRlbmRhYmxlRXJyb3JUeXBlIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9FeHRlbmRhYmxlRXJyb3InKTtcbiAgfSxcblxuICBnZXQgcGFzc2VzR0soKTogKGdhdGVrZWVwZXJOYW1lOiBzdHJpbmcsIHRpbWVvdXQ/OiBudW1iZXIpID0+IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2dhdGVrZWVwZXInKS5wYXNzZXNHSztcbiAgfSxcbn07XG4iXX0=