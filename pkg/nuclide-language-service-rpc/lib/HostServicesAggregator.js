'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.forkHostServices = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let forkHostServices = exports.forkHostServices = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (host, logger) {
    const child = new HostServicesAggregator();
    const howChildShouldRelayBackToHost = yield host.childRegister(child);
    child.initialize(howChildShouldRelayBackToHost, logger);
    return child;

    // Here's an example tree of forked aggregators, with a vertical line to show
    // client-side objects on the left and server-side objects on the right.
    //
    // root            |
    //   <-> relayR0   |
    //   <-> relayR1 <-|-> aggregator
    //                 |    <-> relayA0
    //                 |    <-> relayA1 <-> child1
    //                 |    <-> relayA2 <-> child2
    //
    // If you call child1.consoleNotification(), it forwards to relayA1, which
    // forwards it on to relayR1. The buck stops at the root which is responsible
    // for displaying it.
    //
    // We also offer the same HostServices API on aggregator itself.
    // If you call aggregator.consoleNotification() it just dispatches to relayA0,
    // which behaves identically to relayA1 above. (We use relayA0 here, rather
    // than handling the call inside aggregator itself, to avoid code duplication)
    //
    // If you dispose child1, it relays news of its disposal via relayA1, which
    // removes it from aggregator's list of children.
    //
    // If you dispose aggregator, it disposes all of its remaining children, and
    // relays news of its disposal via relayR1, which removes it from root's
    // list of children.
    //
    // The call to 'root.childRegister(aggregator)' is what creates relayR1.
    // This call might be across nuclide-rpc, which is why childRegister has to
    // return a promise.
    //
    // Why do we use relays? so that each child can relay messages to its parent
    // aggregator, and so the parent aggregator can know which child that message
    // was relayed from, and so we can do all this without lots of duplicate
    // methods in the HostServices interface.
  });

  return function forkHostServices(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This is how we declare in Flow that a type fulfills an interface.
null; /**
       * Copyright (c) 2015-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the license found in the LICENSE file in
       * the root directory of this source tree.
       *
       * 
       * @format
       */

null;

class HostServicesAggregator {
  constructor() {
    this._childRelays = new Map();
    this._counter = 0;
  }

  initialize(parent, logger) {
    this._parent = parent;
    this._logger = logger;
    const relay = new HostServicesRelay(this, 0, null);
    this._childRelays.set(0, relay);
  }

  _selfRelay() {
    const relay = this._childRelays.get(0);

    if (!(relay != null)) {
      throw new Error('Invariant violation: "relay != null"');
    }

    return relay;
  }

  consoleNotification(source, level, text) {
    this._selfRelay().consoleNotification(source, level, text);
  }

  dialogNotification(level, text) {
    return this._selfRelay().dialogNotification(level, text);
  }

  dialogRequest(level, text, buttonLabels, closeLabel) {
    return this._selfRelay().dialogRequest(level, text, buttonLabels, closeLabel);
  }

  dispose() {
    // Folks call this "dispose" method to dispose of the aggregate and
    // all of its children.
    this._selfRelay()._childIsDisposed.next();
    for (const relay of this._childRelays.values()) {
      if (relay._child != null) {
        relay._child.dispose();
      }
    }
    // We'll throw a runtime exception upon any operations after dispose.
    this._childRelays = null;
    this._parent.dispose();
  }

  childRegister(child) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this._counter++;
      const relay = new HostServicesRelay(_this, _this._counter, child);
      _this._childRelays.set(_this._counter, relay);
      return relay;
    })();
  }
}

class HostServicesRelay {
  // signal by sending next().

  //
  constructor(aggregator, id, child) {
    this._childIsDisposed = new _rxjsBundlesRxMinJs.Subject();

    this._aggregator = aggregator;
    this._id = id;
    this._child = child;
  }

  consoleNotification(source, level, text) {
    this._aggregator._parent.consoleNotification(source, level, text);
  }

  dialogNotification(level, text) {
    return this._aggregator._parent.dialogNotification(level, text).refCount().takeUntil(this._childIsDisposed).publish();
    // If the host is disposed, then the ConnectedObservable we return will
    // complete without ever having emitted a value. If you .toPromise on it
    // your promise will complete successfully with value 'undefined'.
  }

  dialogRequest(level, text, buttonLabels, closeLabel) {
    return this._aggregator._parent.dialogRequest(level, text, buttonLabels, closeLabel).refCount().takeUntil(this._childIsDisposed).publish();
  }

  dispose() {
    // Remember, this is a notification relayed from one of the children that
    // it has just finished its "dispose" method. That's what a relay is.
    // It is *NOT* a means to dispose of this relay
    this._childIsDisposed.next();
    this._aggregator._childRelays.delete(this._id);
  }

  childRegister(child) {
    if (!false) {
      throw new Error('relay should never be asked to relay childRegister');
    }
  }
}