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
        var outputProvider = action.payload.outputProvider;

        return _extends({}, state, {
          providers: new Map(state.providers).set(outputProvider.source, outputProvider)
        });
      }
    case ActionTypes.RECORDS_CLEARED:
      {
        return _extends({}, state, {
          records: []
        });
      }
    case ActionTypes.SOURCE_REMOVED:
      {
        var _source = action.payload.source;

        var providers = new Map(state.providers);
        providers['delete'](_source);
        return _extends({}, state, {
          providers: providers
        });
      }
  }

  throw new Error('Unrecognized action type: ' + action.type);
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZVN0YXRlU3RyZWFtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3FCQWdCd0IsaUJBQWlCOzs7Ozs7MkJBSFosZUFBZTs7SUFBaEMsV0FBVzs7a0JBQ1IsSUFBSTs7OztBQUVKLFNBQVMsaUJBQWlCLENBQ3ZDLE9BQThCLEVBQzlCLFlBQXNCLEVBQ1E7QUFDOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxnQkFBRyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEQsU0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsWUFBWSxDQUFDLENBQ3hDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FDYixTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDckIsU0FBTyxNQUFNLENBQUM7Q0FDZjs7QUFFRCxTQUFTLGVBQWUsQ0FBQyxLQUFlLEVBQUUsTUFBYyxFQUFZO0FBQ2xFLFVBQVEsTUFBTSxDQUFDLElBQUk7QUFDakIsU0FBSyxXQUFXLENBQUMsZ0JBQWdCO0FBQUU7WUFDMUIsTUFBTSxHQUFJLE1BQU0sQ0FBQyxPQUFPLENBQXhCLE1BQU07O0FBQ2IsNEJBQ0ssS0FBSztBQUNSLGlCQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztXQUNuRTtPQUNIO0FBQUEsQUFDRCxTQUFLLFdBQVcsQ0FBQyx5QkFBeUI7QUFBRTtZQUNuQyxlQUFlLEdBQUksTUFBTSxDQUFDLE9BQU8sQ0FBakMsZUFBZTs7QUFDdEIsWUFBSSxlQUFlLElBQUksQ0FBQyxFQUFFO0FBQ3hCLGlCQUFPLEtBQUssQ0FBQztTQUNkO0FBQ0QsNEJBQ0ssS0FBSztBQUNSLHlCQUFlLEVBQWYsZUFBZTtBQUNmLGlCQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxlQUFlLENBQUM7V0FDOUM7T0FDSDtBQUFBLEFBQ0QsU0FBSyxXQUFXLENBQUMsbUJBQW1CO0FBQUU7WUFDN0IsY0FBYyxHQUFJLE1BQU0sQ0FBQyxPQUFPLENBQWhDLGNBQWM7O0FBQ3JCLDRCQUNLLEtBQUs7QUFDUixtQkFBUyxFQUFFLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUM7V0FDOUU7T0FDSDtBQUFBLEFBQ0QsU0FBSyxXQUFXLENBQUMsZUFBZTtBQUFFO0FBQ2hDLDRCQUNLLEtBQUs7QUFDUixpQkFBTyxFQUFFLEVBQUU7V0FDWDtPQUNIO0FBQUEsQUFDRCxTQUFLLFdBQVcsQ0FBQyxjQUFjO0FBQUU7WUFDeEIsT0FBTSxHQUFJLE1BQU0sQ0FBQyxPQUFPLENBQXhCLE1BQU07O0FBQ2IsWUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzNDLGlCQUFTLFVBQU8sQ0FBQyxPQUFNLENBQUMsQ0FBQztBQUN6Qiw0QkFDSyxLQUFLO0FBQ1IsbUJBQVMsRUFBVCxTQUFTO1dBQ1Q7T0FDSDtBQUFBLEdBQ0Y7O0FBRUQsUUFBTSxJQUFJLEtBQUssZ0NBQThCLE1BQU0sQ0FBQyxJQUFJLENBQUcsQ0FBQztDQUM3RCIsImZpbGUiOiJjcmVhdGVTdGF0ZVN0cmVhbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtBcHBTdGF0ZX0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCAqIGFzIEFjdGlvblR5cGVzIGZyb20gJy4vQWN0aW9uVHlwZXMnO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlU3RhdGVTdHJlYW0oXG4gIGFjdGlvbiQ6IFJ4Lk9ic2VydmFibGU8T2JqZWN0PixcbiAgaW5pdGlhbFN0YXRlOiBBcHBTdGF0ZSxcbik6IFJ4LkJlaGF2aW9yU3ViamVjdDxBcHBTdGF0ZT4ge1xuICBjb25zdCBzdGF0ZSQgPSBuZXcgUnguQmVoYXZpb3JTdWJqZWN0KGluaXRpYWxTdGF0ZSk7XG4gIGFjdGlvbiQuc2NhbihhY2N1bXVsYXRlU3RhdGUsIGluaXRpYWxTdGF0ZSlcbiAgICAudGhyb3R0bGUoMTAwKVxuICAgIC5zdWJzY3JpYmUoc3RhdGUkKTtcbiAgcmV0dXJuIHN0YXRlJDtcbn1cblxuZnVuY3Rpb24gYWNjdW11bGF0ZVN0YXRlKHN0YXRlOiBBcHBTdGF0ZSwgYWN0aW9uOiBPYmplY3QpOiBBcHBTdGF0ZSB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIEFjdGlvblR5cGVzLk1FU1NBR0VfUkVDRUlWRUQ6IHtcbiAgICAgIGNvbnN0IHtyZWNvcmR9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgcmVjb3Jkczogc3RhdGUucmVjb3Jkcy5jb25jYXQocmVjb3JkKS5zbGljZSgtc3RhdGUubWF4TWVzc2FnZUNvdW50KSxcbiAgICAgIH07XG4gICAgfVxuICAgIGNhc2UgQWN0aW9uVHlwZXMuTUFYX01FU1NBR0VfQ09VTlRfVVBEQVRFRDoge1xuICAgICAgY29uc3Qge21heE1lc3NhZ2VDb3VudH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIGlmIChtYXhNZXNzYWdlQ291bnQgPD0gMCkge1xuICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgbWF4TWVzc2FnZUNvdW50LFxuICAgICAgICByZWNvcmRzOiBzdGF0ZS5yZWNvcmRzLnNsaWNlKC1tYXhNZXNzYWdlQ291bnQpLFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBBY3Rpb25UeXBlcy5QUk9WSURFUl9SRUdJU1RFUkVEOiB7XG4gICAgICBjb25zdCB7b3V0cHV0UHJvdmlkZXJ9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgcHJvdmlkZXJzOiBuZXcgTWFwKHN0YXRlLnByb3ZpZGVycykuc2V0KG91dHB1dFByb3ZpZGVyLnNvdXJjZSwgb3V0cHV0UHJvdmlkZXIpLFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBBY3Rpb25UeXBlcy5SRUNPUkRTX0NMRUFSRUQ6IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICByZWNvcmRzOiBbXSxcbiAgICAgIH07XG4gICAgfVxuICAgIGNhc2UgQWN0aW9uVHlwZXMuU09VUkNFX1JFTU9WRUQ6IHtcbiAgICAgIGNvbnN0IHtzb3VyY2V9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICBjb25zdCBwcm92aWRlcnMgPSBuZXcgTWFwKHN0YXRlLnByb3ZpZGVycyk7XG4gICAgICBwcm92aWRlcnMuZGVsZXRlKHNvdXJjZSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgcHJvdmlkZXJzLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoYFVucmVjb2duaXplZCBhY3Rpb24gdHlwZTogJHthY3Rpb24udHlwZX1gKTtcbn1cbiJdfQ==