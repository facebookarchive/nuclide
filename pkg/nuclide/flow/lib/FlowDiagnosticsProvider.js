'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {trackTiming} from 'nuclide-analytics';

var {getServiceByNuclideUri} = require('nuclide-client');
var {promises, array} = require('nuclide-commons');
var {RequestSerializer} = promises;
var {DiagnosticsProviderBase} = require('nuclide-diagnostics-provider-base');
var {Range} = require('atom');
var invariant = require('assert');

var {JS_GRAMMARS} = require('./constants.js');

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
  var flowMessage = flowMessages[0];

  var diagnosticMessage: FileDiagnosticMessage = {
    scope: 'file',
    providerName: 'Flow',
    type: flowMessage['level'] === 'error' ? 'Error' : 'Warning',
    text: flowMessages.map(errObj => errObj['descr']).join(' '),
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
  _requestSerializer: RequestSerializer;

  /** Maps flow root to the set of file paths under that root for which we have
    * ever reported diagnostics. */
  _flowRootToFilePaths: Map<NuclideUri, Set<NuclideUri>>;

  constructor(shouldRunOnTheFly: boolean, ProviderBase?: typeof DiagnosticsProviderBase = DiagnosticsProviderBase) {
    var utilsOptions = {
      grammarScopes: new Set(JS_GRAMMARS),
      shouldRunOnTheFly,
      onTextEditorEvent: editor => this._runDiagnostics(editor),
      onNewUpdateSubscriber: callback => this._receivedNewUpdateSubscriber(callback),
    };
    this._providerBase = new ProviderBase(utilsOptions);
    this._requestSerializer = new RequestSerializer();
    this._flowRootToFilePaths = new Map();
  }

  @trackTiming('flow.run-diagnostics')
  async _runDiagnostics(textEditor: TextEditor): Promise<void> {
    var file = textEditor.getPath();
    if (!file) {
      return;
    }

    var currentContents = textEditor.isModified() ? textEditor.getText() : null;

    var flowService = getServiceByNuclideUri('FlowService', file);
    invariant(flowService);
    var result = await this._requestSerializer.run(flowService.findDiagnostics(file, currentContents));
    if (result.status === 'outdated') {
      return;
    }
    var diagnostics: ?Diagnostics = result.result;
    if (!diagnostics) {
      return;
    }
    var {flowRoot, messages} = diagnostics;

    var pathsToInvalidate = this._getPathsToInvalidate(flowRoot);
    /* TODO Consider optimizing for the common case of only a single flow root
     * by invalidating all instead of enumerating the files. */
    this._providerBase.publishMessageInvalidation({scope: 'file', filePaths: pathsToInvalidate});

    var pathsForRoot = new Set();
    this._flowRootToFilePaths.set(flowRoot, pathsForRoot);
    for (var message of messages) {
      /* Each message consists of several different components, each with its
       * own text and path. */
      for (var messageComponent of message) {
        pathsForRoot.add(messageComponent.path);
      }
    }

    this._providerBase.publishMessageUpdate(this._processDiagnostics(messages, file));
  }

  _getPathsToInvalidate(flowRoot: NuclideUri): Array<NuclideUri> {
    var filePaths = this._flowRootToFilePaths.get(flowRoot);
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
    var activeTextEditor = atom.workspace.getActiveTextEditor();
    if (activeTextEditor) {
      var matchesGrammar = JS_GRAMMARS.indexOf(activeTextEditor.getGrammar().scopeName) !== -1;
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

  _processDiagnostics(diagnostics: Array<FlowDiagnosticItem>, targetFile: string): DiagnosticProviderUpdate {

    // convert array messages to Error Objects with Traces
    var fileDiagnostics = diagnostics.map(flowMessageToDiagnosticMessage);

    var filePathToMessages = new Map();
    for (var diagnostic of fileDiagnostics) {
      var path = diagnostic['filePath'];
      var diagnosticArray = filePathToMessages.get(path);
      if (!diagnosticArray) {
        diagnosticArray = [];
        filePathToMessages.set(path, diagnosticArray);
      }
      diagnosticArray.push(diagnostic);
    }

    return { filePathToMessages };
  }

  invalidateProjectPath(projectPath: string): void {
    var pathsToInvalidate = new Set();
    for (var flowRootEntry of this._flowRootToFilePaths) {
      var [flowRoot, filePaths] = flowRootEntry;
      if (!flowRoot.startsWith(projectPath)) {
        continue;
      }
      for (var filePath of filePaths) {
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
