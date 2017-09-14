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

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This is how we declare in Flow that a type fulfills an interface.
/**
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

  applyTextEditsForMultipleFiles(changes) {
    return this._selfRelay().applyTextEditsForMultipleFiles(changes);
  }

  dialogRequest(level, text, buttonLabels, closeLabel) {
    return this._selfRelay().dialogRequest(level, text, buttonLabels, closeLabel);
  }

  showProgress(title, options) {
    return this._selfRelay().showProgress(title, options);
  }

  showActionRequired(title, options) {
    return this._selfRelay().showActionRequired(title, options);
  }

  // Call 'dispose' to dispose of the aggregate and all its children
  dispose() {
    // We'll explicitly dispose of everything that our own self relay keeps
    // track of (e.g. outstanding busy signals, notifications, ...)
    this._selfRelay()._disposables.dispose();

    // Next, for every child aggregate, tell it to dispose itself too.
    // The relay.child will notify the relay that it has been disposed, and
    // that's when the relay will do any further cleanup.
    // Note: _selfRelay is the only member of _childRelays that lacks _child.
    for (const relay of this._childRelays.values()) {
      if (relay._child != null) {
        relay._child.dispose();
      }
    }

    // We'll throw a runtime exception upon any operations after dispose.
    this._childRelays = null;

    // Finally, relay to our parent that we've been disposed.
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
  // _childIsDisposed is consumed by using observable.takeUntil(_childIsDisposed),
  // which unsubscribes from 'obs' as soon as _childIsDisposed.next() gets
  // fired. It is signaled by calling _disposables.dispose(), which fires
  // the _childIsDisposed.next().
  constructor(aggregator, id, child) {
    this._childIsDisposed = new _rxjsBundlesRxMinJs.Subject();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    this._aggregator = aggregator;
    this._id = id;
    this._child = child;
    this._disposables.add(() => {
      this._childIsDisposed.next();
    });
  }
  //


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

  applyTextEditsForMultipleFiles(changes) {
    return this._aggregator._parent.applyTextEditsForMultipleFiles(changes);
  }

  showProgress(title, options) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // TODO: this whole function would work better with CancellationToken,
      // particularly in the case where a HostAggregator is disposed after the
      // request has already been sent out to its parent. In the absence of
      // CancellationToken, we can't cancel the parent, and instead have to
      const no_op = {
        setTitle: function (_) {},
        dispose: function () {}
      };

      // If we're already resolved, then return a no-op wrapper.
      if (_this2._disposables.disposed) {
        return no_op;
      }

      // Otherwise, we are going to make a request to our parent.
      const parentPromise = _this2._aggregator._parent.showProgress(title, options);
      const cancel = _this2._childIsDisposed.toPromise();
      let progress = yield Promise.race([parentPromise, cancel]);

      // Should a cancellation come while we're waiting for our parent,
      // then we'll immediately return a no-op wrapper and ensure that
      // the one from our parent will eventually be disposed.
      // The "or" check below is in case both parentPromise and cancel were
      // both signalled, and parentPromise happened to win the race.
      if (progress == null || _this2._disposables.disposed) {
        parentPromise.then(function (progress2) {
          return progress2.dispose();
        });
        return no_op;
      }

      // Here our parent has already displayed 'winner'. It will be disposed
      // either when we ourselves get disposed, or when our caller disposes
      // of the wrapper we return them, whichever happens first.
      const wrapper = {
        setTitle: function (title2) {
          if (progress != null) {
            progress.setTitle(title2);
          }
        },
        dispose: function () {
          _this2._disposables.remove(wrapper);
          if (progress != null) {
            progress.dispose();
            progress = null;
          }
        }
      };
      _this2._disposables.add(wrapper);
      return wrapper;
    })();
  }

  showActionRequired(title, options) {
    return this._aggregator._parent.showActionRequired(title, options).refCount().takeUntil(this._childIsDisposed).publish();
  }

  dispose() {
    if (!this._disposables.disposed) {
      // Remember, this is a notification relayed from one of the children that
      // it has just finished its "dispose" method. That's what a relay is.
      // It is *NOT* a means to dispose of this relay
      this._disposables.dispose();
      this._aggregator._childRelays.delete(this._id);
    }
  }

  childRegister(child) {
    if (!false) {
      throw new Error('relay should never be asked to relay childRegister');
    }
  }
}