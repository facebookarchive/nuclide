"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.forkHostServices = forkHostServices;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
// This is how we declare in Flow that a type fulfills an interface.
null;
null;

async function forkHostServices(host, logger) {
  const child = new HostServicesAggregator();
  const howChildShouldRelayBackToHost = await host.childRegister(child);
  child.initialize(howChildShouldRelayBackToHost, logger);
  return child; // Here's an example tree of forked aggregators, with a vertical line to show
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
}

class HostServicesAggregator {
  constructor() {
    this._childRelays = new Map();
    this._counter = 0;
    this._isDisposed = false;
    // HostServiceAggregator objects are only ever constructed from forkHostServices:
    // 1. it calls the constructor (here)
    // 2. it calls parent.childRegister(child)
    // 3. it calls child.initialize(parent)
    const relay = new HostServicesRelay(this, 0, null);

    this._childRelays.set(0, relay);
  }

  initialize(parent, logger) {
    this._parent = parent;
    this._logger = logger;
  }

  _selfRelay() {
    const relay = this._childRelays.get(0);

    if (!(relay != null)) {
      throw new Error("Invariant violation: \"relay != null\"");
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

  dispatchCommand(command, params) {
    return this._selfRelay().dispatchCommand(command, params);
  }

  isDisposed() {
    return this._isDisposed;
  } // Call 'dispose' to dispose of the aggregate and all its children


  dispose() {
    // Guard against double-disposal (see below).
    if (this._isDisposed) {
      return;
    } // We'll explicitly dispose of everything that our own self relay keeps
    // track of (e.g. outstanding busy signals, notifications, ...)


    this._selfRelay()._disposables.dispose(); // Next, for every child aggregate, tell it to dispose itself too.
    // The relay.child will notify the relay that it has been disposed, and
    // that's when the relay will do any further cleanup.
    // Note: _selfRelay is the only member of _childRelays that lacks _child.


    for (const relay of this._childRelays.values()) {
      if (relay._child != null) {
        relay._child.dispose();
      }
    }

    this._isDisposed = true; // Finally, relay to our parent that we've been disposed.

    if (this._parent != null) {
      // If our parent were already disposed at the time forkHostServices was
      // called, then its childRegister method would have disposed us even before
      // our _parent was hooked up.
      this._parent.dispose();
    }
  }

  async childRegister(child) {
    // The code which has a HostServices object doesn't necessarily know that
    // its parent might have been disposed. And if it tries to fork, that
    // should still succeed and produce a disposed child HostServices object.
    this._counter++;
    const relay = new HostServicesRelay(this, this._counter, child);

    if (this.isDisposed()) {
      child.dispose();
    } else {
      this._childRelays.set(this._counter, relay);
    }

    return relay;
  }

}

class HostServicesRelay {
  //
  // _childIsDisposed is consumed by using observable.takeUntil(_childIsDisposed),
  // which unsubscribes from 'obs' as soon as _childIsDisposed.next() gets
  // fired. It is signaled by calling _disposables.dispose(), which fires
  // the _childIsDisposed.next().
  constructor(aggregator, id, child) {
    this._childIsDisposed = new _RxMin.Subject();
    this._disposables = new (_UniversalDisposable().default)();
    this._aggregator = aggregator;
    this._id = id;
    this._child = child;

    this._disposables.add(() => {
      this._childIsDisposed.next();
    });
  }

  consoleNotification(source, level, text) {
    if (this._aggregator.isDisposed()) {
      return;
    }

    this._aggregator._parent.consoleNotification(source, level, text);
  }

  dialogNotification(level, text) {
    if (this._aggregator.isDisposed()) {
      return _RxMin.Observable.empty().publish();
    }

    return this._aggregator._parent.dialogNotification(level, text).refCount().takeUntil(this._childIsDisposed).publish(); // If the host is disposed, then the ConnectedObservable we return will
    // complete without ever having emitted a value. If you .toPromise on it
    // your promise will complete successfully with value 'undefined'.
  }

  dialogRequest(level, text, buttonLabels, closeLabel) {
    if (this._aggregator.isDisposed()) {
      return _RxMin.Observable.empty().publish();
    }

    return this._aggregator._parent.dialogRequest(level, text, buttonLabels, closeLabel).refCount().takeUntil(this._childIsDisposed).publish();
  }

  applyTextEditsForMultipleFiles(changes) {
    if (this._aggregator.isDisposed()) {
      return Promise.resolve(false);
    }

    return this._aggregator._parent.applyTextEditsForMultipleFiles(changes);
  }

  async showProgress(title, options) {
    // TODO: this whole function would work better with CancellationToken,
    // particularly in the case where a HostAggregator is disposed after the
    // request has already been sent out to its parent. In the absence of
    // CancellationToken, we can't cancel the parent, and instead have to
    const no_op = {
      setTitle: _ => {},
      dispose: () => {}
    }; // If we're already disposed, then return a no-op wrapper.

    if (this._aggregator.isDisposed()) {
      return no_op;
    } // Otherwise, we are going to make a request to our parent.


    const parentPromise = this._aggregator._parent.showProgress(title, options);

    let progress = await _RxMin.Observable.from(parentPromise).takeUntil(this._childIsDisposed).toPromise(); // Should a cancellation come while we're waiting for our parent,
    // then we'll immediately return a no-op wrapper and ensure that
    // the one from our parent will eventually be disposed.
    // The "or" check below is in case parentProgress returned something
    // but also either the parent aggregator or the child aggregator
    // were disposed.

    if (progress == null || this._aggregator.isDisposed() || this._disposables.disposed) {
      parentPromise.then(progress2 => progress2.dispose());
      return no_op;
    } // Here our parent has already displayed 'winner'. It will be disposed
    // either when we ourselves get disposed, or when our caller disposes
    // of the wrapper we return them, whichever happens first.


    const wrapper = {
      setTitle: title2 => {
        if (progress != null) {
          progress.setTitle(title2);
        }
      },
      dispose: () => {
        this._disposables.remove(wrapper);

        if (progress != null) {
          progress.dispose();
          progress = null;
        }
      }
    };

    this._disposables.add(wrapper);

    return wrapper;
  }

  showActionRequired(title, options) {
    if (this._aggregator.isDisposed()) {
      return _RxMin.Observable.empty().publish();
    }

    return this._aggregator._parent.showActionRequired(title, options).refCount().takeUntil(this._childIsDisposed).publish();
  }

  async dispatchCommand(command, params) {
    if (this._aggregator.isDisposed()) {
      return false;
    }

    return this._aggregator._parent.dispatchCommand(command, params);
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