'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {DiagnosticsProviderBase} from 'nuclide-diagnostics-provider-base';

import {trackTiming} from 'nuclide-analytics';
import {promises} from 'nuclide-commons';
const {RequestSerializer} = promises;

export class ArcanistDiagnosticsProvider {
  _providerBase: DiagnosticsProviderBase;
  _requestSerializer: RequestSerializer;

  constructor() {
    const baseOptions = {
      enableForAllGrammars: true,
      shouldRunOnTheFly: false,
      onTextEditorEvent: this._runLint.bind(this),
      onNewUpdateSubscriber: this._receivedNewUpdateSubscriber.bind(this),
    };
    this._providerBase = new DiagnosticsProviderBase(baseOptions);
    this._requestSerializer = new RequestSerializer();
  }

  @trackTiming('nuclide-arcanist:lint')
  async _runLint(textEditor: TextEditor): Promise<void> {
    const filePath = textEditor.getPath();
    if (!filePath) {
      return;
    }
    const {Range} = require('atom');
    try {
      const result = await this._requestSerializer.run(
        require('nuclide-arcanist-client').findDiagnostics(textEditor.getPath())
      );
      if (result.status === 'outdated') {
        return;
      }
      const diagnostics = result.result;
      const blackListedLinters = new Set(atom.config.get('nuclide-arcanist.blacklistedLinters'));
      const filteredDiagnostics = diagnostics.filter(diagnostic => {
        return !blackListedLinters.has(diagnostic.code);
      });
      const fileDiagnostics = filteredDiagnostics.map(diagnostic => {
        var range = new Range(
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
      this._runLint(activeTextEditor);
    }
  }

  onMessageUpdate(callback: MessageUpdateCallback): atom$Disposable {
    return this._providerBase.onMessageUpdate(callback);
  }

  onMessageInvalidation(callback: MessageInvalidationCallback): atom$Disposable {
    return this._providerBase.onMessageInvalidation(callback);
  }
}
