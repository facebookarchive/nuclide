"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerExecutorEpic = registerExecutorEpic;
exports.executeEpic = executeEpic;
exports.trackEpic = trackEpic;
exports.registerRecordProviderEpic = registerRecordProviderEpic;

function _event() {
  const data = require("../../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _getCurrentExecutorId() {
  const data = _interopRequireDefault(require("../getCurrentExecutorId"));

  _getCurrentExecutorId = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _analytics() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/analytics"));

  _analytics = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

/**
 * Register a record provider for every executor.
 */
function registerExecutorEpic(actions, store) {
  return actions.ofType(Actions().REGISTER_EXECUTOR).map(action => {
    if (!(action.type === Actions().REGISTER_EXECUTOR)) {
      throw new Error("Invariant violation: \"action.type === Actions.REGISTER_EXECUTOR\"");
    }

    const {
      executor
    } = action.payload;
    return Actions().registerRecordProvider({
      id: executor.id,
      // $FlowIssue: Flow is having some trouble with the spread here.
      records: executor.output.map(message => Object.assign({}, message, {
        kind: 'response',
        sourceId: executor.id,
        scopeName: null,
        // The output won't be in the language's grammar.
        // Eventually, we'll want to allow providers to specify custom timestamps for records.
        timestamp: new Date(),
        executor
      }))
    });
  });
}
/**
 * Execute the provided code using the current executor.
 */


function executeEpic(actions, store) {
  return actions.ofType(Actions().EXECUTE).flatMap(action => {
    if (!(action.type === Actions().EXECUTE)) {
      throw new Error("Invariant violation: \"action.type === Actions.EXECUTE\"");
    }

    const {
      code
    } = action.payload;
    const currentExecutorId = (0, _getCurrentExecutorId().default)(store.getState()); // flowlint-next-line sketchy-null-string:off

    if (!currentExecutorId) {
      throw new Error("Invariant violation: \"currentExecutorId\"");
    }

    const executor = store.getState().executors.get(currentExecutorId);

    if (!(executor != null)) {
      throw new Error("Invariant violation: \"executor != null\"");
    } // TODO: Is this the best way to do this? Might want to go through nuclide-executors and have
    //       that register output sources?


    return _RxMin.Observable.of(Actions().recordReceived({
      // Eventually, we'll want to allow providers to specify custom timestamps for records.
      timestamp: new Date(),
      sourceId: currentExecutorId,
      kind: 'request',
      level: 'log',
      text: code,
      scopeName: executor.scopeName,
      data: null,
      repeatCount: 1
    })) // Execute the code as a side-effect.
    .finally(() => {
      executor.send(code);
    });
  });
}

function trackEpic(actions, store) {
  return actions.ofType(Actions().EXECUTE).map(action => ({
    type: 'console:execute'
  })).do(_analytics().default.trackEvent).ignoreElements();
}

function registerRecordProviderEpic(actions, store) {
  return actions.ofType(Actions().REGISTER_RECORD_PROVIDER).flatMap(action => {
    if (!(action.type === Actions().REGISTER_RECORD_PROVIDER)) {
      throw new Error("Invariant violation: \"action.type === Actions.REGISTER_RECORD_PROVIDER\"");
    }

    const {
      recordProvider
    } = action.payload; // Transform the messages into actions and merge them into the action stream.
    // TODO: Add enabling/disabling of registered source and only subscribe when enabled. That
    //       way, we won't trigger cold observer side-effects when we don't need the results.

    const messageActions = recordProvider.records.map(Actions().recordReceived); // TODO: Can this be delayed until sometime after registration?

    const statusActions = // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
    typeof recordProvider.observeStatus === 'function' ? (0, _event().observableFromSubscribeFunction)(recordProvider.observeStatus).map(status => Actions().updateStatus(recordProvider.id, status)) : _RxMin.Observable.empty();
    const unregisteredEvents = actions.ofType(Actions().REMOVE_SOURCE).filter(a => {
      if (!(a.type === Actions().REMOVE_SOURCE)) {
        throw new Error("Invariant violation: \"a.type === Actions.REMOVE_SOURCE\"");
      }

      return a.payload.sourceId === recordProvider.id;
    });
    return _RxMin.Observable.merge(_RxMin.Observable.of(Actions().registerSource(Object.assign({}, recordProvider, {
      name: recordProvider.id
    }))), messageActions, statusActions).takeUntil(unregisteredEvents);
  });
}