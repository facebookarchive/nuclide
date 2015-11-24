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

import {trackTiming} from 'nuclide-analytics';

const {getServiceByNuclideUri} = require('nuclide-client');
const {promises, array} = require('nuclide-commons');
const {RequestSerializer} = promises;
const {DiagnosticsProviderBase} = require('nuclide-diagnostics-provider-base');
const {Range} = require('atom');
const invariant = require('assert');

const {JS_GRAMMARS} = require('./constants.js');

/* TODO remove these duplicate definitions once we figure out importing types
 * through symlinks. */
export type Diagnostics = {
  flowRoot: NuclideUri,
  messages: Array<FlowDiagnosticItem>
};
type FlowError = {
  level: string,
  descr: string,
  path: string,
  line: number,
  start: number,
  endline: number,
  end: number,
}

type FlowDiagnosticItem = Array<FlowError>;

/**
 * Currently, a diagnostic from Flow is an object with a "message" property.
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
function extractRange(message) {
  // It's unclear why the 1-based to 0-based indexing works the way that it
  // does, but this has the desired effect in the UI, in practice.
  return new Range(
    [message['line'] - 1, message['start'] - 1],
    [message['endline'] - 1, message['end']]
  );
}

// A trace object is very similar to an error object.
function flowMessageToTrace(message) {
  return {
    type: 'Trace',
    text: message['descr'],
    filePath: message['path'],
    range: extractRange(message),
  };
}

function flowMessageToDiagnosticMessage(flowMessages) {
  const flowMessage = flowMessages[0];

  const diagnosticMessage: FileDiagnosticMessage = {
    scope: 'file',
    providerName: 'Flow',
    type: flowMessage['level'] === 'error' ? 'Error' : 'Warning',
    text: flowMessage['descr'],
    filePath: flowMessage['path'],
    range: extractRange(flowMessage),
  };

  // When the message is an array with multiple elements, the second element
  // onwards comprise the trace for the error.
  if (flowMessages.length > 1) {
    diagnosticMessage.trace = flowMessages.slice(1).map(flowMessageToTrace);
  }

  return diagnosticMessage;
}

class FlowDiagnosticsProvider {
  _providerBase: DiagnosticsProviderBase;
  _busySignalProvider: BusySignalProviderBase;
  _requestSerializer: RequestSerializer;

  /** Maps flow root to the set of file paths under that root for which we have
    * ever reported diagnostics. */
  _flowRootToFilePaths: Map<NuclideUri, Set<NuclideUri>>;

  constructor(
    shouldRunOnTheFly: boolean,
    busySignalProvider: BusySignalProviderBase,
    ProviderBase?: typeof DiagnosticsProviderBase = DiagnosticsProviderBase,
  ) {
    this._busySignalProvider = busySignalProvider;
    const utilsOptions = {
      grammarScopes: new Set(JS_GRAMMARS),
      shouldRunOnTheFly,
      onTextEditorEvent: editor => this._runDiagnostics(editor),
      onNewUpdateSubscriber: callback => this._receivedNewUpdateSubscriber(callback),
    };
    this._providerBase = new ProviderBase(utilsOptions);
    this._requestSerializer = new RequestSerializer();
    this._flowRootToFilePaths = new Map();
  }

  _runDiagnostics(textEditor: TextEditor): void {
    this._busySignalProvider.reportBusy(
      'Flow: Waiting for diagnostics',
      () => this._runDiagnosticsImpl(textEditor),
    );
  }

  @trackTiming('flow.run-diagnostics')
  async _runDiagnosticsImpl(textEditor: TextEditor): Promise<void> {
    const file = textEditor.getPath();
    if (!file) {
      return;
    }

    const currentContents = textEditor.isModified() ? textEditor.getText() : null;

    const flowService = getServiceByNuclideUri('FlowService', file);
    invariant(flowService);
    const result = await this._requestSerializer.run(
      flowService.flowFindDiagnostics(file, currentContents)
    );
    if (result.status === 'outdated') {
      return;
    }
    const diagnostics: ?Diagnostics = result.result;
    if (!diagnostics) {
      return;
    }
    const {flowRoot, messages} = diagnostics;

    const pathsToInvalidate = this._getPathsToInvalidate(flowRoot);
    /* TODO Consider optimizing for the common case of only a single flow root
     * by invalidating all instead of enumerating the files. */
    this._providerBase.publishMessageInvalidation({scope: 'file', filePaths: pathsToInvalidate});

    const pathsForRoot = new Set();
    this._flowRootToFilePaths.set(flowRoot, pathsForRoot);
    for (const message of messages) {
      /* Each message consists of several different components, each with its
       * own text and path. */
      for (const messageComponent of message) {
        pathsForRoot.add(messageComponent.path);
      }
    }

    this._providerBase.publishMessageUpdate(this._processDiagnostics(messages, file));
  }

  _getPathsToInvalidate(flowRoot: NuclideUri): Array<NuclideUri> {
    const filePaths = this._flowRootToFilePaths.get(flowRoot);
    if (!filePaths) {
      return [];
    }
    return array.from(filePaths);
  }

  _receivedNewUpdateSubscriber(callback: MessageUpdateCallback): void {
    // Every time we get a new subscriber, we need to push results to them. This
    // logic is common to all providers and should be abstracted out (t7813069)
    //
    // Once we provide all diagnostics, instead of just the current file, we can
    // probably remove the activeTextEditor parameter.
    const activeTextEditor = atom.workspace.getActiveTextEditor();
    if (activeTextEditor) {
      const matchesGrammar = JS_GRAMMARS.indexOf(activeTextEditor.getGrammar().scopeName) !== -1;
      if (matchesGrammar) {
        this._runDiagnostics(activeTextEditor);
      }
    }
  }

  setRunOnTheFly(runOnTheFly: boolean): void {
    this._providerBase.setRunOnTheFly(runOnTheFly);
  }

  onMessageUpdate(callback: MessageUpdateCallback): atom$Disposable {
    return this._providerBase.onMessageUpdate(callback);
  }

  onMessageInvalidation(callback: MessageInvalidationCallback): atom$Disposable {
    return this._providerBase.onMessageInvalidation(callback);
  }

  dispose() {
    this._providerBase.dispose();
  }

  _processDiagnostics(
    diagnostics: Array<FlowDiagnosticItem>,
    currentFile: string
  ): DiagnosticProviderUpdate {

    // convert array messages to Error Objects with Traces
    const fileDiagnostics = diagnostics.map(flowMessageToDiagnosticMessage);

    const filePathToMessages = new Map();

    // This invalidates the errors in the current file. If Flow, when running in this root, has
    // reported errors for this file, this invalidation is not necessary because the path will be
    // explicitly invalidated. However, if Flow has reported an error in this root from another root
    // (as sometimes happens when Flow roots contain symlinks to other Flow roots), and it also does
    // not report that same error when running in this Flow root, then we want the error to
    // disappear when this file is opened.
    //
    // This isn't a perfect solution, since it can still leave diagnostics up in other files, but
    // this is a corner case and doing this is still better than doing nothing.
    //
    // I think that whenever this happens, it's a bug in Flow. It seems strange for Flow to report
    // errors in one place when run from one root, and not report errors in that same place when run
    // from another root. But such is life.
    filePathToMessages.set(currentFile, []);

    for (const diagnostic of fileDiagnostics) {
      const path = diagnostic['filePath'];
      let diagnosticArray = filePathToMessages.get(path);
      if (!diagnosticArray) {
        diagnosticArray = [];
        filePathToMessages.set(path, diagnosticArray);
      }
      diagnosticArray.push(diagnostic);
    }

    return { filePathToMessages };
  }

  invalidateProjectPath(projectPath: string): void {
    const pathsToInvalidate = new Set();
    for (const flowRootEntry of this._flowRootToFilePaths) {
      const [flowRoot, filePaths] = flowRootEntry;
      if (!flowRoot.startsWith(projectPath)) {
        continue;
      }
      for (const filePath of filePaths) {
        pathsToInvalidate.add(filePath);
      }
      this._flowRootToFilePaths.delete(flowRoot);
    }
    this._providerBase.publishMessageInvalidation({
      scope: 'file',
      filePaths: array.from(pathsToInvalidate),
    });
  }
}

module.exports = FlowDiagnosticsProvider;
