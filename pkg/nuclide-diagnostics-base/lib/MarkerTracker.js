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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var MarkerTracker = (function () {
  function MarkerTracker() {
    var _this = this;

    _classCallCheck(this, MarkerTracker);

    this._messageToMarker = new Map();
    this._fileToMessages = new Map();
    this._subscriptions = new _atom.CompositeDisposable();
    this._disposed = false;

    this._subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
      var path = editor.getPath();
      if (path == null) {
        return;
      }
      var messagesForPath = _this._fileToMessages.get(path);
      if (messagesForPath == null) {
        return;
      }
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

        // Add to _fileToMessages
        var path = message.filePath;
        var messageSet = _this2._fileToMessages.get(path);
        if (messageSet == null) {
          messageSet = new Set();
          _this2._fileToMessages.set(path, messageSet);
        }
        messageSet.add(message);

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
        var messageSet = this._fileToMessages.get(message.filePath);
        if (messageSet != null) {
          messageSet['delete'](message);
          if (messageSet.size === 0) {
            this._fileToMessages['delete'](message.filePath);
          }
        }

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
      (0, _assert2['default'])(fix != null);

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
        _this3._messageToMarker['delete'](message);
        markerSubscription.dispose();
        _this3._subscriptions.remove(markerSubscription);
      });
      this._subscriptions.add(markerSubscription);
    }
  }, {
    key: '_assertNotDisposed',
    value: function _assertNotDisposed() {
      (0, _assert2['default'])(!this._disposed, 'MarkerTracker has been disposed');
    }
  }]);

  return MarkerTracker;
})();

exports.MarkerTracker = MarkerTracker;

/**
 * Stores all current FileDiagnosticMessages, indexed by file. Includes those for files that are
 * not open.
 * invariant: no empty sets (should be removed from the map)
 */

/**
 * Stores all current markers, indexed by FileDiagnosticMessage.
 * invariant: No messages for closed files, no destroyed markers.
 */
//# sourceMappingURL=data:application/json;base64,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TyxDQUFDLEdBQUcsQ0FBQztBQUN4QiwrQkFBVSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUM7O0FBRXZCLFVBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTs7Ozs7QUFLbEQsa0JBQVUsRUFBRSxPQUFPOztBQUVuQixrQkFBVSxFQUFFLEtBQUs7T0FDbEIsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7Ozs7QUFJM0MsVUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLFlBQU07QUFDbkQsZUFBSyxnQkFBZ0IsVUFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3RDLDBCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzdCLGVBQUssY0FBYyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO09BQ2hELENBQUMsQ0FBQztBQUNILFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7S0FDN0M7OztXQUVpQiw4QkFBUztBQUN6QiwrQkFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsaUNBQWlDLENBQUMsQ0FBQztLQUMvRDs7O1NBdEpVLGFBQWEiLCJmaWxlIjoiTWFya2VyVHJhY2tlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxufSBmcm9tICcuLic7XG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmV4cG9ydCBjbGFzcyBNYXJrZXJUcmFja2VyIHtcblxuICAvKipcbiAgICogU3RvcmVzIGFsbCBjdXJyZW50IEZpbGVEaWFnbm9zdGljTWVzc2FnZXMsIGluZGV4ZWQgYnkgZmlsZS4gSW5jbHVkZXMgdGhvc2UgZm9yIGZpbGVzIHRoYXQgYXJlXG4gICAqIG5vdCBvcGVuLlxuICAgKiBpbnZhcmlhbnQ6IG5vIGVtcHR5IHNldHMgKHNob3VsZCBiZSByZW1vdmVkIGZyb20gdGhlIG1hcClcbiAgICovXG4gIF9maWxlVG9NZXNzYWdlczogTWFwPE51Y2xpZGVVcmksIFNldDxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+PjtcblxuICAvKipcbiAgICogU3RvcmVzIGFsbCBjdXJyZW50IG1hcmtlcnMsIGluZGV4ZWQgYnkgRmlsZURpYWdub3N0aWNNZXNzYWdlLlxuICAgKiBpbnZhcmlhbnQ6IE5vIG1lc3NhZ2VzIGZvciBjbG9zZWQgZmlsZXMsIG5vIGRlc3Ryb3llZCBtYXJrZXJzLlxuICAgKi9cbiAgX21lc3NhZ2VUb01hcmtlcjogTWFwPEZpbGVEaWFnbm9zdGljTWVzc2FnZSwgYXRvbSRNYXJrZXI+O1xuXG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIF9kaXNwb3NlZDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9tZXNzYWdlVG9NYXJrZXIgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fZmlsZVRvTWVzc2FnZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fZGlzcG9zZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKGVkaXRvciA9PiB7XG4gICAgICAgIGNvbnN0IHBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgICAgICBpZiAocGF0aCA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VzRm9yUGF0aCA9IHRoaXMuX2ZpbGVUb01lc3NhZ2VzLmdldChwYXRoKTtcbiAgICAgICAgaWYgKG1lc3NhZ2VzRm9yUGF0aCA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgbWVzc2FnZSBvZiBtZXNzYWdlc0ZvclBhdGgpIHtcbiAgICAgICAgICAvLyBUaGVyZSBtaWdodCBhbHJlYWR5IGJlIGEgbWFya2VyIGJlY2F1c2UgdGhlcmUgY2FuIGJlIG11bHRpcGxlIFRleHRFZGl0b3JzIG9wZW4gZm9yIGFcbiAgICAgICAgICAvLyBnaXZlbiBmaWxlLlxuICAgICAgICAgIGlmICghdGhpcy5fbWVzc2FnZVRvTWFya2VyLmhhcyhtZXNzYWdlKSkge1xuICAgICAgICAgICAgdGhpcy5fYWRkTWFya2VyKGVkaXRvciwgbWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIGlmICghdGhpcy5fZGlzcG9zZWQpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgZm9yIChjb25zdCBtYXJrZXIgb2YgdGhpcy5fbWVzc2FnZVRvTWFya2VyLnZhbHVlcygpKSB7XG4gICAgICAgIG1hcmtlci5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9maWxlVG9NZXNzYWdlcy5jbGVhcigpO1xuICAgICAgdGhpcy5fbWVzc2FnZVRvTWFya2VyLmNsZWFyKCk7XG4gICAgICB0aGlzLl9kaXNwb3NlZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybiBhIFJhbmdlIGlmIHRoZSBtYXJrZXIgaXMgc3RpbGwgdmFsaWQsIG90aGVyd2lzZSByZXR1cm4gbnVsbCAqL1xuICBnZXRDdXJyZW50UmFuZ2UobWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlKTogP2F0b20kUmFuZ2Uge1xuICAgIHRoaXMuX2Fzc2VydE5vdERpc3Bvc2VkKCk7XG4gICAgY29uc3QgbWFya2VyID0gdGhpcy5fbWVzc2FnZVRvTWFya2VyLmdldChtZXNzYWdlKTtcblxuICAgIGlmIChtYXJrZXIgIT0gbnVsbCAmJiBtYXJrZXIuaXNWYWxpZCgpKSB7XG4gICAgICByZXR1cm4gbWFya2VyLmdldEJ1ZmZlclJhbmdlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFkZEZpbGVNZXNzYWdlcyhtZXNzYWdlczogQXJyYXk8RmlsZURpYWdub3N0aWNNZXNzYWdlPik6IHZvaWQge1xuICAgIHRoaXMuX2Fzc2VydE5vdERpc3Bvc2VkKCk7XG4gICAgLy8gUmlnaHQgbm93IHdlIG9ubHkgY2FyZSBhYm91dCBtZXNzYWdlcyB3aXRoIGZpeGVzLlxuICAgIGNvbnN0IG1lc3NhZ2VzV2l0aEZpeCA9IG1lc3NhZ2VzLmZpbHRlcihtID0+IG0uZml4ICE9IG51bGwpO1xuXG4gICAgZm9yIChjb25zdCBtZXNzYWdlIG9mIG1lc3NhZ2VzV2l0aEZpeCkge1xuXG4gICAgICAvLyBBZGQgdG8gX2ZpbGVUb01lc3NhZ2VzXG4gICAgICBjb25zdCBwYXRoID0gbWVzc2FnZS5maWxlUGF0aDtcbiAgICAgIGxldCBtZXNzYWdlU2V0ID0gdGhpcy5fZmlsZVRvTWVzc2FnZXMuZ2V0KHBhdGgpO1xuICAgICAgaWYgKG1lc3NhZ2VTZXQgPT0gbnVsbCkge1xuICAgICAgICBtZXNzYWdlU2V0ID0gbmV3IFNldCgpO1xuICAgICAgICB0aGlzLl9maWxlVG9NZXNzYWdlcy5zZXQocGF0aCwgbWVzc2FnZVNldCk7XG4gICAgICB9XG4gICAgICBtZXNzYWdlU2V0LmFkZChtZXNzYWdlKTtcblxuICAgICAgLy8gSWYgdGhlIGZpbGUgaXMgY3VycmVudGx5IG9wZW4sIGNyZWF0ZSBhIG1hcmtlci5cblxuICAgICAgLy8gVE9ETyBJZiB0aGVyZSBpcyBhIGxvbmcgZGVsYXkgYmV0d2VlbiB3aGVuIHRoZSBmaWxlIGlzIHNhdmVkIGFuZCByZXN1bHRzIGFwcGVhciwgdGhlIGZpbGVcbiAgICAgIC8vIG1heSBoYXZlIGNoYW5nZWQgaW4gdGhlIG1lYW4gdGltZS4gTWVhbmluZyB0aGF0IHRoZSBtYXJrZXJzIHdlIHBsYWNlIGhlcmUgbWF5IGJlIGluIHRoZVxuICAgICAgLy8gd3JvbmcgcGxhY2UgYWxyZWFkeS4gQ29uc2lkZXIgZGV0ZWN0aW5nIHN1Y2ggY2FzZXMgKHBlcmhhcHMgd2l0aCBhIGNoZWNrc3VtIGluY2x1ZGVkIGluIHRoZVxuICAgICAgLy8gZml4KSBhbmQgcmVqZWN0aW5nIHRoZSBmaXhlcywgc2luY2Ugd2UgY2FuJ3QgYWNjdXJhdGVseSB0cmFjayB0aGVpciBsb2NhdGlvbnMuXG5cbiAgICAgIGNvbnN0IGVkaXRvckZvckZpbGUgPVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpLmZpbHRlcihlZGl0b3IgPT4gZWRpdG9yLmdldFBhdGgoKSA9PT0gbWVzc2FnZS5maWxlUGF0aClbMF07XG4gICAgICBpZiAoZWRpdG9yRm9yRmlsZSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2FkZE1hcmtlcihlZGl0b3JGb3JGaWxlLCBtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogUmVtb3ZlIHRoZSBnaXZlbiBtZXNzYWdlcywgaWYgdGhleSBhcmUgY3VycmVudGx5IHByZXNlbnQgKi9cbiAgcmVtb3ZlRmlsZU1lc3NhZ2VzKG1lc3NhZ2VzOiBJdGVyYWJsZTxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+KTogdm9pZCB7XG4gICAgdGhpcy5fYXNzZXJ0Tm90RGlzcG9zZWQoKTtcblxuICAgIGZvciAoY29uc3QgbWVzc2FnZSBvZiBtZXNzYWdlcykge1xuICAgICAgY29uc3QgbWVzc2FnZVNldCA9IHRoaXMuX2ZpbGVUb01lc3NhZ2VzLmdldChtZXNzYWdlLmZpbGVQYXRoKTtcbiAgICAgIGlmIChtZXNzYWdlU2V0ICE9IG51bGwpIHtcbiAgICAgICAgbWVzc2FnZVNldC5kZWxldGUobWVzc2FnZSk7XG4gICAgICAgIGlmIChtZXNzYWdlU2V0LnNpemUgPT09IDApIHtcbiAgICAgICAgICB0aGlzLl9maWxlVG9NZXNzYWdlcy5kZWxldGUobWVzc2FnZS5maWxlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgbWFya2VyID0gdGhpcy5fbWVzc2FnZVRvTWFya2VyLmdldChtZXNzYWdlKTtcbiAgICAgIGlmIChtYXJrZXIgIT0gbnVsbCkge1xuICAgICAgICAvLyBObyBuZWVkIHRvIHJlbW92ZSBmcm9tIHRoZSBzZXQgZXhwbGljaXRseSBzaW5jZSB3ZSBkbyB0aGF0IG9uIHRoZSBtYXJrZXIncyBvbkRpZERlc3Ryb3lcbiAgICAgICAgLy8gaGFuZGxlci5cbiAgICAgICAgbWFya2VyLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfYWRkTWFya2VyKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLCBtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UpOiB2b2lkIHtcbiAgICBjb25zdCBmaXggPSBtZXNzYWdlLmZpeDtcbiAgICBpbnZhcmlhbnQoZml4ICE9IG51bGwpO1xuXG4gICAgY29uc3QgbWFya2VyID0gZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShmaXgub2xkUmFuZ2UsIHtcbiAgICAgIC8vICd0b3VjaCcgaXMgdGhlIGxlYXN0IHBlcm1pc3NpdmUgaW52YWxpZGF0aW9uIHN0cmF0ZWd5OiBJdCB3aWxsIGludmFsaWRhdGUgZm9yXG4gICAgICAvLyBjaGFuZ2VzIHRoYXQgdG91Y2ggdGhlIG1hcmtlZCByZWdpb24gaW4gYW55IHdheS4gV2Ugd2FudCB0byBpbnZhbGlkYXRlXG4gICAgICAvLyBhZ2dyZXNzaXZlbHkgYmVjYXVzZSBhbiBpbmNvcnJlY3QgZml4IGFwcGxpY2F0aW9uIGlzIGZhciB3b3JzZSB0aGFuIGEgZmFpbGVkXG4gICAgICAvLyBhcHBsaWNhdGlvbi5cbiAgICAgIGludmFsaWRhdGU6ICd0b3VjaCcsXG4gICAgICAvLyBEb24ndCBzZXJpYWxpemUgdGhlIG1hcmtlciB3aGVuIHRoZSBidWZmZXIgaXMgc2VyaWFsaXplZC5cbiAgICAgIHBlcnNpc3RlbnQ6IGZhbHNlLFxuICAgIH0pO1xuICAgIHRoaXMuX21lc3NhZ2VUb01hcmtlci5zZXQobWVzc2FnZSwgbWFya2VyKTtcblxuICAgIC8vIFRoZSBtYXJrZXIgd2lsbCBiZSBkZXN0cm95ZWQgYXV0b21hdGljYWxseSB3aGVuIGl0cyBhc3NvY2lhdGVkIFRleHRCdWZmZXIgaXMgZGVzdHJveWVkLiBDbGVhblxuICAgIC8vIHVwIHdoZW4gdGhhdCBoYXBwZW5zLlxuICAgIGNvbnN0IG1hcmtlclN1YnNjcmlwdGlvbiA9IG1hcmtlci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgdGhpcy5fbWVzc2FnZVRvTWFya2VyLmRlbGV0ZShtZXNzYWdlKTtcbiAgICAgIG1hcmtlclN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLnJlbW92ZShtYXJrZXJTdWJzY3JpcHRpb24pO1xuICAgIH0pO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG1hcmtlclN1YnNjcmlwdGlvbik7XG4gIH1cblxuICBfYXNzZXJ0Tm90RGlzcG9zZWQoKTogdm9pZCB7XG4gICAgaW52YXJpYW50KCF0aGlzLl9kaXNwb3NlZCwgJ01hcmtlclRyYWNrZXIgaGFzIGJlZW4gZGlzcG9zZWQnKTtcbiAgfVxufVxuIl19