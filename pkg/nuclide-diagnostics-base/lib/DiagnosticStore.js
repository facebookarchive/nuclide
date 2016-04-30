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
  DiagnosticMessage,
  DiagnosticProvider,
  DiagnosticProviderUpdate,
  FileDiagnosticMessage,
  ProjectDiagnosticMessage,
  FileMessageUpdate,
} from '..';

import type {NuclideUri} from '../../nuclide-remote-uri';

import {applyTextEdit} from '../../nuclide-textedit';
import {array} from '../../nuclide-commons';
import {MarkerTracker} from './MarkerTracker';
import invariant from 'assert';
import {Disposable, Emitter} from 'atom';

const PROJECT_MESSAGE_CHANGE_EVENT = 'messages-changed-for-project';
const ALL_CHANGE_EVENT = 'messages-changed';

class DiagnosticStore {
  // A map from each diagnostic provider to:
  // a map from each file it has messages for to the array of messages for that file.
  _providerToFileToMessages: Map<DiagnosticProvider, Map<NuclideUri, Array<FileDiagnosticMessage>>>;
  // A map from each file that has messages from any diagnostic provider
  // to the set of diagnostic providers that have messages for it.
  _fileToProviders: Map<NuclideUri, Set<DiagnosticProvider>>;

  // A map from each diagnostic provider to the array of project messages from it.
  _providerToProjectDiagnostics: Map<DiagnosticProvider, Array<ProjectDiagnosticMessage>>;

  // File paths are used as event names for the _fileChangeEmitter, so a second
  // emitter is used for other events to prevent event name collisions.
  _fileChangeEmitter: Emitter;
  _nonFileChangeEmitter: Emitter;
  // A map of NuclideUri to the number of listeners registered for changes to
  // messages for that file.
  _fileToListenersCount: Map<NuclideUri, number>;
  _projectListenersCount: number;
  _allMessagesListenersCount: number;

  _markerTracker: MarkerTracker;

  constructor() {
    this._providerToFileToMessages = new Map();
    this._fileToProviders = new Map();
    this._providerToProjectDiagnostics = new Map();

    this._fileChangeEmitter = new Emitter();
    this._nonFileChangeEmitter = new Emitter();
    this._fileToListenersCount = new Map();
    this._projectListenersCount = 0;
    this._allMessagesListenersCount = 0;

    this._markerTracker = new MarkerTracker();
  }

  dispose() {
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
    let fileToMessages = this._providerToFileToMessages.get(diagnosticProvider);
    if (!fileToMessages) {
      fileToMessages = new Map();
      this._providerToFileToMessages.set(diagnosticProvider, fileToMessages);
    }
    newFilePathsToMessages.forEach((newMessagesForPath, filePath) => {
      // Flow naively thinks that since we are in a closure, fileToMessages could have been
      // reassigned to something null by the time this executes.
      invariant(fileToMessages != null);

      const messagesToRemove = fileToMessages.get(filePath);
      if (messagesToRemove != null) {
        this._markerTracker.removeFileMessages(messagesToRemove);
      }
      this._markerTracker.addFileMessages(newMessagesForPath);

      // Update _providerToFileToMessages.
      fileToMessages.set(filePath, newMessagesForPath);
      // Update _fileToProviders.
      let providers = this._fileToProviders.get(filePath);
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
      const providers = this._fileToProviders.get(filePath);
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
    const filesToDiagnostics = this._providerToFileToMessages.get(diagnosticProvider);
    if (filesToDiagnostics) {
      const allFilePaths = filesToDiagnostics.keys();
      this._invalidateFileMessagesForProvider(diagnosticProvider, allFilePaths);
    }
    // Invalidate all project messages.
    this._invalidateProjectMessagesForProvider(diagnosticProvider);

    this._emitAllMessages();
  }

  _invalidateSingleMessage(message: FileDiagnosticMessage): void {
    this._markerTracker.removeFileMessages([message]);
    for (const fileToMessages of this._providerToFileToMessages.values()) {
      const fileMessages = fileToMessages.get(message.filePath);
      if (fileMessages != null) {
        array.remove(fileMessages, message);
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
  onFileMessagesDidUpdate(
      callback: (update: FileMessageUpdate) => mixed,
      filePath: NuclideUri
    ): IDisposable {
    // Use the filePath as the event name.
    const emitterDisposable = this._fileChangeEmitter.on(filePath, callback);
    this._incrementFileListenerCount(filePath);

    const fileMessages = this._getFileMessages(filePath);
    if (fileMessages.length) {
      callback({filePath, messages: fileMessages});
    }
    return new Disposable(() => {
      emitterDisposable.dispose();
      this._decrementFileListenerCount(filePath);
    });
  }

  _incrementFileListenerCount(filePath: NuclideUri): void {
    const currentCount = this._fileToListenersCount.get(filePath) || 0;
    this._fileToListenersCount.set(filePath, currentCount + 1);
  }

  _decrementFileListenerCount(filePath: NuclideUri): void {
    const currentCount = this._fileToListenersCount.get(filePath) || 0;
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
  onProjectMessagesDidUpdate(
    callback: (messages: Array<ProjectDiagnosticMessage>) => mixed
  ): IDisposable {
    const emitterDisposable = this._nonFileChangeEmitter.on(PROJECT_MESSAGE_CHANGE_EVENT, callback);
    this._projectListenersCount += 1;

    const projectMessages = this._getProjectMessages();
    if (projectMessages.length) {
      callback(projectMessages);
    }
    return new Disposable(() => {
      emitterDisposable.dispose();
      this._projectListenersCount -= 1;
    });
  }

  /**
   * Call the callback when any messages change.
   * In addition, the Store will immediately invoke the callback with data
   * currently in the Store, iff there is any.
   * @param callback The function to message when any messages change. The array
   *   of messages is meant to completely replace any previous messages.
   */
  onAllMessagesDidUpdate(callback: (messages: Array<DiagnosticMessage>) => mixed):
      IDisposable {
    const emitterDisposable = this._nonFileChangeEmitter.on(ALL_CHANGE_EVENT, callback);
    this._allMessagesListenersCount += 1;

    const allMessages = this._getAllMessages();
    if (allMessages.length) {
      callback(allMessages);
    }
    return new Disposable(() => {
      emitterDisposable.dispose();
      this._allMessagesListenersCount -= 1;
    });
  }

  /**
   * Gets the current diagnostic messages for the file.
   * Prefer to get updates via ::onFileMessagesDidUpdate.
   */
  _getFileMessages(filePath: NuclideUri): Array<FileDiagnosticMessage> {
    let allFileMessages = [];
    const relevantProviders = this._fileToProviders.get(filePath);
    if (relevantProviders) {
      for (const provider of relevantProviders) {
        const fileToMessages = this._providerToFileToMessages.get(provider);
        invariant(fileToMessages != null);
        const messages = fileToMessages.get(filePath);
        invariant(messages != null);
        allFileMessages = allFileMessages.concat(messages);
      }
    }
    return allFileMessages;
  }

  /**
   * Gets the current project-scope diagnostic messages.
   * Prefer to get updates via ::onProjectMessagesDidUpdate.
   */
  _getProjectMessages(): Array<ProjectDiagnosticMessage> {
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
  _getAllMessages(): Array<DiagnosticMessage> {
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

  applyFix(message: FileDiagnosticMessage): void {
    const succeeded = this._applySingleFix(message);
    if (!succeeded) {
      notifyFixFailed();
    }
  }

  applyFixesForFile(file: NuclideUri): void {
    for (const message of this._getFileMessages(file)) {
      if (message.fix != null) {
        const succeeded = this._applySingleFix(message);
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
  _applySingleFix(message: FileDiagnosticMessage): boolean {
    const fix = message.fix;
    invariant(fix != null);

    const actualRange = this._markerTracker.getCurrentRange(message);

    if (actualRange == null) {
      return false;
    }

    const fixWithActualRange = {
      ...fix,
      oldRange: actualRange,
    };
    const succeeded = applyTextEdit(message.filePath, fixWithActualRange);
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

  _emitFileMessages(filePath: NuclideUri): void {
    if (this._fileToListenersCount.get(filePath)) {
      this._fileChangeEmitter.emit(filePath, {filePath, messages: this._getFileMessages(filePath)});
    }
  }

  _emitProjectMessages(): void {
    if (this._projectListenersCount) {
      this._nonFileChangeEmitter.emit(PROJECT_MESSAGE_CHANGE_EVENT, this._getProjectMessages());
    }
  }

  _emitAllMessages(): void {
    if (this._allMessagesListenersCount) {
      this._nonFileChangeEmitter.emit(ALL_CHANGE_EVENT, this._getAllMessages());
    }
  }
}

function notifyFixFailed() {
  atom.notifications.addWarning(
    'Failed to apply fix. Try saving to get fresh results and then try again.',
  );
}

module.exports = DiagnosticStore;
