'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {getServiceByNuclideUri} = require('nuclide-client');
var {Emitter, Range, CompositeDisposable} = require('atom');
var invariant = require('assert');

var {JS_GRAMMARS} = require('./constants.js');

type FlowError = {
  level: string,
  descr: string,
  path: string,
  line: number,
  start: number,
  endline: number,
  end: number,
}

type FlowDiagnosticItem = {
  message: Array<FlowError>,
}

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
  _emitter: Emitter;

  _disposables: CompositeDisposable;

  constructor() {
    this._emitter = new Emitter();
    this._disposables = new CompositeDisposable();
    var textEventDispatcher = require('nuclide-text-event-dispatcher').getInstance();
    this._disposables.add(textEventDispatcher.onFileChange(JS_GRAMMARS, editor => this._runDiagnostics(editor)));
  }

  async _runDiagnostics(textEditor: TextEditor): Promise<void> {
    var file = textEditor.getPath();
    if (!file) {
      return;
    }

    var currentContents = textEditor.isModified() ? textEditor.getText() : null;

    var flowService = getServiceByNuclideUri('FlowService', file);
    invariant(flowService);
    var diagnostics = await flowService.findDiagnostics(file, currentContents);
    if (!diagnostics.length) {
      return;
    }

    // we need to invalidate to make sure that files which are now clean have
    // the errors removed
    this._emitter.emit('invalidate', { scope: 'file', filePaths: [file] });
    this._emitter.emit('update', this._processDiagnostics(diagnostics, file));
  }

  onMessageUpdate(callback: MessageUpdateCallback): atom$Disposable {
    var disposable = this._emitter.on('update', callback);
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
    return disposable;
  }

  onMessageInvalidation(callback: MessageInvalidationCallback): atom$Disposable {
    return this._emitter.on('invalidate', callback);
  }

  dispose() {
    this._emitter.dispose();
    this._disposables.dispose();
  }

  _processDiagnostics(diagnostics: Array<FlowDiagnosticItem>, targetFile: string): DiagnosticProviderUpdate {
    var hasMessageWithPath = function(message) {
      return message['filePath'] === targetFile;
    };

    // convert array messages to Error Objects with Traces
    var fileDiagnostics = diagnostics
      .map(diagnostic => diagnostic['message'])
      .map(flowMessageToDiagnosticMessage)
      .filter(hasMessageWithPath);

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
}

module.exports = FlowDiagnosticsProvider;
