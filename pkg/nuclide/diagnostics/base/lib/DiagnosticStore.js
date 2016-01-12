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
        // Update _providerToFileToMessages.
        // $FlowIssue: Flow should understand that fileToMessages cannot be null/undefined here.
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
      (0, _assert2['default'])(message.fix != null);
      var succeeded = (0, _textedit.applyTextEdit)(message.filePath, message.fix);
      if (succeeded) {
        this._invalidateSingleMessage(message);
      } else {
        atom.notifications.addWarning('Failed to apply fix. Try saving to get fresh results and then try again.');
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
//# sourceMappingURL=data:application/json;base64,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LGVBQWUsQ0FBQyIsImZpbGUiOiJEaWFnbm9zdGljU3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEludmFsaWRhdGlvbk1lc3NhZ2UsXG4gIERpYWdub3N0aWNNZXNzYWdlLFxuICBEaWFnbm9zdGljUHJvdmlkZXIsXG4gIERpYWdub3N0aWNQcm92aWRlclVwZGF0ZSxcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBQcm9qZWN0RGlhZ25vc3RpY01lc3NhZ2UsXG4gIEZpbGVNZXNzYWdlVXBkYXRlLFxufSBmcm9tICcuL21haW4nO1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmltcG9ydCB7YXBwbHlUZXh0RWRpdH0gZnJvbSAnLi4vLi4vLi4vdGV4dGVkaXQnO1xuXG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi8uLi9jb21tb25zJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCB7RGlzcG9zYWJsZSwgRW1pdHRlcn0gPSByZXF1aXJlKCdhdG9tJyk7XG5cbmNvbnN0IFBST0pFQ1RfTUVTU0FHRV9DSEFOR0VfRVZFTlQgPSAnbWVzc2FnZXMtY2hhbmdlZC1mb3ItcHJvamVjdCc7XG5jb25zdCBBTExfQ0hBTkdFX0VWRU5UID0gJ21lc3NhZ2VzLWNoYW5nZWQnO1xuXG5jbGFzcyBEaWFnbm9zdGljU3RvcmUge1xuICAvLyBBIG1hcCBmcm9tIGVhY2ggZGlhZ25vc3RpYyBwcm92aWRlciB0bzpcbiAgLy8gYSBtYXAgZnJvbSBlYWNoIGZpbGUgaXQgaGFzIG1lc3NhZ2VzIGZvciB0byB0aGUgYXJyYXkgb2YgbWVzc2FnZXMgZm9yIHRoYXQgZmlsZS5cbiAgX3Byb3ZpZGVyVG9GaWxlVG9NZXNzYWdlczogTWFwPERpYWdub3N0aWNQcm92aWRlciwgTWFwPE51Y2xpZGVVcmksIEFycmF5PEZpbGVEaWFnbm9zdGljTWVzc2FnZT4+PjtcbiAgLy8gQSBtYXAgZnJvbSBlYWNoIGZpbGUgdGhhdCBoYXMgbWVzc2FnZXMgZnJvbSBhbnkgZGlhZ25vc3RpYyBwcm92aWRlclxuICAvLyB0byB0aGUgc2V0IG9mIGRpYWdub3N0aWMgcHJvdmlkZXJzIHRoYXQgaGF2ZSBtZXNzYWdlcyBmb3IgaXQuXG4gIF9maWxlVG9Qcm92aWRlcnM6IE1hcDxOdWNsaWRlVXJpLCBTZXQ8RGlhZ25vc3RpY1Byb3ZpZGVyPj47XG5cbiAgLy8gQSBtYXAgZnJvbSBlYWNoIGRpYWdub3N0aWMgcHJvdmlkZXIgdG8gdGhlIGFycmF5IG9mIHByb2plY3QgbWVzc2FnZXMgZnJvbSBpdC5cbiAgX3Byb3ZpZGVyVG9Qcm9qZWN0RGlhZ25vc3RpY3M6IE1hcDxEaWFnbm9zdGljUHJvdmlkZXIsIEFycmF5PFByb2plY3REaWFnbm9zdGljTWVzc2FnZT4+O1xuXG4gIC8vIEZpbGUgcGF0aHMgYXJlIHVzZWQgYXMgZXZlbnQgbmFtZXMgZm9yIHRoZSBfZmlsZUNoYW5nZUVtaXR0ZXIsIHNvIGEgc2Vjb25kXG4gIC8vIGVtaXR0ZXIgaXMgdXNlZCBmb3Igb3RoZXIgZXZlbnRzIHRvIHByZXZlbnQgZXZlbnQgbmFtZSBjb2xsaXNpb25zLlxuICBfZmlsZUNoYW5nZUVtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9ub25GaWxlQ2hhbmdlRW1pdHRlcjogRW1pdHRlcjtcbiAgLy8gQSBtYXAgb2YgTnVjbGlkZVVyaSB0byB0aGUgbnVtYmVyIG9mIGxpc3RlbmVycyByZWdpc3RlcmVkIGZvciBjaGFuZ2VzIHRvXG4gIC8vIG1lc3NhZ2VzIGZvciB0aGF0IGZpbGUuXG4gIF9maWxlVG9MaXN0ZW5lcnNDb3VudDogTWFwPE51Y2xpZGVVcmksIG51bWJlcj47XG4gIF9wcm9qZWN0TGlzdGVuZXJzQ291bnQ6IG51bWJlcjtcbiAgX2FsbE1lc3NhZ2VzTGlzdGVuZXJzQ291bnQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9wcm92aWRlclRvRmlsZVRvTWVzc2FnZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fZmlsZVRvUHJvdmlkZXJzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3Byb3ZpZGVyVG9Qcm9qZWN0RGlhZ25vc3RpY3MgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLl9maWxlQ2hhbmdlRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fbm9uRmlsZUNoYW5nZUVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX2ZpbGVUb0xpc3RlbmVyc0NvdW50ID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3Byb2plY3RMaXN0ZW5lcnNDb3VudCA9IDA7XG4gICAgdGhpcy5fYWxsTWVzc2FnZXNMaXN0ZW5lcnNDb3VudCA9IDA7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX3Byb3ZpZGVyVG9GaWxlVG9NZXNzYWdlcy5jbGVhcigpO1xuICAgIHRoaXMuX2ZpbGVUb1Byb3ZpZGVycy5jbGVhcigpO1xuICAgIHRoaXMuX3Byb3ZpZGVyVG9Qcm9qZWN0RGlhZ25vc3RpY3MuY2xlYXIoKTtcbiAgICB0aGlzLl9maWxlQ2hhbmdlRW1pdHRlci5kaXNwb3NlKCk7XG4gICAgdGhpcy5fbm9uRmlsZUNoYW5nZUVtaXR0ZXIuZGlzcG9zZSgpO1xuICAgIHRoaXMuX2ZpbGVUb0xpc3RlbmVyc0NvdW50LmNsZWFyKCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZWN0aW9uOiBNZXRob2RzIHRvIG1vZGlmeSB0aGUgc3RvcmUuXG4gICAqL1xuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIG1lc3NhZ2VzIGZyb20gdGhlIGdpdmVuIHByb3ZpZGVyLlxuICAgKiBJZiB0aGUgdXBkYXRlIGNvbnRhaW5zIG1lc3NhZ2VzIGF0IGEgc2NvcGUgdGhhdCBhbHJlYWR5IGhhcyBtZXNzYWdlcyBmcm9tXG4gICAqIHRoaXMgcHJvdmlkZXIgaW4gdGhlIHN0b3JlLCB0aGUgZXhpc3RpbmcgbWVzc2FnZXMgd2lsbCBiZSBvdmVyd3JpdHRlbiBieSB0aGVcbiAgICogbmV3IG1lc3NhZ2VzLlxuICAgKiBAcGFyYW0gZGlhZ25vc3RpY1Byb3ZpZGVyIFRoZSBkaWFnbm9zdGljIHByb3ZpZGVyIHRoYXQgdGhlc2UgbWVzc2FnZXMgY29tZSBmcm9tLlxuICAgKiBAcGFyYW0gdXBkYXRlcyBTZXQgb2YgdXBkYXRlcyB0byBhcHBseS5cbiAgICovXG4gIHVwZGF0ZU1lc3NhZ2VzKFxuICAgICAgZGlhZ25vc3RpY1Byb3ZpZGVyOiBEaWFnbm9zdGljUHJvdmlkZXIsXG4gICAgICB1cGRhdGVzOiBEaWFnbm9zdGljUHJvdmlkZXJVcGRhdGUsXG4gICAgKTogdm9pZCB7XG4gICAgaWYgKHVwZGF0ZXMuZmlsZVBhdGhUb01lc3NhZ2VzKSB7XG4gICAgICB0aGlzLl91cGRhdGVGaWxlTWVzc2FnZXMoZGlhZ25vc3RpY1Byb3ZpZGVyLCB1cGRhdGVzLmZpbGVQYXRoVG9NZXNzYWdlcyk7XG4gICAgfVxuICAgIGlmICh1cGRhdGVzLnByb2plY3RNZXNzYWdlcykge1xuICAgICAgdGhpcy5fdXBkYXRlUHJvamVjdE1lc3NhZ2VzKGRpYWdub3N0aWNQcm92aWRlciwgdXBkYXRlcy5wcm9qZWN0TWVzc2FnZXMpO1xuICAgIH1cbiAgICBpZiAodXBkYXRlcy5maWxlUGF0aFRvTWVzc2FnZXMgfHwgdXBkYXRlcy5wcm9qZWN0TWVzc2FnZXMpIHtcbiAgICAgIHRoaXMuX2VtaXRBbGxNZXNzYWdlcygpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVGaWxlTWVzc2FnZXMoXG4gICAgICBkaWFnbm9zdGljUHJvdmlkZXI6IERpYWdub3N0aWNQcm92aWRlcixcbiAgICAgIG5ld0ZpbGVQYXRoc1RvTWVzc2FnZXM6IE1hcDxOdWNsaWRlVXJpLCBBcnJheTxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+PlxuICAgICk6IHZvaWQge1xuICAgIGxldCBmaWxlVG9NZXNzYWdlcyA9IHRoaXMuX3Byb3ZpZGVyVG9GaWxlVG9NZXNzYWdlcy5nZXQoZGlhZ25vc3RpY1Byb3ZpZGVyKTtcbiAgICBpZiAoIWZpbGVUb01lc3NhZ2VzKSB7XG4gICAgICBmaWxlVG9NZXNzYWdlcyA9IG5ldyBNYXAoKTtcbiAgICAgIHRoaXMuX3Byb3ZpZGVyVG9GaWxlVG9NZXNzYWdlcy5zZXQoZGlhZ25vc3RpY1Byb3ZpZGVyLCBmaWxlVG9NZXNzYWdlcyk7XG4gICAgfVxuICAgIG5ld0ZpbGVQYXRoc1RvTWVzc2FnZXMuZm9yRWFjaCgobmV3TWVzc2FnZXNGb3JQYXRoLCBmaWxlUGF0aCkgPT4ge1xuICAgICAgLy8gVXBkYXRlIF9wcm92aWRlclRvRmlsZVRvTWVzc2FnZXMuXG4gICAgICAvLyAkRmxvd0lzc3VlOiBGbG93IHNob3VsZCB1bmRlcnN0YW5kIHRoYXQgZmlsZVRvTWVzc2FnZXMgY2Fubm90IGJlIG51bGwvdW5kZWZpbmVkIGhlcmUuXG4gICAgICBmaWxlVG9NZXNzYWdlcy5zZXQoZmlsZVBhdGgsIG5ld01lc3NhZ2VzRm9yUGF0aCk7XG4gICAgICAvLyBVcGRhdGUgX2ZpbGVUb1Byb3ZpZGVycy5cbiAgICAgIGxldCBwcm92aWRlcnMgPSB0aGlzLl9maWxlVG9Qcm92aWRlcnMuZ2V0KGZpbGVQYXRoKTtcbiAgICAgIGlmICghcHJvdmlkZXJzKSB7XG4gICAgICAgIHByb3ZpZGVycyA9IG5ldyBTZXQoKTtcbiAgICAgICAgdGhpcy5fZmlsZVRvUHJvdmlkZXJzLnNldChmaWxlUGF0aCwgcHJvdmlkZXJzKTtcbiAgICAgIH1cbiAgICAgIHByb3ZpZGVycy5hZGQoZGlhZ25vc3RpY1Byb3ZpZGVyKTtcblxuICAgICAgdGhpcy5fZW1pdEZpbGVNZXNzYWdlcyhmaWxlUGF0aCk7XG4gICAgfSk7XG4gIH1cblxuICBfdXBkYXRlUHJvamVjdE1lc3NhZ2VzKFxuICAgIGRpYWdub3N0aWNQcm92aWRlcjogRGlhZ25vc3RpY1Byb3ZpZGVyLFxuICAgIHByb2plY3RNZXNzYWdlczogQXJyYXk8UHJvamVjdERpYWdub3N0aWNNZXNzYWdlPlxuICApOiB2b2lkIHtcbiAgICB0aGlzLl9wcm92aWRlclRvUHJvamVjdERpYWdub3N0aWNzLnNldChkaWFnbm9zdGljUHJvdmlkZXIsIHByb2plY3RNZXNzYWdlcyk7XG4gICAgdGhpcy5fZW1pdFByb2plY3RNZXNzYWdlcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIHRoZSBtZXNzYWdlcyBmcm9tIHRoZSBnaXZlbiBwcm92aWRlciwgYWNjb3JkaW5nIHRvIHRoZSBvcHRpb25zLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBBbiBPYmplY3Qgb2YgdGhlIGZvcm06XG4gICAqICAgKiBzY29wZTogQ2FuIGJlICdmaWxlJywgJ3Byb2plY3QnLCBvciAnYWxsJy5cbiAgICogICAgICAgKiAnZmlsZSc6IFRoZSAnZmlsZVBhdGhzJyBvcHRpb24gZGV0ZXJtaW5lcyB3aGljaCBmaWxlcycgbWVzc2FnZXMgdG8gY2xlYXJcbiAgICogICAgICAgKiAncHJvamVjdCc6IGFsbCAncHJvamVjdCcgc2NvcGUgbWVzc2FnZXMgYXJlIGNsZWFyZWQuXG4gICAqICAgICAgICogJ2FsbCc6IGFsbCBtZXNzYWdlcyBhcmUgY2xlYXJlZC5cbiAgICogICAqIGZpbGVQYXRoczogQXJyYXkgb2YgYWJzb2x1dGUgZmlsZSBwYXRocyAoTnVjbGlkZVVyaSkgdG8gY2xlYXIgbWVzc2FnZXMgZm9yLlxuICAgKi9cbiAgaW52YWxpZGF0ZU1lc3NhZ2VzKFxuICAgICAgZGlhZ25vc3RpY1Byb3ZpZGVyOiBEaWFnbm9zdGljUHJvdmlkZXIsXG4gICAgICBpbnZhbGlkYXRpb25NZXNzYWdlOiBJbnZhbGlkYXRpb25NZXNzYWdlXG4gICAgKTogdm9pZCB7XG4gICAgaWYgKGludmFsaWRhdGlvbk1lc3NhZ2Uuc2NvcGUgPT09ICdmaWxlJykge1xuICAgICAgdGhpcy5faW52YWxpZGF0ZUZpbGVNZXNzYWdlc0ZvclByb3ZpZGVyKGRpYWdub3N0aWNQcm92aWRlciwgaW52YWxpZGF0aW9uTWVzc2FnZS5maWxlUGF0aHMpO1xuICAgICAgdGhpcy5fZW1pdEFsbE1lc3NhZ2VzKCk7XG4gICAgfSBlbHNlIGlmIChpbnZhbGlkYXRpb25NZXNzYWdlLnNjb3BlID09PSAncHJvamVjdCcpIHtcbiAgICAgIHRoaXMuX2ludmFsaWRhdGVQcm9qZWN0TWVzc2FnZXNGb3JQcm92aWRlcihkaWFnbm9zdGljUHJvdmlkZXIpO1xuICAgICAgdGhpcy5fZW1pdEFsbE1lc3NhZ2VzKCk7XG4gICAgfSBlbHNlIGlmIChpbnZhbGlkYXRpb25NZXNzYWdlLnNjb3BlID09PSAnYWxsJykge1xuICAgICAgdGhpcy5faW52YWxpZGF0ZUFsbE1lc3NhZ2VzRm9yUHJvdmlkZXIoZGlhZ25vc3RpY1Byb3ZpZGVyKTtcbiAgICB9XG4gIH1cblxuICBfaW52YWxpZGF0ZUZpbGVNZXNzYWdlc0ZvclByb3ZpZGVyKFxuICAgIGRpYWdub3N0aWNQcm92aWRlcjogRGlhZ25vc3RpY1Byb3ZpZGVyLFxuICAgIHBhdGhzVG9SZW1vdmU6IEl0ZXJhYmxlPE51Y2xpZGVVcmk+XG4gICk6IHZvaWQge1xuICAgIGNvbnN0IGZpbGVUb0RpYWdub3N0aWNzID0gdGhpcy5fcHJvdmlkZXJUb0ZpbGVUb01lc3NhZ2VzLmdldChkaWFnbm9zdGljUHJvdmlkZXIpO1xuICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgcGF0aHNUb1JlbW92ZSkge1xuICAgICAgLy8gVXBkYXRlIF9wcm92aWRlclRvRmlsZVRvTWVzc2FnZXMuXG4gICAgICBpZiAoZmlsZVRvRGlhZ25vc3RpY3MpIHtcbiAgICAgICAgZmlsZVRvRGlhZ25vc3RpY3MuZGVsZXRlKGZpbGVQYXRoKTtcbiAgICAgIH1cbiAgICAgIC8vIFVwZGF0ZSBfZmlsZVRvUHJvdmlkZXJzLlxuICAgICAgY29uc3QgcHJvdmlkZXJzID0gdGhpcy5fZmlsZVRvUHJvdmlkZXJzLmdldChmaWxlUGF0aCk7XG4gICAgICBpZiAocHJvdmlkZXJzKSB7XG4gICAgICAgIHByb3ZpZGVycy5kZWxldGUoZGlhZ25vc3RpY1Byb3ZpZGVyKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2VtaXRGaWxlTWVzc2FnZXMoZmlsZVBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIF9pbnZhbGlkYXRlUHJvamVjdE1lc3NhZ2VzRm9yUHJvdmlkZXIoZGlhZ25vc3RpY1Byb3ZpZGVyOiBEaWFnbm9zdGljUHJvdmlkZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9wcm92aWRlclRvUHJvamVjdERpYWdub3N0aWNzLmRlbGV0ZShkaWFnbm9zdGljUHJvdmlkZXIpO1xuICAgIHRoaXMuX2VtaXRQcm9qZWN0TWVzc2FnZXMoKTtcbiAgfVxuXG4gIF9pbnZhbGlkYXRlQWxsTWVzc2FnZXNGb3JQcm92aWRlcihkaWFnbm9zdGljUHJvdmlkZXI6IERpYWdub3N0aWNQcm92aWRlcik6IHZvaWQge1xuICAgIC8vIEludmFsaWRhdGUgYWxsIGZpbGUgbWVzc2FnZXMuXG4gICAgY29uc3QgZmlsZXNUb0RpYWdub3N0aWNzID0gdGhpcy5fcHJvdmlkZXJUb0ZpbGVUb01lc3NhZ2VzLmdldChkaWFnbm9zdGljUHJvdmlkZXIpO1xuICAgIGlmIChmaWxlc1RvRGlhZ25vc3RpY3MpIHtcbiAgICAgIGNvbnN0IGFsbEZpbGVQYXRocyA9IGZpbGVzVG9EaWFnbm9zdGljcy5rZXlzKCk7XG4gICAgICB0aGlzLl9pbnZhbGlkYXRlRmlsZU1lc3NhZ2VzRm9yUHJvdmlkZXIoZGlhZ25vc3RpY1Byb3ZpZGVyLCBhbGxGaWxlUGF0aHMpO1xuICAgIH1cbiAgICAvLyBJbnZhbGlkYXRlIGFsbCBwcm9qZWN0IG1lc3NhZ2VzLlxuICAgIHRoaXMuX2ludmFsaWRhdGVQcm9qZWN0TWVzc2FnZXNGb3JQcm92aWRlcihkaWFnbm9zdGljUHJvdmlkZXIpO1xuXG4gICAgdGhpcy5fZW1pdEFsbE1lc3NhZ2VzKCk7XG4gIH1cblxuICBfaW52YWxpZGF0ZVNpbmdsZU1lc3NhZ2UobWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBmaWxlVG9NZXNzYWdlcyBvZiB0aGlzLl9wcm92aWRlclRvRmlsZVRvTWVzc2FnZXMudmFsdWVzKCkpIHtcbiAgICAgIGNvbnN0IGZpbGVNZXNzYWdlcyA9IGZpbGVUb01lc3NhZ2VzLmdldChtZXNzYWdlLmZpbGVQYXRoKTtcbiAgICAgIGlmIChmaWxlTWVzc2FnZXMgIT0gbnVsbCkge1xuICAgICAgICBhcnJheS5yZW1vdmUoZmlsZU1lc3NhZ2VzLCBtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gTG9va3MgbGlrZSBlbWl0QWxsTWVzc2FnZXMgZG9lcyBub3QgYWN0dWFsbHkgZW1pdCBhbGwgbWVzc2FnZXMuIFdlIG5lZWQgdG8gZG8gYm90aCBmb3IgYm90aFxuICAgIC8vIHRoZSBndXR0ZXIgVUkgYW5kIHRoZSBkaWFnbm9zdGljcyB0YWJsZSB0byBnZXQgdXBkYXRlZC5cbiAgICB0aGlzLl9lbWl0RmlsZU1lc3NhZ2VzKG1lc3NhZ2UuZmlsZVBhdGgpO1xuICAgIHRoaXMuX2VtaXRBbGxNZXNzYWdlcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlY3Rpb246IE1ldGhvZHMgdG8gcmVhZCBmcm9tIHRoZSBzdG9yZS5cbiAgICovXG5cbiAgLyoqXG4gICAqIENhbGwgdGhlIGNhbGxiYWNrIHdoZW4gdGhlIGZpbGVQYXRoJ3MgbWVzc2FnZXMgaGF2ZSBjaGFuZ2VkLlxuICAgKiBJbiBhZGRpdGlvbiwgdGhlIFN0b3JlIHdpbGwgaW1tZWRpYXRlbHkgaW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIHRoZSBkYXRhXG4gICAqIGN1cnJlbnRseSBpbiB0aGUgU3RvcmUsIGlmZiB0aGVyZSBpcyBhbnkuXG4gICAqIEBwYXJhbSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gbWVzc2FnZSB3aGVuIGFueSBvZiB0aGUgZmlsZVBhdGhzJyBtZXNzYWdlc1xuICAgKiAgIGNoYW5nZS4gVGhlIGFycmF5IG9mIG1lc3NhZ2VzIGlzIG1lYW50IHRvIGNvbXBsZXRlbHkgcmVwbGFjZSBhbnkgcHJldmlvdXNcbiAgICogICBtZXNzYWdlcyBmb3IgdGhpcyBmaWxlIHBhdGguXG4gICAqL1xuICBvbkZpbGVNZXNzYWdlc0RpZFVwZGF0ZShcbiAgICAgIGNhbGxiYWNrOiAodXBkYXRlOiBGaWxlTWVzc2FnZVVwZGF0ZSkgPT4gbWl4ZWQsXG4gICAgICBmaWxlUGF0aDogTnVjbGlkZVVyaVxuICAgICk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgLy8gVXNlIHRoZSBmaWxlUGF0aCBhcyB0aGUgZXZlbnQgbmFtZS5cbiAgICBjb25zdCBlbWl0dGVyRGlzcG9zYWJsZSA9IHRoaXMuX2ZpbGVDaGFuZ2VFbWl0dGVyLm9uKGZpbGVQYXRoLCBjYWxsYmFjayk7XG4gICAgdGhpcy5faW5jcmVtZW50RmlsZUxpc3RlbmVyQ291bnQoZmlsZVBhdGgpO1xuXG4gICAgY29uc3QgZmlsZU1lc3NhZ2VzID0gdGhpcy5fZ2V0RmlsZU1lc3NhZ2VzKGZpbGVQYXRoKTtcbiAgICBpZiAoZmlsZU1lc3NhZ2VzLmxlbmd0aCkge1xuICAgICAgY2FsbGJhY2soe2ZpbGVQYXRoLCBtZXNzYWdlczogZmlsZU1lc3NhZ2VzfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBlbWl0dGVyRGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9kZWNyZW1lbnRGaWxlTGlzdGVuZXJDb3VudChmaWxlUGF0aCk7XG4gICAgfSk7XG4gIH1cblxuICBfaW5jcmVtZW50RmlsZUxpc3RlbmVyQ291bnQoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiB2b2lkIHtcbiAgICBjb25zdCBjdXJyZW50Q291bnQgPSB0aGlzLl9maWxlVG9MaXN0ZW5lcnNDb3VudC5nZXQoZmlsZVBhdGgpIHx8IDA7XG4gICAgdGhpcy5fZmlsZVRvTGlzdGVuZXJzQ291bnQuc2V0KGZpbGVQYXRoLCBjdXJyZW50Q291bnQgKyAxKTtcbiAgfVxuXG4gIF9kZWNyZW1lbnRGaWxlTGlzdGVuZXJDb3VudChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IHZvaWQge1xuICAgIGNvbnN0IGN1cnJlbnRDb3VudCA9IHRoaXMuX2ZpbGVUb0xpc3RlbmVyc0NvdW50LmdldChmaWxlUGF0aCkgfHwgMDtcbiAgICBpZiAoY3VycmVudENvdW50ID4gMCkge1xuICAgICAgdGhpcy5fZmlsZVRvTGlzdGVuZXJzQ291bnQuc2V0KGZpbGVQYXRoLCBjdXJyZW50Q291bnQgLSAxKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCB0aGUgY2FsbGJhY2sgd2hlbiBwcm9qZWN0LXNjb3BlIG1lc3NhZ2VzIGNoYW5nZS5cbiAgICogSW4gYWRkaXRpb24sIHRoZSBTdG9yZSB3aWxsIGltbWVkaWF0ZWx5IGludm9rZSB0aGUgY2FsbGJhY2sgd2l0aCB0aGUgZGF0YVxuICAgKiBjdXJyZW50bHkgaW4gdGhlIFN0b3JlLCBpZmYgdGhlcmUgaXMgYW55LlxuICAgKiBAcGFyYW0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIG1lc3NhZ2Ugd2hlbiB0aGUgcHJvamVjdC1zY29wZSBtZXNzYWdlc1xuICAgKiAgIGNoYW5nZS4gVGhlIGFycmF5IG9mIG1lc3NhZ2VzIGlzIG1lYW50IHRvIGNvbXBsZXRlbHkgcmVwbGFjZSBhbnkgcHJldmlvdXNcbiAgICogICBwcm9qZWN0LXNjb3BlIG1lc3NhZ2VzLlxuICAgKi9cbiAgb25Qcm9qZWN0TWVzc2FnZXNEaWRVcGRhdGUoXG4gICAgY2FsbGJhY2s6IChtZXNzYWdlczogQXJyYXk8UHJvamVjdERpYWdub3N0aWNNZXNzYWdlPikgPT4gbWl4ZWRcbiAgKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICBjb25zdCBlbWl0dGVyRGlzcG9zYWJsZSA9IHRoaXMuX25vbkZpbGVDaGFuZ2VFbWl0dGVyLm9uKFBST0pFQ1RfTUVTU0FHRV9DSEFOR0VfRVZFTlQsIGNhbGxiYWNrKTtcbiAgICB0aGlzLl9wcm9qZWN0TGlzdGVuZXJzQ291bnQgKz0gMTtcblxuICAgIGNvbnN0IHByb2plY3RNZXNzYWdlcyA9IHRoaXMuX2dldFByb2plY3RNZXNzYWdlcygpO1xuICAgIGlmIChwcm9qZWN0TWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgICBjYWxsYmFjayhwcm9qZWN0TWVzc2FnZXMpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgZW1pdHRlckRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fcHJvamVjdExpc3RlbmVyc0NvdW50IC09IDE7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCB0aGUgY2FsbGJhY2sgd2hlbiBhbnkgbWVzc2FnZXMgY2hhbmdlLlxuICAgKiBJbiBhZGRpdGlvbiwgdGhlIFN0b3JlIHdpbGwgaW1tZWRpYXRlbHkgaW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGRhdGFcbiAgICogY3VycmVudGx5IGluIHRoZSBTdG9yZSwgaWZmIHRoZXJlIGlzIGFueS5cbiAgICogQHBhcmFtIGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBtZXNzYWdlIHdoZW4gYW55IG1lc3NhZ2VzIGNoYW5nZS4gVGhlIGFycmF5XG4gICAqICAgb2YgbWVzc2FnZXMgaXMgbWVhbnQgdG8gY29tcGxldGVseSByZXBsYWNlIGFueSBwcmV2aW91cyBtZXNzYWdlcy5cbiAgICovXG4gIG9uQWxsTWVzc2FnZXNEaWRVcGRhdGUoY2FsbGJhY2s6IChtZXNzYWdlczogQXJyYXk8RGlhZ25vc3RpY01lc3NhZ2U+KSA9PiBtaXhlZCk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgY29uc3QgZW1pdHRlckRpc3Bvc2FibGUgPSB0aGlzLl9ub25GaWxlQ2hhbmdlRW1pdHRlci5vbihBTExfQ0hBTkdFX0VWRU5ULCBjYWxsYmFjayk7XG4gICAgdGhpcy5fYWxsTWVzc2FnZXNMaXN0ZW5lcnNDb3VudCArPSAxO1xuXG4gICAgY29uc3QgYWxsTWVzc2FnZXMgPSB0aGlzLl9nZXRBbGxNZXNzYWdlcygpO1xuICAgIGlmIChhbGxNZXNzYWdlcy5sZW5ndGgpIHtcbiAgICAgIGNhbGxiYWNrKGFsbE1lc3NhZ2VzKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGVtaXR0ZXJEaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2FsbE1lc3NhZ2VzTGlzdGVuZXJzQ291bnQgLT0gMTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjdXJyZW50IGRpYWdub3N0aWMgbWVzc2FnZXMgZm9yIHRoZSBmaWxlLlxuICAgKiBQcmVmZXIgdG8gZ2V0IHVwZGF0ZXMgdmlhIDo6b25GaWxlTWVzc2FnZXNEaWRVcGRhdGUuXG4gICAqL1xuICBfZ2V0RmlsZU1lc3NhZ2VzKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogQXJyYXk8RmlsZURpYWdub3N0aWNNZXNzYWdlPiB7XG4gICAgbGV0IGFsbEZpbGVNZXNzYWdlcyA9IFtdO1xuICAgIGNvbnN0IHJlbGV2YW50UHJvdmlkZXJzID0gdGhpcy5fZmlsZVRvUHJvdmlkZXJzLmdldChmaWxlUGF0aCk7XG4gICAgaWYgKHJlbGV2YW50UHJvdmlkZXJzKSB7XG4gICAgICBmb3IgKGNvbnN0IHByb3ZpZGVyIG9mIHJlbGV2YW50UHJvdmlkZXJzKSB7XG4gICAgICAgIGNvbnN0IGZpbGVUb01lc3NhZ2VzID0gdGhpcy5fcHJvdmlkZXJUb0ZpbGVUb01lc3NhZ2VzLmdldChwcm92aWRlcik7XG4gICAgICAgIGludmFyaWFudChmaWxlVG9NZXNzYWdlcyAhPSBudWxsKTtcbiAgICAgICAgY29uc3QgbWVzc2FnZXMgPSBmaWxlVG9NZXNzYWdlcy5nZXQoZmlsZVBhdGgpO1xuICAgICAgICBpbnZhcmlhbnQobWVzc2FnZXMgIT0gbnVsbCk7XG4gICAgICAgIGFsbEZpbGVNZXNzYWdlcyA9IGFsbEZpbGVNZXNzYWdlcy5jb25jYXQobWVzc2FnZXMpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYWxsRmlsZU1lc3NhZ2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGN1cnJlbnQgcHJvamVjdC1zY29wZSBkaWFnbm9zdGljIG1lc3NhZ2VzLlxuICAgKiBQcmVmZXIgdG8gZ2V0IHVwZGF0ZXMgdmlhIDo6b25Qcm9qZWN0TWVzc2FnZXNEaWRVcGRhdGUuXG4gICAqL1xuICBfZ2V0UHJvamVjdE1lc3NhZ2VzKCk6IEFycmF5PFByb2plY3REaWFnbm9zdGljTWVzc2FnZT4ge1xuICAgIGxldCBhbGxQcm9qZWN0TWVzc2FnZXMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IG1lc3NhZ2VzIG9mIHRoaXMuX3Byb3ZpZGVyVG9Qcm9qZWN0RGlhZ25vc3RpY3MudmFsdWVzKCkpIHtcbiAgICAgIGFsbFByb2plY3RNZXNzYWdlcyA9IGFsbFByb2plY3RNZXNzYWdlcy5jb25jYXQobWVzc2FnZXMpO1xuICAgIH1cbiAgICByZXR1cm4gYWxsUHJvamVjdE1lc3NhZ2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYWxsIGN1cnJlbnQgZGlhZ25vc3RpYyBtZXNzYWdlcy5cbiAgICogUHJlZmVyIHRvIGdldCB1cGRhdGVzIHZpYSA6Om9uQWxsTWVzc2FnZXNEaWRVcGRhdGUuXG4gICAqL1xuICBfZ2V0QWxsTWVzc2FnZXMoKTogQXJyYXk8RGlhZ25vc3RpY01lc3NhZ2U+IHtcbiAgICBsZXQgYWxsTWVzc2FnZXMgPSBbXTtcbiAgICAvLyBHZXQgYWxsIGZpbGUgbWVzc2FnZXMuXG4gICAgZm9yIChjb25zdCBmaWxlVG9NZXNzYWdlcyBvZiB0aGlzLl9wcm92aWRlclRvRmlsZVRvTWVzc2FnZXMudmFsdWVzKCkpIHtcbiAgICAgIGZvciAoY29uc3QgbWVzc2FnZXMgb2YgZmlsZVRvTWVzc2FnZXMudmFsdWVzKCkpIHtcbiAgICAgICAgYWxsTWVzc2FnZXMgPSBhbGxNZXNzYWdlcy5jb25jYXQobWVzc2FnZXMpO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBHZXQgYWxsIHByb2plY3QgbWVzc2FnZXMuXG4gICAgYWxsTWVzc2FnZXMgPSBhbGxNZXNzYWdlcy5jb25jYXQodGhpcy5fZ2V0UHJvamVjdE1lc3NhZ2VzKCkpO1xuICAgIHJldHVybiBhbGxNZXNzYWdlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWN0aW9uOiBGZWVkYmFjayBmcm9tIHRoZSBVSVxuICAgKi9cblxuICBhcHBseUZpeChtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UpOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQobWVzc2FnZS5maXggIT0gbnVsbCk7XG4gICAgY29uc3Qgc3VjY2VlZGVkID0gYXBwbHlUZXh0RWRpdChtZXNzYWdlLmZpbGVQYXRoLCBtZXNzYWdlLmZpeCk7XG4gICAgaWYgKHN1Y2NlZWRlZCkge1xuICAgICAgdGhpcy5faW52YWxpZGF0ZVNpbmdsZU1lc3NhZ2UobWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAnRmFpbGVkIHRvIGFwcGx5IGZpeC4gVHJ5IHNhdmluZyB0byBnZXQgZnJlc2ggcmVzdWx0cyBhbmQgdGhlbiB0cnkgYWdhaW4uJyxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlY3Rpb246IEV2ZW50IEVtaXR0aW5nXG4gICAqL1xuXG4gIF9lbWl0RmlsZU1lc3NhZ2VzKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2ZpbGVUb0xpc3RlbmVyc0NvdW50LmdldChmaWxlUGF0aCkpIHtcbiAgICAgIHRoaXMuX2ZpbGVDaGFuZ2VFbWl0dGVyLmVtaXQoZmlsZVBhdGgsIHtmaWxlUGF0aCwgbWVzc2FnZXM6IHRoaXMuX2dldEZpbGVNZXNzYWdlcyhmaWxlUGF0aCl9KTtcbiAgICB9XG4gIH1cblxuICBfZW1pdFByb2plY3RNZXNzYWdlcygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcHJvamVjdExpc3RlbmVyc0NvdW50KSB7XG4gICAgICB0aGlzLl9ub25GaWxlQ2hhbmdlRW1pdHRlci5lbWl0KFBST0pFQ1RfTUVTU0FHRV9DSEFOR0VfRVZFTlQsIHRoaXMuX2dldFByb2plY3RNZXNzYWdlcygpKTtcbiAgICB9XG4gIH1cblxuICBfZW1pdEFsbE1lc3NhZ2VzKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9hbGxNZXNzYWdlc0xpc3RlbmVyc0NvdW50KSB7XG4gICAgICB0aGlzLl9ub25GaWxlQ2hhbmdlRW1pdHRlci5lbWl0KEFMTF9DSEFOR0VfRVZFTlQsIHRoaXMuX2dldEFsbE1lc3NhZ2VzKCkpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpYWdub3N0aWNTdG9yZTtcbiJdfQ==