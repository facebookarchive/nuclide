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

var {findDiagnostics, getCachedHackLanguageForUri} = require('./hack');
var {RequestSerializer} = require('nuclide-commons').promises;
var {DiagnosticsProviderBase} = require('nuclide-diagnostics-provider-base');
var {Range} = require('atom');
var {parse, isRemote, createRemoteUri} = require('nuclide-remote-uri');
import invariant from 'assert';

var {HACK_GRAMMAR} = require('nuclide-hack-common/lib/constants');

import type HackLanguage from './HackLanguage';
import type {HackDiagnosticItem, HackError} from './types';

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
function extractRange(message: HackError): Range {
  // It's unclear why the 1-based to 0-based indexing works the way that it
  // does, but this has the desired effect in the UI, in practice.
  return new Range(
    [message['line'] - 1, message['start'] - 1],
    [message['line'] - 1, message['end']]
  );
}

// A trace object is very similar to an error object.
function hackMessageToTrace(
  traceError: HackError,
  causeFilePath: string,
  causeRange: Range
): Object {
  return {
    type: 'Trace',
    text: traceError['descr'],
    filePath: causeFilePath,
    range: causeRange,
  };
}

function hackMessageToDiagnosticMessage(
  hackDiagnostic: HackDiagnosticItem
): FileDiagnosticMessage {
  var {message: hackMessages} = hackDiagnostic;

  var causeMessage = hackMessages[0];
  var filePath = causeMessage['path'];
  var range = extractRange(causeMessage);

  var diagnosticMessage: FileDiagnosticMessage = {
    scope: 'file',
    providerName: 'Hack',
    type: 'Error',
    // TODO(most): Revert to `text: causeMessage['descr']` when diagnostic traces are working.
    html: hackMessages.map(message => message['descr']).join('<br/>'),
    filePath,
    range,
  };

  // When the message is an array with multiple elements, the second element
  // onwards comprise the trace for the error.
  if (hackMessages.length > 1) {
    diagnosticMessage.trace = hackMessages.slice(1).map(hackTraceMessage =>
      hackMessageToTrace(hackTraceMessage, filePath, range)
    );
  }

  return diagnosticMessage;
}

class HackDiagnosticsProvider {
  _providerBase: DiagnosticsProviderBase;
  _requestSerializer: RequestSerializer;

  /**
   * Maps hack root to the set of file paths under that root for which we have
   * ever reported diagnostics.
   */
  _hackLanguageToFilePaths: Map<HackLanguage, Set<NuclideUri>>;

  constructor(
    shouldRunOnTheFly: boolean,
    ProviderBase?: typeof DiagnosticsProviderBase = DiagnosticsProviderBase
  ) {
    var utilsOptions = {
      grammarScopes: new Set([HACK_GRAMMAR]),
      shouldRunOnTheFly,
      onTextEditorEvent: editor => this._runDiagnostics(editor),
      onNewUpdateSubscriber: callback => this._receivedNewUpdateSubscriber(callback),
    };
    this._providerBase = new ProviderBase(utilsOptions);
    this._requestSerializer = new RequestSerializer();
    this._hackLanguageToFilePaths = new Map();
  }

  @trackTiming('hack.run-diagnostics')
  async _runDiagnostics(textEditor: TextEditor): Promise<void> {
    var filePath = textEditor.getPath();
    if (!filePath) {
      return;
    }

    var {hostname, port} = parse(filePath);

    // `hh_client` doesn't currently support `onTheFly` diagnosis.
    // So, currently, it would only work if there is no `hh_client` or `.hhconfig` where
    // the `HackWorker` model will diagnose with the updated editor contents.
    var {status, result} = await this._requestSerializer.run(findDiagnostics(textEditor));
    if (!result || status === 'outdated') {
      return;
    }

    var diagnostics = result;
    var hackLanguage = await getCachedHackLanguageForUri(textEditor.getPath());
    invariant(hackLanguage);

    this._providerBase.publishMessageInvalidation({scope: 'file', filePaths: [filePath]});
    this._invalidatePathsForHackLanguage(hackLanguage);

    var pathsForHackLanguage = new Set();
    this._hackLanguageToFilePaths.set(hackLanguage, pathsForHackLanguage);
    for (var diagnostic of diagnostics) {
      /* Each message consists of several different components, each with its
       * own text and path. */
      for (var diagnosticMessage of diagnostic.message) {
        if (isRemote(filePath)) {
          diagnosticMessage.path = createRemoteUri(hostname, port, diagnosticMessage.path);
        }
        pathsForHackLanguage.add(diagnosticMessage.path);
      }
    }

    this._providerBase.publishMessageUpdate(this._processDiagnostics(diagnostics));
  }

  _processDiagnostics(diagnostics: Array<HackDiagnosticItem>): DiagnosticProviderUpdate {
    // Convert array messages to Error Objects with Traces.
    var fileDiagnostics = diagnostics.map(hackMessageToDiagnosticMessage);

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

  _getPathsToInvalidate(hackLanguage: HackLanguage): Array<NuclideUri> {
    if (!hackLanguage.isHackClientAvailable()) {
      return [];
    }
    var filePaths = this._hackLanguageToFilePaths.get(hackLanguage);
    if (!filePaths) {
      return [];
    }
    return require('nuclide-commons').array.from(filePaths);
  }

  _receivedNewUpdateSubscriber(callback: MessageUpdateCallback): void {
    // Every time we get a new subscriber, we need to push results to them. This
    // logic is common to all providers and should be abstracted out (t7813069)
    //
    // Once we provide all diagnostics, instead of just the current file, we can
    // probably remove the activeTextEditor parameter.
    var activeTextEditor = atom.workspace.getActiveTextEditor();
    if (activeTextEditor) {
      if (activeTextEditor.getGrammar().scopeName === HACK_GRAMMAR) {
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

  invalidateProjectPath(projectPath: NuclideUri): void {
    var hackLanguage = getCachedHackLanguageForUri(projectPath);
    if (!hackLanguage) {
      return;
    }
    this._invalidatePathsForHackLanguage(hackLanguage);
  }

  _invalidatePathsForHackLanguage(hackLanguage: HackLanguage): void {
    var pathsToInvalidate = this._getPathsToInvalidate(hackLanguage);
    this._providerBase.publishMessageInvalidation({scope: 'file', filePaths: pathsToInvalidate});
    this._hackLanguageToFilePaths.delete(hackLanguage);
  }

  dispose() {
    this._providerBase.dispose();
  }
}

module.exports = HackDiagnosticsProvider;
