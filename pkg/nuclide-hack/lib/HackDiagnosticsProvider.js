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
import type {HackLanguage} from './HackLanguage';
import type {
  HackDiagnostic,
  SingleHackMessage,
} from '../../nuclide-hack-base/lib/HackService';
import type {
  FileDiagnosticMessage,
  MessageUpdateCallback,
  MessageInvalidationCallback,
  DiagnosticProviderUpdate,
} from '../../nuclide-diagnostics-base';

import {trackTiming} from '../../nuclide-analytics';
import {getHackLanguageForUri, getCachedHackLanguageForUri} from './HackLanguage';
import {RequestSerializer} from '../../commons-node/promise';
import {DiagnosticsProviderBase} from '../../nuclide-diagnostics-provider-base';
import {Range} from 'atom';
import invariant from 'assert';

import {HACK_GRAMMARS_SET} from '../../nuclide-hack-common';

/**
 * Currently, a diagnostic from Hack is an object with a "message" property.
 * Each item in the "message" array is an object with the following fields:
 *     - path (string) File that contains the error.
 *     - descr (string) Description of the error.
 *     - line (number) Start line.
 *     - endline (number) End line.
 *     - start (number) Start column.
 *     - end (number) End column.
 *     - code (number) Presumably an error code.
 * The message array may have more than one item. For example, if there is a
 * type incompatibility error, the first item in the message array blames the
 * usage of the wrong type and the second blames the declaration of the type
 * with which the usage disagrees. Note that these could occur in different
 * files.
 */
function extractRange(message: SingleHackMessage): atom$Range {
  // It's unclear why the 1-based to 0-based indexing works the way that it
  // does, but this has the desired effect in the UI, in practice.
  return new Range(
    [message.line - 1, message.start - 1],
    [message.line - 1, message.end]
  );
}

// A trace object is very similar to an error object.
function hackMessageToTrace(traceError: SingleHackMessage): Object {
  return {
    type: 'Trace',
    text: traceError.descr,
    filePath: traceError.path,
    range: extractRange(traceError),
  };
}

function hackMessageToDiagnosticMessage(
  hackDiagnostic: {message: HackDiagnostic;},
): FileDiagnosticMessage {
  const {message: hackMessages} = hackDiagnostic;

  const causeMessage = hackMessages[0];
  invariant(causeMessage.path != null);
  const diagnosticMessage: FileDiagnosticMessage = {
    scope: 'file',
    providerName: `Hack: ${hackMessages[0].code}`,
    type: 'Error',
    text: causeMessage.descr,
    filePath: causeMessage.path,
    range: extractRange(causeMessage),
  };

  // When the message is an array with multiple elements, the second element
  // onwards comprise the trace for the error.
  if (hackMessages.length > 1) {
    diagnosticMessage.trace = hackMessages.slice(1).map(hackMessageToTrace);
  }

  return diagnosticMessage;
}

class HackDiagnosticsProvider {
  _busySignalProvider: BusySignalProviderBase;
  _providerBase: DiagnosticsProviderBase;
  _requestSerializer: RequestSerializer<any>;

  /**
   * Maps hack root to the set of file paths under that root for which we have
   * ever reported diagnostics.
   */
  _hackLanguageToFilePaths: Map<HackLanguage, Set<NuclideUri>>;

  constructor(
    shouldRunOnTheFly: boolean,
    busySignalProvider: BusySignalProviderBase,
    ProviderBase: typeof DiagnosticsProviderBase = DiagnosticsProviderBase,
  ) {
    this._busySignalProvider = busySignalProvider;
    const utilsOptions = {
      grammarScopes: HACK_GRAMMARS_SET,
      shouldRunOnTheFly,
      onTextEditorEvent: editor => this._runDiagnostics(editor),
      onNewUpdateSubscriber: callback => this._receivedNewUpdateSubscriber(callback),
    };
    this._providerBase = new ProviderBase(utilsOptions);
    this._requestSerializer = new RequestSerializer();
    this._hackLanguageToFilePaths = new Map();
  }

  _runDiagnostics(textEditor: atom$TextEditor): void {
    this._busySignalProvider.reportBusy(
      'Hack: Waiting for diagnostics',
      () => this._runDiagnosticsImpl(textEditor),
    );
  }

  @trackTiming('hack.run-diagnostics')
  async _runDiagnosticsImpl(textEditor: atom$TextEditor): Promise<void> {
    const filePath = textEditor.getPath();
    if (!filePath) {
      return;
    }

    // `hh_client` doesn't currently support `onTheFly` diagnosis.
    // So, currently, it would only work if there is no `hh_client` or `.hhconfig` where
    // the `HackWorker` model will diagnose with the updated editor contents.
    const diagnosisResult = await this._requestSerializer.run(findDiagnostics(textEditor));
    if (diagnosisResult.status === 'outdated' || diagnosisResult.result == null) {
      return;
    }

    const diagnostics = diagnosisResult.result;
    const hackLanguage = await getHackLanguageForUri(textEditor.getPath());
    if (!hackLanguage) {
      return;
    }

    this._providerBase.publishMessageInvalidation({scope: 'file', filePaths: [filePath]});
    this._invalidatePathsForHackLanguage(hackLanguage);

    const pathsForHackLanguage = new Set();
    this._hackLanguageToFilePaths.set(hackLanguage, pathsForHackLanguage);
    for (const diagnostic of diagnostics) {
      /*
       * Each message consists of several different components, each with its
       * own text and path.
       */
      for (const diagnosticMessage of diagnostic.message) {
        pathsForHackLanguage.add(diagnosticMessage.path);
      }
    }

    this._providerBase.publishMessageUpdate(this._processDiagnostics(diagnostics));
  }

  _processDiagnostics(diagnostics: Array<{message: HackDiagnostic;}>): DiagnosticProviderUpdate {
    // Convert array messages to Error Objects with Traces.
    const fileDiagnostics = diagnostics.map(hackMessageToDiagnosticMessage);

    const filePathToMessages = new Map();
    for (const diagnostic of fileDiagnostics) {
      const path = diagnostic.filePath;
      let diagnosticArray = filePathToMessages.get(path);
      if (!diagnosticArray) {
        diagnosticArray = [];
        filePathToMessages.set(path, diagnosticArray);
      }
      diagnosticArray.push(diagnostic);
    }

    return {filePathToMessages};
  }

  _getPathsToInvalidate(hackLanguage: HackLanguage): Array<NuclideUri> {
    if (!hackLanguage.isHackAvailable()) {
      return [];
    }
    const filePaths = this._hackLanguageToFilePaths.get(hackLanguage);
    if (!filePaths) {
      return [];
    }
    return Array.from(filePaths);
  }

  _receivedNewUpdateSubscriber(callback: MessageUpdateCallback): void {
    // Every time we get a new subscriber, we need to push results to them. This
    // logic is common to all providers and should be abstracted out (t7813069)
    //
    // Once we provide all diagnostics, instead of just the current file, we can
    // probably remove the activeTextEditor parameter.
    const activeTextEditor = atom.workspace.getActiveTextEditor();
    if (activeTextEditor) {
      if (HACK_GRAMMARS_SET.has(activeTextEditor.getGrammar().scopeName)) {
        this._runDiagnostics(activeTextEditor);
      }
    }
  }

  setRunOnTheFly(runOnTheFly: boolean): void {
    this._providerBase.setRunOnTheFly(runOnTheFly);
  }

  onMessageUpdate(callback: MessageUpdateCallback): IDisposable {
    return this._providerBase.onMessageUpdate(callback);
  }

  onMessageInvalidation(callback: MessageInvalidationCallback): IDisposable {
    return this._providerBase.onMessageInvalidation(callback);
  }

  invalidateProjectPath(projectPath: NuclideUri): void {
    const hackLanguage = getCachedHackLanguageForUri(projectPath);
    if (!hackLanguage) {
      return;
    }
    this._invalidatePathsForHackLanguage(hackLanguage);
  }

  _invalidatePathsForHackLanguage(hackLanguage: HackLanguage): void {
    const pathsToInvalidate = this._getPathsToInvalidate(hackLanguage);
    this._providerBase.publishMessageInvalidation(
      {scope: 'file', filePaths: pathsToInvalidate},
    );
    this._hackLanguageToFilePaths.delete(hackLanguage);
  }

  dispose() {
    this._providerBase.dispose();
  }
}

async function findDiagnostics(
  editor: atom$TextEditor,
): Promise<Array<{message: HackDiagnostic;}>> {
  const filePath = editor.getPath();
  const hackLanguage = await getHackLanguageForUri(filePath);
  if (!hackLanguage || !filePath) {
    return [];
  }

  invariant(filePath);
  const contents = editor.getText();

  return await hackLanguage.getDiagnostics(filePath, contents);
}

module.exports = HackDiagnosticsProvider;
