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

exports.registerExecutorEpic = registerExecutorEpic;
exports.executeEpic = executeEpic;
exports.registerRecordProviderEpic = registerRecordProviderEpic;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../../commons-node/event');
}

var _Actions2;

function _Actions() {
  return _Actions2 = _interopRequireWildcard(require('./Actions'));
}

var _getCurrentExecutorId2;

function _getCurrentExecutorId() {
  return _getCurrentExecutorId2 = _interopRequireDefault(require('../getCurrentExecutorId'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

/**
 * Register a record provider for every executor.
 */

function registerExecutorEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).REGISTER_EXECUTOR).map(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).REGISTER_EXECUTOR);
    var executor = action.payload.executor;

    return (_Actions2 || _Actions()).registerRecordProvider({
      id: executor.id,
      records: executor.output.map(function (message) {
        return _extends({}, message, {
          kind: 'response',
          sourceId: executor.id,
          scopeName: null });
      })
    });
  });
}

/**
 * Execute the provided code using the current executor.
 */
// The output won't be in the language's grammar.

function executeEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).EXECUTE).flatMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).EXECUTE);
    var code = action.payload.code;

    var currentExecutorId = (0, (_getCurrentExecutorId2 || _getCurrentExecutorId()).default)(store.getState());
    (0, (_assert2 || _assert()).default)(currentExecutorId);

    var executor = store.getState().executors.get(currentExecutorId);
    (0, (_assert2 || _assert()).default)(executor != null);

    // TODO: Is this the best way to do this? Might want to go through nuclide-executors and have
    //       that register output sources?
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).recordReceived({
      sourceId: currentExecutorId,
      kind: 'request',
      level: 'log',
      text: code,
      scopeName: executor.scopeName
    }))
    // Execute the code as a side-effect.
    .finally(function () {
      executor.send(code);
    });
  });
}

function registerRecordProviderEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).REGISTER_RECORD_PROVIDER).flatMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).REGISTER_RECORD_PROVIDER);
    var recordProvider = action.payload.recordProvider;

    // Transform the messages into actions and merge them into the action stream.
    // TODO: Add enabling/disabling of registered source and only subscribe when enabled. That
    //       way, we won't trigger cold observer side-effects when we don't need the results.
    var messageActions = recordProvider.records.map((_Actions2 || _Actions()).recordReceived);

    // TODO: Can this be delayed until sometime after registration?
    var statusActions = typeof recordProvider.observeStatus === 'function' ? (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(recordProvider.observeStatus).map(function (status) {
      return (_Actions2 || _Actions()).updateStatus(recordProvider.id, status);
    }) : (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();

    var unregisteredEvents = actions.ofType((_Actions2 || _Actions()).REMOVE_SOURCE).filter(function (a) {
      (0, (_assert2 || _assert()).default)(a.type === (_Actions2 || _Actions()).REMOVE_SOURCE);
      return a.payload.sourceId === recordProvider.id;
    });

    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge(messageActions, statusActions).takeUntil(unregisteredEvents);
  });
}