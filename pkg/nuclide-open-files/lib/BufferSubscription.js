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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

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

    var subscriptions = new (_atom2 || _atom()).CompositeDisposable();

    subscriptions.add(buffer.onDidChange(_asyncToGenerator(function* (event) {
      if (_this._notifier == null) {
        return;
      }
      // Must inspect the buffer before awaiting on the notifier
      // to avoid race conditions
      var filePath = _this._buffer.getPath();
      (0, (_assert2 || _assert()).default)(filePath != null);
      var version = _this._buffer.changeCount;

      (0, (_assert2 || _assert()).default)(_this._notifier != null);
      var notifier = yield _this._notifier;
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
    })));
    subscriptions.add(buffer.onDidChangePath(function () {
      _this.sendClose();
      _this.onChangePath();
    }));
    subscriptions.add(buffer.onDidDestroy(function () {
      _this.sendClose();
      _this.dispose();
    }));

    this._subscriptions = subscriptions;

    this.onChangePath();
  }

  _createClass(BufferSubscription, [{
    key: 'onChangePath',
    value: function onChangePath() {
      this._oldPath = this._buffer.getPath();
      this._notifier = this._notifiers.get(this._buffer);
      this.sendOpen();
    }
  }, {
    key: 'sendEvent',
    value: _asyncToGenerator(function* (event) {
      (0, (_assert2 || _assert()).default)(event.kind !== 'sync');
      try {
        yield event.fileVersion.notifier.onEvent(event);
        this.updateServerVersion(event.fileVersion.version);
      } catch (e) {
        logger.error('Error sending file event: ' + JSON.stringify(event), e);

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
            (0, (_assert2 || _assert()).default)(filePath != null);
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

                logger.error('Successful resync event: ' + JSON.stringify(syncEvent));
              } catch (syncError) {
                logger.error('Error sending file sync event: ' + JSON.stringify(syncEvent), syncError);

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
    key: 'sendOpen',
    value: _asyncToGenerator(function* () {
      if (this._notifier == null) {
        return;
      }

      // Must inspect the buffer before awaiting on the notifier
      // to avoid race conditions
      var filePath = this._buffer.getPath();
      (0, (_assert2 || _assert()).default)(filePath != null);
      var version = this._buffer.changeCount;
      var contents = this._buffer.getText();

      (0, (_assert2 || _assert()).default)(this._notifier != null);
      var notifier = yield this._notifier;
      this.sendEvent({
        kind: 'open',
        fileVersion: {
          notifier: notifier,
          filePath: filePath,
          version: version
        },
        contents: contents
      });
    })
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
      this._notifier = null;
      this._subscriptions.dispose();
    }
  }]);

  return BufferSubscription;
})();

exports.BufferSubscription = BufferSubscription;