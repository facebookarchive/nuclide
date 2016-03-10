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
//# sourceMappingURL=data:application/json;base64,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TyxDQUFDLEdBQUcsQ0FBQztBQUN4QiwrQkFBVSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUM7O0FBRXZCLFVBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTs7Ozs7QUFLbEQsa0JBQVUsRUFBRSxPQUFPOztBQUVuQixrQkFBVSxFQUFFLEtBQUs7T0FDbEIsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7Ozs7QUFJM0MsVUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLFlBQU07QUFDbkQsZUFBSyxnQkFBZ0IsVUFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3RDLDBCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzdCLGVBQUssY0FBYyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO09BQ2hELENBQUMsQ0FBQztBQUNILFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7S0FDN0M7OztXQUVpQiw4QkFBUztBQUN6QiwrQkFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsaUNBQWlDLENBQUMsQ0FBQztLQUMvRDs7O1NBdEpVLGFBQWEiLCJmaWxlIjoiTWFya2VyVHJhY2tlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxufSBmcm9tICcuL21haW4nO1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuZXhwb3J0IGNsYXNzIE1hcmtlclRyYWNrZXIge1xuXG4gIC8qKlxuICAgKiBTdG9yZXMgYWxsIGN1cnJlbnQgRmlsZURpYWdub3N0aWNNZXNzYWdlcywgaW5kZXhlZCBieSBmaWxlLiBJbmNsdWRlcyB0aG9zZSBmb3IgZmlsZXMgdGhhdCBhcmVcbiAgICogbm90IG9wZW4uXG4gICAqIGludmFyaWFudDogbm8gZW1wdHkgc2V0cyAoc2hvdWxkIGJlIHJlbW92ZWQgZnJvbSB0aGUgbWFwKVxuICAgKi9cbiAgX2ZpbGVUb01lc3NhZ2VzOiBNYXA8TnVjbGlkZVVyaSwgU2V0PEZpbGVEaWFnbm9zdGljTWVzc2FnZT4+O1xuXG4gIC8qKlxuICAgKiBTdG9yZXMgYWxsIGN1cnJlbnQgbWFya2VycywgaW5kZXhlZCBieSBGaWxlRGlhZ25vc3RpY01lc3NhZ2UuXG4gICAqIGludmFyaWFudDogTm8gbWVzc2FnZXMgZm9yIGNsb3NlZCBmaWxlcywgbm8gZGVzdHJveWVkIG1hcmtlcnMuXG4gICAqL1xuICBfbWVzc2FnZVRvTWFya2VyOiBNYXA8RmlsZURpYWdub3N0aWNNZXNzYWdlLCBhdG9tJE1hcmtlcj47XG5cbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgX2Rpc3Bvc2VkOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX21lc3NhZ2VUb01hcmtlciA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9maWxlVG9NZXNzYWdlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9kaXNwb3NlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoZWRpdG9yID0+IHtcbiAgICAgICAgY29uc3QgcGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgICAgIGlmIChwYXRoID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWVzc2FnZXNGb3JQYXRoID0gdGhpcy5fZmlsZVRvTWVzc2FnZXMuZ2V0KHBhdGgpO1xuICAgICAgICBpZiAobWVzc2FnZXNGb3JQYXRoID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBtZXNzYWdlIG9mIG1lc3NhZ2VzRm9yUGF0aCkge1xuICAgICAgICAgIC8vIFRoZXJlIG1pZ2h0IGFscmVhZHkgYmUgYSBtYXJrZXIgYmVjYXVzZSB0aGVyZSBjYW4gYmUgbXVsdGlwbGUgVGV4dEVkaXRvcnMgb3BlbiBmb3IgYVxuICAgICAgICAgIC8vIGdpdmVuIGZpbGUuXG4gICAgICAgICAgaWYgKCF0aGlzLl9tZXNzYWdlVG9NYXJrZXIuaGFzKG1lc3NhZ2UpKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRNYXJrZXIoZWRpdG9yLCBtZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKCF0aGlzLl9kaXNwb3NlZCkge1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICBmb3IgKGNvbnN0IG1hcmtlciBvZiB0aGlzLl9tZXNzYWdlVG9NYXJrZXIudmFsdWVzKCkpIHtcbiAgICAgICAgbWFya2VyLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2ZpbGVUb01lc3NhZ2VzLmNsZWFyKCk7XG4gICAgICB0aGlzLl9tZXNzYWdlVG9NYXJrZXIuY2xlYXIoKTtcbiAgICAgIHRoaXMuX2Rpc3Bvc2VkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKiogUmV0dXJuIGEgUmFuZ2UgaWYgdGhlIG1hcmtlciBpcyBzdGlsbCB2YWxpZCwgb3RoZXJ3aXNlIHJldHVybiBudWxsICovXG4gIGdldEN1cnJlbnRSYW5nZShtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UpOiA/YXRvbSRSYW5nZSB7XG4gICAgdGhpcy5fYXNzZXJ0Tm90RGlzcG9zZWQoKTtcbiAgICBjb25zdCBtYXJrZXIgPSB0aGlzLl9tZXNzYWdlVG9NYXJrZXIuZ2V0KG1lc3NhZ2UpO1xuXG4gICAgaWYgKG1hcmtlciAhPSBudWxsICYmIG1hcmtlci5pc1ZhbGlkKCkpIHtcbiAgICAgIHJldHVybiBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgYWRkRmlsZU1lc3NhZ2VzKG1lc3NhZ2VzOiBBcnJheTxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+KTogdm9pZCB7XG4gICAgdGhpcy5fYXNzZXJ0Tm90RGlzcG9zZWQoKTtcbiAgICAvLyBSaWdodCBub3cgd2Ugb25seSBjYXJlIGFib3V0IG1lc3NhZ2VzIHdpdGggZml4ZXMuXG4gICAgY29uc3QgbWVzc2FnZXNXaXRoRml4ID0gbWVzc2FnZXMuZmlsdGVyKG0gPT4gbS5maXggIT0gbnVsbCk7XG5cbiAgICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgbWVzc2FnZXNXaXRoRml4KSB7XG5cbiAgICAgIC8vIEFkZCB0byBfZmlsZVRvTWVzc2FnZXNcbiAgICAgIGNvbnN0IHBhdGggPSBtZXNzYWdlLmZpbGVQYXRoO1xuICAgICAgbGV0IG1lc3NhZ2VTZXQgPSB0aGlzLl9maWxlVG9NZXNzYWdlcy5nZXQocGF0aCk7XG4gICAgICBpZiAobWVzc2FnZVNldCA9PSBudWxsKSB7XG4gICAgICAgIG1lc3NhZ2VTZXQgPSBuZXcgU2V0KCk7XG4gICAgICAgIHRoaXMuX2ZpbGVUb01lc3NhZ2VzLnNldChwYXRoLCBtZXNzYWdlU2V0KTtcbiAgICAgIH1cbiAgICAgIG1lc3NhZ2VTZXQuYWRkKG1lc3NhZ2UpO1xuXG4gICAgICAvLyBJZiB0aGUgZmlsZSBpcyBjdXJyZW50bHkgb3BlbiwgY3JlYXRlIGEgbWFya2VyLlxuXG4gICAgICAvLyBUT0RPIElmIHRoZXJlIGlzIGEgbG9uZyBkZWxheSBiZXR3ZWVuIHdoZW4gdGhlIGZpbGUgaXMgc2F2ZWQgYW5kIHJlc3VsdHMgYXBwZWFyLCB0aGUgZmlsZVxuICAgICAgLy8gbWF5IGhhdmUgY2hhbmdlZCBpbiB0aGUgbWVhbiB0aW1lLiBNZWFuaW5nIHRoYXQgdGhlIG1hcmtlcnMgd2UgcGxhY2UgaGVyZSBtYXkgYmUgaW4gdGhlXG4gICAgICAvLyB3cm9uZyBwbGFjZSBhbHJlYWR5LiBDb25zaWRlciBkZXRlY3Rpbmcgc3VjaCBjYXNlcyAocGVyaGFwcyB3aXRoIGEgY2hlY2tzdW0gaW5jbHVkZWQgaW4gdGhlXG4gICAgICAvLyBmaXgpIGFuZCByZWplY3RpbmcgdGhlIGZpeGVzLCBzaW5jZSB3ZSBjYW4ndCBhY2N1cmF0ZWx5IHRyYWNrIHRoZWlyIGxvY2F0aW9ucy5cblxuICAgICAgY29uc3QgZWRpdG9yRm9yRmlsZSA9XG4gICAgICAgIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkuZmlsdGVyKGVkaXRvciA9PiBlZGl0b3IuZ2V0UGF0aCgpID09PSBtZXNzYWdlLmZpbGVQYXRoKVswXTtcbiAgICAgIGlmIChlZGl0b3JGb3JGaWxlICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fYWRkTWFya2VyKGVkaXRvckZvckZpbGUsIG1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBSZW1vdmUgdGhlIGdpdmVuIG1lc3NhZ2VzLCBpZiB0aGV5IGFyZSBjdXJyZW50bHkgcHJlc2VudCAqL1xuICByZW1vdmVGaWxlTWVzc2FnZXMobWVzc2FnZXM6IEl0ZXJhYmxlPEZpbGVEaWFnbm9zdGljTWVzc2FnZT4pOiB2b2lkIHtcbiAgICB0aGlzLl9hc3NlcnROb3REaXNwb3NlZCgpO1xuXG4gICAgZm9yIChjb25zdCBtZXNzYWdlIG9mIG1lc3NhZ2VzKSB7XG4gICAgICBjb25zdCBtZXNzYWdlU2V0ID0gdGhpcy5fZmlsZVRvTWVzc2FnZXMuZ2V0KG1lc3NhZ2UuZmlsZVBhdGgpO1xuICAgICAgaWYgKG1lc3NhZ2VTZXQgIT0gbnVsbCkge1xuICAgICAgICBtZXNzYWdlU2V0LmRlbGV0ZShtZXNzYWdlKTtcbiAgICAgICAgaWYgKG1lc3NhZ2VTZXQuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuX2ZpbGVUb01lc3NhZ2VzLmRlbGV0ZShtZXNzYWdlLmZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBtYXJrZXIgPSB0aGlzLl9tZXNzYWdlVG9NYXJrZXIuZ2V0KG1lc3NhZ2UpO1xuICAgICAgaWYgKG1hcmtlciAhPSBudWxsKSB7XG4gICAgICAgIC8vIE5vIG5lZWQgdG8gcmVtb3ZlIGZyb20gdGhlIHNldCBleHBsaWNpdGx5IHNpbmNlIHdlIGRvIHRoYXQgb24gdGhlIG1hcmtlcidzIG9uRGlkRGVzdHJveVxuICAgICAgICAvLyBoYW5kbGVyLlxuICAgICAgICBtYXJrZXIuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9hZGRNYXJrZXIoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSk6IHZvaWQge1xuICAgIGNvbnN0IGZpeCA9IG1lc3NhZ2UuZml4O1xuICAgIGludmFyaWFudChmaXggIT0gbnVsbCk7XG5cbiAgICBjb25zdCBtYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKGZpeC5vbGRSYW5nZSwge1xuICAgICAgLy8gJ3RvdWNoJyBpcyB0aGUgbGVhc3QgcGVybWlzc2l2ZSBpbnZhbGlkYXRpb24gc3RyYXRlZ3k6IEl0IHdpbGwgaW52YWxpZGF0ZSBmb3JcbiAgICAgIC8vIGNoYW5nZXMgdGhhdCB0b3VjaCB0aGUgbWFya2VkIHJlZ2lvbiBpbiBhbnkgd2F5LiBXZSB3YW50IHRvIGludmFsaWRhdGVcbiAgICAgIC8vIGFnZ3Jlc3NpdmVseSBiZWNhdXNlIGFuIGluY29ycmVjdCBmaXggYXBwbGljYXRpb24gaXMgZmFyIHdvcnNlIHRoYW4gYSBmYWlsZWRcbiAgICAgIC8vIGFwcGxpY2F0aW9uLlxuICAgICAgaW52YWxpZGF0ZTogJ3RvdWNoJyxcbiAgICAgIC8vIERvbid0IHNlcmlhbGl6ZSB0aGUgbWFya2VyIHdoZW4gdGhlIGJ1ZmZlciBpcyBzZXJpYWxpemVkLlxuICAgICAgcGVyc2lzdGVudDogZmFsc2UsXG4gICAgfSk7XG4gICAgdGhpcy5fbWVzc2FnZVRvTWFya2VyLnNldChtZXNzYWdlLCBtYXJrZXIpO1xuXG4gICAgLy8gVGhlIG1hcmtlciB3aWxsIGJlIGRlc3Ryb3llZCBhdXRvbWF0aWNhbGx5IHdoZW4gaXRzIGFzc29jaWF0ZWQgVGV4dEJ1ZmZlciBpcyBkZXN0cm95ZWQuIENsZWFuXG4gICAgLy8gdXAgd2hlbiB0aGF0IGhhcHBlbnMuXG4gICAgY29uc3QgbWFya2VyU3Vic2NyaXB0aW9uID0gbWFya2VyLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICB0aGlzLl9tZXNzYWdlVG9NYXJrZXIuZGVsZXRlKG1lc3NhZ2UpO1xuICAgICAgbWFya2VyU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMucmVtb3ZlKG1hcmtlclN1YnNjcmlwdGlvbik7XG4gICAgfSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQobWFya2VyU3Vic2NyaXB0aW9uKTtcbiAgfVxuXG4gIF9hc3NlcnROb3REaXNwb3NlZCgpOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQoIXRoaXMuX2Rpc3Bvc2VkLCAnTWFya2VyVHJhY2tlciBoYXMgYmVlbiBkaXNwb3NlZCcpO1xuICB9XG59XG4iXX0=