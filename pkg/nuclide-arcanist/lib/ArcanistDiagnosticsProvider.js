'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BusySignalProviderBase} from '../../nuclide-busy-signal-provider-base';

import type {
  MessageUpdateCallback,
  MessageInvalidationCallback,
} from '../../nuclide-diagnostics-base';

import {CompositeDisposable, Range} from 'atom';
import {DiagnosticsProviderBase} from '../../nuclide-diagnostics-provider-base';

import featureConfig from '../../nuclide-feature-config';
import {trackTiming} from '../../nuclide-analytics';
import {onWillDestroyTextBuffer} from '../../nuclide-atom-helpers';
import {promises} from '../../nuclide-commons';
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
    this._subscriptions.add(onWillDestroyTextBuffer(buffer => {
      const path: ?string = buffer.getPath();
      if (!path) {
        return;
      }
      this._providerBase.publishMessageInvalidation({scope: 'file', filePaths: [path]});
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
    try {
      const blacklistedLinters: Array<string> =
        (featureConfig.get('nuclide-arcanist.blacklistedLinters'): any);
      const result = await this._requestSerializer.run(
        require('../../nuclide-arcanist-client').findDiagnostics([filePath], blacklistedLinters)
      );
      if (result.status === 'outdated') {
        return;
      }
      const diagnostics = result.result;
      const fileDiagnostics = diagnostics.map(diagnostic => {
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
        const maybeProperties = {};
        if (diagnostic.original != null &&
          diagnostic.replacement != null &&
          // Sometimes linters set original and replacement to the same value. Obviously that won't
          // fix anything.
          diagnostic.original !== diagnostic.replacement
        ) {
          maybeProperties.fix = {
            oldRange: this._getRangeForFix(diagnostic.row, diagnostic.col, diagnostic.original),
            newText: diagnostic.replacement,
            oldText: diagnostic.original,
          };
        }
        return {
          scope: 'file',
          providerName: 'Arc' + (diagnostic.code ? `: ${diagnostic.code}` : ''),
          type: diagnostic.type,
          text,
          filePath: diagnostic.filePath,
          range,
          ...maybeProperties,
        };
      });
      const diagnosticsUpdate = {
        filePathToMessages: new Map([[filePath, fileDiagnostics]]),
      };
      this._providerBase.publishMessageUpdate(diagnosticsUpdate);
    } catch (error) {
      const logger = require('../../nuclide-logging').getLogger();
      logger.error(error);
      return;
    }
  }

  _getRangeForFix(startRow: number, startCol: number, originalText: string): atom$Range {
    let newlineCount = 0;
    for (const char of originalText) {
      if (char === '\n') {
        newlineCount++;
      }
    }
    const endRow = startRow + newlineCount;
    const lastNewlineIndex = originalText.lastIndexOf('\n');
    let endCol;
    if (lastNewlineIndex === -1) {
      endCol = startCol + originalText.length;
    } else {
      endCol = originalText.length - lastNewlineIndex - 1;
    }

    return new Range([startRow, startCol], [endRow, endCol]);
  }

  _receivedNewUpdateSubscriber(): void {
    const activeTextEditor = atom.workspace.getActiveTextEditor();
    if (activeTextEditor) {
      this._runLintWithBusyMessage(activeTextEditor);
    }
  }

  onMessageUpdate(callback: MessageUpdateCallback): IDisposable {
    return this._providerBase.onMessageUpdate(callback);
  }

  onMessageInvalidation(callback: MessageInvalidationCallback): IDisposable {
    return this._providerBase.onMessageInvalidation(callback);
  }
}
