'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {BusySignalProviderBase} from '../../nuclide-busy-signal';
import type {
  MessageUpdateCallback,
  MessageInvalidationCallback,
} from '../../nuclide-diagnostics-common';
import type {DiagnosticProviderUpdate} from '../../nuclide-diagnostics-common/lib/rpc-types';

import nuclideUri from '../../commons-node/nuclideUri';
import {trackTiming} from '../../nuclide-analytics';
import {getHackLanguageForUri} from './HackLanguage';
import {RequestSerializer} from '../../commons-node/promise';
import {DiagnosticsProviderBase} from '../../nuclide-diagnostics-provider-base';
import {onDidRemoveProjectPath} from '../../commons-atom/projects';
import {getLogger} from '../../nuclide-logging';
import {getFileVersionOfEditor} from '../../nuclide-open-files';

import {HACK_GRAMMARS_SET} from '../../nuclide-hack-common';

export default class HackDiagnosticsProvider {
  _busySignalProvider: BusySignalProviderBase;
  _providerBase: DiagnosticsProviderBase;
  _requestSerializer: RequestSerializer<any>;
  _subscription: IDisposable;

  /**
   * Maps hack root to the set of file paths under that root for which we have
   * ever reported diagnostics.
   */
  _projectRootToFilePaths: Map<NuclideUri, Set<NuclideUri>>;

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
    this._projectRootToFilePaths = new Map();
    this._subscription = onDidRemoveProjectPath(projectPath => {
      this.invalidateProjectPath(projectPath);
    });
  }

  _runDiagnostics(textEditor: atom$TextEditor): void {
    this._busySignalProvider.reportBusy(
      'Hack: Waiting for diagnostics',
      () => this._runDiagnosticsImpl(textEditor),
    );
  }

  @trackTiming('hack.run-diagnostics')
  async _runDiagnosticsImpl(textEditor: atom$TextEditor): Promise<void> {
    let filePath = textEditor.getPath();
    if (filePath == null) {
      return;
    }

    // `hh_client` doesn't currently support `onTheFly` diagnosis.
    // So, currently, it would only work if there is no `hh_client` or `.hhconfig` where
    // the `HackWorker` model will diagnose with the updated editor contents.
    const diagnosisResult = await this._requestSerializer.run(findDiagnostics(textEditor));
    if (diagnosisResult.status === 'success' && diagnosisResult.result == null) {
      getLogger().error('hh_client could not be reached');
    }
    if (diagnosisResult.status === 'outdated' || diagnosisResult.result == null) {
      return;
    }

    const diagnostics: DiagnosticProviderUpdate = diagnosisResult.result;
    filePath = textEditor.getPath();
    if (filePath == null) {
      return;
    }
    const hackLanguage = await getHackLanguageForUri(filePath);
    if (hackLanguage == null) {
      return;
    }
    const projectRoot = await hackLanguage.getProjectRoot(filePath);
    if (projectRoot == null) {
      return;
    }

    this._providerBase.publishMessageInvalidation({scope: 'file', filePaths: [filePath]});
    this._invalidatePathsForProjectRoot(projectRoot);

    const pathsForHackLanguage = new Set();
    this._projectRootToFilePaths.set(projectRoot, pathsForHackLanguage);
    const addPath = path => {
      if (path != null) {
        pathsForHackLanguage.add(path);
      }
    };
    if (diagnostics.filePathToMessages != null) {
      diagnostics.filePathToMessages.forEach(
        (messages, messagePath) => {
          addPath(messagePath);
          messages.forEach(
            message => {
              addPath(message.filePath);
              if (message.trace != null) {
                message.trace.forEach(trace => {
                  addPath(trace.filePath);
                });
              }
            });
        });
    }

    this._providerBase.publishMessageUpdate(diagnostics);
  }

  _getPathsToInvalidate(projectRoot: NuclideUri): Array<NuclideUri> {
    const filePaths = this._projectRootToFilePaths.get(projectRoot);
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

  // Called when a directory is removed from the file tree.
  invalidateProjectPath(projectPath: NuclideUri): void {
    Array.from(this._projectRootToFilePaths.keys())
      // This filter is over broad, the real filter should be
      // no open dir in the File Tree contains the root.
      // This will err on the side of removing messages,
      // which should be fine, as they will come back once a file is reopened
      // or edited.
      .filter(rootPath => nuclideUri.contains(projectPath, rootPath)
        || nuclideUri.contains(rootPath, projectPath))
      .forEach(removedPath => {
        this._invalidatePathsForProjectRoot(removedPath);
      });
  }

  _invalidatePathsForProjectRoot(projectRoot: NuclideUri): void {
    const pathsToInvalidate = this._getPathsToInvalidate(projectRoot);
    this._providerBase.publishMessageInvalidation(
      {scope: 'file', filePaths: pathsToInvalidate},
    );
    this._projectRootToFilePaths.delete(projectRoot);
  }

  dispose() {
    this._subscription.dispose();
    this._providerBase.dispose();
  }
}

async function findDiagnostics(
  editor: atom$TextEditor,
): Promise<?DiagnosticProviderUpdate> {
  const fileVersion = await getFileVersionOfEditor(editor);
  const hackLanguage = await getHackLanguageForUri(editor.getPath());
  if (hackLanguage == null || fileVersion == null) {
    return null;
  }

  return await hackLanguage.getDiagnostics(fileVersion);
}
