'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nuclideTextedit;

function _load_nuclideTextedit() {
  return _nuclideTextedit = _interopRequireDefault(require('../../nuclide-textedit'));
}

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _MarkerTracker;

function _load_MarkerTracker() {
  return _MarkerTracker = require('./MarkerTracker');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DiagnosticStore {
  // A map from each file that has messages from any diagnostic provider
  // to the set of diagnostic providers that have messages for it.
  constructor() {
    this._providerToFileToMessages = new Map();
    this._fileToProviders = new (_collection || _load_collection()).MultiMap();
    this._providerToProjectDiagnostics = new Map();

    this._fileChanges = new _rxjsBundlesRxMinJs.Subject();
    this._projectChanges = new _rxjsBundlesRxMinJs.BehaviorSubject([]);
    this._allChanges = new _rxjsBundlesRxMinJs.BehaviorSubject([]);

    this._markerTracker = new (_MarkerTracker || _load_MarkerTracker()).MarkerTracker();
  }

  // A map from each diagnostic provider to the array of project messages from it.

  // A map from each diagnostic provider to:
  // a map from each file it has messages for to the array of messages for that file.


  dispose() {
    this._providerToFileToMessages.clear();
    this._fileToProviders.clear();
    this._providerToProjectDiagnostics.clear();
    this._fileChanges.complete();
    this._projectChanges.complete();
    this._allChanges.complete();
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
  updateMessages(diagnosticProvider, updates) {
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

  _updateFileMessages(diagnosticProvider, newFilePathsToMessages) {
    let fileToMessages = this._providerToFileToMessages.get(diagnosticProvider);
    if (!fileToMessages) {
      fileToMessages = new Map();
      this._providerToFileToMessages.set(diagnosticProvider, fileToMessages);
    }
    newFilePathsToMessages.forEach((newMessagesForPath, filePath) => {
      // Flow naively thinks that since we are in a closure, fileToMessages could have been
      // reassigned to something null by the time this executes.
      if (!(fileToMessages != null)) {
        throw new Error('Invariant violation: "fileToMessages != null"');
      }

      const messagesToRemove = fileToMessages.get(filePath);
      if (messagesToRemove != null) {
        this._markerTracker.removeFileMessages(messagesToRemove);
      }
      this._markerTracker.addFileMessages(newMessagesForPath);

      // Update _providerToFileToMessages.
      fileToMessages.set(filePath, newMessagesForPath);
      // Update _fileToProviders.
      this._fileToProviders.add(filePath, diagnosticProvider);

      this._emitFileMessages(filePath);
    });
  }

  _updateProjectMessages(diagnosticProvider, projectMessages) {
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
  invalidateMessages(diagnosticProvider, invalidationMessage) {
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

  _invalidateFileMessagesForProvider(diagnosticProvider, pathsToRemove) {
    const fileToDiagnostics = this._providerToFileToMessages.get(diagnosticProvider);
    for (const filePath of pathsToRemove) {
      // Update _providerToFileToMessages.
      if (fileToDiagnostics) {
        const diagnosticsToRemove = fileToDiagnostics.get(filePath);
        if (diagnosticsToRemove != null) {
          this._markerTracker.removeFileMessages(diagnosticsToRemove);
        }
        fileToDiagnostics.delete(filePath);
      }
      // Update _fileToProviders.
      this._fileToProviders.delete(filePath, diagnosticProvider);

      this._emitFileMessages(filePath);
    }
  }

  _invalidateProjectMessagesForProvider(diagnosticProvider) {
    this._providerToProjectDiagnostics.delete(diagnosticProvider);
    this._emitProjectMessages();
  }

  _invalidateAllMessagesForProvider(diagnosticProvider) {
    // Invalidate all file messages.
    const filesToDiagnostics = this._providerToFileToMessages.get(diagnosticProvider);
    if (filesToDiagnostics) {
      const allFilePaths = filesToDiagnostics.keys();
      this._invalidateFileMessagesForProvider(diagnosticProvider, allFilePaths);
    }
    // Invalidate all project messages.
    this._invalidateProjectMessagesForProvider(diagnosticProvider);

    this._emitAllMessages();
  }

  _invalidateSingleMessage(message) {
    this._markerTracker.removeFileMessages([message]);
    for (const fileToMessages of this._providerToFileToMessages.values()) {
      const fileMessages = fileToMessages.get(message.filePath);
      if (fileMessages != null) {
        (0, (_collection || _load_collection()).arrayRemove)(fileMessages, message);
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

  getFileMessageUpdates(filePath) {
    const fileMessages = this._getFileMessages(filePath);
    const initialObservable = _rxjsBundlesRxMinJs.Observable.of({ filePath, messages: fileMessages });
    return _rxjsBundlesRxMinJs.Observable.concat(initialObservable, this._fileChanges.filter(change => change.filePath === filePath));
  }

  getProjectMessageUpdates() {
    return this._projectChanges.asObservable();
  }

  getAllMessageUpdates() {
    return this._allChanges.asObservable();
  }

  /**
   * Call the callback when the filePath's messages have changed.
   * In addition, the Store will immediately invoke the callback with the data
   * currently in the Store, iff there is any.
   * @param callback The function to message when any of the filePaths' messages
   *   change. The array of messages is meant to completely replace any previous
   *   messages for this file path.
   */
  onFileMessagesDidUpdate(callback, filePath) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this.getFileMessageUpdates(filePath).subscribe(callback));
  }

  /**
   * Call the callback when project-scope messages change.
   * In addition, the Store will immediately invoke the callback with the data
   * currently in the Store, iff there is any.
   * @param callback The function to message when the project-scope messages
   *   change. The array of messages is meant to completely replace any previous
   *   project-scope messages.
   */
  onProjectMessagesDidUpdate(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this.getProjectMessageUpdates().subscribe(callback));
  }

  /**
   * Call the callback when any messages change.
   * In addition, the Store will immediately invoke the callback with data
   * currently in the Store, iff there is any.
   * @param callback The function to message when any messages change. The array
   *   of messages is meant to completely replace any previous messages.
   */
  onAllMessagesDidUpdate(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this.getAllMessageUpdates().subscribe(callback));
  }

  /**
   * Gets the current diagnostic messages for the file.
   * Prefer to get updates via ::onFileMessagesDidUpdate.
   */
  _getFileMessages(filePath) {
    let allFileMessages = [];
    const relevantProviders = this._fileToProviders.get(filePath);
    for (const provider of relevantProviders) {
      const fileToMessages = this._providerToFileToMessages.get(provider);

      if (!(fileToMessages != null)) {
        throw new Error('Invariant violation: "fileToMessages != null"');
      }

      const messages = fileToMessages.get(filePath);

      if (!(messages != null)) {
        throw new Error('Invariant violation: "messages != null"');
      }

      allFileMessages = allFileMessages.concat(messages);
    }
    return allFileMessages;
  }

  /**
   * Gets the current project-scope diagnostic messages.
   * Prefer to get updates via ::onProjectMessagesDidUpdate.
   */
  _getProjectMessages() {
    let allProjectMessages = [];
    for (const messages of this._providerToProjectDiagnostics.values()) {
      allProjectMessages = allProjectMessages.concat(messages);
    }
    return allProjectMessages;
  }

  /**
   * Gets all current diagnostic messages.
   * Prefer to get updates via ::onAllMessagesDidUpdate.
   */
  _getAllMessages() {
    let allMessages = [];
    // Get all file messages.
    for (const fileToMessages of this._providerToFileToMessages.values()) {
      for (const messages of fileToMessages.values()) {
        allMessages = allMessages.concat(messages);
      }
    }
    // Get all project messages.
    allMessages = allMessages.concat(this._getProjectMessages());
    return allMessages;
  }

  /**
   * Section: Feedback from the UI
   */

  applyFix(message) {
    this._applyFixes(message.filePath, message);
  }

  applyFixesForFile(file) {
    const messages = this._getFileMessages(file).filter(msg => msg.fix != null && msg.fix.speculative !== true);
    this._applyFixes(file, ...messages);
  }

  // Precondition: all messages have the given filePath
  _applyFixes(filePath, ...messages) {
    const messagesWithFixes = messages.filter(msg => msg.fix != null);
    const fixes = [];
    for (const message of messagesWithFixes) {
      const fix = this._getUpdatedFix(message);
      if (fix == null) {
        notifyFixFailed();
        return;
      }
      fixes.push(fix);
    }
    const succeeded = (0, (_nuclideTextedit || _load_nuclideTextedit()).default)(filePath, ...fixes);
    if (succeeded) {
      for (const message of messagesWithFixes) {
        this._invalidateSingleMessage(message);
      }
    } else {
      notifyFixFailed();
    }
  }

  /**
   * Return the fix for the given message with the updated range based on the stored markers. If the
   * range cannot be found (in particular, if edits have rendered it invalid), return null.
   *
   * Precondition: message.fix != null
   */
  _getUpdatedFix(message) {
    const fix = message.fix;

    if (!(fix != null)) {
      throw new Error('Invariant violation: "fix != null"');
    }

    const actualRange = this._markerTracker.getCurrentRange(message);

    if (actualRange == null) {
      return null;
    }

    return Object.assign({}, fix, {
      oldRange: actualRange
    });
  }

  /**
   * Section: Event Emitting
   */

  _emitFileMessages(filePath) {
    this._fileChanges.next({
      filePath,
      messages: this._getFileMessages(filePath)
    });
  }

  _emitProjectMessages() {
    this._projectChanges.next(this._getProjectMessages());
  }

  _emitAllMessages() {
    this._allChanges.next(this._getAllMessages());
  }
}

exports.default = DiagnosticStore; /**
                                    * Copyright (c) 2015-present, Facebook, Inc.
                                    * All rights reserved.
                                    *
                                    * This source code is licensed under the license found in the LICENSE file in
                                    * the root directory of this source tree.
                                    *
                                    * 
                                    */

function notifyFixFailed() {
  atom.notifications.addWarning('Failed to apply fix. Try saving to get fresh results and then try again.');
}