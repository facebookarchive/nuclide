var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _textedit = require('../../../textedit');

var _commons = require('../../../commons');

var _MarkerTracker = require('./MarkerTracker');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _require = require('atom');

var Disposable = _require.Disposable;
var Emitter = _require.Emitter;

var PROJECT_MESSAGE_CHANGE_EVENT = 'messages-changed-for-project';
var ALL_CHANGE_EVENT = 'messages-changed';

var DiagnosticStore = (function () {
  function DiagnosticStore() {
    _classCallCheck(this, DiagnosticStore);

    this._providerToFileToMessages = new Map();
    this._fileToProviders = new Map();
    this._providerToProjectDiagnostics = new Map();

    this._fileChangeEmitter = new Emitter();
    this._nonFileChangeEmitter = new Emitter();
    this._fileToListenersCount = new Map();
    this._projectListenersCount = 0;
    this._allMessagesListenersCount = 0;

    this._markerTracker = new _MarkerTracker.MarkerTracker();
  }

  _createClass(DiagnosticStore, [{
    key: 'dispose',
    value: function dispose() {
      this._providerToFileToMessages.clear();
      this._fileToProviders.clear();
      this._providerToProjectDiagnostics.clear();
      this._fileChangeEmitter.dispose();
      this._nonFileChangeEmitter.dispose();
      this._fileToListenersCount.clear();
      this._markerTracker.dispose();
    }

    /**
     * Section: Methods to modify the store.
     */

    /**
     * Update the messages from the given provider.
     * If the update contains messages at a scope that already has messages from
     * this provider in the store, the existing messages will be overwritten by the
     * new messages.
     * @param diagnosticProvider The diagnostic provider that these messages come from.
     * @param updates Set of updates to apply.
     */
  }, {
    key: 'updateMessages',
    value: function updateMessages(diagnosticProvider, updates) {
      if (updates.filePathToMessages) {
        this._updateFileMessages(diagnosticProvider, updates.filePathToMessages);
      }
      if (updates.projectMessages) {
        this._updateProjectMessages(diagnosticProvider, updates.projectMessages);
      }
      if (updates.filePathToMessages || updates.projectMessages) {
        this._emitAllMessages();
      }
    }
  }, {
    key: '_updateFileMessages',
    value: function _updateFileMessages(diagnosticProvider, newFilePathsToMessages) {
      var _this = this;

      var fileToMessages = this._providerToFileToMessages.get(diagnosticProvider);
      if (!fileToMessages) {
        fileToMessages = new Map();
        this._providerToFileToMessages.set(diagnosticProvider, fileToMessages);
      }
      newFilePathsToMessages.forEach(function (newMessagesForPath, filePath) {
        // Flow naively thinks that since we are in a closure, fileToMessages could have been
        // reassigned to something null by the time this executes.
        (0, _assert2['default'])(fileToMessages != null);

        var messagesToRemove = fileToMessages.get(filePath);
        if (messagesToRemove != null) {
          _this._markerTracker.removeFileMessages(messagesToRemove);
        }
        _this._markerTracker.addFileMessages(newMessagesForPath);

        // Update _providerToFileToMessages.
        fileToMessages.set(filePath, newMessagesForPath);
        // Update _fileToProviders.
        var providers = _this._fileToProviders.get(filePath);
        if (!providers) {
          providers = new Set();
          _this._fileToProviders.set(filePath, providers);
        }
        providers.add(diagnosticProvider);

        _this._emitFileMessages(filePath);
      });
    }
  }, {
    key: '_updateProjectMessages',
    value: function _updateProjectMessages(diagnosticProvider, projectMessages) {
      this._providerToProjectDiagnostics.set(diagnosticProvider, projectMessages);
      this._emitProjectMessages();
    }

    /**
     * Clear the messages from the given provider, according to the options.
     * @param options An Object of the form:
     *   * scope: Can be 'file', 'project', or 'all'.
     *       * 'file': The 'filePaths' option determines which files' messages to clear
     *       * 'project': all 'project' scope messages are cleared.
     *       * 'all': all messages are cleared.
     *   * filePaths: Array of absolute file paths (NuclideUri) to clear messages for.
     */
  }, {
    key: 'invalidateMessages',
    value: function invalidateMessages(diagnosticProvider, invalidationMessage) {
      if (invalidationMessage.scope === 'file') {
        this._invalidateFileMessagesForProvider(diagnosticProvider, invalidationMessage.filePaths);
        this._emitAllMessages();
      } else if (invalidationMessage.scope === 'project') {
        this._invalidateProjectMessagesForProvider(diagnosticProvider);
        this._emitAllMessages();
      } else if (invalidationMessage.scope === 'all') {
        this._invalidateAllMessagesForProvider(diagnosticProvider);
      }
    }
  }, {
    key: '_invalidateFileMessagesForProvider',
    value: function _invalidateFileMessagesForProvider(diagnosticProvider, pathsToRemove) {
      var fileToDiagnostics = this._providerToFileToMessages.get(diagnosticProvider);
      for (var filePath of pathsToRemove) {
        // Update _providerToFileToMessages.
        if (fileToDiagnostics) {
          var diagnosticsToRemove = fileToDiagnostics.get(filePath);
          if (diagnosticsToRemove != null) {
            this._markerTracker.removeFileMessages(diagnosticsToRemove);
          }
          fileToDiagnostics['delete'](filePath);
        }
        // Update _fileToProviders.
        var providers = this._fileToProviders.get(filePath);
        if (providers) {
          providers['delete'](diagnosticProvider);
        }
        this._emitFileMessages(filePath);
      }
    }
  }, {
    key: '_invalidateProjectMessagesForProvider',
    value: function _invalidateProjectMessagesForProvider(diagnosticProvider) {
      this._providerToProjectDiagnostics['delete'](diagnosticProvider);
      this._emitProjectMessages();
    }
  }, {
    key: '_invalidateAllMessagesForProvider',
    value: function _invalidateAllMessagesForProvider(diagnosticProvider) {
      // Invalidate all file messages.
      var filesToDiagnostics = this._providerToFileToMessages.get(diagnosticProvider);
      if (filesToDiagnostics) {
        var allFilePaths = filesToDiagnostics.keys();
        this._invalidateFileMessagesForProvider(diagnosticProvider, allFilePaths);
      }
      // Invalidate all project messages.
      this._invalidateProjectMessagesForProvider(diagnosticProvider);

      this._emitAllMessages();
    }
  }, {
    key: '_invalidateSingleMessage',
    value: function _invalidateSingleMessage(message) {
      this._markerTracker.removeFileMessages([message]);
      for (var fileToMessages of this._providerToFileToMessages.values()) {
        var fileMessages = fileToMessages.get(message.filePath);
        if (fileMessages != null) {
          _commons.array.remove(fileMessages, message);
        }
      }
      // Looks like emitAllMessages does not actually emit all messages. We need to do both for both
      // the gutter UI and the diagnostics table to get updated.
      this._emitFileMessages(message.filePath);
      this._emitAllMessages();
    }

    /**
     * Section: Methods to read from the store.
     */

    /**
     * Call the callback when the filePath's messages have changed.
     * In addition, the Store will immediately invoke the callback with the data
     * currently in the Store, iff there is any.
     * @param callback The function to message when any of the filePaths' messages
     *   change. The array of messages is meant to completely replace any previous
     *   messages for this file path.
     */
  }, {
    key: 'onFileMessagesDidUpdate',
    value: function onFileMessagesDidUpdate(callback, filePath) {
      var _this2 = this;

      // Use the filePath as the event name.
      var emitterDisposable = this._fileChangeEmitter.on(filePath, callback);
      this._incrementFileListenerCount(filePath);

      var fileMessages = this._getFileMessages(filePath);
      if (fileMessages.length) {
        callback({ filePath: filePath, messages: fileMessages });
      }
      return new Disposable(function () {
        emitterDisposable.dispose();
        _this2._decrementFileListenerCount(filePath);
      });
    }
  }, {
    key: '_incrementFileListenerCount',
    value: function _incrementFileListenerCount(filePath) {
      var currentCount = this._fileToListenersCount.get(filePath) || 0;
      this._fileToListenersCount.set(filePath, currentCount + 1);
    }
  }, {
    key: '_decrementFileListenerCount',
    value: function _decrementFileListenerCount(filePath) {
      var currentCount = this._fileToListenersCount.get(filePath) || 0;
      if (currentCount > 0) {
        this._fileToListenersCount.set(filePath, currentCount - 1);
      }
    }

    /**
     * Call the callback when project-scope messages change.
     * In addition, the Store will immediately invoke the callback with the data
     * currently in the Store, iff there is any.
     * @param callback The function to message when the project-scope messages
     *   change. The array of messages is meant to completely replace any previous
     *   project-scope messages.
     */
  }, {
    key: 'onProjectMessagesDidUpdate',
    value: function onProjectMessagesDidUpdate(callback) {
      var _this3 = this;

      var emitterDisposable = this._nonFileChangeEmitter.on(PROJECT_MESSAGE_CHANGE_EVENT, callback);
      this._projectListenersCount += 1;

      var projectMessages = this._getProjectMessages();
      if (projectMessages.length) {
        callback(projectMessages);
      }
      return new Disposable(function () {
        emitterDisposable.dispose();
        _this3._projectListenersCount -= 1;
      });
    }

    /**
     * Call the callback when any messages change.
     * In addition, the Store will immediately invoke the callback with data
     * currently in the Store, iff there is any.
     * @param callback The function to message when any messages change. The array
     *   of messages is meant to completely replace any previous messages.
     */
  }, {
    key: 'onAllMessagesDidUpdate',
    value: function onAllMessagesDidUpdate(callback) {
      var _this4 = this;

      var emitterDisposable = this._nonFileChangeEmitter.on(ALL_CHANGE_EVENT, callback);
      this._allMessagesListenersCount += 1;

      var allMessages = this._getAllMessages();
      if (allMessages.length) {
        callback(allMessages);
      }
      return new Disposable(function () {
        emitterDisposable.dispose();
        _this4._allMessagesListenersCount -= 1;
      });
    }

    /**
     * Gets the current diagnostic messages for the file.
     * Prefer to get updates via ::onFileMessagesDidUpdate.
     */
  }, {
    key: '_getFileMessages',
    value: function _getFileMessages(filePath) {
      var allFileMessages = [];
      var relevantProviders = this._fileToProviders.get(filePath);
      if (relevantProviders) {
        for (var provider of relevantProviders) {
          var fileToMessages = this._providerToFileToMessages.get(provider);
          (0, _assert2['default'])(fileToMessages != null);
          var _messages = fileToMessages.get(filePath);
          (0, _assert2['default'])(_messages != null);
          allFileMessages = allFileMessages.concat(_messages);
        }
      }
      return allFileMessages;
    }

    /**
     * Gets the current project-scope diagnostic messages.
     * Prefer to get updates via ::onProjectMessagesDidUpdate.
     */
  }, {
    key: '_getProjectMessages',
    value: function _getProjectMessages() {
      var allProjectMessages = [];
      for (var _messages2 of this._providerToProjectDiagnostics.values()) {
        allProjectMessages = allProjectMessages.concat(_messages2);
      }
      return allProjectMessages;
    }

    /**
     * Gets all current diagnostic messages.
     * Prefer to get updates via ::onAllMessagesDidUpdate.
     */
  }, {
    key: '_getAllMessages',
    value: function _getAllMessages() {
      var allMessages = [];
      // Get all file messages.
      for (var fileToMessages of this._providerToFileToMessages.values()) {
        for (var _messages3 of fileToMessages.values()) {
          allMessages = allMessages.concat(_messages3);
        }
      }
      // Get all project messages.
      allMessages = allMessages.concat(this._getProjectMessages());
      return allMessages;
    }

    /**
     * Section: Feedback from the UI
     */

  }, {
    key: 'applyFix',
    value: function applyFix(message) {
      var succeeded = this._applySingleFix(message);
      if (!succeeded) {
        notifyFixFailed();
      }
    }
  }, {
    key: 'applyFixesForFile',
    value: function applyFixesForFile(file) {
      for (var message of this._getFileMessages(file)) {
        if (message.fix != null) {
          var succeeded = this._applySingleFix(message);
          if (!succeeded) {
            notifyFixFailed();
            return;
          }
        }
      }
    }

    /**
     * Returns true iff the fix succeeds.
     */
  }, {
    key: '_applySingleFix',
    value: function _applySingleFix(message) {
      var fix = message.fix;
      (0, _assert2['default'])(fix != null);

      var actualRange = this._markerTracker.getCurrentRange(message);

      if (actualRange == null) {
        return false;
      }

      var fixWithActualRange = _extends({}, fix, {
        oldRange: actualRange
      });
      var succeeded = (0, _textedit.applyTextEdit)(message.filePath, fixWithActualRange);
      if (succeeded) {
        this._invalidateSingleMessage(message);
        return true;
      } else {
        return false;
      }
    }

    /**
     * Section: Event Emitting
     */

  }, {
    key: '_emitFileMessages',
    value: function _emitFileMessages(filePath) {
      if (this._fileToListenersCount.get(filePath)) {
        this._fileChangeEmitter.emit(filePath, { filePath: filePath, messages: this._getFileMessages(filePath) });
      }
    }
  }, {
    key: '_emitProjectMessages',
    value: function _emitProjectMessages() {
      if (this._projectListenersCount) {
        this._nonFileChangeEmitter.emit(PROJECT_MESSAGE_CHANGE_EVENT, this._getProjectMessages());
      }
    }
  }, {
    key: '_emitAllMessages',
    value: function _emitAllMessages() {
      if (this._allMessagesListenersCount) {
        this._nonFileChangeEmitter.emit(ALL_CHANGE_EVENT, this._getAllMessages());
      }
    }
  }]);

  return DiagnosticStore;
})();

function notifyFixFailed() {
  atom.notifications.addWarning('Failed to apply fix. Try saving to get fresh results and then try again.');
}

module.exports = DiagnosticStore;

// A map from each diagnostic provider to:
// a map from each file it has messages for to the array of messages for that file.

// A map from each file that has messages from any diagnostic provider
// to the set of diagnostic providers that have messages for it.

// A map from each diagnostic provider to the array of project messages from it.

// File paths are used as event names for the _fileChangeEmitter, so a second
// emitter is used for other events to prevent event name collisions.

// A map of NuclideUri to the number of listeners registered for changes to
// messages for that file.
//# sourceMappingURL=data:application/json;base64,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LENBQUMsSUFBSSxDQUFDLDRCQUE0QixFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7T0FDM0Y7S0FDRjs7O1dBRWUsNEJBQVM7QUFDdkIsVUFBSSxJQUFJLENBQUMsMEJBQTBCLEVBQUU7QUFDbkMsWUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztPQUMzRTtLQUNGOzs7U0FoWkcsZUFBZTs7O0FBbVpyQixTQUFTLGVBQWUsR0FBRztBQUN6QixNQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FDM0IsMEVBQTBFLENBQzNFLENBQUM7Q0FDSDs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJEaWFnbm9zdGljU3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEludmFsaWRhdGlvbk1lc3NhZ2UsXG4gIERpYWdub3N0aWNNZXNzYWdlLFxuICBEaWFnbm9zdGljUHJvdmlkZXIsXG4gIERpYWdub3N0aWNQcm92aWRlclVwZGF0ZSxcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBQcm9qZWN0RGlhZ25vc3RpY01lc3NhZ2UsXG4gIEZpbGVNZXNzYWdlVXBkYXRlLFxufSBmcm9tICcuL21haW4nO1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmltcG9ydCB7YXBwbHlUZXh0RWRpdH0gZnJvbSAnLi4vLi4vLi4vdGV4dGVkaXQnO1xuXG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi8uLi9jb21tb25zJztcblxuaW1wb3J0IHtNYXJrZXJUcmFja2VyfSBmcm9tICcuL01hcmtlclRyYWNrZXInO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IHtEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUoJ2F0b20nKTtcblxuY29uc3QgUFJPSkVDVF9NRVNTQUdFX0NIQU5HRV9FVkVOVCA9ICdtZXNzYWdlcy1jaGFuZ2VkLWZvci1wcm9qZWN0JztcbmNvbnN0IEFMTF9DSEFOR0VfRVZFTlQgPSAnbWVzc2FnZXMtY2hhbmdlZCc7XG5cbmNsYXNzIERpYWdub3N0aWNTdG9yZSB7XG4gIC8vIEEgbWFwIGZyb20gZWFjaCBkaWFnbm9zdGljIHByb3ZpZGVyIHRvOlxuICAvLyBhIG1hcCBmcm9tIGVhY2ggZmlsZSBpdCBoYXMgbWVzc2FnZXMgZm9yIHRvIHRoZSBhcnJheSBvZiBtZXNzYWdlcyBmb3IgdGhhdCBmaWxlLlxuICBfcHJvdmlkZXJUb0ZpbGVUb01lc3NhZ2VzOiBNYXA8RGlhZ25vc3RpY1Byb3ZpZGVyLCBNYXA8TnVjbGlkZVVyaSwgQXJyYXk8RmlsZURpYWdub3N0aWNNZXNzYWdlPj4+O1xuICAvLyBBIG1hcCBmcm9tIGVhY2ggZmlsZSB0aGF0IGhhcyBtZXNzYWdlcyBmcm9tIGFueSBkaWFnbm9zdGljIHByb3ZpZGVyXG4gIC8vIHRvIHRoZSBzZXQgb2YgZGlhZ25vc3RpYyBwcm92aWRlcnMgdGhhdCBoYXZlIG1lc3NhZ2VzIGZvciBpdC5cbiAgX2ZpbGVUb1Byb3ZpZGVyczogTWFwPE51Y2xpZGVVcmksIFNldDxEaWFnbm9zdGljUHJvdmlkZXI+PjtcblxuICAvLyBBIG1hcCBmcm9tIGVhY2ggZGlhZ25vc3RpYyBwcm92aWRlciB0byB0aGUgYXJyYXkgb2YgcHJvamVjdCBtZXNzYWdlcyBmcm9tIGl0LlxuICBfcHJvdmlkZXJUb1Byb2plY3REaWFnbm9zdGljczogTWFwPERpYWdub3N0aWNQcm92aWRlciwgQXJyYXk8UHJvamVjdERpYWdub3N0aWNNZXNzYWdlPj47XG5cbiAgLy8gRmlsZSBwYXRocyBhcmUgdXNlZCBhcyBldmVudCBuYW1lcyBmb3IgdGhlIF9maWxlQ2hhbmdlRW1pdHRlciwgc28gYSBzZWNvbmRcbiAgLy8gZW1pdHRlciBpcyB1c2VkIGZvciBvdGhlciBldmVudHMgdG8gcHJldmVudCBldmVudCBuYW1lIGNvbGxpc2lvbnMuXG4gIF9maWxlQ2hhbmdlRW1pdHRlcjogRW1pdHRlcjtcbiAgX25vbkZpbGVDaGFuZ2VFbWl0dGVyOiBFbWl0dGVyO1xuICAvLyBBIG1hcCBvZiBOdWNsaWRlVXJpIHRvIHRoZSBudW1iZXIgb2YgbGlzdGVuZXJzIHJlZ2lzdGVyZWQgZm9yIGNoYW5nZXMgdG9cbiAgLy8gbWVzc2FnZXMgZm9yIHRoYXQgZmlsZS5cbiAgX2ZpbGVUb0xpc3RlbmVyc0NvdW50OiBNYXA8TnVjbGlkZVVyaSwgbnVtYmVyPjtcbiAgX3Byb2plY3RMaXN0ZW5lcnNDb3VudDogbnVtYmVyO1xuICBfYWxsTWVzc2FnZXNMaXN0ZW5lcnNDb3VudDogbnVtYmVyO1xuXG4gIF9tYXJrZXJUcmFja2VyOiBNYXJrZXJUcmFja2VyO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3Byb3ZpZGVyVG9GaWxlVG9NZXNzYWdlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9maWxlVG9Qcm92aWRlcnMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fcHJvdmlkZXJUb1Byb2plY3REaWFnbm9zdGljcyA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuX2ZpbGVDaGFuZ2VFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9ub25GaWxlQ2hhbmdlRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fZmlsZVRvTGlzdGVuZXJzQ291bnQgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fcHJvamVjdExpc3RlbmVyc0NvdW50ID0gMDtcbiAgICB0aGlzLl9hbGxNZXNzYWdlc0xpc3RlbmVyc0NvdW50ID0gMDtcblxuICAgIHRoaXMuX21hcmtlclRyYWNrZXIgPSBuZXcgTWFya2VyVHJhY2tlcigpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9wcm92aWRlclRvRmlsZVRvTWVzc2FnZXMuY2xlYXIoKTtcbiAgICB0aGlzLl9maWxlVG9Qcm92aWRlcnMuY2xlYXIoKTtcbiAgICB0aGlzLl9wcm92aWRlclRvUHJvamVjdERpYWdub3N0aWNzLmNsZWFyKCk7XG4gICAgdGhpcy5fZmlsZUNoYW5nZUVtaXR0ZXIuZGlzcG9zZSgpO1xuICAgIHRoaXMuX25vbkZpbGVDaGFuZ2VFbWl0dGVyLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9maWxlVG9MaXN0ZW5lcnNDb3VudC5jbGVhcigpO1xuICAgIHRoaXMuX21hcmtlclRyYWNrZXIuZGlzcG9zZSgpO1xuICB9XG5cblxuICAvKipcbiAgICogU2VjdGlvbjogTWV0aG9kcyB0byBtb2RpZnkgdGhlIHN0b3JlLlxuICAgKi9cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBtZXNzYWdlcyBmcm9tIHRoZSBnaXZlbiBwcm92aWRlci5cbiAgICogSWYgdGhlIHVwZGF0ZSBjb250YWlucyBtZXNzYWdlcyBhdCBhIHNjb3BlIHRoYXQgYWxyZWFkeSBoYXMgbWVzc2FnZXMgZnJvbVxuICAgKiB0aGlzIHByb3ZpZGVyIGluIHRoZSBzdG9yZSwgdGhlIGV4aXN0aW5nIG1lc3NhZ2VzIHdpbGwgYmUgb3ZlcndyaXR0ZW4gYnkgdGhlXG4gICAqIG5ldyBtZXNzYWdlcy5cbiAgICogQHBhcmFtIGRpYWdub3N0aWNQcm92aWRlciBUaGUgZGlhZ25vc3RpYyBwcm92aWRlciB0aGF0IHRoZXNlIG1lc3NhZ2VzIGNvbWUgZnJvbS5cbiAgICogQHBhcmFtIHVwZGF0ZXMgU2V0IG9mIHVwZGF0ZXMgdG8gYXBwbHkuXG4gICAqL1xuICB1cGRhdGVNZXNzYWdlcyhcbiAgICAgIGRpYWdub3N0aWNQcm92aWRlcjogRGlhZ25vc3RpY1Byb3ZpZGVyLFxuICAgICAgdXBkYXRlczogRGlhZ25vc3RpY1Byb3ZpZGVyVXBkYXRlLFxuICAgICk6IHZvaWQge1xuICAgIGlmICh1cGRhdGVzLmZpbGVQYXRoVG9NZXNzYWdlcykge1xuICAgICAgdGhpcy5fdXBkYXRlRmlsZU1lc3NhZ2VzKGRpYWdub3N0aWNQcm92aWRlciwgdXBkYXRlcy5maWxlUGF0aFRvTWVzc2FnZXMpO1xuICAgIH1cbiAgICBpZiAodXBkYXRlcy5wcm9qZWN0TWVzc2FnZXMpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVByb2plY3RNZXNzYWdlcyhkaWFnbm9zdGljUHJvdmlkZXIsIHVwZGF0ZXMucHJvamVjdE1lc3NhZ2VzKTtcbiAgICB9XG4gICAgaWYgKHVwZGF0ZXMuZmlsZVBhdGhUb01lc3NhZ2VzIHx8IHVwZGF0ZXMucHJvamVjdE1lc3NhZ2VzKSB7XG4gICAgICB0aGlzLl9lbWl0QWxsTWVzc2FnZXMoKTtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlRmlsZU1lc3NhZ2VzKFxuICAgICAgZGlhZ25vc3RpY1Byb3ZpZGVyOiBEaWFnbm9zdGljUHJvdmlkZXIsXG4gICAgICBuZXdGaWxlUGF0aHNUb01lc3NhZ2VzOiBNYXA8TnVjbGlkZVVyaSwgQXJyYXk8RmlsZURpYWdub3N0aWNNZXNzYWdlPj5cbiAgICApOiB2b2lkIHtcbiAgICBsZXQgZmlsZVRvTWVzc2FnZXMgPSB0aGlzLl9wcm92aWRlclRvRmlsZVRvTWVzc2FnZXMuZ2V0KGRpYWdub3N0aWNQcm92aWRlcik7XG4gICAgaWYgKCFmaWxlVG9NZXNzYWdlcykge1xuICAgICAgZmlsZVRvTWVzc2FnZXMgPSBuZXcgTWFwKCk7XG4gICAgICB0aGlzLl9wcm92aWRlclRvRmlsZVRvTWVzc2FnZXMuc2V0KGRpYWdub3N0aWNQcm92aWRlciwgZmlsZVRvTWVzc2FnZXMpO1xuICAgIH1cbiAgICBuZXdGaWxlUGF0aHNUb01lc3NhZ2VzLmZvckVhY2goKG5ld01lc3NhZ2VzRm9yUGF0aCwgZmlsZVBhdGgpID0+IHtcbiAgICAgIC8vIEZsb3cgbmFpdmVseSB0aGlua3MgdGhhdCBzaW5jZSB3ZSBhcmUgaW4gYSBjbG9zdXJlLCBmaWxlVG9NZXNzYWdlcyBjb3VsZCBoYXZlIGJlZW5cbiAgICAgIC8vIHJlYXNzaWduZWQgdG8gc29tZXRoaW5nIG51bGwgYnkgdGhlIHRpbWUgdGhpcyBleGVjdXRlcy5cbiAgICAgIGludmFyaWFudChmaWxlVG9NZXNzYWdlcyAhPSBudWxsKTtcblxuICAgICAgY29uc3QgbWVzc2FnZXNUb1JlbW92ZSA9IGZpbGVUb01lc3NhZ2VzLmdldChmaWxlUGF0aCk7XG4gICAgICBpZiAobWVzc2FnZXNUb1JlbW92ZSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuX21hcmtlclRyYWNrZXIucmVtb3ZlRmlsZU1lc3NhZ2VzKG1lc3NhZ2VzVG9SZW1vdmUpO1xuICAgICAgfVxuICAgICAgdGhpcy5fbWFya2VyVHJhY2tlci5hZGRGaWxlTWVzc2FnZXMobmV3TWVzc2FnZXNGb3JQYXRoKTtcblxuICAgICAgLy8gVXBkYXRlIF9wcm92aWRlclRvRmlsZVRvTWVzc2FnZXMuXG4gICAgICBmaWxlVG9NZXNzYWdlcy5zZXQoZmlsZVBhdGgsIG5ld01lc3NhZ2VzRm9yUGF0aCk7XG4gICAgICAvLyBVcGRhdGUgX2ZpbGVUb1Byb3ZpZGVycy5cbiAgICAgIGxldCBwcm92aWRlcnMgPSB0aGlzLl9maWxlVG9Qcm92aWRlcnMuZ2V0KGZpbGVQYXRoKTtcbiAgICAgIGlmICghcHJvdmlkZXJzKSB7XG4gICAgICAgIHByb3ZpZGVycyA9IG5ldyBTZXQoKTtcbiAgICAgICAgdGhpcy5fZmlsZVRvUHJvdmlkZXJzLnNldChmaWxlUGF0aCwgcHJvdmlkZXJzKTtcbiAgICAgIH1cbiAgICAgIHByb3ZpZGVycy5hZGQoZGlhZ25vc3RpY1Byb3ZpZGVyKTtcblxuICAgICAgdGhpcy5fZW1pdEZpbGVNZXNzYWdlcyhmaWxlUGF0aCk7XG4gICAgfSk7XG4gIH1cblxuICBfdXBkYXRlUHJvamVjdE1lc3NhZ2VzKFxuICAgIGRpYWdub3N0aWNQcm92aWRlcjogRGlhZ25vc3RpY1Byb3ZpZGVyLFxuICAgIHByb2plY3RNZXNzYWdlczogQXJyYXk8UHJvamVjdERpYWdub3N0aWNNZXNzYWdlPlxuICApOiB2b2lkIHtcbiAgICB0aGlzLl9wcm92aWRlclRvUHJvamVjdERpYWdub3N0aWNzLnNldChkaWFnbm9zdGljUHJvdmlkZXIsIHByb2plY3RNZXNzYWdlcyk7XG4gICAgdGhpcy5fZW1pdFByb2plY3RNZXNzYWdlcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIHRoZSBtZXNzYWdlcyBmcm9tIHRoZSBnaXZlbiBwcm92aWRlciwgYWNjb3JkaW5nIHRvIHRoZSBvcHRpb25zLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBBbiBPYmplY3Qgb2YgdGhlIGZvcm06XG4gICAqICAgKiBzY29wZTogQ2FuIGJlICdmaWxlJywgJ3Byb2plY3QnLCBvciAnYWxsJy5cbiAgICogICAgICAgKiAnZmlsZSc6IFRoZSAnZmlsZVBhdGhzJyBvcHRpb24gZGV0ZXJtaW5lcyB3aGljaCBmaWxlcycgbWVzc2FnZXMgdG8gY2xlYXJcbiAgICogICAgICAgKiAncHJvamVjdCc6IGFsbCAncHJvamVjdCcgc2NvcGUgbWVzc2FnZXMgYXJlIGNsZWFyZWQuXG4gICAqICAgICAgICogJ2FsbCc6IGFsbCBtZXNzYWdlcyBhcmUgY2xlYXJlZC5cbiAgICogICAqIGZpbGVQYXRoczogQXJyYXkgb2YgYWJzb2x1dGUgZmlsZSBwYXRocyAoTnVjbGlkZVVyaSkgdG8gY2xlYXIgbWVzc2FnZXMgZm9yLlxuICAgKi9cbiAgaW52YWxpZGF0ZU1lc3NhZ2VzKFxuICAgICAgZGlhZ25vc3RpY1Byb3ZpZGVyOiBEaWFnbm9zdGljUHJvdmlkZXIsXG4gICAgICBpbnZhbGlkYXRpb25NZXNzYWdlOiBJbnZhbGlkYXRpb25NZXNzYWdlXG4gICAgKTogdm9pZCB7XG4gICAgaWYgKGludmFsaWRhdGlvbk1lc3NhZ2Uuc2NvcGUgPT09ICdmaWxlJykge1xuICAgICAgdGhpcy5faW52YWxpZGF0ZUZpbGVNZXNzYWdlc0ZvclByb3ZpZGVyKGRpYWdub3N0aWNQcm92aWRlciwgaW52YWxpZGF0aW9uTWVzc2FnZS5maWxlUGF0aHMpO1xuICAgICAgdGhpcy5fZW1pdEFsbE1lc3NhZ2VzKCk7XG4gICAgfSBlbHNlIGlmIChpbnZhbGlkYXRpb25NZXNzYWdlLnNjb3BlID09PSAncHJvamVjdCcpIHtcbiAgICAgIHRoaXMuX2ludmFsaWRhdGVQcm9qZWN0TWVzc2FnZXNGb3JQcm92aWRlcihkaWFnbm9zdGljUHJvdmlkZXIpO1xuICAgICAgdGhpcy5fZW1pdEFsbE1lc3NhZ2VzKCk7XG4gICAgfSBlbHNlIGlmIChpbnZhbGlkYXRpb25NZXNzYWdlLnNjb3BlID09PSAnYWxsJykge1xuICAgICAgdGhpcy5faW52YWxpZGF0ZUFsbE1lc3NhZ2VzRm9yUHJvdmlkZXIoZGlhZ25vc3RpY1Byb3ZpZGVyKTtcbiAgICB9XG4gIH1cblxuICBfaW52YWxpZGF0ZUZpbGVNZXNzYWdlc0ZvclByb3ZpZGVyKFxuICAgIGRpYWdub3N0aWNQcm92aWRlcjogRGlhZ25vc3RpY1Byb3ZpZGVyLFxuICAgIHBhdGhzVG9SZW1vdmU6IEl0ZXJhYmxlPE51Y2xpZGVVcmk+XG4gICk6IHZvaWQge1xuICAgIGNvbnN0IGZpbGVUb0RpYWdub3N0aWNzID0gdGhpcy5fcHJvdmlkZXJUb0ZpbGVUb01lc3NhZ2VzLmdldChkaWFnbm9zdGljUHJvdmlkZXIpO1xuICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgcGF0aHNUb1JlbW92ZSkge1xuICAgICAgLy8gVXBkYXRlIF9wcm92aWRlclRvRmlsZVRvTWVzc2FnZXMuXG4gICAgICBpZiAoZmlsZVRvRGlhZ25vc3RpY3MpIHtcbiAgICAgICAgY29uc3QgZGlhZ25vc3RpY3NUb1JlbW92ZSA9IGZpbGVUb0RpYWdub3N0aWNzLmdldChmaWxlUGF0aCk7XG4gICAgICAgIGlmIChkaWFnbm9zdGljc1RvUmVtb3ZlICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9tYXJrZXJUcmFja2VyLnJlbW92ZUZpbGVNZXNzYWdlcyhkaWFnbm9zdGljc1RvUmVtb3ZlKTtcbiAgICAgICAgfVxuICAgICAgICBmaWxlVG9EaWFnbm9zdGljcy5kZWxldGUoZmlsZVBhdGgpO1xuICAgICAgfVxuICAgICAgLy8gVXBkYXRlIF9maWxlVG9Qcm92aWRlcnMuXG4gICAgICBjb25zdCBwcm92aWRlcnMgPSB0aGlzLl9maWxlVG9Qcm92aWRlcnMuZ2V0KGZpbGVQYXRoKTtcbiAgICAgIGlmIChwcm92aWRlcnMpIHtcbiAgICAgICAgcHJvdmlkZXJzLmRlbGV0ZShkaWFnbm9zdGljUHJvdmlkZXIpO1xuICAgICAgfVxuICAgICAgdGhpcy5fZW1pdEZpbGVNZXNzYWdlcyhmaWxlUGF0aCk7XG4gICAgfVxuICB9XG5cbiAgX2ludmFsaWRhdGVQcm9qZWN0TWVzc2FnZXNGb3JQcm92aWRlcihkaWFnbm9zdGljUHJvdmlkZXI6IERpYWdub3N0aWNQcm92aWRlcik6IHZvaWQge1xuICAgIHRoaXMuX3Byb3ZpZGVyVG9Qcm9qZWN0RGlhZ25vc3RpY3MuZGVsZXRlKGRpYWdub3N0aWNQcm92aWRlcik7XG4gICAgdGhpcy5fZW1pdFByb2plY3RNZXNzYWdlcygpO1xuICB9XG5cbiAgX2ludmFsaWRhdGVBbGxNZXNzYWdlc0ZvclByb3ZpZGVyKGRpYWdub3N0aWNQcm92aWRlcjogRGlhZ25vc3RpY1Byb3ZpZGVyKTogdm9pZCB7XG4gICAgLy8gSW52YWxpZGF0ZSBhbGwgZmlsZSBtZXNzYWdlcy5cbiAgICBjb25zdCBmaWxlc1RvRGlhZ25vc3RpY3MgPSB0aGlzLl9wcm92aWRlclRvRmlsZVRvTWVzc2FnZXMuZ2V0KGRpYWdub3N0aWNQcm92aWRlcik7XG4gICAgaWYgKGZpbGVzVG9EaWFnbm9zdGljcykge1xuICAgICAgY29uc3QgYWxsRmlsZVBhdGhzID0gZmlsZXNUb0RpYWdub3N0aWNzLmtleXMoKTtcbiAgICAgIHRoaXMuX2ludmFsaWRhdGVGaWxlTWVzc2FnZXNGb3JQcm92aWRlcihkaWFnbm9zdGljUHJvdmlkZXIsIGFsbEZpbGVQYXRocyk7XG4gICAgfVxuICAgIC8vIEludmFsaWRhdGUgYWxsIHByb2plY3QgbWVzc2FnZXMuXG4gICAgdGhpcy5faW52YWxpZGF0ZVByb2plY3RNZXNzYWdlc0ZvclByb3ZpZGVyKGRpYWdub3N0aWNQcm92aWRlcik7XG5cbiAgICB0aGlzLl9lbWl0QWxsTWVzc2FnZXMoKTtcbiAgfVxuXG4gIF9pbnZhbGlkYXRlU2luZ2xlTWVzc2FnZShtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UpOiB2b2lkIHtcbiAgICB0aGlzLl9tYXJrZXJUcmFja2VyLnJlbW92ZUZpbGVNZXNzYWdlcyhbbWVzc2FnZV0pO1xuICAgIGZvciAoY29uc3QgZmlsZVRvTWVzc2FnZXMgb2YgdGhpcy5fcHJvdmlkZXJUb0ZpbGVUb01lc3NhZ2VzLnZhbHVlcygpKSB7XG4gICAgICBjb25zdCBmaWxlTWVzc2FnZXMgPSBmaWxlVG9NZXNzYWdlcy5nZXQobWVzc2FnZS5maWxlUGF0aCk7XG4gICAgICBpZiAoZmlsZU1lc3NhZ2VzICE9IG51bGwpIHtcbiAgICAgICAgYXJyYXkucmVtb3ZlKGZpbGVNZXNzYWdlcywgbWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIExvb2tzIGxpa2UgZW1pdEFsbE1lc3NhZ2VzIGRvZXMgbm90IGFjdHVhbGx5IGVtaXQgYWxsIG1lc3NhZ2VzLiBXZSBuZWVkIHRvIGRvIGJvdGggZm9yIGJvdGhcbiAgICAvLyB0aGUgZ3V0dGVyIFVJIGFuZCB0aGUgZGlhZ25vc3RpY3MgdGFibGUgdG8gZ2V0IHVwZGF0ZWQuXG4gICAgdGhpcy5fZW1pdEZpbGVNZXNzYWdlcyhtZXNzYWdlLmZpbGVQYXRoKTtcbiAgICB0aGlzLl9lbWl0QWxsTWVzc2FnZXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWN0aW9uOiBNZXRob2RzIHRvIHJlYWQgZnJvbSB0aGUgc3RvcmUuXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDYWxsIHRoZSBjYWxsYmFjayB3aGVuIHRoZSBmaWxlUGF0aCdzIG1lc3NhZ2VzIGhhdmUgY2hhbmdlZC5cbiAgICogSW4gYWRkaXRpb24sIHRoZSBTdG9yZSB3aWxsIGltbWVkaWF0ZWx5IGludm9rZSB0aGUgY2FsbGJhY2sgd2l0aCB0aGUgZGF0YVxuICAgKiBjdXJyZW50bHkgaW4gdGhlIFN0b3JlLCBpZmYgdGhlcmUgaXMgYW55LlxuICAgKiBAcGFyYW0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIG1lc3NhZ2Ugd2hlbiBhbnkgb2YgdGhlIGZpbGVQYXRocycgbWVzc2FnZXNcbiAgICogICBjaGFuZ2UuIFRoZSBhcnJheSBvZiBtZXNzYWdlcyBpcyBtZWFudCB0byBjb21wbGV0ZWx5IHJlcGxhY2UgYW55IHByZXZpb3VzXG4gICAqICAgbWVzc2FnZXMgZm9yIHRoaXMgZmlsZSBwYXRoLlxuICAgKi9cbiAgb25GaWxlTWVzc2FnZXNEaWRVcGRhdGUoXG4gICAgICBjYWxsYmFjazogKHVwZGF0ZTogRmlsZU1lc3NhZ2VVcGRhdGUpID0+IG1peGVkLFxuICAgICAgZmlsZVBhdGg6IE51Y2xpZGVVcmlcbiAgICApOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIC8vIFVzZSB0aGUgZmlsZVBhdGggYXMgdGhlIGV2ZW50IG5hbWUuXG4gICAgY29uc3QgZW1pdHRlckRpc3Bvc2FibGUgPSB0aGlzLl9maWxlQ2hhbmdlRW1pdHRlci5vbihmaWxlUGF0aCwgY2FsbGJhY2spO1xuICAgIHRoaXMuX2luY3JlbWVudEZpbGVMaXN0ZW5lckNvdW50KGZpbGVQYXRoKTtcblxuICAgIGNvbnN0IGZpbGVNZXNzYWdlcyA9IHRoaXMuX2dldEZpbGVNZXNzYWdlcyhmaWxlUGF0aCk7XG4gICAgaWYgKGZpbGVNZXNzYWdlcy5sZW5ndGgpIHtcbiAgICAgIGNhbGxiYWNrKHtmaWxlUGF0aCwgbWVzc2FnZXM6IGZpbGVNZXNzYWdlc30pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgZW1pdHRlckRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fZGVjcmVtZW50RmlsZUxpc3RlbmVyQ291bnQoZmlsZVBhdGgpO1xuICAgIH0pO1xuICB9XG5cbiAgX2luY3JlbWVudEZpbGVMaXN0ZW5lckNvdW50KGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgY29uc3QgY3VycmVudENvdW50ID0gdGhpcy5fZmlsZVRvTGlzdGVuZXJzQ291bnQuZ2V0KGZpbGVQYXRoKSB8fCAwO1xuICAgIHRoaXMuX2ZpbGVUb0xpc3RlbmVyc0NvdW50LnNldChmaWxlUGF0aCwgY3VycmVudENvdW50ICsgMSk7XG4gIH1cblxuICBfZGVjcmVtZW50RmlsZUxpc3RlbmVyQ291bnQoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiB2b2lkIHtcbiAgICBjb25zdCBjdXJyZW50Q291bnQgPSB0aGlzLl9maWxlVG9MaXN0ZW5lcnNDb3VudC5nZXQoZmlsZVBhdGgpIHx8IDA7XG4gICAgaWYgKGN1cnJlbnRDb3VudCA+IDApIHtcbiAgICAgIHRoaXMuX2ZpbGVUb0xpc3RlbmVyc0NvdW50LnNldChmaWxlUGF0aCwgY3VycmVudENvdW50IC0gMSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGwgdGhlIGNhbGxiYWNrIHdoZW4gcHJvamVjdC1zY29wZSBtZXNzYWdlcyBjaGFuZ2UuXG4gICAqIEluIGFkZGl0aW9uLCB0aGUgU3RvcmUgd2lsbCBpbW1lZGlhdGVseSBpbnZva2UgdGhlIGNhbGxiYWNrIHdpdGggdGhlIGRhdGFcbiAgICogY3VycmVudGx5IGluIHRoZSBTdG9yZSwgaWZmIHRoZXJlIGlzIGFueS5cbiAgICogQHBhcmFtIGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBtZXNzYWdlIHdoZW4gdGhlIHByb2plY3Qtc2NvcGUgbWVzc2FnZXNcbiAgICogICBjaGFuZ2UuIFRoZSBhcnJheSBvZiBtZXNzYWdlcyBpcyBtZWFudCB0byBjb21wbGV0ZWx5IHJlcGxhY2UgYW55IHByZXZpb3VzXG4gICAqICAgcHJvamVjdC1zY29wZSBtZXNzYWdlcy5cbiAgICovXG4gIG9uUHJvamVjdE1lc3NhZ2VzRGlkVXBkYXRlKFxuICAgIGNhbGxiYWNrOiAobWVzc2FnZXM6IEFycmF5PFByb2plY3REaWFnbm9zdGljTWVzc2FnZT4pID0+IG1peGVkXG4gICk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgY29uc3QgZW1pdHRlckRpc3Bvc2FibGUgPSB0aGlzLl9ub25GaWxlQ2hhbmdlRW1pdHRlci5vbihQUk9KRUNUX01FU1NBR0VfQ0hBTkdFX0VWRU5ULCBjYWxsYmFjayk7XG4gICAgdGhpcy5fcHJvamVjdExpc3RlbmVyc0NvdW50ICs9IDE7XG5cbiAgICBjb25zdCBwcm9qZWN0TWVzc2FnZXMgPSB0aGlzLl9nZXRQcm9qZWN0TWVzc2FnZXMoKTtcbiAgICBpZiAocHJvamVjdE1lc3NhZ2VzLmxlbmd0aCkge1xuICAgICAgY2FsbGJhY2socHJvamVjdE1lc3NhZ2VzKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGVtaXR0ZXJEaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3Byb2plY3RMaXN0ZW5lcnNDb3VudCAtPSAxO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGwgdGhlIGNhbGxiYWNrIHdoZW4gYW55IG1lc3NhZ2VzIGNoYW5nZS5cbiAgICogSW4gYWRkaXRpb24sIHRoZSBTdG9yZSB3aWxsIGltbWVkaWF0ZWx5IGludm9rZSB0aGUgY2FsbGJhY2sgd2l0aCBkYXRhXG4gICAqIGN1cnJlbnRseSBpbiB0aGUgU3RvcmUsIGlmZiB0aGVyZSBpcyBhbnkuXG4gICAqIEBwYXJhbSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gbWVzc2FnZSB3aGVuIGFueSBtZXNzYWdlcyBjaGFuZ2UuIFRoZSBhcnJheVxuICAgKiAgIG9mIG1lc3NhZ2VzIGlzIG1lYW50IHRvIGNvbXBsZXRlbHkgcmVwbGFjZSBhbnkgcHJldmlvdXMgbWVzc2FnZXMuXG4gICAqL1xuICBvbkFsbE1lc3NhZ2VzRGlkVXBkYXRlKGNhbGxiYWNrOiAobWVzc2FnZXM6IEFycmF5PERpYWdub3N0aWNNZXNzYWdlPikgPT4gbWl4ZWQpOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIGNvbnN0IGVtaXR0ZXJEaXNwb3NhYmxlID0gdGhpcy5fbm9uRmlsZUNoYW5nZUVtaXR0ZXIub24oQUxMX0NIQU5HRV9FVkVOVCwgY2FsbGJhY2spO1xuICAgIHRoaXMuX2FsbE1lc3NhZ2VzTGlzdGVuZXJzQ291bnQgKz0gMTtcblxuICAgIGNvbnN0IGFsbE1lc3NhZ2VzID0gdGhpcy5fZ2V0QWxsTWVzc2FnZXMoKTtcbiAgICBpZiAoYWxsTWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgICBjYWxsYmFjayhhbGxNZXNzYWdlcyk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBlbWl0dGVyRGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9hbGxNZXNzYWdlc0xpc3RlbmVyc0NvdW50IC09IDE7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgY3VycmVudCBkaWFnbm9zdGljIG1lc3NhZ2VzIGZvciB0aGUgZmlsZS5cbiAgICogUHJlZmVyIHRvIGdldCB1cGRhdGVzIHZpYSA6Om9uRmlsZU1lc3NhZ2VzRGlkVXBkYXRlLlxuICAgKi9cbiAgX2dldEZpbGVNZXNzYWdlcyhmaWxlUGF0aDogTnVjbGlkZVVyaSk6IEFycmF5PEZpbGVEaWFnbm9zdGljTWVzc2FnZT4ge1xuICAgIGxldCBhbGxGaWxlTWVzc2FnZXMgPSBbXTtcbiAgICBjb25zdCByZWxldmFudFByb3ZpZGVycyA9IHRoaXMuX2ZpbGVUb1Byb3ZpZGVycy5nZXQoZmlsZVBhdGgpO1xuICAgIGlmIChyZWxldmFudFByb3ZpZGVycykge1xuICAgICAgZm9yIChjb25zdCBwcm92aWRlciBvZiByZWxldmFudFByb3ZpZGVycykge1xuICAgICAgICBjb25zdCBmaWxlVG9NZXNzYWdlcyA9IHRoaXMuX3Byb3ZpZGVyVG9GaWxlVG9NZXNzYWdlcy5nZXQocHJvdmlkZXIpO1xuICAgICAgICBpbnZhcmlhbnQoZmlsZVRvTWVzc2FnZXMgIT0gbnVsbCk7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VzID0gZmlsZVRvTWVzc2FnZXMuZ2V0KGZpbGVQYXRoKTtcbiAgICAgICAgaW52YXJpYW50KG1lc3NhZ2VzICE9IG51bGwpO1xuICAgICAgICBhbGxGaWxlTWVzc2FnZXMgPSBhbGxGaWxlTWVzc2FnZXMuY29uY2F0KG1lc3NhZ2VzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFsbEZpbGVNZXNzYWdlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjdXJyZW50IHByb2plY3Qtc2NvcGUgZGlhZ25vc3RpYyBtZXNzYWdlcy5cbiAgICogUHJlZmVyIHRvIGdldCB1cGRhdGVzIHZpYSA6Om9uUHJvamVjdE1lc3NhZ2VzRGlkVXBkYXRlLlxuICAgKi9cbiAgX2dldFByb2plY3RNZXNzYWdlcygpOiBBcnJheTxQcm9qZWN0RGlhZ25vc3RpY01lc3NhZ2U+IHtcbiAgICBsZXQgYWxsUHJvamVjdE1lc3NhZ2VzID0gW107XG4gICAgZm9yIChjb25zdCBtZXNzYWdlcyBvZiB0aGlzLl9wcm92aWRlclRvUHJvamVjdERpYWdub3N0aWNzLnZhbHVlcygpKSB7XG4gICAgICBhbGxQcm9qZWN0TWVzc2FnZXMgPSBhbGxQcm9qZWN0TWVzc2FnZXMuY29uY2F0KG1lc3NhZ2VzKTtcbiAgICB9XG4gICAgcmV0dXJuIGFsbFByb2plY3RNZXNzYWdlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFsbCBjdXJyZW50IGRpYWdub3N0aWMgbWVzc2FnZXMuXG4gICAqIFByZWZlciB0byBnZXQgdXBkYXRlcyB2aWEgOjpvbkFsbE1lc3NhZ2VzRGlkVXBkYXRlLlxuICAgKi9cbiAgX2dldEFsbE1lc3NhZ2VzKCk6IEFycmF5PERpYWdub3N0aWNNZXNzYWdlPiB7XG4gICAgbGV0IGFsbE1lc3NhZ2VzID0gW107XG4gICAgLy8gR2V0IGFsbCBmaWxlIG1lc3NhZ2VzLlxuICAgIGZvciAoY29uc3QgZmlsZVRvTWVzc2FnZXMgb2YgdGhpcy5fcHJvdmlkZXJUb0ZpbGVUb01lc3NhZ2VzLnZhbHVlcygpKSB7XG4gICAgICBmb3IgKGNvbnN0IG1lc3NhZ2VzIG9mIGZpbGVUb01lc3NhZ2VzLnZhbHVlcygpKSB7XG4gICAgICAgIGFsbE1lc3NhZ2VzID0gYWxsTWVzc2FnZXMuY29uY2F0KG1lc3NhZ2VzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gR2V0IGFsbCBwcm9qZWN0IG1lc3NhZ2VzLlxuICAgIGFsbE1lc3NhZ2VzID0gYWxsTWVzc2FnZXMuY29uY2F0KHRoaXMuX2dldFByb2plY3RNZXNzYWdlcygpKTtcbiAgICByZXR1cm4gYWxsTWVzc2FnZXM7XG4gIH1cblxuICAvKipcbiAgICogU2VjdGlvbjogRmVlZGJhY2sgZnJvbSB0aGUgVUlcbiAgICovXG5cbiAgYXBwbHlGaXgobWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlKTogdm9pZCB7XG4gICAgY29uc3Qgc3VjY2VlZGVkID0gdGhpcy5fYXBwbHlTaW5nbGVGaXgobWVzc2FnZSk7XG4gICAgaWYgKCFzdWNjZWVkZWQpIHtcbiAgICAgIG5vdGlmeUZpeEZhaWxlZCgpO1xuICAgIH1cbiAgfVxuXG4gIGFwcGx5Rml4ZXNGb3JGaWxlKGZpbGU6IE51Y2xpZGVVcmkpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgdGhpcy5fZ2V0RmlsZU1lc3NhZ2VzKGZpbGUpKSB7XG4gICAgICBpZiAobWVzc2FnZS5maXggIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBzdWNjZWVkZWQgPSB0aGlzLl9hcHBseVNpbmdsZUZpeChtZXNzYWdlKTtcbiAgICAgICAgaWYgKCFzdWNjZWVkZWQpIHtcbiAgICAgICAgICBub3RpZnlGaXhGYWlsZWQoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmZiB0aGUgZml4IHN1Y2NlZWRzLlxuICAgKi9cbiAgX2FwcGx5U2luZ2xlRml4KG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGZpeCA9IG1lc3NhZ2UuZml4O1xuICAgIGludmFyaWFudChmaXggIT0gbnVsbCk7XG5cbiAgICBjb25zdCBhY3R1YWxSYW5nZSA9IHRoaXMuX21hcmtlclRyYWNrZXIuZ2V0Q3VycmVudFJhbmdlKG1lc3NhZ2UpO1xuXG4gICAgaWYgKGFjdHVhbFJhbmdlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBmaXhXaXRoQWN0dWFsUmFuZ2UgPSB7XG4gICAgICAuLi5maXgsXG4gICAgICBvbGRSYW5nZTogYWN0dWFsUmFuZ2UsXG4gICAgfTtcbiAgICBjb25zdCBzdWNjZWVkZWQgPSBhcHBseVRleHRFZGl0KG1lc3NhZ2UuZmlsZVBhdGgsIGZpeFdpdGhBY3R1YWxSYW5nZSk7XG4gICAgaWYgKHN1Y2NlZWRlZCkge1xuICAgICAgdGhpcy5faW52YWxpZGF0ZVNpbmdsZU1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZWN0aW9uOiBFdmVudCBFbWl0dGluZ1xuICAgKi9cblxuICBfZW1pdEZpbGVNZXNzYWdlcyhmaWxlUGF0aDogTnVjbGlkZVVyaSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9maWxlVG9MaXN0ZW5lcnNDb3VudC5nZXQoZmlsZVBhdGgpKSB7XG4gICAgICB0aGlzLl9maWxlQ2hhbmdlRW1pdHRlci5lbWl0KGZpbGVQYXRoLCB7ZmlsZVBhdGgsIG1lc3NhZ2VzOiB0aGlzLl9nZXRGaWxlTWVzc2FnZXMoZmlsZVBhdGgpfSk7XG4gICAgfVxuICB9XG5cbiAgX2VtaXRQcm9qZWN0TWVzc2FnZXMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3Byb2plY3RMaXN0ZW5lcnNDb3VudCkge1xuICAgICAgdGhpcy5fbm9uRmlsZUNoYW5nZUVtaXR0ZXIuZW1pdChQUk9KRUNUX01FU1NBR0VfQ0hBTkdFX0VWRU5ULCB0aGlzLl9nZXRQcm9qZWN0TWVzc2FnZXMoKSk7XG4gICAgfVxuICB9XG5cbiAgX2VtaXRBbGxNZXNzYWdlcygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fYWxsTWVzc2FnZXNMaXN0ZW5lcnNDb3VudCkge1xuICAgICAgdGhpcy5fbm9uRmlsZUNoYW5nZUVtaXR0ZXIuZW1pdChBTExfQ0hBTkdFX0VWRU5ULCB0aGlzLl9nZXRBbGxNZXNzYWdlcygpKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbm90aWZ5Rml4RmFpbGVkKCkge1xuICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAnRmFpbGVkIHRvIGFwcGx5IGZpeC4gVHJ5IHNhdmluZyB0byBnZXQgZnJlc2ggcmVzdWx0cyBhbmQgdGhlbiB0cnkgYWdhaW4uJyxcbiAgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWFnbm9zdGljU3RvcmU7XG4iXX0=