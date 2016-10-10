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
import type {
  MessageUpdateCallback,
  MessageInvalidationCallback,
} from '../../nuclide-diagnostics-common';
import type {
  DiagnosticProviderUpdate,
  InvalidationMessage,
} from '../../nuclide-diagnostics-common/lib/rpc-types';
import type {LanguageService} from './LanguageService';

import {ConnectionCache} from '../../nuclide-remote-connection';
import nuclideUri from '../../commons-node/nuclideUri';
import {trackTiming} from '../../nuclide-analytics';
import {RequestSerializer} from '../../commons-node/promise';
import {DiagnosticsProviderBase} from '../../nuclide-diagnostics-provider-base';
import {onDidRemoveProjectPath} from '../../commons-atom/projects';
import {getLogger} from '../../nuclide-logging';
import {getFileVersionOfEditor} from '../../nuclide-open-files';
import {Observable} from 'rxjs';
import {ServerConnection} from '../../nuclide-remote-connection';
import {observableFromSubscribeFunction} from '../../commons-node/event';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {BusySignalProviderBase} from '../../nuclide-busy-signal';
import UniversalDisposable from '../../commons-node/UniversalDisposable';

export type DiagnosticsConfig = FileDiagnosticsConfig | ObservableDiagnosticsConfig;

export type FileDiagnosticsConfig = {
  version: '0.1.0',
  shouldRunOnTheFly: boolean,
};

export type ObservableDiagnosticsConfig = {
  version: '0.2.0',
};

const diagnosticService = 'nuclide-diagnostics-provider';

export function registerDiagnostics<T: LanguageService>(
  name: string,
  grammars: Array<string>,
  config: DiagnosticsConfig,
  connectionToLanguageService: ConnectionCache<T>,
): IDisposable {
  const result = new UniversalDisposable();
  let provider;
  switch (config.version) {
    case '0.1.0':
      provider = new FileDiagnosticsProvider(
        name,
        grammars,
        config.shouldRunOnTheFly,
        connectionToLanguageService,
      );
      result.add(provider);
      break;
    case '0.2.0':
      provider = new ObservableDiagnosticProvider(
        connectionToLanguageService,
      );
      break;
    default:
      throw new Error('Unexpected diagnostics version');
  }
  result.add(atom.packages.serviceHub.provide(
    diagnosticService,
    config.version,
    provider));
  return result;
}

export class FileDiagnosticsProvider<T: LanguageService> {
  name: string;
  _busySignalProvider: BusySignalProviderBase;
  _providerBase: DiagnosticsProviderBase;
  _requestSerializer: RequestSerializer<any>;
  _subscriptions: UniversalDisposable;

  /**
   * Maps hack root to the set of file paths under that root for which we have
   * ever reported diagnostics.
   */
  _projectRootToFilePaths: Map<NuclideUri, Set<NuclideUri>>;
  _connectionToLanguageService: ConnectionCache<T>;

  constructor(
    name: string,
    grammars: Array<string>,
    shouldRunOnTheFly: boolean,
    connectionToLanguageService: ConnectionCache<T>,
    busySignalProvider: BusySignalProviderBase = new BusySignalProviderBase(),
    ProviderBase: typeof DiagnosticsProviderBase = DiagnosticsProviderBase,
  ) {
    this.name = name;
    this._busySignalProvider = busySignalProvider;
    this._connectionToLanguageService = connectionToLanguageService;
    const utilsOptions = {
      grammarScopes: new Set(grammars),
      shouldRunOnTheFly,
      onTextEditorEvent: editor => this._runDiagnostics(editor),
      onNewUpdateSubscriber: callback => this._receivedNewUpdateSubscriber(callback),
    };
    this._providerBase = new ProviderBase(utilsOptions);
    this._requestSerializer = new RequestSerializer();
    this._projectRootToFilePaths = new Map();
    this._subscriptions = new UniversalDisposable();
    this._subscriptions.add(
      onDidRemoveProjectPath(projectPath => {
        this.invalidateProjectPath(projectPath);
      }),
      this._providerBase,
      atom.packages.serviceHub.provide(
        'nuclide-busy-signal',
        '0.1.0',
        busySignalProvider,
      ));
  }

  _runDiagnostics(textEditor: atom$TextEditor): void {
    this._busySignalProvider.reportBusy(
      `${this.name}: Waiting for diagnostics`,
      () => this._runDiagnosticsImpl(textEditor),
    );
  }

  // TODO: tracking ids
  @trackTiming('hack.run-diagnostics')
  async _runDiagnosticsImpl(textEditor: atom$TextEditor): Promise<void> {
    let filePath = textEditor.getPath();
    if (filePath == null) {
      return;
    }

    // `hh_client` doesn't currently support `onTheFly` diagnosis.
    // So, currently, it would only work if there is no `hh_client` or `.hhconfig` where
    // the `HackWorker` model will diagnose with the updated editor contents.
    const diagnosisResult = await this._requestSerializer.run(this.findDiagnostics(textEditor));
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
    const languageService = this._connectionToLanguageService.getForUri(filePath);
    if (languageService == null) {
      return;
    }
    const projectRoot = await (await languageService).getProjectRoot(filePath);
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
      if (this._providerBase.getGrammarScopes().has(activeTextEditor.getGrammar().scopeName)) {
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
    this._subscriptions.dispose();
  }

  async findDiagnostics(
    editor: atom$TextEditor,
  ): Promise<?DiagnosticProviderUpdate> {
    const fileVersion = await getFileVersionOfEditor(editor);
    const languageService = this._connectionToLanguageService.getForUri(editor.getPath());
    if (languageService == null || fileVersion == null) {
      return null;
    }

    return await (await languageService).getDiagnostics(fileVersion);
  }
}

export class ObservableDiagnosticProvider<T: LanguageService> {
  updates: Observable<DiagnosticProviderUpdate>;
  invalidations: Observable<InvalidationMessage>;
  _connectionToLanguageService: ConnectionCache<T>;

  constructor(connectionToLanguageService: ConnectionCache<T>) {
    this._connectionToLanguageService = connectionToLanguageService;
    this.updates = this._connectionToLanguageService.observeValues()
      .switchMap(languageService => {
        return Observable.fromPromise(languageService);
      })
      .mergeMap(language => language.observeDiagnostics().refCount())
      .map(({filePath, messages}) => ({
        filePathToMessages: new Map([[filePath, messages]]),
      }));

    // TODO: Per file invalidations?
    this.invalidations = observableFromSubscribeFunction(
      ServerConnection.onDidCloseServerConnection)
        .map(connection => {
          return {
            scope: 'file',
            // TODO: Does this work for invalidating an entire ServerConnection?
            // TODO: What about windows?
            filePaths: [connection.getUriOfRemotePath('/')],
          };
        });
  }
}
