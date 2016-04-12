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

var _nuclideTextedit = require('../../nuclide-textedit');

var _nuclideCommons = require('../../nuclide-commons');

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
          _nuclideCommons.array.remove(fileMessages, message);
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
      var succeeded = (0, _nuclideTextedit.applyTextEdit)(message.filePath, fixWithActualRange);
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
//# sourceMappingURL=data:application/json;base64,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QUMsSUFBSSxDQUFDLDRCQUE0QixFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7T0FDM0Y7S0FDRjs7O1dBRWUsNEJBQVM7QUFDdkIsVUFBSSxJQUFJLENBQUMsMEJBQTBCLEVBQUU7QUFDbkMsWUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztPQUMzRTtLQUNGOzs7U0FqWkcsZUFBZTs7O0FBb1pyQixTQUFTLGVBQWUsR0FBRztBQUN6QixNQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FDM0IsMEVBQTBFLENBQzNFLENBQUM7Q0FDSDs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJEaWFnbm9zdGljU3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEludmFsaWRhdGlvbk1lc3NhZ2UsXG4gIERpYWdub3N0aWNNZXNzYWdlLFxuICBEaWFnbm9zdGljUHJvdmlkZXIsXG4gIERpYWdub3N0aWNQcm92aWRlclVwZGF0ZSxcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBQcm9qZWN0RGlhZ25vc3RpY01lc3NhZ2UsXG4gIEZpbGVNZXNzYWdlVXBkYXRlLFxufSBmcm9tICcuLic7XG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuXG5pbXBvcnQge2FwcGx5VGV4dEVkaXR9IGZyb20gJy4uLy4uL251Y2xpZGUtdGV4dGVkaXQnO1xuXG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuXG5pbXBvcnQge01hcmtlclRyYWNrZXJ9IGZyb20gJy4vTWFya2VyVHJhY2tlcic7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3Qge0Rpc3Bvc2FibGUsIEVtaXR0ZXJ9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG5jb25zdCBQUk9KRUNUX01FU1NBR0VfQ0hBTkdFX0VWRU5UID0gJ21lc3NhZ2VzLWNoYW5nZWQtZm9yLXByb2plY3QnO1xuY29uc3QgQUxMX0NIQU5HRV9FVkVOVCA9ICdtZXNzYWdlcy1jaGFuZ2VkJztcblxuY2xhc3MgRGlhZ25vc3RpY1N0b3JlIHtcbiAgLy8gQSBtYXAgZnJvbSBlYWNoIGRpYWdub3N0aWMgcHJvdmlkZXIgdG86XG4gIC8vIGEgbWFwIGZyb20gZWFjaCBmaWxlIGl0IGhhcyBtZXNzYWdlcyBmb3IgdG8gdGhlIGFycmF5IG9mIG1lc3NhZ2VzIGZvciB0aGF0IGZpbGUuXG4gIF9wcm92aWRlclRvRmlsZVRvTWVzc2FnZXM6IE1hcDxEaWFnbm9zdGljUHJvdmlkZXIsIE1hcDxOdWNsaWRlVXJpLCBBcnJheTxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+Pj47XG4gIC8vIEEgbWFwIGZyb20gZWFjaCBmaWxlIHRoYXQgaGFzIG1lc3NhZ2VzIGZyb20gYW55IGRpYWdub3N0aWMgcHJvdmlkZXJcbiAgLy8gdG8gdGhlIHNldCBvZiBkaWFnbm9zdGljIHByb3ZpZGVycyB0aGF0IGhhdmUgbWVzc2FnZXMgZm9yIGl0LlxuICBfZmlsZVRvUHJvdmlkZXJzOiBNYXA8TnVjbGlkZVVyaSwgU2V0PERpYWdub3N0aWNQcm92aWRlcj4+O1xuXG4gIC8vIEEgbWFwIGZyb20gZWFjaCBkaWFnbm9zdGljIHByb3ZpZGVyIHRvIHRoZSBhcnJheSBvZiBwcm9qZWN0IG1lc3NhZ2VzIGZyb20gaXQuXG4gIF9wcm92aWRlclRvUHJvamVjdERpYWdub3N0aWNzOiBNYXA8RGlhZ25vc3RpY1Byb3ZpZGVyLCBBcnJheTxQcm9qZWN0RGlhZ25vc3RpY01lc3NhZ2U+PjtcblxuICAvLyBGaWxlIHBhdGhzIGFyZSB1c2VkIGFzIGV2ZW50IG5hbWVzIGZvciB0aGUgX2ZpbGVDaGFuZ2VFbWl0dGVyLCBzbyBhIHNlY29uZFxuICAvLyBlbWl0dGVyIGlzIHVzZWQgZm9yIG90aGVyIGV2ZW50cyB0byBwcmV2ZW50IGV2ZW50IG5hbWUgY29sbGlzaW9ucy5cbiAgX2ZpbGVDaGFuZ2VFbWl0dGVyOiBFbWl0dGVyO1xuICBfbm9uRmlsZUNoYW5nZUVtaXR0ZXI6IEVtaXR0ZXI7XG4gIC8vIEEgbWFwIG9mIE51Y2xpZGVVcmkgdG8gdGhlIG51bWJlciBvZiBsaXN0ZW5lcnMgcmVnaXN0ZXJlZCBmb3IgY2hhbmdlcyB0b1xuICAvLyBtZXNzYWdlcyBmb3IgdGhhdCBmaWxlLlxuICBfZmlsZVRvTGlzdGVuZXJzQ291bnQ6IE1hcDxOdWNsaWRlVXJpLCBudW1iZXI+O1xuICBfcHJvamVjdExpc3RlbmVyc0NvdW50OiBudW1iZXI7XG4gIF9hbGxNZXNzYWdlc0xpc3RlbmVyc0NvdW50OiBudW1iZXI7XG5cbiAgX21hcmtlclRyYWNrZXI6IE1hcmtlclRyYWNrZXI7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fcHJvdmlkZXJUb0ZpbGVUb01lc3NhZ2VzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2ZpbGVUb1Byb3ZpZGVycyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9wcm92aWRlclRvUHJvamVjdERpYWdub3N0aWNzID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5fZmlsZUNoYW5nZUVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX25vbkZpbGVDaGFuZ2VFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9maWxlVG9MaXN0ZW5lcnNDb3VudCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9wcm9qZWN0TGlzdGVuZXJzQ291bnQgPSAwO1xuICAgIHRoaXMuX2FsbE1lc3NhZ2VzTGlzdGVuZXJzQ291bnQgPSAwO1xuXG4gICAgdGhpcy5fbWFya2VyVHJhY2tlciA9IG5ldyBNYXJrZXJUcmFja2VyKCk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX3Byb3ZpZGVyVG9GaWxlVG9NZXNzYWdlcy5jbGVhcigpO1xuICAgIHRoaXMuX2ZpbGVUb1Byb3ZpZGVycy5jbGVhcigpO1xuICAgIHRoaXMuX3Byb3ZpZGVyVG9Qcm9qZWN0RGlhZ25vc3RpY3MuY2xlYXIoKTtcbiAgICB0aGlzLl9maWxlQ2hhbmdlRW1pdHRlci5kaXNwb3NlKCk7XG4gICAgdGhpcy5fbm9uRmlsZUNoYW5nZUVtaXR0ZXIuZGlzcG9zZSgpO1xuICAgIHRoaXMuX2ZpbGVUb0xpc3RlbmVyc0NvdW50LmNsZWFyKCk7XG4gICAgdGhpcy5fbWFya2VyVHJhY2tlci5kaXNwb3NlKCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZWN0aW9uOiBNZXRob2RzIHRvIG1vZGlmeSB0aGUgc3RvcmUuXG4gICAqL1xuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIG1lc3NhZ2VzIGZyb20gdGhlIGdpdmVuIHByb3ZpZGVyLlxuICAgKiBJZiB0aGUgdXBkYXRlIGNvbnRhaW5zIG1lc3NhZ2VzIGF0IGEgc2NvcGUgdGhhdCBhbHJlYWR5IGhhcyBtZXNzYWdlcyBmcm9tXG4gICAqIHRoaXMgcHJvdmlkZXIgaW4gdGhlIHN0b3JlLCB0aGUgZXhpc3RpbmcgbWVzc2FnZXMgd2lsbCBiZSBvdmVyd3JpdHRlbiBieSB0aGVcbiAgICogbmV3IG1lc3NhZ2VzLlxuICAgKiBAcGFyYW0gZGlhZ25vc3RpY1Byb3ZpZGVyIFRoZSBkaWFnbm9zdGljIHByb3ZpZGVyIHRoYXQgdGhlc2UgbWVzc2FnZXMgY29tZSBmcm9tLlxuICAgKiBAcGFyYW0gdXBkYXRlcyBTZXQgb2YgdXBkYXRlcyB0byBhcHBseS5cbiAgICovXG4gIHVwZGF0ZU1lc3NhZ2VzKFxuICAgICAgZGlhZ25vc3RpY1Byb3ZpZGVyOiBEaWFnbm9zdGljUHJvdmlkZXIsXG4gICAgICB1cGRhdGVzOiBEaWFnbm9zdGljUHJvdmlkZXJVcGRhdGUsXG4gICAgKTogdm9pZCB7XG4gICAgaWYgKHVwZGF0ZXMuZmlsZVBhdGhUb01lc3NhZ2VzKSB7XG4gICAgICB0aGlzLl91cGRhdGVGaWxlTWVzc2FnZXMoZGlhZ25vc3RpY1Byb3ZpZGVyLCB1cGRhdGVzLmZpbGVQYXRoVG9NZXNzYWdlcyk7XG4gICAgfVxuICAgIGlmICh1cGRhdGVzLnByb2plY3RNZXNzYWdlcykge1xuICAgICAgdGhpcy5fdXBkYXRlUHJvamVjdE1lc3NhZ2VzKGRpYWdub3N0aWNQcm92aWRlciwgdXBkYXRlcy5wcm9qZWN0TWVzc2FnZXMpO1xuICAgIH1cbiAgICBpZiAodXBkYXRlcy5maWxlUGF0aFRvTWVzc2FnZXMgfHwgdXBkYXRlcy5wcm9qZWN0TWVzc2FnZXMpIHtcbiAgICAgIHRoaXMuX2VtaXRBbGxNZXNzYWdlcygpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVGaWxlTWVzc2FnZXMoXG4gICAgICBkaWFnbm9zdGljUHJvdmlkZXI6IERpYWdub3N0aWNQcm92aWRlcixcbiAgICAgIG5ld0ZpbGVQYXRoc1RvTWVzc2FnZXM6IE1hcDxOdWNsaWRlVXJpLCBBcnJheTxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+PlxuICAgICk6IHZvaWQge1xuICAgIGxldCBmaWxlVG9NZXNzYWdlcyA9IHRoaXMuX3Byb3ZpZGVyVG9GaWxlVG9NZXNzYWdlcy5nZXQoZGlhZ25vc3RpY1Byb3ZpZGVyKTtcbiAgICBpZiAoIWZpbGVUb01lc3NhZ2VzKSB7XG4gICAgICBmaWxlVG9NZXNzYWdlcyA9IG5ldyBNYXAoKTtcbiAgICAgIHRoaXMuX3Byb3ZpZGVyVG9GaWxlVG9NZXNzYWdlcy5zZXQoZGlhZ25vc3RpY1Byb3ZpZGVyLCBmaWxlVG9NZXNzYWdlcyk7XG4gICAgfVxuICAgIG5ld0ZpbGVQYXRoc1RvTWVzc2FnZXMuZm9yRWFjaCgobmV3TWVzc2FnZXNGb3JQYXRoLCBmaWxlUGF0aCkgPT4ge1xuICAgICAgLy8gRmxvdyBuYWl2ZWx5IHRoaW5rcyB0aGF0IHNpbmNlIHdlIGFyZSBpbiBhIGNsb3N1cmUsIGZpbGVUb01lc3NhZ2VzIGNvdWxkIGhhdmUgYmVlblxuICAgICAgLy8gcmVhc3NpZ25lZCB0byBzb21ldGhpbmcgbnVsbCBieSB0aGUgdGltZSB0aGlzIGV4ZWN1dGVzLlxuICAgICAgaW52YXJpYW50KGZpbGVUb01lc3NhZ2VzICE9IG51bGwpO1xuXG4gICAgICBjb25zdCBtZXNzYWdlc1RvUmVtb3ZlID0gZmlsZVRvTWVzc2FnZXMuZ2V0KGZpbGVQYXRoKTtcbiAgICAgIGlmIChtZXNzYWdlc1RvUmVtb3ZlICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fbWFya2VyVHJhY2tlci5yZW1vdmVGaWxlTWVzc2FnZXMobWVzc2FnZXNUb1JlbW92ZSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9tYXJrZXJUcmFja2VyLmFkZEZpbGVNZXNzYWdlcyhuZXdNZXNzYWdlc0ZvclBhdGgpO1xuXG4gICAgICAvLyBVcGRhdGUgX3Byb3ZpZGVyVG9GaWxlVG9NZXNzYWdlcy5cbiAgICAgIGZpbGVUb01lc3NhZ2VzLnNldChmaWxlUGF0aCwgbmV3TWVzc2FnZXNGb3JQYXRoKTtcbiAgICAgIC8vIFVwZGF0ZSBfZmlsZVRvUHJvdmlkZXJzLlxuICAgICAgbGV0IHByb3ZpZGVycyA9IHRoaXMuX2ZpbGVUb1Byb3ZpZGVycy5nZXQoZmlsZVBhdGgpO1xuICAgICAgaWYgKCFwcm92aWRlcnMpIHtcbiAgICAgICAgcHJvdmlkZXJzID0gbmV3IFNldCgpO1xuICAgICAgICB0aGlzLl9maWxlVG9Qcm92aWRlcnMuc2V0KGZpbGVQYXRoLCBwcm92aWRlcnMpO1xuICAgICAgfVxuICAgICAgcHJvdmlkZXJzLmFkZChkaWFnbm9zdGljUHJvdmlkZXIpO1xuXG4gICAgICB0aGlzLl9lbWl0RmlsZU1lc3NhZ2VzKGZpbGVQYXRoKTtcbiAgICB9KTtcbiAgfVxuXG4gIF91cGRhdGVQcm9qZWN0TWVzc2FnZXMoXG4gICAgZGlhZ25vc3RpY1Byb3ZpZGVyOiBEaWFnbm9zdGljUHJvdmlkZXIsXG4gICAgcHJvamVjdE1lc3NhZ2VzOiBBcnJheTxQcm9qZWN0RGlhZ25vc3RpY01lc3NhZ2U+XG4gICk6IHZvaWQge1xuICAgIHRoaXMuX3Byb3ZpZGVyVG9Qcm9qZWN0RGlhZ25vc3RpY3Muc2V0KGRpYWdub3N0aWNQcm92aWRlciwgcHJvamVjdE1lc3NhZ2VzKTtcbiAgICB0aGlzLl9lbWl0UHJvamVjdE1lc3NhZ2VzKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgdGhlIG1lc3NhZ2VzIGZyb20gdGhlIGdpdmVuIHByb3ZpZGVyLCBhY2NvcmRpbmcgdG8gdGhlIG9wdGlvbnMuXG4gICAqIEBwYXJhbSBvcHRpb25zIEFuIE9iamVjdCBvZiB0aGUgZm9ybTpcbiAgICogICAqIHNjb3BlOiBDYW4gYmUgJ2ZpbGUnLCAncHJvamVjdCcsIG9yICdhbGwnLlxuICAgKiAgICAgICAqICdmaWxlJzogVGhlICdmaWxlUGF0aHMnIG9wdGlvbiBkZXRlcm1pbmVzIHdoaWNoIGZpbGVzJyBtZXNzYWdlcyB0byBjbGVhclxuICAgKiAgICAgICAqICdwcm9qZWN0JzogYWxsICdwcm9qZWN0JyBzY29wZSBtZXNzYWdlcyBhcmUgY2xlYXJlZC5cbiAgICogICAgICAgKiAnYWxsJzogYWxsIG1lc3NhZ2VzIGFyZSBjbGVhcmVkLlxuICAgKiAgICogZmlsZVBhdGhzOiBBcnJheSBvZiBhYnNvbHV0ZSBmaWxlIHBhdGhzIChOdWNsaWRlVXJpKSB0byBjbGVhciBtZXNzYWdlcyBmb3IuXG4gICAqL1xuICBpbnZhbGlkYXRlTWVzc2FnZXMoXG4gICAgICBkaWFnbm9zdGljUHJvdmlkZXI6IERpYWdub3N0aWNQcm92aWRlcixcbiAgICAgIGludmFsaWRhdGlvbk1lc3NhZ2U6IEludmFsaWRhdGlvbk1lc3NhZ2VcbiAgICApOiB2b2lkIHtcbiAgICBpZiAoaW52YWxpZGF0aW9uTWVzc2FnZS5zY29wZSA9PT0gJ2ZpbGUnKSB7XG4gICAgICB0aGlzLl9pbnZhbGlkYXRlRmlsZU1lc3NhZ2VzRm9yUHJvdmlkZXIoZGlhZ25vc3RpY1Byb3ZpZGVyLCBpbnZhbGlkYXRpb25NZXNzYWdlLmZpbGVQYXRocyk7XG4gICAgICB0aGlzLl9lbWl0QWxsTWVzc2FnZXMoKTtcbiAgICB9IGVsc2UgaWYgKGludmFsaWRhdGlvbk1lc3NhZ2Uuc2NvcGUgPT09ICdwcm9qZWN0Jykge1xuICAgICAgdGhpcy5faW52YWxpZGF0ZVByb2plY3RNZXNzYWdlc0ZvclByb3ZpZGVyKGRpYWdub3N0aWNQcm92aWRlcik7XG4gICAgICB0aGlzLl9lbWl0QWxsTWVzc2FnZXMoKTtcbiAgICB9IGVsc2UgaWYgKGludmFsaWRhdGlvbk1lc3NhZ2Uuc2NvcGUgPT09ICdhbGwnKSB7XG4gICAgICB0aGlzLl9pbnZhbGlkYXRlQWxsTWVzc2FnZXNGb3JQcm92aWRlcihkaWFnbm9zdGljUHJvdmlkZXIpO1xuICAgIH1cbiAgfVxuXG4gIF9pbnZhbGlkYXRlRmlsZU1lc3NhZ2VzRm9yUHJvdmlkZXIoXG4gICAgZGlhZ25vc3RpY1Byb3ZpZGVyOiBEaWFnbm9zdGljUHJvdmlkZXIsXG4gICAgcGF0aHNUb1JlbW92ZTogSXRlcmFibGU8TnVjbGlkZVVyaT5cbiAgKTogdm9pZCB7XG4gICAgY29uc3QgZmlsZVRvRGlhZ25vc3RpY3MgPSB0aGlzLl9wcm92aWRlclRvRmlsZVRvTWVzc2FnZXMuZ2V0KGRpYWdub3N0aWNQcm92aWRlcik7XG4gICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiBwYXRoc1RvUmVtb3ZlKSB7XG4gICAgICAvLyBVcGRhdGUgX3Byb3ZpZGVyVG9GaWxlVG9NZXNzYWdlcy5cbiAgICAgIGlmIChmaWxlVG9EaWFnbm9zdGljcykge1xuICAgICAgICBjb25zdCBkaWFnbm9zdGljc1RvUmVtb3ZlID0gZmlsZVRvRGlhZ25vc3RpY3MuZ2V0KGZpbGVQYXRoKTtcbiAgICAgICAgaWYgKGRpYWdub3N0aWNzVG9SZW1vdmUgIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuX21hcmtlclRyYWNrZXIucmVtb3ZlRmlsZU1lc3NhZ2VzKGRpYWdub3N0aWNzVG9SZW1vdmUpO1xuICAgICAgICB9XG4gICAgICAgIGZpbGVUb0RpYWdub3N0aWNzLmRlbGV0ZShmaWxlUGF0aCk7XG4gICAgICB9XG4gICAgICAvLyBVcGRhdGUgX2ZpbGVUb1Byb3ZpZGVycy5cbiAgICAgIGNvbnN0IHByb3ZpZGVycyA9IHRoaXMuX2ZpbGVUb1Byb3ZpZGVycy5nZXQoZmlsZVBhdGgpO1xuICAgICAgaWYgKHByb3ZpZGVycykge1xuICAgICAgICBwcm92aWRlcnMuZGVsZXRlKGRpYWdub3N0aWNQcm92aWRlcik7XG4gICAgICB9XG4gICAgICB0aGlzLl9lbWl0RmlsZU1lc3NhZ2VzKGZpbGVQYXRoKTtcbiAgICB9XG4gIH1cblxuICBfaW52YWxpZGF0ZVByb2plY3RNZXNzYWdlc0ZvclByb3ZpZGVyKGRpYWdub3N0aWNQcm92aWRlcjogRGlhZ25vc3RpY1Byb3ZpZGVyKTogdm9pZCB7XG4gICAgdGhpcy5fcHJvdmlkZXJUb1Byb2plY3REaWFnbm9zdGljcy5kZWxldGUoZGlhZ25vc3RpY1Byb3ZpZGVyKTtcbiAgICB0aGlzLl9lbWl0UHJvamVjdE1lc3NhZ2VzKCk7XG4gIH1cblxuICBfaW52YWxpZGF0ZUFsbE1lc3NhZ2VzRm9yUHJvdmlkZXIoZGlhZ25vc3RpY1Byb3ZpZGVyOiBEaWFnbm9zdGljUHJvdmlkZXIpOiB2b2lkIHtcbiAgICAvLyBJbnZhbGlkYXRlIGFsbCBmaWxlIG1lc3NhZ2VzLlxuICAgIGNvbnN0IGZpbGVzVG9EaWFnbm9zdGljcyA9IHRoaXMuX3Byb3ZpZGVyVG9GaWxlVG9NZXNzYWdlcy5nZXQoZGlhZ25vc3RpY1Byb3ZpZGVyKTtcbiAgICBpZiAoZmlsZXNUb0RpYWdub3N0aWNzKSB7XG4gICAgICBjb25zdCBhbGxGaWxlUGF0aHMgPSBmaWxlc1RvRGlhZ25vc3RpY3Mua2V5cygpO1xuICAgICAgdGhpcy5faW52YWxpZGF0ZUZpbGVNZXNzYWdlc0ZvclByb3ZpZGVyKGRpYWdub3N0aWNQcm92aWRlciwgYWxsRmlsZVBhdGhzKTtcbiAgICB9XG4gICAgLy8gSW52YWxpZGF0ZSBhbGwgcHJvamVjdCBtZXNzYWdlcy5cbiAgICB0aGlzLl9pbnZhbGlkYXRlUHJvamVjdE1lc3NhZ2VzRm9yUHJvdmlkZXIoZGlhZ25vc3RpY1Byb3ZpZGVyKTtcblxuICAgIHRoaXMuX2VtaXRBbGxNZXNzYWdlcygpO1xuICB9XG5cbiAgX2ludmFsaWRhdGVTaW5nbGVNZXNzYWdlKG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSk6IHZvaWQge1xuICAgIHRoaXMuX21hcmtlclRyYWNrZXIucmVtb3ZlRmlsZU1lc3NhZ2VzKFttZXNzYWdlXSk7XG4gICAgZm9yIChjb25zdCBmaWxlVG9NZXNzYWdlcyBvZiB0aGlzLl9wcm92aWRlclRvRmlsZVRvTWVzc2FnZXMudmFsdWVzKCkpIHtcbiAgICAgIGNvbnN0IGZpbGVNZXNzYWdlcyA9IGZpbGVUb01lc3NhZ2VzLmdldChtZXNzYWdlLmZpbGVQYXRoKTtcbiAgICAgIGlmIChmaWxlTWVzc2FnZXMgIT0gbnVsbCkge1xuICAgICAgICBhcnJheS5yZW1vdmUoZmlsZU1lc3NhZ2VzLCBtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gTG9va3MgbGlrZSBlbWl0QWxsTWVzc2FnZXMgZG9lcyBub3QgYWN0dWFsbHkgZW1pdCBhbGwgbWVzc2FnZXMuIFdlIG5lZWQgdG8gZG8gYm90aCBmb3IgYm90aFxuICAgIC8vIHRoZSBndXR0ZXIgVUkgYW5kIHRoZSBkaWFnbm9zdGljcyB0YWJsZSB0byBnZXQgdXBkYXRlZC5cbiAgICB0aGlzLl9lbWl0RmlsZU1lc3NhZ2VzKG1lc3NhZ2UuZmlsZVBhdGgpO1xuICAgIHRoaXMuX2VtaXRBbGxNZXNzYWdlcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlY3Rpb246IE1ldGhvZHMgdG8gcmVhZCBmcm9tIHRoZSBzdG9yZS5cbiAgICovXG5cbiAgLyoqXG4gICAqIENhbGwgdGhlIGNhbGxiYWNrIHdoZW4gdGhlIGZpbGVQYXRoJ3MgbWVzc2FnZXMgaGF2ZSBjaGFuZ2VkLlxuICAgKiBJbiBhZGRpdGlvbiwgdGhlIFN0b3JlIHdpbGwgaW1tZWRpYXRlbHkgaW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIHRoZSBkYXRhXG4gICAqIGN1cnJlbnRseSBpbiB0aGUgU3RvcmUsIGlmZiB0aGVyZSBpcyBhbnkuXG4gICAqIEBwYXJhbSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gbWVzc2FnZSB3aGVuIGFueSBvZiB0aGUgZmlsZVBhdGhzJyBtZXNzYWdlc1xuICAgKiAgIGNoYW5nZS4gVGhlIGFycmF5IG9mIG1lc3NhZ2VzIGlzIG1lYW50IHRvIGNvbXBsZXRlbHkgcmVwbGFjZSBhbnkgcHJldmlvdXNcbiAgICogICBtZXNzYWdlcyBmb3IgdGhpcyBmaWxlIHBhdGguXG4gICAqL1xuICBvbkZpbGVNZXNzYWdlc0RpZFVwZGF0ZShcbiAgICAgIGNhbGxiYWNrOiAodXBkYXRlOiBGaWxlTWVzc2FnZVVwZGF0ZSkgPT4gbWl4ZWQsXG4gICAgICBmaWxlUGF0aDogTnVjbGlkZVVyaVxuICAgICk6IElEaXNwb3NhYmxlIHtcbiAgICAvLyBVc2UgdGhlIGZpbGVQYXRoIGFzIHRoZSBldmVudCBuYW1lLlxuICAgIGNvbnN0IGVtaXR0ZXJEaXNwb3NhYmxlID0gdGhpcy5fZmlsZUNoYW5nZUVtaXR0ZXIub24oZmlsZVBhdGgsIGNhbGxiYWNrKTtcbiAgICB0aGlzLl9pbmNyZW1lbnRGaWxlTGlzdGVuZXJDb3VudChmaWxlUGF0aCk7XG5cbiAgICBjb25zdCBmaWxlTWVzc2FnZXMgPSB0aGlzLl9nZXRGaWxlTWVzc2FnZXMoZmlsZVBhdGgpO1xuICAgIGlmIChmaWxlTWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgICBjYWxsYmFjayh7ZmlsZVBhdGgsIG1lc3NhZ2VzOiBmaWxlTWVzc2FnZXN9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGVtaXR0ZXJEaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2RlY3JlbWVudEZpbGVMaXN0ZW5lckNvdW50KGZpbGVQYXRoKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9pbmNyZW1lbnRGaWxlTGlzdGVuZXJDb3VudChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IHZvaWQge1xuICAgIGNvbnN0IGN1cnJlbnRDb3VudCA9IHRoaXMuX2ZpbGVUb0xpc3RlbmVyc0NvdW50LmdldChmaWxlUGF0aCkgfHwgMDtcbiAgICB0aGlzLl9maWxlVG9MaXN0ZW5lcnNDb3VudC5zZXQoZmlsZVBhdGgsIGN1cnJlbnRDb3VudCArIDEpO1xuICB9XG5cbiAgX2RlY3JlbWVudEZpbGVMaXN0ZW5lckNvdW50KGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgY29uc3QgY3VycmVudENvdW50ID0gdGhpcy5fZmlsZVRvTGlzdGVuZXJzQ291bnQuZ2V0KGZpbGVQYXRoKSB8fCAwO1xuICAgIGlmIChjdXJyZW50Q291bnQgPiAwKSB7XG4gICAgICB0aGlzLl9maWxlVG9MaXN0ZW5lcnNDb3VudC5zZXQoZmlsZVBhdGgsIGN1cnJlbnRDb3VudCAtIDEpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIHRoZSBjYWxsYmFjayB3aGVuIHByb2plY3Qtc2NvcGUgbWVzc2FnZXMgY2hhbmdlLlxuICAgKiBJbiBhZGRpdGlvbiwgdGhlIFN0b3JlIHdpbGwgaW1tZWRpYXRlbHkgaW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIHRoZSBkYXRhXG4gICAqIGN1cnJlbnRseSBpbiB0aGUgU3RvcmUsIGlmZiB0aGVyZSBpcyBhbnkuXG4gICAqIEBwYXJhbSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gbWVzc2FnZSB3aGVuIHRoZSBwcm9qZWN0LXNjb3BlIG1lc3NhZ2VzXG4gICAqICAgY2hhbmdlLiBUaGUgYXJyYXkgb2YgbWVzc2FnZXMgaXMgbWVhbnQgdG8gY29tcGxldGVseSByZXBsYWNlIGFueSBwcmV2aW91c1xuICAgKiAgIHByb2plY3Qtc2NvcGUgbWVzc2FnZXMuXG4gICAqL1xuICBvblByb2plY3RNZXNzYWdlc0RpZFVwZGF0ZShcbiAgICBjYWxsYmFjazogKG1lc3NhZ2VzOiBBcnJheTxQcm9qZWN0RGlhZ25vc3RpY01lc3NhZ2U+KSA9PiBtaXhlZFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgY29uc3QgZW1pdHRlckRpc3Bvc2FibGUgPSB0aGlzLl9ub25GaWxlQ2hhbmdlRW1pdHRlci5vbihQUk9KRUNUX01FU1NBR0VfQ0hBTkdFX0VWRU5ULCBjYWxsYmFjayk7XG4gICAgdGhpcy5fcHJvamVjdExpc3RlbmVyc0NvdW50ICs9IDE7XG5cbiAgICBjb25zdCBwcm9qZWN0TWVzc2FnZXMgPSB0aGlzLl9nZXRQcm9qZWN0TWVzc2FnZXMoKTtcbiAgICBpZiAocHJvamVjdE1lc3NhZ2VzLmxlbmd0aCkge1xuICAgICAgY2FsbGJhY2socHJvamVjdE1lc3NhZ2VzKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGVtaXR0ZXJEaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3Byb2plY3RMaXN0ZW5lcnNDb3VudCAtPSAxO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGwgdGhlIGNhbGxiYWNrIHdoZW4gYW55IG1lc3NhZ2VzIGNoYW5nZS5cbiAgICogSW4gYWRkaXRpb24sIHRoZSBTdG9yZSB3aWxsIGltbWVkaWF0ZWx5IGludm9rZSB0aGUgY2FsbGJhY2sgd2l0aCBkYXRhXG4gICAqIGN1cnJlbnRseSBpbiB0aGUgU3RvcmUsIGlmZiB0aGVyZSBpcyBhbnkuXG4gICAqIEBwYXJhbSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gbWVzc2FnZSB3aGVuIGFueSBtZXNzYWdlcyBjaGFuZ2UuIFRoZSBhcnJheVxuICAgKiAgIG9mIG1lc3NhZ2VzIGlzIG1lYW50IHRvIGNvbXBsZXRlbHkgcmVwbGFjZSBhbnkgcHJldmlvdXMgbWVzc2FnZXMuXG4gICAqL1xuICBvbkFsbE1lc3NhZ2VzRGlkVXBkYXRlKGNhbGxiYWNrOiAobWVzc2FnZXM6IEFycmF5PERpYWdub3N0aWNNZXNzYWdlPikgPT4gbWl4ZWQpOlxuICAgICAgSURpc3Bvc2FibGUge1xuICAgIGNvbnN0IGVtaXR0ZXJEaXNwb3NhYmxlID0gdGhpcy5fbm9uRmlsZUNoYW5nZUVtaXR0ZXIub24oQUxMX0NIQU5HRV9FVkVOVCwgY2FsbGJhY2spO1xuICAgIHRoaXMuX2FsbE1lc3NhZ2VzTGlzdGVuZXJzQ291bnQgKz0gMTtcblxuICAgIGNvbnN0IGFsbE1lc3NhZ2VzID0gdGhpcy5fZ2V0QWxsTWVzc2FnZXMoKTtcbiAgICBpZiAoYWxsTWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgICBjYWxsYmFjayhhbGxNZXNzYWdlcyk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBlbWl0dGVyRGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9hbGxNZXNzYWdlc0xpc3RlbmVyc0NvdW50IC09IDE7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgY3VycmVudCBkaWFnbm9zdGljIG1lc3NhZ2VzIGZvciB0aGUgZmlsZS5cbiAgICogUHJlZmVyIHRvIGdldCB1cGRhdGVzIHZpYSA6Om9uRmlsZU1lc3NhZ2VzRGlkVXBkYXRlLlxuICAgKi9cbiAgX2dldEZpbGVNZXNzYWdlcyhmaWxlUGF0aDogTnVjbGlkZVVyaSk6IEFycmF5PEZpbGVEaWFnbm9zdGljTWVzc2FnZT4ge1xuICAgIGxldCBhbGxGaWxlTWVzc2FnZXMgPSBbXTtcbiAgICBjb25zdCByZWxldmFudFByb3ZpZGVycyA9IHRoaXMuX2ZpbGVUb1Byb3ZpZGVycy5nZXQoZmlsZVBhdGgpO1xuICAgIGlmIChyZWxldmFudFByb3ZpZGVycykge1xuICAgICAgZm9yIChjb25zdCBwcm92aWRlciBvZiByZWxldmFudFByb3ZpZGVycykge1xuICAgICAgICBjb25zdCBmaWxlVG9NZXNzYWdlcyA9IHRoaXMuX3Byb3ZpZGVyVG9GaWxlVG9NZXNzYWdlcy5nZXQocHJvdmlkZXIpO1xuICAgICAgICBpbnZhcmlhbnQoZmlsZVRvTWVzc2FnZXMgIT0gbnVsbCk7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VzID0gZmlsZVRvTWVzc2FnZXMuZ2V0KGZpbGVQYXRoKTtcbiAgICAgICAgaW52YXJpYW50KG1lc3NhZ2VzICE9IG51bGwpO1xuICAgICAgICBhbGxGaWxlTWVzc2FnZXMgPSBhbGxGaWxlTWVzc2FnZXMuY29uY2F0KG1lc3NhZ2VzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFsbEZpbGVNZXNzYWdlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjdXJyZW50IHByb2plY3Qtc2NvcGUgZGlhZ25vc3RpYyBtZXNzYWdlcy5cbiAgICogUHJlZmVyIHRvIGdldCB1cGRhdGVzIHZpYSA6Om9uUHJvamVjdE1lc3NhZ2VzRGlkVXBkYXRlLlxuICAgKi9cbiAgX2dldFByb2plY3RNZXNzYWdlcygpOiBBcnJheTxQcm9qZWN0RGlhZ25vc3RpY01lc3NhZ2U+IHtcbiAgICBsZXQgYWxsUHJvamVjdE1lc3NhZ2VzID0gW107XG4gICAgZm9yIChjb25zdCBtZXNzYWdlcyBvZiB0aGlzLl9wcm92aWRlclRvUHJvamVjdERpYWdub3N0aWNzLnZhbHVlcygpKSB7XG4gICAgICBhbGxQcm9qZWN0TWVzc2FnZXMgPSBhbGxQcm9qZWN0TWVzc2FnZXMuY29uY2F0KG1lc3NhZ2VzKTtcbiAgICB9XG4gICAgcmV0dXJuIGFsbFByb2plY3RNZXNzYWdlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFsbCBjdXJyZW50IGRpYWdub3N0aWMgbWVzc2FnZXMuXG4gICAqIFByZWZlciB0byBnZXQgdXBkYXRlcyB2aWEgOjpvbkFsbE1lc3NhZ2VzRGlkVXBkYXRlLlxuICAgKi9cbiAgX2dldEFsbE1lc3NhZ2VzKCk6IEFycmF5PERpYWdub3N0aWNNZXNzYWdlPiB7XG4gICAgbGV0IGFsbE1lc3NhZ2VzID0gW107XG4gICAgLy8gR2V0IGFsbCBmaWxlIG1lc3NhZ2VzLlxuICAgIGZvciAoY29uc3QgZmlsZVRvTWVzc2FnZXMgb2YgdGhpcy5fcHJvdmlkZXJUb0ZpbGVUb01lc3NhZ2VzLnZhbHVlcygpKSB7XG4gICAgICBmb3IgKGNvbnN0IG1lc3NhZ2VzIG9mIGZpbGVUb01lc3NhZ2VzLnZhbHVlcygpKSB7XG4gICAgICAgIGFsbE1lc3NhZ2VzID0gYWxsTWVzc2FnZXMuY29uY2F0KG1lc3NhZ2VzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gR2V0IGFsbCBwcm9qZWN0IG1lc3NhZ2VzLlxuICAgIGFsbE1lc3NhZ2VzID0gYWxsTWVzc2FnZXMuY29uY2F0KHRoaXMuX2dldFByb2plY3RNZXNzYWdlcygpKTtcbiAgICByZXR1cm4gYWxsTWVzc2FnZXM7XG4gIH1cblxuICAvKipcbiAgICogU2VjdGlvbjogRmVlZGJhY2sgZnJvbSB0aGUgVUlcbiAgICovXG5cbiAgYXBwbHlGaXgobWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlKTogdm9pZCB7XG4gICAgY29uc3Qgc3VjY2VlZGVkID0gdGhpcy5fYXBwbHlTaW5nbGVGaXgobWVzc2FnZSk7XG4gICAgaWYgKCFzdWNjZWVkZWQpIHtcbiAgICAgIG5vdGlmeUZpeEZhaWxlZCgpO1xuICAgIH1cbiAgfVxuXG4gIGFwcGx5Rml4ZXNGb3JGaWxlKGZpbGU6IE51Y2xpZGVVcmkpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgdGhpcy5fZ2V0RmlsZU1lc3NhZ2VzKGZpbGUpKSB7XG4gICAgICBpZiAobWVzc2FnZS5maXggIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBzdWNjZWVkZWQgPSB0aGlzLl9hcHBseVNpbmdsZUZpeChtZXNzYWdlKTtcbiAgICAgICAgaWYgKCFzdWNjZWVkZWQpIHtcbiAgICAgICAgICBub3RpZnlGaXhGYWlsZWQoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmZiB0aGUgZml4IHN1Y2NlZWRzLlxuICAgKi9cbiAgX2FwcGx5U2luZ2xlRml4KG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGZpeCA9IG1lc3NhZ2UuZml4O1xuICAgIGludmFyaWFudChmaXggIT0gbnVsbCk7XG5cbiAgICBjb25zdCBhY3R1YWxSYW5nZSA9IHRoaXMuX21hcmtlclRyYWNrZXIuZ2V0Q3VycmVudFJhbmdlKG1lc3NhZ2UpO1xuXG4gICAgaWYgKGFjdHVhbFJhbmdlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBmaXhXaXRoQWN0dWFsUmFuZ2UgPSB7XG4gICAgICAuLi5maXgsXG4gICAgICBvbGRSYW5nZTogYWN0dWFsUmFuZ2UsXG4gICAgfTtcbiAgICBjb25zdCBzdWNjZWVkZWQgPSBhcHBseVRleHRFZGl0KG1lc3NhZ2UuZmlsZVBhdGgsIGZpeFdpdGhBY3R1YWxSYW5nZSk7XG4gICAgaWYgKHN1Y2NlZWRlZCkge1xuICAgICAgdGhpcy5faW52YWxpZGF0ZVNpbmdsZU1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZWN0aW9uOiBFdmVudCBFbWl0dGluZ1xuICAgKi9cblxuICBfZW1pdEZpbGVNZXNzYWdlcyhmaWxlUGF0aDogTnVjbGlkZVVyaSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9maWxlVG9MaXN0ZW5lcnNDb3VudC5nZXQoZmlsZVBhdGgpKSB7XG4gICAgICB0aGlzLl9maWxlQ2hhbmdlRW1pdHRlci5lbWl0KGZpbGVQYXRoLCB7ZmlsZVBhdGgsIG1lc3NhZ2VzOiB0aGlzLl9nZXRGaWxlTWVzc2FnZXMoZmlsZVBhdGgpfSk7XG4gICAgfVxuICB9XG5cbiAgX2VtaXRQcm9qZWN0TWVzc2FnZXMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3Byb2plY3RMaXN0ZW5lcnNDb3VudCkge1xuICAgICAgdGhpcy5fbm9uRmlsZUNoYW5nZUVtaXR0ZXIuZW1pdChQUk9KRUNUX01FU1NBR0VfQ0hBTkdFX0VWRU5ULCB0aGlzLl9nZXRQcm9qZWN0TWVzc2FnZXMoKSk7XG4gICAgfVxuICB9XG5cbiAgX2VtaXRBbGxNZXNzYWdlcygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fYWxsTWVzc2FnZXNMaXN0ZW5lcnNDb3VudCkge1xuICAgICAgdGhpcy5fbm9uRmlsZUNoYW5nZUVtaXR0ZXIuZW1pdChBTExfQ0hBTkdFX0VWRU5ULCB0aGlzLl9nZXRBbGxNZXNzYWdlcygpKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbm90aWZ5Rml4RmFpbGVkKCkge1xuICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAnRmFpbGVkIHRvIGFwcGx5IGZpeC4gVHJ5IHNhdmluZyB0byBnZXQgZnJlc2ggcmVzdWx0cyBhbmQgdGhlbiB0cnkgYWdhaW4uJyxcbiAgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWFnbm9zdGljU3RvcmU7XG4iXX0=