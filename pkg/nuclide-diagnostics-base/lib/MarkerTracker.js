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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var MarkerTracker = (function () {
  function MarkerTracker() {
    var _this = this;

    _classCallCheck(this, MarkerTracker);

    this._messageToMarker = new Map();
    this._fileToMessages = new (_commonsNodeCollection2 || _commonsNodeCollection()).MultiMap();
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    this._disposed = false;

    this._subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
      var path = editor.getPath();
      if (path == null) {
        return;
      }
      var messagesForPath = _this._fileToMessages.get(path);
      for (var message of messagesForPath) {
        // There might already be a marker because there can be multiple TextEditors open for a
        // given file.
        if (!_this._messageToMarker.has(message)) {
          _this._addMarker(editor, message);
        }
      }
    }));
  }

  _createClass(MarkerTracker, [{
    key: 'dispose',
    value: function dispose() {
      if (!this._disposed) {
        this._subscriptions.dispose();
        for (var marker of this._messageToMarker.values()) {
          marker.destroy();
        }
        this._fileToMessages.clear();
        this._messageToMarker.clear();
        this._disposed = true;
      }
    }

    /** Return a Range if the marker is still valid, otherwise return null */
  }, {
    key: 'getCurrentRange',
    value: function getCurrentRange(message) {
      this._assertNotDisposed();
      var marker = this._messageToMarker.get(message);

      if (marker != null && marker.isValid()) {
        return marker.getBufferRange();
      } else {
        return null;
      }
    }
  }, {
    key: 'addFileMessages',
    value: function addFileMessages(messages) {
      var _this2 = this;

      this._assertNotDisposed();
      // Right now we only care about messages with fixes.
      var messagesWithFix = messages.filter(function (m) {
        return m.fix != null;
      });

      var _loop = function (message) {
        _this2._fileToMessages.add(message.filePath, message);

        // If the file is currently open, create a marker.

        // TODO If there is a long delay between when the file is saved and results appear, the file
        // may have changed in the mean time. Meaning that the markers we place here may be in the
        // wrong place already. Consider detecting such cases (perhaps with a checksum included in the
        // fix) and rejecting the fixes, since we can't accurately track their locations.

        var editorForFile = atom.workspace.getTextEditors().filter(function (editor) {
          return editor.getPath() === message.filePath;
        })[0];
        if (editorForFile != null) {
          _this2._addMarker(editorForFile, message);
        }
      };

      for (var message of messagesWithFix) {
        _loop(message);
      }
    }

    /** Remove the given messages, if they are currently present */
  }, {
    key: 'removeFileMessages',
    value: function removeFileMessages(messages) {
      this._assertNotDisposed();

      for (var message of messages) {
        this._fileToMessages.delete(message.filePath, message);

        var marker = this._messageToMarker.get(message);
        if (marker != null) {
          // No need to remove from the set explicitly since we do that on the marker's onDidDestroy
          // handler.
          marker.destroy();
        }
      }
    }
  }, {
    key: '_addMarker',
    value: function _addMarker(editor, message) {
      var _this3 = this;

      var fix = message.fix;
      (0, (_assert2 || _assert()).default)(fix != null);

      var marker = editor.markBufferRange(fix.oldRange, {
        // 'touch' is the least permissive invalidation strategy: It will invalidate for
        // changes that touch the marked region in any way. We want to invalidate
        // aggressively because an incorrect fix application is far worse than a failed
        // application.
        invalidate: 'touch',
        // Don't serialize the marker when the buffer is serialized.
        persistent: false
      });
      this._messageToMarker.set(message, marker);

      // The marker will be destroyed automatically when its associated TextBuffer is destroyed. Clean
      // up when that happens.
      var markerSubscription = marker.onDidDestroy(function () {
        _this3._messageToMarker.delete(message);
        markerSubscription.dispose();
        _this3._subscriptions.remove(markerSubscription);
      });
      this._subscriptions.add(markerSubscription);
    }
  }, {
    key: '_assertNotDisposed',
    value: function _assertNotDisposed() {
      (0, (_assert2 || _assert()).default)(!this._disposed, 'MarkerTracker has been disposed');
    }
  }]);

  return MarkerTracker;
})();

exports.MarkerTracker = MarkerTracker;

/**
 * Stores all current FileDiagnosticMessages, indexed by file. Includes those for files that are
 * not open.
 */

/**
 * Stores all current markers, indexed by FileDiagnosticMessage.
 * invariant: No messages for closed files, no destroyed markers.
 */