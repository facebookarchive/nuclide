'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BusySignalInstance {

  constructor(messageStore) {
    this._messageStore = messageStore;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  dispose() {
    this._disposables.dispose();
  }

  /**
   * Displays the message until the returned disposable is disposed
   */
  reportBusy(message, options) {
    if (options == null || options.onlyForFile == null) {
      const disposable = this._messageStore.displayMessage(message);
      this._disposables.add(disposable);
      return new (_UniversalDisposable || _load_UniversalDisposable()).default(disposable, () => {
        this._disposables.remove(disposable);
      });
    }

    let displayedDisposable = null;
    const disposeDisplayed = () => {
      if (displayedDisposable != null) {
        displayedDisposable.dispose();
        displayedDisposable = null;
      }
    };
    this._disposables.add(disposeDisplayed);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.workspace.observeActivePaneItem(item => {
      if (item != null && typeof item.getPath === 'function' && item.getPath() === options.onlyForFile) {
        if (displayedDisposable == null) {
          displayedDisposable = this._messageStore.displayMessage(message);
        }
      } else {
        disposeDisplayed();
      }
    }),
    // We can't add displayedDisposable directly because its value may change.
    disposeDisplayed, () => this._disposables.remove(disposeDisplayed));
  }

  /**
   * Publishes a 'busy' message with the given string. Marks it as done when the
   * promise returned by the given function is resolved or rejected.
   *
   * Used to indicate that some work is ongoing while the given asynchronous
   * function executes.
   */
  reportBusyWhile(message, f, options) {
    const messageRemover = this.reportBusy(message, options);
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
exports.default = BusySignalInstance; /**
                                       * Copyright (c) 2017-present, Facebook, Inc.
                                       * All rights reserved.
                                       *
                                       * This source code is licensed under the BSD-style license found in the
                                       * LICENSE file in the root directory of this source tree. An additional grant
                                       * of patent rights can be found in the PATENTS file in the same directory.
                                       *
                                       * 
                                       * @format
                                       */