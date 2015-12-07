'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BusySignalProviderBase} from 'nuclide-busy-signal-provider-base';

import type {
  MessageUpdateCallback,
  MessageInvalidationCallback,
} from 'nuclide-diagnostics-base';

import {CompositeDisposable} from 'atom';
import {DiagnosticsProviderBase} from 'nuclide-diagnostics-provider-base';

import featureConfig from 'nuclide-feature-config';
import {trackTiming} from 'nuclide-analytics';
import {isTextEditor} from 'nuclide-atom-helpers';
import {promises} from 'nuclide-commons';
import invariant from 'assert';

const {RequestSerializer} = promises;

export class ArcanistDiagnosticsProvider {
  _providerBase: DiagnosticsProviderBase;
  _requestSerializer: RequestSerializer;
  _subscriptions: atom$CompositeDisposable;
  _busySignalProvider: BusySignalProviderBase;

  constructor(busySignalProvider: BusySignalProviderBase) {
    this._busySignalProvider = busySignalProvider;
    this._subscriptions = new CompositeDisposable();
    const baseOptions = {
      enableForAllGrammars: true,
      shouldRunOnTheFly: false,
      onTextEditorEvent: this._runLintWithBusyMessage.bind(this),
      onNewUpdateSubscriber: this._receivedNewUpdateSubscriber.bind(this),
    };
    this._providerBase = new DiagnosticsProviderBase(baseOptions);
    this._requestSerializer = new RequestSerializer();
    this._subscriptions.add(atom.workspace.onWillDestroyPaneItem(({item}) => {
      if (isTextEditor(item)) {
        invariant(typeof item.getPath === 'function');
        const path: ?string = item.getPath();
        if (!path) {
          return;
        }
        const openBufferCount = this._getOpenBufferCount(path);
        invariant(
          openBufferCount !== 0,
          'The file that is about to be closed should still be open.'
        );
        if (openBufferCount === 1) {
          this._providerBase.publishMessageInvalidation({scope: 'file', filePaths: [path]});
        }
      }
    }));
  }

  dispose(): void {
    this._subscriptions.dispose();
  }

  /** The returned Promise will resolve when results have been published. */
  _runLintWithBusyMessage(textEditor: TextEditor): Promise<void> {
    const path = textEditor.getPath();
    if (path == null) {
      return Promise.resolve();
    }
    return this._busySignalProvider.reportBusy(
      `Waiting for arc lint results for \`${textEditor.getTitle()}\``,
      () => this._runLint(textEditor),
      { onlyForFile: path },
    );
  }

  /** Do not call this directly -- call _runLintWithBusyMessage */
  @trackTiming('nuclide-arcanist:lint')
  async _runLint(textEditor: TextEditor): Promise<void> {
    const filePath = textEditor.getPath();
    invariant(filePath);
    const {Range} = require('atom');
    try {
      const result = await this._requestSerializer.run(
        require('nuclide-arcanist-client').findDiagnostics([filePath])
      );
      if (result.status === 'outdated') {
        return;
      }
      const diagnostics = result.result;
      const blackListedLinters = new Set(featureConfig.get('nuclide-arcanist.blacklistedLinters'));
      const filteredDiagnostics = diagnostics.filter(diagnostic => {
        return !blackListedLinters.has(diagnostic.code);
      });
      const fileDiagnostics = filteredDiagnostics.map(diagnostic => {
        const range = new Range(
          [diagnostic.row, diagnostic.col],
          [diagnostic.row, textEditor.getBuffer().lineLengthForRow(diagnostic.row)]
        );
        let text;
        if (Array.isArray(diagnostic.text)) {
          // Sometimes `arc lint` returns an array of strings for the text, rather than just a
          // string :(.
          text = diagnostic.text.join(' ');
        } else {
          text = diagnostic.text;
        }
        return {
          scope: 'file',
          providerName: 'Arc' + (diagnostic.code ? `: ${diagnostic.code}` : ''),
          type: diagnostic.type,
          text,
          filePath: diagnostic.filePath,
          range,
        };
      });
      const diagnosticsUpdate = {
        filePathToMessages: new Map([[filePath, fileDiagnostics]]),
      };
      this._providerBase.publishMessageUpdate(diagnosticsUpdate);
    } catch (error) {
      const logger = require('nuclide-logging').getLogger();
      logger.error(error);
      return;
    }
  }

  _receivedNewUpdateSubscriber(): void {
    const activeTextEditor = atom.workspace.getActiveTextEditor();
    if (activeTextEditor) {
      this._runLintWithBusyMessage(activeTextEditor);
    }
  }

  onMessageUpdate(callback: MessageUpdateCallback): atom$Disposable {
    return this._providerBase.onMessageUpdate(callback);
  }

  onMessageInvalidation(callback: MessageInvalidationCallback): atom$Disposable {
    return this._providerBase.onMessageInvalidation(callback);
  }

  _getOpenBufferCount(path: string): number {
    return atom.workspace.getTextEditors()
      .filter(editor => editor.getPath() === path)
      .length;
  }
}
