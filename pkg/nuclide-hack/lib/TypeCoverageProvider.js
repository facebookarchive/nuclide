'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';
import type {BusySignalProviderBase} from '../../nuclide-busy-signal';
import type {
  FileDiagnosticMessage,
  MessageUpdateCallback,
  MessageInvalidationCallback,
} from '../../nuclide-diagnostics-base';
import type {TypeCoverageRegion} from './TypedRegions';

import {getHackLanguageForUri} from './HackLanguage';
import {DiagnosticsProviderBase} from '../../nuclide-diagnostics-provider-base';
import {CompositeDisposable, Range} from 'atom';
import {trackTiming} from '../../nuclide-analytics';
import {promises} from '../../nuclide-commons';
import {existingEditorForUri, onWillDestroyTextBuffer} from '../../nuclide-atom-helpers';
import invariant from 'assert';
import {HACK_GRAMMARS_SET} from '../../nuclide-hack-common';
import {getLogger} from '../../nuclide-logging';

const logger = getLogger();
const {RequestSerializer} = promises;

// Provides Diagnostics for un-typed regions of Hack code.
export class TypeCoverageProvider {
  _providerBase: DiagnosticsProviderBase;
  _requestSerializer: RequestSerializer<Array<TypeCoverageRegion>>;
  _busySignalProvider: BusySignalProviderBase;
  _subscriptions: atom$CompositeDisposable;

  constructor(busySignalProvider: BusySignalProviderBase) {
    this._busySignalProvider = busySignalProvider;
    const shouldRunOnTheFly = false;
    const utilsOptions = {
      grammarScopes: HACK_GRAMMARS_SET,
      shouldRunOnTheFly,
      onTextEditorEvent: editor => this._runTypeCoverage(editor),
      onNewUpdateSubscriber: callback => this._receivedNewUpdateSubscriber(callback),
    };
    this._providerBase = new DiagnosticsProviderBase(utilsOptions);
    this._requestSerializer = new RequestSerializer();
    this._subscriptions = new CompositeDisposable();
    this._subscriptions.add(onWillDestroyTextBuffer(buffer => {
      const path: ?string = buffer.getPath();
      if (!path) {
        return;
      }
      this._providerBase.publishMessageInvalidation({scope: 'file', filePaths: [path]});
    }));

    this._checkExistingBuffers();
  }

  async _checkExistingBuffers(): Promise {
    const existingEditors = atom.project.getBuffers()
      .map(buffer => {
        const path = buffer.getPath();
        if (path == null || path === '') {
          return null;
        }
        return existingEditorForUri(buffer.getPath());
      })
      .filter(editor => editor != null && HACK_GRAMMARS_SET.has(editor.getGrammar().scopeName));
    for (const editor of existingEditors) {
      invariant(editor);
      /* eslint-disable babel/no-await-in-loop */
      await this._runTypeCoverage(editor);
      /* eslint-enable babel/no-await-in-loop */
    }
  }

  dispose(): void {
    this._subscriptions.dispose();
    this._providerBase.dispose();
  }

  _runTypeCoverage(textEditor: TextEditor): Promise<void> {
    return this._busySignalProvider.reportBusy(
      'Hack: Waiting for type coverage results',
      () => this._runTypeCoverageImpl(textEditor),
    ).catch(async e => { logger.error(e); });
  }

  @trackTiming('hack:run-type-coverage')
  async _runTypeCoverageImpl(textEditor: TextEditor): Promise<void> {
    const filePath = textEditor.getPath();
    if (filePath == null) {
      return;
    }

    const hackLanguage = await getHackLanguageForUri(textEditor.getPath());
    if (hackLanguage == null) {
      return;
    }

    const result = await this._requestSerializer.run(
      hackLanguage.getTypeCoverage(filePath)
    );
    if (result.status === 'outdated') {
      return;
    }

    const regions: Array<TypeCoverageRegion> = result.result;
    const diagnostics = regions.map(region => convertRegionToDiagnostic(filePath, region));
    const diagnosticsUpdate = {
      filePathToMessages: new Map([[filePath, diagnostics]]),
    };
    this._providerBase.publishMessageUpdate(diagnosticsUpdate);
  }

  _receivedNewUpdateSubscriber(): void {
    // Every time we get a new subscriber, we need to push results to them. This
    // logic is common to all providers and should be abstracted out (t7813069)
    //
    // Once we provide all diagnostics, instead of just the current file, we can
    // probably remove the activeTextEditor parameter.
    const activeTextEditor = atom.workspace.getActiveTextEditor();
    if (activeTextEditor) {
      if (HACK_GRAMMARS_SET.has(activeTextEditor.getGrammar().scopeName)) {
        this._runTypeCoverage(activeTextEditor);
      }
    }
  }

  onMessageUpdate(callback: MessageUpdateCallback): IDisposable {
    return this._providerBase.onMessageUpdate(callback);
  }

  onMessageInvalidation(callback: MessageInvalidationCallback): IDisposable {
    return this._providerBase.onMessageInvalidation(callback);
  }
}

const ERROR_MESSAGE = 'Un-type checked code. Consider adding type annotations.';
const WARNING_MESSAGE = 'Partially type checked code. Consider adding type annotations.';

function convertRegionToDiagnostic(filePath: NuclideUri, region: TypeCoverageRegion)
    : FileDiagnosticMessage {
  const isWarning = region.type === 'partial';
  const line = region.line - 1;
  return {
    scope: 'file',
    providerName: 'Hack',
    type: isWarning ? 'Warning' : 'Error',
    text: isWarning ? WARNING_MESSAGE : ERROR_MESSAGE,
    filePath: filePath,
    range: new Range([line, region.start - 1], [line, region.end]),
  };
}
