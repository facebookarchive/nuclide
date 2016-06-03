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

exports.default = createStateStream;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ActionTypes2;

function _ActionTypes() {
  return _ActionTypes2 = _interopRequireWildcard(require('./ActionTypes'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

function createStateStream(action$, initialState) {
  return action$.scan(accumulateState, initialState);
}

function accumulateState(state, action) {
  switch (action.type) {
    case (_ActionTypes2 || _ActionTypes()).EXECUTE:
      {
        // No-op. This is only for side-effects.
        return state;
      }
    case (_ActionTypes2 || _ActionTypes()).MESSAGE_RECEIVED:
      {
        var record = action.payload.record;

        return _extends({}, state, {
          records: state.records.concat(record).slice(-state.maxMessageCount)
        });
      }
    case (_ActionTypes2 || _ActionTypes()).MAX_MESSAGE_COUNT_UPDATED:
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
    case (_ActionTypes2 || _ActionTypes()).PROVIDER_REGISTERED:
      {
        var _action$payload = action.payload;
        var recordProvider = _action$payload.recordProvider;
        var subscription = _action$payload.subscription;

        return _extends({}, state, {
          providers: new Map(state.providers).set(recordProvider.id, recordProvider),
          providerSubscriptions: new Map(state.providerSubscriptions).set(recordProvider.id, subscription)
        });
      }
    case (_ActionTypes2 || _ActionTypes()).RECORDS_CLEARED:
      {
        return _extends({}, state, {
          records: []
        });
      }
    case (_ActionTypes2 || _ActionTypes()).REGISTER_EXECUTOR:
      {
        var executor = action.payload.executor;

        return _extends({}, state, {
          executors: new Map(state.executors).set(executor.id, executor)
        });
      }
    case (_ActionTypes2 || _ActionTypes()).SELECT_EXECUTOR:
      {
        var executorId = action.payload.executorId;

        return _extends({}, state, {
          currentExecutorId: executorId
        });
      }
    case (_ActionTypes2 || _ActionTypes()).SOURCE_REMOVED:
      {
        var _source = action.payload.source;

        var providers = new Map(state.providers);
        var providerSubscriptions = new Map(state.providerSubscriptions);
        providers.delete(_source);
        providerSubscriptions.delete(_source);
        return _extends({}, state, {
          providers: providers,
          providerSubscriptions: providerSubscriptions
        });
      }
    case (_ActionTypes2 || _ActionTypes()).UNREGISTER_EXECUTOR:
      {
        var executor = action.payload.executor;

        var executors = new Map(state.executors);
        executors.delete(executor.id);
        return _extends({}, state, {
          executors: executors
        });
      }
  }

  throw new Error('Unrecognized action type: ' + action.type);
}
module.exports = exports.default;