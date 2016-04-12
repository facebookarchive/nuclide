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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = createStateStream;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ActionTypes = require('./ActionTypes');

var ActionTypes = _interopRequireWildcard(_ActionTypes);

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

function createStateStream(action$, initialState) {
  var state$ = new _rx2['default'].BehaviorSubject(initialState);
  action$.scan(accumulateState, initialState).throttle(100).subscribe(state$);
  return state$;
}

function accumulateState(state, action) {
  switch (action.type) {
    case ActionTypes.EXECUTE:
      {
        // No-op. This is only for side-effects.
        return state;
      }
    case ActionTypes.MESSAGE_RECEIVED:
      {
        var record = action.payload.record;

        return _extends({}, state, {
          records: state.records.concat(record).slice(-state.maxMessageCount)
        });
      }
    case ActionTypes.MAX_MESSAGE_COUNT_UPDATED:
      {
        var maxMessageCount = action.payload.maxMessageCount;

        if (maxMessageCount <= 0) {
          return state;
        }
        return _extends({}, state, {
          maxMessageCount: maxMessageCount,
          records: state.records.slice(-maxMessageCount)
        });
      }
    case ActionTypes.PROVIDER_REGISTERED:
      {
        var _action$payload = action.payload;
        var recordProvider = _action$payload.recordProvider;
        var subscription = _action$payload.subscription;

        return _extends({}, state, {
          providers: new Map(state.providers).set(recordProvider.source, recordProvider),
          providerSubscriptions: new Map(state.providerSubscriptions).set(recordProvider.source, subscription)
        });
      }
    case ActionTypes.RECORDS_CLEARED:
      {
        return _extends({}, state, {
          records: []
        });
      }
    case ActionTypes.REGISTER_EXECUTOR:
      {
        var executor = action.payload.executor;

        return _extends({}, state, {
          executors: new Map(state.executors).set(executor.id, executor)
        });
      }
    case ActionTypes.SELECT_EXECUTOR:
      {
        var executorId = action.payload.executorId;

        return _extends({}, state, {
          currentExecutorId: executorId
        });
      }
    case ActionTypes.SOURCE_REMOVED:
      {
        var _source = action.payload.source;

        var providers = new Map(state.providers);
        var providerSubscriptions = new Map(state.providerSubscriptions);
        providers['delete'](_source);
        providerSubscriptions['delete'](_source);
        return _extends({}, state, {
          providers: providers,
          providerSubscriptions: providerSubscriptions
        });
      }
    case ActionTypes.UNREGISTER_EXECUTOR:
      {
        var executor = action.payload.executor;

        var executors = new Map(state.executors);
        executors['delete'](executor.id);
        return _extends({}, state, {
          executors: executors
        });
      }
  }

  throw new Error('Unrecognized action type: ' + action.type);
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzNDLFlBQU0scUJBQXFCLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDbkUsaUJBQVMsVUFBTyxDQUFDLE9BQU0sQ0FBQyxDQUFDO0FBQ3pCLDZCQUFxQixVQUFPLENBQUMsT0FBTSxDQUFDLENBQUM7QUFDckMsNEJBQ0ssS0FBSztBQUNSLG1CQUFTLEVBQVQsU0FBUztBQUNULCtCQUFxQixFQUFyQixxQkFBcUI7V0FDckI7T0FDSDtBQUFBLEFBQ0QsU0FBSyxXQUFXLENBQUMsbUJBQW1CO0FBQUU7WUFDN0IsUUFBUSxHQUFJLE1BQU0sQ0FBQyxPQUFPLENBQTFCLFFBQVE7O0FBQ2YsWUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzNDLGlCQUFTLFVBQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsNEJBQ0ssS0FBSztBQUNSLG1CQUFTLEVBQVQsU0FBUztXQUNUO09BQ0g7QUFBQSxHQUNGOztBQUVELFFBQU0sSUFBSSxLQUFLLGdDQUE4QixNQUFNLENBQUMsSUFBSSxDQUFHLENBQUM7Q0FDN0QiLCJmaWxlIjoiY3JlYXRlU3RhdGVTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QXBwU3RhdGV9IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQgKiBhcyBBY3Rpb25UeXBlcyBmcm9tICcuL0FjdGlvblR5cGVzJztcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVN0YXRlU3RyZWFtKFxuICBhY3Rpb24kOiBSeC5PYnNlcnZhYmxlPE9iamVjdD4sXG4gIGluaXRpYWxTdGF0ZTogQXBwU3RhdGUsXG4pOiBSeC5CZWhhdmlvclN1YmplY3Q8QXBwU3RhdGU+IHtcbiAgY29uc3Qgc3RhdGUkID0gbmV3IFJ4LkJlaGF2aW9yU3ViamVjdChpbml0aWFsU3RhdGUpO1xuICBhY3Rpb24kLnNjYW4oYWNjdW11bGF0ZVN0YXRlLCBpbml0aWFsU3RhdGUpXG4gICAgLnRocm90dGxlKDEwMClcbiAgICAuc3Vic2NyaWJlKHN0YXRlJCk7XG4gIHJldHVybiBzdGF0ZSQ7XG59XG5cbmZ1bmN0aW9uIGFjY3VtdWxhdGVTdGF0ZShzdGF0ZTogQXBwU3RhdGUsIGFjdGlvbjogT2JqZWN0KTogQXBwU3RhdGUge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBBY3Rpb25UeXBlcy5FWEVDVVRFOiB7XG4gICAgICAvLyBOby1vcC4gVGhpcyBpcyBvbmx5IGZvciBzaWRlLWVmZmVjdHMuXG4gICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuICAgIGNhc2UgQWN0aW9uVHlwZXMuTUVTU0FHRV9SRUNFSVZFRDoge1xuICAgICAgY29uc3Qge3JlY29yZH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICByZWNvcmRzOiBzdGF0ZS5yZWNvcmRzLmNvbmNhdChyZWNvcmQpLnNsaWNlKC1zdGF0ZS5tYXhNZXNzYWdlQ291bnQpLFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBBY3Rpb25UeXBlcy5NQVhfTUVTU0FHRV9DT1VOVF9VUERBVEVEOiB7XG4gICAgICBjb25zdCB7bWF4TWVzc2FnZUNvdW50fSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgaWYgKG1heE1lc3NhZ2VDb3VudCA8PSAwKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBtYXhNZXNzYWdlQ291bnQsXG4gICAgICAgIHJlY29yZHM6IHN0YXRlLnJlY29yZHMuc2xpY2UoLW1heE1lc3NhZ2VDb3VudCksXG4gICAgICB9O1xuICAgIH1cbiAgICBjYXNlIEFjdGlvblR5cGVzLlBST1ZJREVSX1JFR0lTVEVSRUQ6IHtcbiAgICAgIGNvbnN0IHtyZWNvcmRQcm92aWRlciwgc3Vic2NyaXB0aW9ufSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIHByb3ZpZGVyczogbmV3IE1hcChzdGF0ZS5wcm92aWRlcnMpLnNldChyZWNvcmRQcm92aWRlci5zb3VyY2UsIHJlY29yZFByb3ZpZGVyKSxcbiAgICAgICAgcHJvdmlkZXJTdWJzY3JpcHRpb25zOlxuICAgICAgICAgIG5ldyBNYXAoc3RhdGUucHJvdmlkZXJTdWJzY3JpcHRpb25zKS5zZXQocmVjb3JkUHJvdmlkZXIuc291cmNlLCBzdWJzY3JpcHRpb24pLFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBBY3Rpb25UeXBlcy5SRUNPUkRTX0NMRUFSRUQ6IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICByZWNvcmRzOiBbXSxcbiAgICAgIH07XG4gICAgfVxuICAgIGNhc2UgQWN0aW9uVHlwZXMuUkVHSVNURVJfRVhFQ1VUT1I6IHtcbiAgICAgIGNvbnN0IHtleGVjdXRvcn0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBleGVjdXRvcnM6IG5ldyBNYXAoc3RhdGUuZXhlY3V0b3JzKS5zZXQoZXhlY3V0b3IuaWQsIGV4ZWN1dG9yKSxcbiAgICAgIH07XG4gICAgfVxuICAgIGNhc2UgQWN0aW9uVHlwZXMuU0VMRUNUX0VYRUNVVE9SOiB7XG4gICAgICBjb25zdCB7ZXhlY3V0b3JJZH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBjdXJyZW50RXhlY3V0b3JJZDogZXhlY3V0b3JJZCxcbiAgICAgIH07XG4gICAgfVxuICAgIGNhc2UgQWN0aW9uVHlwZXMuU09VUkNFX1JFTU9WRUQ6IHtcbiAgICAgIGNvbnN0IHtzb3VyY2V9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICBjb25zdCBwcm92aWRlcnMgPSBuZXcgTWFwKHN0YXRlLnByb3ZpZGVycyk7XG4gICAgICBjb25zdCBwcm92aWRlclN1YnNjcmlwdGlvbnMgPSBuZXcgTWFwKHN0YXRlLnByb3ZpZGVyU3Vic2NyaXB0aW9ucyk7XG4gICAgICBwcm92aWRlcnMuZGVsZXRlKHNvdXJjZSk7XG4gICAgICBwcm92aWRlclN1YnNjcmlwdGlvbnMuZGVsZXRlKHNvdXJjZSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgcHJvdmlkZXJzLFxuICAgICAgICBwcm92aWRlclN1YnNjcmlwdGlvbnMsXG4gICAgICB9O1xuICAgIH1cbiAgICBjYXNlIEFjdGlvblR5cGVzLlVOUkVHSVNURVJfRVhFQ1VUT1I6IHtcbiAgICAgIGNvbnN0IHtleGVjdXRvcn0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIGNvbnN0IGV4ZWN1dG9ycyA9IG5ldyBNYXAoc3RhdGUuZXhlY3V0b3JzKTtcbiAgICAgIGV4ZWN1dG9ycy5kZWxldGUoZXhlY3V0b3IuaWQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIGV4ZWN1dG9ycyxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKGBVbnJlY29nbml6ZWQgYWN0aW9uIHR5cGU6ICR7YWN0aW9uLnR5cGV9YCk7XG59XG4iXX0=