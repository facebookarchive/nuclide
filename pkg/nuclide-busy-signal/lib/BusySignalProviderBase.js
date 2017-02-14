'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BusySignalProviderBase = undefined;

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _promise;

function _load_promise() {
  return _promise = require('../../commons-node/promise');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class BusySignalProviderBase {

  constructor() {
    this._nextId = 0;
    this._messages = new _rxjsBundlesRxMinJs.Subject();
    this.messages = this._messages;
  }

  /**
   * Displays the message until the returned disposable is disposed
   */
  displayMessage(message, optionsArg) {
    // Reassign as const so the type refinement holds in the closure below
    const options = optionsArg;
    if (options == null || options.onlyForFile == null) {
      return this._displayMessage(message);
    }

    let displayedDisposable = null;
    const disposeDisplayed = () => {
      if (displayedDisposable != null) {
        displayedDisposable.dispose();
        displayedDisposable = null;
      }
    };
    return new _atom.CompositeDisposable(atom.workspace.observeActivePaneItem(item => {
      if (item != null && typeof item.getPath === 'function' && item.getPath() === options.onlyForFile) {
        if (displayedDisposable == null) {
          displayedDisposable = this._displayMessage(message);
        }
      } else {
        disposeDisplayed();
      }
    }),
    // We can't add displayedDisposable directly because its value may change.
    new _atom.Disposable(disposeDisplayed));
  }

  _displayMessage(message) {
    const { busy, done } = this._nextMessagePair(message);
    this._messages.next(busy);
    return new _atom.Disposable(() => {
      this._messages.next(done);
    });
  }

  _nextMessagePair(message) {
    const busy = {
      status: 'busy',
      id: this._nextId,
      message
    };
    const done = {
      status: 'done',
      id: this._nextId
    };
    this._nextId++;
    return { busy, done };
  }

  /**
   * Publishes a 'busy' message with the given string. Marks it as done when the
   * promise returned by the given function is resolved or rejected.
   *
   * Used to indicate that some work is ongoing while the given asynchronous
   * function executes.
   */
  reportBusy(message, f, options) {
    const messageRemover = this.displayMessage(message, options);
    const removeMessage = messageRemover.dispose.bind(messageRemover);
    try {
      const returnValue = f();

      if (!(0, (_promise || _load_promise()).isPromise)(returnValue)) {
        throw new Error('Invariant violation: "isPromise(returnValue)"');
      }

      returnValue.then(removeMessage, removeMessage);
      return returnValue;
    } catch (e) {
      removeMessage();
      throw e;
    }
  }
}
exports.BusySignalProviderBase = BusySignalProviderBase;