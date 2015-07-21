'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  InvalidationMessage,
  DiagnosticProvider,
  DiagnosticProviderUpdate,
  FileDiagnosticMessage,
  ProjectDiagnosticMessage,
  FileMessageUpdate,
} from './types';

var {Disposable, Emitter} = require('atom');

var PROJECT_MESSAGE_CHANGE_EVENT = 'messages-changed-for-project';
var ALL_CHANGE_EVENT = 'messages-changed';

class DiagnosticStore {
  // A map from each diagnostic provider to:
  // a map from each file it has messages for to the array of messages for that file.
  _providerToFileToMessages: Map<DiagnosticProvider, Map<NuclideUri, Array<DiagnosticMessage>>>;
  // A map from each file that has messages from any diagnostic provider
  // to the set of diagnostic providers that have messages for it.
  _fileToProviders: Map<NuclideUri, Set<DiagnosticProvider>>;

  // A map from each diagnostic provider to the array of project messages from it.
  _providerToProjectDiagnostics: Map<DiagnosticProvider, Array<DiagnosticMessage>>;

  // File paths are used as event names for the _fileChangeEmitter, so a second
  // emitter is used for other events to prevent event name collisions.
  _fileChangeEmitter: Emitter;
  _nonFileChangeEmitter: Emitter;
  // A map of NuclideUri to the number of listeners registered for changes to
  // messages for that file.
  _fileToListenersCount: Map<NuclideUri, number>;
  _projectListenersCount: number;
  _allMessagesListenersCount: number;

  constructor() {
    this._providerToFileToMessages = new Map();
    this._fileToProviders = new Map();
    this._providerToProjectDiagnostics = new Map();

    this._fileChangeEmitter = new Emitter();
    this._nonFileChangeEmitter = new Emitter();
    this._fileToListenersCount = new Map();
    this._projectListenersCount = 0;
    this._allMessagesListenersCount = 0;
  }

  dispose() {
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
  updateMessages(
      diagnosticProvider: DiagnosticProvider,
      updates: DiagnosticProviderUpdate,
    ): void {
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

  _updateFileMessages(
      diagnosticProvider: DiagnosticProvider,
      newFilePathsToMessages: Map<NuclideUri, Array<FileDiagnosticMessage>>
    ): void {
    var fileToMessages = this._providerToFileToMessages.get(diagnosticProvider);
    if (!fileToMessages) {
      fileToMessages = new Map();
      this._providerToFileToMessages.set(diagnosticProvider, fileToMessages);
    }
    newFilePathsToMessages.forEach((newMessagesForPath, filePath) => {
      // Update _providerToFileToMessages.
      fileToMessages.set(filePath, newMessagesForPath);
      // Update _fileToProviders.
      var providers = this._fileToProviders.get(filePath);
      if (!providers) {
        providers = new Set();
        this._fileToProviders.set(filePath, providers);
      }
      providers.add(diagnosticProvider);

      this._emitFileMessages(filePath);
    });
  }

  _updateProjectMessages(
    diagnosticProvider: DiagnosticProvider,
    projectMessages: Array<ProjectDiagnosticMessage>
  ): void {
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
  invalidateMessages(
      diagnosticProvider: DiagnosticProvider,
      invalidationMessage: InvalidationMessage
    ): void {
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

  _invalidateFileMessagesForProvider(
    diagnosticProvider: DiagnosticProvider,
    pathsToRemove: Iterable<NuclideUri>
  ): void {
    var fileToDiagnostics = this._providerToFileToMessages.get(diagnosticProvider);
    for (var filePath of pathsToRemove) {
      // Update _providerToFileToMessages.
      if (fileToDiagnostics) {
        fileToDiagnostics.delete(filePath);
      }
      // Update _fileToProviders.
      var providers = this._fileToProviders.get(filePath);
      if (providers) {
        providers.delete(diagnosticProvider);
      }
      this._emitFileMessages(filePath);
    }
  }

  _invalidateProjectMessagesForProvider(diagnosticProvider: DiagnosticProvider): void {
    this._providerToProjectDiagnostics.delete(diagnosticProvider);
    this._emitProjectMessages();
  }

  _invalidateAllMessagesForProvider(diagnosticProvider: DiagnosticProvider): void {
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

  /**
   * Section: Methods to read from the store.
   */

  /**
   * Call the callback when the filePath's messages have changed.
   * @param callback The function to message when any of the filePaths' messages
   *   change. The array of messages is meant to completely replace any previous
   *   messages for this file path.
   */
  onFileMessagesDidUpdate(
      callback: (update: FileMessageUpdate) => mixed,
      filePath: NuclideUri
    ): atom$Disposable {
    // Use the filePath as the event name.
    var emitterDisposable = this._fileChangeEmitter.on(filePath, callback);
    this._incrementFileListenerCount(filePath);
    return new Disposable(() => {
      emitterDisposable.dispose();
      this._decrementFileListenerCount(filePath);
    });
  }

  _incrementFileListenerCount(filePath: NuclideUri): void {
    var currentCount = this._fileToListenersCount.get(filePath) || 0;
    this._fileToListenersCount.set(filePath, currentCount + 1);
  }

  _decrementFileListenerCount(filePath: NuclideUri): void {
    var currentCount = this._fileToListenersCount.get(filePath) || 0;
    if (currentCount > 0) {
      this._fileToListenersCount.set(filePath, currentCount - 1);
    }
  }

  /**
   * Call the callback when project-scope messages change.
   * @param callback The function to message when the project-scope messages
   *   change. The array of messages is meant to completely replace any previous
   *   project-scope messages.
   */
  onProjectMessagesDidUpdate(callback: (messages: Array<DiagnosticMessage>) => mixed): atom$Disposable {
    var emitterDisposable = this._nonFileChangeEmitter.on(PROJECT_MESSAGE_CHANGE_EVENT, callback);
    this._projectListenersCount += 1;
    return new Disposable(() => {
      emitterDisposable.dispose();
      this._projectListenersCount -= 1;
    });
  }

  /**
   * Call the callback when any messages change.
   * @param callback The function to message when any messages change. The array
   *   of messages is meant to completely replace any previous messages.
   */
  onAllMessagesDidUpdate(callback: (messages: Array<DiagnosticMessage>) => mixed): atom$Disposable {
    var emitterDisposable = this._nonFileChangeEmitter.on(ALL_CHANGE_EVENT, callback);
    this._allMessagesListenersCount += 1;
    return new Disposable(() => {
      emitterDisposable.dispose();
      this._allMessagesListenersCount -= 1;
    });
  }

  /**
   * Gets the current diagnostic messages for the file.
   * Prefer to get updates via ::onFileMessagesDidUpdate.
   */
  getFileMessages(filePath: NuclideUri): Array<DiagnosticMessage> {
    var allFileMessages = [];
    var relevantProviders = this._fileToProviders.get(filePath);
    if (relevantProviders) {
      for (var provider of relevantProviders.values()) {
        var messages = (this._providerToFileToMessages.get(provider)).get(filePath);
        allFileMessages = allFileMessages.concat(messages);
      }
    }
    return allFileMessages;
  }

  /**
   * Gets the current project-scope diagnostic messages.
   * Prefer to get updates via ::onProjectMessagesDidUpdate.
   */
  getProjectMessages(): Array<DiagnosticMessage> {
    var allProjectMessages = [];
    for (var messages of this._providerToProjectDiagnostics.values()) {
      allProjectMessages = allProjectMessages.concat(messages);
    }
    return allProjectMessages;
  }

  /**
   * Gets all current diagnostic messages.
   * Prefer to get updates via ::onAllMessagesDidUpdate.
   */
  getAllMessages(): Array<DiagnosticMessage> {
    var allMessages = [];
    // Get all file messages.
    for (var fileToMessages of this._providerToFileToMessages.values()) {
      for (var messages of fileToMessages.values()) {
        allMessages = allMessages.concat(messages);
      }
    }
    // Get all project messages.
    allMessages = allMessages.concat(this.getProjectMessages());
    return allMessages;
  }


  /**
   * Section: Event Emitting
   */

  _emitFileMessages(filePath: NuclideUri): void {
    if (this._fileToListenersCount.get(filePath)) {
      this._fileChangeEmitter.emit(filePath, {filePath, messages: this.getFileMessages(filePath)});
    }
  }

  _emitProjectMessages(): void {
    if (this._projectListenersCount) {
      this._nonFileChangeEmitter.emit(PROJECT_MESSAGE_CHANGE_EVENT, this.getProjectMessages());
    }
  }

  _emitAllMessages(): void {
    if (this._allMessagesListenersCount) {
      this._nonFileChangeEmitter.emit(ALL_CHANGE_EVENT, this.getAllMessages());
    }
  }
}

module.exports = DiagnosticStore;
