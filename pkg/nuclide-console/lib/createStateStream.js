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

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

function createStateStream(action$, initialState) {
  return action$.scan(accumulateState, initialState);
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
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxDQUFDO0FBQ3pCLDZCQUFxQixVQUFPLENBQUMsT0FBTSxDQUFDLENBQUM7QUFDckMsNEJBQ0ssS0FBSztBQUNSLG1CQUFTLEVBQVQsU0FBUztBQUNULCtCQUFxQixFQUFyQixxQkFBcUI7V0FDckI7T0FDSDtBQUFBLEFBQ0QsU0FBSyxXQUFXLENBQUMsbUJBQW1CO0FBQUU7WUFDN0IsUUFBUSxHQUFJLE1BQU0sQ0FBQyxPQUFPLENBQTFCLFFBQVE7O0FBQ2YsWUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzNDLGlCQUFTLFVBQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsNEJBQ0ssS0FBSztBQUNSLG1CQUFTLEVBQVQsU0FBUztXQUNUO09BQ0g7QUFBQSxHQUNGOztBQUVELFFBQU0sSUFBSSxLQUFLLGdDQUE4QixNQUFNLENBQUMsSUFBSSxDQUFHLENBQUM7Q0FDN0QiLCJmaWxlIjoiY3JlYXRlU3RhdGVTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QXBwU3RhdGV9IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQgKiBhcyBBY3Rpb25UeXBlcyBmcm9tICcuL0FjdGlvblR5cGVzJztcbmltcG9ydCBSeCBmcm9tICdAcmVhY3RpdmV4L3J4anMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVTdGF0ZVN0cmVhbShcbiAgYWN0aW9uJDogUnguT2JzZXJ2YWJsZTxPYmplY3Q+LFxuICBpbml0aWFsU3RhdGU6IEFwcFN0YXRlLFxuKTogUnguT2JzZXJ2YWJsZTxBcHBTdGF0ZT4ge1xuICByZXR1cm4gYWN0aW9uJC5zY2FuKGFjY3VtdWxhdGVTdGF0ZSwgaW5pdGlhbFN0YXRlKTtcbn1cblxuZnVuY3Rpb24gYWNjdW11bGF0ZVN0YXRlKHN0YXRlOiBBcHBTdGF0ZSwgYWN0aW9uOiBPYmplY3QpOiBBcHBTdGF0ZSB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIEFjdGlvblR5cGVzLkVYRUNVVEU6IHtcbiAgICAgIC8vIE5vLW9wLiBUaGlzIGlzIG9ubHkgZm9yIHNpZGUtZWZmZWN0cy5cbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG4gICAgY2FzZSBBY3Rpb25UeXBlcy5NRVNTQUdFX1JFQ0VJVkVEOiB7XG4gICAgICBjb25zdCB7cmVjb3JkfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIHJlY29yZHM6IHN0YXRlLnJlY29yZHMuY29uY2F0KHJlY29yZCkuc2xpY2UoLXN0YXRlLm1heE1lc3NhZ2VDb3VudCksXG4gICAgICB9O1xuICAgIH1cbiAgICBjYXNlIEFjdGlvblR5cGVzLk1BWF9NRVNTQUdFX0NPVU5UX1VQREFURUQ6IHtcbiAgICAgIGNvbnN0IHttYXhNZXNzYWdlQ291bnR9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICBpZiAobWF4TWVzc2FnZUNvdW50IDw9IDApIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIG1heE1lc3NhZ2VDb3VudCxcbiAgICAgICAgcmVjb3Jkczogc3RhdGUucmVjb3Jkcy5zbGljZSgtbWF4TWVzc2FnZUNvdW50KSxcbiAgICAgIH07XG4gICAgfVxuICAgIGNhc2UgQWN0aW9uVHlwZXMuUFJPVklERVJfUkVHSVNURVJFRDoge1xuICAgICAgY29uc3Qge3JlY29yZFByb3ZpZGVyLCBzdWJzY3JpcHRpb259ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgcHJvdmlkZXJzOiBuZXcgTWFwKHN0YXRlLnByb3ZpZGVycykuc2V0KHJlY29yZFByb3ZpZGVyLnNvdXJjZSwgcmVjb3JkUHJvdmlkZXIpLFxuICAgICAgICBwcm92aWRlclN1YnNjcmlwdGlvbnM6XG4gICAgICAgICAgbmV3IE1hcChzdGF0ZS5wcm92aWRlclN1YnNjcmlwdGlvbnMpLnNldChyZWNvcmRQcm92aWRlci5zb3VyY2UsIHN1YnNjcmlwdGlvbiksXG4gICAgICB9O1xuICAgIH1cbiAgICBjYXNlIEFjdGlvblR5cGVzLlJFQ09SRFNfQ0xFQVJFRDoge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIHJlY29yZHM6IFtdLFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBBY3Rpb25UeXBlcy5SRUdJU1RFUl9FWEVDVVRPUjoge1xuICAgICAgY29uc3Qge2V4ZWN1dG9yfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIGV4ZWN1dG9yczogbmV3IE1hcChzdGF0ZS5leGVjdXRvcnMpLnNldChleGVjdXRvci5pZCwgZXhlY3V0b3IpLFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBBY3Rpb25UeXBlcy5TRUxFQ1RfRVhFQ1VUT1I6IHtcbiAgICAgIGNvbnN0IHtleGVjdXRvcklkfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIGN1cnJlbnRFeGVjdXRvcklkOiBleGVjdXRvcklkLFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBBY3Rpb25UeXBlcy5TT1VSQ0VfUkVNT1ZFRDoge1xuICAgICAgY29uc3Qge3NvdXJjZX0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIGNvbnN0IHByb3ZpZGVycyA9IG5ldyBNYXAoc3RhdGUucHJvdmlkZXJzKTtcbiAgICAgIGNvbnN0IHByb3ZpZGVyU3Vic2NyaXB0aW9ucyA9IG5ldyBNYXAoc3RhdGUucHJvdmlkZXJTdWJzY3JpcHRpb25zKTtcbiAgICAgIHByb3ZpZGVycy5kZWxldGUoc291cmNlKTtcbiAgICAgIHByb3ZpZGVyU3Vic2NyaXB0aW9ucy5kZWxldGUoc291cmNlKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBwcm92aWRlcnMsXG4gICAgICAgIHByb3ZpZGVyU3Vic2NyaXB0aW9ucyxcbiAgICAgIH07XG4gICAgfVxuICAgIGNhc2UgQWN0aW9uVHlwZXMuVU5SRUdJU1RFUl9FWEVDVVRPUjoge1xuICAgICAgY29uc3Qge2V4ZWN1dG9yfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgY29uc3QgZXhlY3V0b3JzID0gbmV3IE1hcChzdGF0ZS5leGVjdXRvcnMpO1xuICAgICAgZXhlY3V0b3JzLmRlbGV0ZShleGVjdXRvci5pZCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgZXhlY3V0b3JzLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoYFVucmVjb2duaXplZCBhY3Rpb24gdHlwZTogJHthY3Rpb24udHlwZX1gKTtcbn1cbiJdfQ==