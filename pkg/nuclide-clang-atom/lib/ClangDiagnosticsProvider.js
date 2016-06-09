'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BusySignalProviderBase} from '../../nuclide-busy-signal';
import type {NuclideUri} from '../../nuclide-remote-uri';
import type {
  ClangCompileResult,
  ClangSourceRange,
  ClangLocation,
} from '../../nuclide-clang/lib/rpc-types';
import type {
  FileDiagnosticMessage,
  MessageUpdateCallback,
  MessageInvalidationCallback,
} from '../../nuclide-diagnostics-base';

import invariant from 'assert';
import {GRAMMAR_SET} from './constants';
import {DiagnosticsProviderBase} from '../../nuclide-diagnostics-provider-base';
import {track, trackTiming} from '../../nuclide-analytics';
import featureConfig from '../../nuclide-feature-config';
import {getLogger} from '../../nuclide-logging';
import {getDiagnostics} from './libclang';
import {CompositeDisposable, Range} from 'atom';

const DEFAULT_FLAGS_WARNING =
  'Diagnostics are disabled due to lack of compilation flags. ' +
  'Build this file with Buck, or create a compile_commands.json file manually.';

function atomRangeFromSourceRange(clangRange: ClangSourceRange): atom$Range {
  return new Range(
    [clangRange.start.line, clangRange.start.column],
    [clangRange.end.line, clangRange.end.column]
  );
}

function atomRangeFromLocation(location: ClangLocation): atom$Range {
  const line = Math.max(0, location.line);
  return new Range([line, 0], [line + 1, 0]);
}

class ClangDiagnosticsProvider {
  _providerBase: DiagnosticsProviderBase;
  _busySignalProvider: BusySignalProviderBase;

  // Keep track of the diagnostics created by each text buffer.
  // Diagnostics will be removed once the file is closed.
  _bufferDiagnostics: WeakMap<atom$TextBuffer, Array<NuclideUri>>;
  _hasSubscription: WeakMap<atom$TextBuffer, boolean>;
  _subscriptions: atom$CompositeDisposable;

  // When we open a file for the first time, make sure we pass 'clean' to getDiagnostics
  // to reset any server state for the file.
  // This is so the user can easily refresh the Clang + Buck state by reloading Atom.
  // Note that we do not use the TextBuffer here, since a close/reopen is acceptable.
  _openedFiles: Set<string>;

  constructor(busySignalProvider: BusySignalProviderBase) {
    const options = {
      grammarScopes: GRAMMAR_SET,
      onTextEditorEvent: this.runDiagnostics.bind(this),
      onNewUpdateSubscriber: this._receivedNewUpdateSubscriber.bind(this),
    };
    this._providerBase = new DiagnosticsProviderBase(options);
    this._busySignalProvider = busySignalProvider;

    this._bufferDiagnostics = new WeakMap();
    this._hasSubscription = new WeakMap();
    this._subscriptions = new CompositeDisposable();
    this._openedFiles = new Set();
  }

  runDiagnostics(editor: atom$TextEditor): void {
    this._busySignalProvider.reportBusy(
      `Clang: compiling \`${editor.getTitle()}\``,
      () => this._runDiagnosticsImpl(editor),
    );
  }

  @trackTiming('nuclide-clang-atom.fetch-diagnostics')
  async _runDiagnosticsImpl(textEditor: atom$TextEditor): Promise<void> {
    const filePath = textEditor.getPath();
    if (!filePath) {
      return;
    }

    const buffer = textEditor.getBuffer();
    if (!this._hasSubscription.get(buffer)) {
      const disposable = buffer.onDidDestroy(() => {
        this.invalidateBuffer(buffer);
        this._hasSubscription.delete(buffer);
        this._subscriptions.remove(disposable);
        disposable.dispose();
      });
      this._hasSubscription.set(buffer, true);
      this._subscriptions.add(disposable);
    }

    try {
      const diagnostics = await getDiagnostics(textEditor, !this._openedFiles.has(filePath));
      this._openedFiles.add(filePath);
      // It's important to make sure that the buffer hasn't already been destroyed.
      if (diagnostics == null || !this._hasSubscription.get(buffer)) {
        return;
      }
      const accurateFlags = diagnostics.accurateFlags;
      invariant(accurateFlags != null);
      track('nuclide-clang-atom.fetch-diagnostics', {
        filePath,
        count: diagnostics.diagnostics.length.toString(),
        accurateFlags: accurateFlags.toString(),
      });
      const filePathToMessages = this._processDiagnostics(diagnostics, textEditor);
      this.invalidateBuffer(buffer);
      this._providerBase.publishMessageUpdate({filePathToMessages});
      this._bufferDiagnostics.set(buffer, Array.from(filePathToMessages.keys()));
    } catch (error) {
      getLogger().error(error);
    }
  }

  _processDiagnostics(
    data: ClangCompileResult,
    textEditor: atom$TextEditor,
  ): Map<NuclideUri, Array<FileDiagnosticMessage>> {
    const editorPath = textEditor.getPath();
    invariant(editorPath);
    const filePathToMessages = new Map();
    if (data.accurateFlags || featureConfig.get('nuclide-clang-atom.defaultDiagnostics')) {
      data.diagnostics.forEach(diagnostic => {
        // We show only warnings, errors and fatals (2, 3 and 4, respectively).
        if (diagnostic.severity < 2) {
          return;
        }

        // Clang adds file-wide errors on line -1, so we put it on line 0 instead.
        // The usual file-wide error is 'too many errors emitted, stopping now'.
        let range;
        if (diagnostic.ranges) {
          // Use the first range from the diagnostic as the range for Linter.
          range = atomRangeFromSourceRange(diagnostic.ranges[0]);
        } else {
          range = atomRangeFromLocation(diagnostic.location);
        }

        const filePath = diagnostic.location.file || editorPath;
        let messages = filePathToMessages.get(filePath);
        if (messages == null) {
          messages = [];
          filePathToMessages.set(filePath, messages);
        }

        let trace;
        if (diagnostic.children != null) {
          trace = diagnostic.children.map(child => {
            return {
              type: 'Trace',
              text: child.spelling,
              filePath: child.location.file,
              range: atomRangeFromLocation(child.location),
            };
          });
        }

        let fix;
        if (diagnostic.fixits != null) {
          // TODO: support multiple fixits (if it's ever used at all)
          const fixit = diagnostic.fixits[0];
          if (fixit != null) {
            fix = {
              oldRange: atomRangeFromSourceRange(fixit.range),
              newText: fixit.value,
            };
          }
        }

        messages.push({
          scope: 'file',
          providerName: 'Clang',
          type: diagnostic.severity === 2 ? 'Warning' : 'Error',
          filePath,
          text: diagnostic.spelling,
          range,
          trace,
          fix,
        });
      });
    } else {
      filePathToMessages.set(editorPath, [
        {
          scope: 'file',
          providerName: 'Clang',
          type: 'Warning',
          filePath: editorPath,
          text: DEFAULT_FLAGS_WARNING,
          range: new Range([0, 0], [1, 0]),
        },
      ]);
    }

    return filePathToMessages;
  }

  invalidateBuffer(buffer: atom$TextBuffer): void {
    const filePaths = this._bufferDiagnostics.get(buffer);
    if (filePaths != null) {
      this._providerBase.publishMessageInvalidation({scope: 'file', filePaths});
    }
  }

  _receivedNewUpdateSubscriber(callback: MessageUpdateCallback): void {
    const activeTextEditor = atom.workspace.getActiveTextEditor();
    if (activeTextEditor && GRAMMAR_SET.has(activeTextEditor.getGrammar().scopeName)) {
      this.runDiagnostics(activeTextEditor);
    }
  }

  onMessageUpdate(callback: MessageUpdateCallback): IDisposable {
    return this._providerBase.onMessageUpdate(callback);
  }

  onMessageInvalidation(callback: MessageInvalidationCallback): IDisposable {
    return this._providerBase.onMessageInvalidation(callback);
  }

  dispose() {
    this._providerBase.dispose();
    this._subscriptions.dispose();
  }

}

module.exports = ClangDiagnosticsProvider;
