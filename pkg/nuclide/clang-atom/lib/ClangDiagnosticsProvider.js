'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BusySignalProviderBase} from '../../busy-signal-provider-base';
import type {NuclideUri} from '../../remote-uri';
import type {ClangCompileResult} from '../../clang';
import type {
  FileDiagnosticMessage,
  MessageUpdateCallback,
  MessageInvalidationCallback,
} from '../../diagnostics/base';

import {GRAMMAR_SET} from './constants';
import {DiagnosticsProviderBase} from '../../diagnostics/provider-base';
import {trackTiming} from '../../analytics';
import {array} from '../../commons';
import {getLogger} from '../../logging';
import {getDiagnostics} from './libclang';
import {Range} from 'atom';

class ClangDiagnosticsProvider {
  _providerBase: DiagnosticsProviderBase;
  _busySignalProvider: BusySignalProviderBase;

  // Clang can often point out errors in other files (e.g. included header files).
  // We need to keep track of all the error locations for each file so they can be cleared
  // when diagnostics are updated.
  _diagnosticPaths: Map<NuclideUri, Array<NuclideUri>>;

  constructor(busySignalProvider: BusySignalProviderBase) {
    const options = {
      grammarScopes: GRAMMAR_SET,
      onTextEditorEvent: this.runDiagnostics.bind(this),
      onNewUpdateSubscriber: this._receivedNewUpdateSubscriber.bind(this),
    };
    this._providerBase = new DiagnosticsProviderBase(options);
    this._busySignalProvider = busySignalProvider;
    this._diagnosticPaths = new Map();
  }

  runDiagnostics(editor: atom$TextEditor): void {
    this._busySignalProvider.reportBusy(
      `Clang: compiling \`${editor.getTitle()}\``,
      () => this._runDiagnosticsImpl(editor),
    );
  }

  @trackTiming('nuclide-clang:fetch-diagnostics')
  async _runDiagnosticsImpl(textEditor: atom$TextEditor): Promise<void> {
    const filePath = textEditor.getPath();
    if (!filePath) {
      return;
    }

    try {
      const diagnostics = await getDiagnostics(textEditor);
      if (diagnostics == null) {
        return;
      }
      const filePathToMessages = this._processDiagnostics(diagnostics, textEditor);
      this.invalidatePath(filePath);
      this._providerBase.publishMessageUpdate({filePathToMessages});
      this._diagnosticPaths.set(filePath, array.from(filePathToMessages.keys()));
    } catch (error) {
      getLogger().error(error);
    }
  }

  _processDiagnostics(
    data: ClangCompileResult,
    textEditor: atom$TextEditor,
  ): Map<NuclideUri, Array<FileDiagnosticMessage>> {
    const filePathToMessages = new Map();
    data.diagnostics.forEach(diagnostic => {
      // We show only warnings, errors and fatals (2, 3 and 4, respectively).
      if (diagnostic.severity < 2) {
        return;
      }

      const {file: filePath} = diagnostic.location;
      // TODO(t7637036): remove when clang errors are less spammy
      if (filePath !== textEditor.getPath()) {
        return;
      }

      // Clang adds file-wide errors on line -1, so we put it on line 0 instead.
      // The usual file-wide error is 'too many errors emitted, stopping now'.
      const line = Math.max(0, diagnostic.location.line);
      const col = 0;
      let range;
      if (diagnostic.ranges) {
        // Use the first range from the diagnostic as the range for Linter.
        const clangRange = diagnostic.ranges[0];
        range = new Range(
          [clangRange.start.line, clangRange.start.column],
          [clangRange.end.line, clangRange.end.column]
        );
      } else {
        range = new Range(
          [line, col],
          [line, textEditor.getBuffer().lineLengthForRow(line)]
        );
      }

      let messages = filePathToMessages.get(filePath);
      if (messages == null) {
        messages = [];
        filePathToMessages.set(filePath, messages);
      }
      messages.push({
        scope: 'file',
        providerName: 'Clang',
        type: diagnostic.severity === 2 ? 'Warning' : 'Error',
        filePath,
        text: diagnostic.spelling,
        range,
      });
    });

    return filePathToMessages;
  }

  invalidatePath(path: NuclideUri): void {
    const filePaths = this._diagnosticPaths.get(path);
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

  onMessageUpdate(callback: MessageUpdateCallback): atom$Disposable {
    return this._providerBase.onMessageUpdate(callback);
  }

  onMessageInvalidation(callback: MessageInvalidationCallback): atom$Disposable {
    return this._providerBase.onMessageInvalidation(callback);
  }

  invalidateProjectPath(projectPath: NuclideUri): void {
    const filePaths = new Set();
    for (const [path, errorPaths] of this._diagnosticPaths) {
      if (path.startsWith(projectPath)) {
        errorPaths.forEach(x => filePaths.add(x));
      }
    }
    this._providerBase.publishMessageInvalidation({
      scope: 'file',
      filePaths: array.from(filePaths),
    });
  }

  dispose() {
    this._providerBase.dispose();
  }

}

module.exports = ClangDiagnosticsProvider;
