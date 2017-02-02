/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {BusySignalProviderBase} from '../../nuclide-busy-signal';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {
  MessageUpdateCallback,
  MessageInvalidationCallback,
} from '../../nuclide-diagnostics-common';
import type {
  FileDiagnosticMessage,
  DiagnosticProviderUpdate,
} from '../../nuclide-diagnostics-common/lib/rpc-types';
import type {
  NewDiagnostics,
} from '../../nuclide-flow-rpc';

import {trackTiming} from '../../nuclide-analytics';
import {getFlowServiceByNuclideUri} from './FlowServiceFactory';
import {RequestSerializer} from '../../commons-node/promise';
import {DiagnosticsProviderBase} from '../../nuclide-diagnostics-provider-base';
import invariant from 'assert';
import {JS_GRAMMARS} from './constants';
import {getLogger} from '../../nuclide-logging';

const logger = getLogger();

class FlowDiagnosticsProvider {
  _providerBase: DiagnosticsProviderBase;
  _busySignalProvider: BusySignalProviderBase;
  _requestSerializer: RequestSerializer<?NewDiagnostics>;

  /**
    * Maps flow root to the set of file paths under that root for which we have
    * ever reported diagnostics.
    */
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
    ).catch(e => logger.error(e));
  }

  _runDiagnosticsImpl(textEditor: TextEditor): Promise<void> {
    return trackTiming(
      'flow.run-diagnostics',
      () => this.__runDiagnosticsImpl(textEditor),
    );
  }

  async __runDiagnosticsImpl(textEditor: TextEditor): Promise<void> {
    const file = textEditor.getPath();
    if (!file) {
      return;
    }

    const flowService = getFlowServiceByNuclideUri(file);
    invariant(flowService);
    const result = await this._requestSerializer.run(
      flowService.flowFindDiagnostics(file, /* currentContents */ null),
    );
    if (result.status === 'outdated') {
      return;
    }
    const diagnostics: ?NewDiagnostics = result.result;
    if (!diagnostics) {
      return;
    }
    const {flowRoot, messages} = diagnostics;

    const pathsToInvalidate = this._getPathsToInvalidate(flowRoot);
    /*
     * TODO Consider optimizing for the common case of only a single flow root
     * by invalidating all instead of enumerating the files.
     */
    this._providerBase.publishMessageInvalidation({scope: 'file', filePaths: pathsToInvalidate});

    const pathsForRoot = new Set();
    this._flowRootToFilePaths.set(flowRoot, pathsForRoot);
    for (const message of messages) {
      /*
       * Each message consists of several different components, each with its
       * own text and path.
       */
      pathsForRoot.add(message.filePath);
      if (message.trace != null) {
        for (const trace of message.trace) {
          if (trace.filePath != null) {
            pathsForRoot.add(trace.filePath);
          }
        }
      }
    }

    this._providerBase.publishMessageUpdate(this._processDiagnostics(messages, file));
  }

  _getPathsToInvalidate(flowRoot: NuclideUri): Array<NuclideUri> {
    const filePaths = this._flowRootToFilePaths.get(flowRoot);
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
      const matchesGrammar = JS_GRAMMARS.indexOf(activeTextEditor.getGrammar().scopeName) !== -1;
      if (matchesGrammar) {
        this._runDiagnostics(activeTextEditor);
      }
    }
  }

  onMessageUpdate(callback: MessageUpdateCallback): IDisposable {
    return this._providerBase.onMessageUpdate(callback);
  }

  onMessageInvalidation(callback: MessageInvalidationCallback): IDisposable {
    return this._providerBase.onMessageInvalidation(callback);
  }

  dispose() {
    this._providerBase.dispose();
  }

  _processDiagnostics(
    diagnostics: Array<FileDiagnosticMessage>,
    currentFile: string,
  ): DiagnosticProviderUpdate {
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

    for (const diagnostic of diagnostics) {
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
      filePaths: Array.from(pathsToInvalidate),
    });
  }
}

module.exports = FlowDiagnosticsProvider;
