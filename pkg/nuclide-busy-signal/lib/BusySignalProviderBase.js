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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _commonsNodePromise;

function _load_commonsNodePromise() {
  return _commonsNodePromise = require('../../commons-node/promise');
}

var BusySignalProviderBase = (function () {
  function BusySignalProviderBase() {
    _classCallCheck(this, BusySignalProviderBase);

    this._nextId = 0;
    this._messages = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
    this.messages = this._messages;
  }

  /**
   * Displays the message until the returned disposable is disposed
   */

  _createClass(BusySignalProviderBase, [{
    key: 'displayMessage',
    value: function displayMessage(message, optionsArg) {
      var _this = this;

      // Reassign as const so the type refinement holds in the closure below
      var options = optionsArg;
      if (options == null || options.onlyForFile == null) {
        return this._displayMessage(message);
      }

      var displayedDisposable = null;
      var disposeDisplayed = function disposeDisplayed() {
        if (displayedDisposable != null) {
          displayedDisposable.dispose();
          displayedDisposable = null;
        }
      };
      return new (_atom || _load_atom()).CompositeDisposable(atom.workspace.observeActivePaneItem(function (item) {
        if (item != null && typeof item.getPath === 'function' && item.getPath() === options.onlyForFile) {
          if (displayedDisposable == null) {
            displayedDisposable = _this._displayMessage(message);
          }
        } else {
          disposeDisplayed();
        }
      }),
      // We can't add displayedDisposable directly because its value may change.
      new (_atom || _load_atom()).Disposable(disposeDisplayed));
    }
  }, {
    key: '_displayMessage',
    value: function _displayMessage(message) {
      var _this2 = this;

      var _nextMessagePair2 = this._nextMessagePair(message);

      var busy = _nextMessagePair2.busy;
      var done = _nextMessagePair2.done;

      this._messages.next(busy);
      return new (_atom || _load_atom()).Disposable(function () {
        _this2._messages.next(done);
      });
    }
  }, {
    key: '_nextMessagePair',
    value: function _nextMessagePair(message) {
      var busy = {
        status: 'busy',
        id: this._nextId,
        message: message
      };
      var done = {
        status: 'done',
        id: this._nextId
      };
      this._nextId++;
      return { busy: busy, done: done };
    }

    /**
     * Publishes a 'busy' message with the given string. Marks it as done when the
     * promise returned by the given function is resolved or rejected.
     *
     * Used to indicate that some work is ongoing while the given asynchronous
     * function executes.
     */
  }, {
    key: 'reportBusy',
    value: function reportBusy(message, f, options) {
      var messageRemover = this.displayMessage(message, options);
      var removeMessage = messageRemover.dispose.bind(messageRemover);
      try {
        var returnValue = f();
        (0, (_assert || _load_assert()).default)((0, (_commonsNodePromise || _load_commonsNodePromise()).isPromise)(returnValue));
        returnValue.then(removeMessage, removeMessage);
        return returnValue;
      } catch (e) {
        removeMessage();
        throw e;
      }
    }
  }]);

  return BusySignalProviderBase;
})();

exports.BusySignalProviderBase = BusySignalProviderBase;