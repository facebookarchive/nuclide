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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

var RESYNC_TIMEOUT_MS = 2000;

// Watches a TextBuffer for change/rename/destroy events and then sends
// those events to the FileNotifier or NotifiersByConnection as appropriate.
//
// change/rename events go to the FileNotifier.
// If sending a change/rename throws, that is an indication that we are out of
// sync with the server side, so send a 'sync' message.
//
// close events have a different error recovery policy so they go to the main
// NotifiersByConnection. The close message must be sent even if the buffer is
// renamed or destroyed, so rather than keep the per-buffer info around after
// a buffer is destroyed, the outstanding close messages are kept with the
// per-connection info in NotifiersByConnection.

var BufferSubscription = (function () {
  function BufferSubscription(notifiers, buffer) {
    var _this = this;

    _classCallCheck(this, BufferSubscription);

    this._notifiers = notifiers;
    this._buffer = buffer;
    this._notifier = null;
    this._serverVersion = -1;
    this._lastAttemptedSync = -1;
    this._sentOpen = false;

    var subscriptions = new (_atom || _load_atom()).CompositeDisposable();

    subscriptions.add(buffer.onDidChange(_asyncToGenerator(function* (event) {
      if (_this._notifier == null) {
        return;
      }

      // Must inspect the buffer before awaiting on the notifier
      // to avoid race conditions
      var filePath = _this._buffer.getPath();
      (0, (_assert || _load_assert()).default)(filePath != null);
      var version = _this._buffer.changeCount;

      (0, (_assert || _load_assert()).default)(_this._notifier != null);
      var notifier = yield _this._notifier;
      if (_this._sentOpen) {
        _this.sendEvent({
          kind: 'edit',
          fileVersion: {
            notifier: notifier,
            filePath: filePath,
            version: version
          },
          oldRange: event.oldRange,
          newRange: event.newRange,
          oldText: event.oldText,
          newText: event.newText
        });
      } else {
        _this._sendOpenByNotifier(notifier);
      }
    })));

    this._subscriptions = subscriptions;

    this._oldPath = this._buffer.getPath();
    this._notifier = this._notifiers.get(this._buffer);

    // This prevents the open message from sending when the file is initially empty.
    // Sadly there's no reliable 'is loaded' event from Atom.
    // TODO: Could watch onDidReload() which will catch the case where an empty file is opened
    // after startup, leaving the only failure the reopening of empty files at startup.
    if (this._buffer.getText() !== '' && this._notifier != null) {
      this._notifier.then(function (notifier) {
        return _this._sendOpenByNotifier(notifier);
      });
    }
  }

  _createClass(BufferSubscription, [{
    key: '_sendOpenByNotifier',
    value: function _sendOpenByNotifier(notifier) {
      var filePath = this._buffer.getPath();
      (0, (_assert || _load_assert()).default)(filePath != null);
      var version = this._buffer.changeCount;

      this._sentOpen = true;
      this.sendEvent({
        kind: 'open',
        fileVersion: {
          notifier: notifier,
          filePath: filePath,
          version: version
        },
        contents: this._buffer.getText()
      });
    }
  }, {
    key: 'sendEvent',
    value: _asyncToGenerator(function* (event) {
      (0, (_assert || _load_assert()).default)(event.kind !== 'sync');
      try {
        yield event.fileVersion.notifier.onEvent(event);
        this.updateServerVersion(event.fileVersion.version);
      } catch (e) {
        logger.error('Error sending file event: ' + eventToString(event), e);

        if (event.fileVersion.filePath === this._buffer.getPath()) {
          logger.error('Attempting file resync');
          this.attemptResync();
        } else {
          logger.error('File renamed, so no resync attempted');
        }
      }
    })
  }, {
    key: 'updateServerVersion',
    value: function updateServerVersion(sentVersion) {
      this._serverVersion = Math.max(this._serverVersion, sentVersion);
      this._lastAttemptedSync = Math.max(this._lastAttemptedSync, sentVersion);
    }

    // Something went awry in our synchronization protocol
    // Attempt a reset with a 'sync' event.
  }, {
    key: 'attemptResync',
    value: function attemptResync() {
      var _this2 = this;

      // always attempt to resync to the latest version
      var resyncVersion = this._buffer.changeCount;
      var filePath = this._buffer.getPath();

      // don't send a resync if another edit has already succeeded at this version
      // or an attempt to sync at this version is already underway
      if (resyncVersion > this._lastAttemptedSync) {
        (function () {
          logger.error('At most recent edit, attempting file resync');
          _this2._lastAttemptedSync = resyncVersion;

          var sendResync = _asyncToGenerator(function* () {
            if (_this2._notifier == null) {
              logger.error('Resync preempted by remote connection closed');
              return;
            }
            (0, (_assert || _load_assert()).default)(filePath != null);
            var notifier = yield _this2._notifier;
            if (_this2._buffer.isDestroyed()) {
              logger.error('Resync preempted by later event');
            } else if (filePath !== _this2._buffer.getPath()) {
              logger.error('Resync preempted by file rename');
            } else if (resyncVersion !== _this2._lastAttemptedSync) {
              logger.error('Resync preempted by later resync');
            } else if (resyncVersion !== _this2._buffer.changeCount) {
              logger.error('Resync preempted by later edit');
            } else {
              var syncEvent = {
                kind: 'sync',
                fileVersion: {
                  notifier: notifier,
                  filePath: filePath,
                  version: resyncVersion
                },
                contents: _this2._buffer.getText()
              };
              try {
                yield notifier.onEvent(syncEvent);
                _this2.updateServerVersion(resyncVersion);

                logger.error('Successful resync event: ' + eventToString(syncEvent));
              } catch (syncError) {
                logger.error('Error sending file sync event: ' + eventToString(syncEvent), syncError);

                // continue trying until either the file is closed,
                // or a resync to a later edit is attempted
                // or the resync succeeds
                setTimeout(sendResync, RESYNC_TIMEOUT_MS);
              }
            }
          });

          sendResync();
        })();
      } else {
        logger.error('Resync aborted by more recent edit');
      }
    }
  }, {
    key: 'sendClose',
    value: function sendClose() {
      // Use different retry policy for close messages.
      if (this._oldPath != null) {
        this._notifiers.sendClose(this._oldPath, this._buffer.changeCount);
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.sendClose();
      this._notifier = null;
      this._subscriptions.dispose();
    }
  }]);

  return BufferSubscription;
})();

exports.BufferSubscription = BufferSubscription;

function eventToString(event) {
  var jsonable = _extends({}, event);
  jsonable.fileVersion = _extends({}, event.fileVersion);
  jsonable.fileVersion.notifier = null;
  return JSON.stringify(jsonable);
}