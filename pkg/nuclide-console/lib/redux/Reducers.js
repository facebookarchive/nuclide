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

exports.default = accumulateState;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _Actions2;

function _Actions() {
  return _Actions2 = _interopRequireWildcard(require('./Actions'));
}

function accumulateState(state, action) {
  switch (action.type) {
    case (_Actions2 || _Actions()).RECORD_RECEIVED:
      {
        var record = action.payload.record;

        return _extends({}, state, {
          records: state.records.concat(record).slice(-state.maxMessageCount)
        });
      }
    case (_Actions2 || _Actions()).SET_MAX_MESSAGE_COUNT:
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
    case (_Actions2 || _Actions()).REGISTER_RECORD_PROVIDER:
      {
        var recordProvider = action.payload.recordProvider;

        return _extends({}, state, {
          providers: new Map(state.providers).set(recordProvider.id, recordProvider)
        });
      }
    case (_Actions2 || _Actions()).CLEAR_RECORDS:
      {
        return _extends({}, state, {
          records: []
        });
      }
    case (_Actions2 || _Actions()).REGISTER_EXECUTOR:
      {
        var executor = action.payload.executor;

        return _extends({}, state, {
          executors: new Map(state.executors).set(executor.id, executor)
        });
      }
    case (_Actions2 || _Actions()).SELECT_EXECUTOR:
      {
        var executorId = action.payload.executorId;

        return _extends({}, state, {
          currentExecutorId: executorId
        });
      }
    case (_Actions2 || _Actions()).REMOVE_SOURCE:
      {
        var sourceId = action.payload.sourceId;

        var providers = new Map(state.providers);
        var providerStatuses = new Map(state.providerStatuses);
        var executors = new Map(state.executors);
        providers.delete(sourceId);
        providerStatuses.delete(sourceId);
        executors.delete(sourceId);
        return _extends({}, state, {
          providers: providers,
          providerStatuses: providerStatuses,
          executors: executors
        });
      }
    case (_Actions2 || _Actions()).UPDATE_STATUS:
      {
        var _action$payload = action.payload;
        var _status = _action$payload.status;
        var providerId = _action$payload.providerId;

        return _extends({}, state, {
          providerStatuses: new Map(state.providerStatuses).set(providerId, _status)
        });
      }
  }

  return state;
}

module.exports = exports.default;