/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {
  DatatipProvider,
  DatatipService,
} from '../../atom-ide-datatip/lib/types';

import type {CodeActionFetcher} from '../../atom-ide-code-actions/lib/types';

import type {
  DiagnosticMessage,
  FileDiagnosticMessage,
  FileDiagnosticMessages,
  ObservableDiagnosticUpdater,
} from '../../atom-ide-diagnostics/lib/types';

import invariant from 'assert';

import analytics from 'nuclide-commons-atom/analytics';

import * as AtomLinter from './AtomLinter';
import KeyboardShortcuts from './KeyboardShortcuts';
import createPackage from 'nuclide-commons-atom/createPackage';
import {observeTextEditors} from 'nuclide-commons-atom/text-editor';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import {DiagnosticsViewModel, WORKSPACE_VIEW_URI} from './DiagnosticsViewModel';
import StatusBarTile from './StatusBarTile';
import {applyUpdateToEditor} from './gutter';
import getDiagnosticDatatip from './getDiagnosticDatatip';
import {goToLocation} from 'nuclide-commons-atom/go-to-location';
import featureConfig from 'nuclide-commons-atom/feature-config';
import {destroyItemWhere} from 'nuclide-commons-atom/destroyItemWhere';
import {BehaviorSubject, Observable} from 'rxjs';

const MAX_OPEN_ALL_FILES = 20;

type ActivationState = {
  filterByActiveTextEditor: boolean,
};

function getEditorDiagnosticUpdates(
  editor: atom$TextEditor,
  diagnosticUpdater: ObservableDiagnosticUpdater,
): Observable<FileDiagnosticMessages> {
  return observableFromSubscribeFunction(editor.onDidChangePath.bind(editor))
    .startWith(editor.getPath())
    .switchMap(
      filePath =>
        filePath != null
          ? diagnosticUpdater.getFileMessageUpdates(filePath)
          : Observable.empty(),
    )
    .takeUntil(
      observableFromSubscribeFunction(editor.onDidDestroy.bind(editor)),
    );
}

class Activation {
  _diagnosticUpdaters: BehaviorSubject<?ObservableDiagnosticUpdater>;
  _subscriptions: UniversalDisposable;
  _state: ActivationState;
  _statusBarTile: ?StatusBarTile;
  _fileDiagnostics: WeakMap<atom$TextEditor, Array<FileDiagnosticMessage>>;
  _codeActionFetcher: ?CodeActionFetcher;

  constructor(state_: ?Object): void {
    this._diagnosticUpdaters = new BehaviorSubject(null);
    this._subscriptions = new UniversalDisposable(
      this.registerOpenerAndCommand(),
    );
    const state = state_ || {};
    this._state = {
      filterByActiveTextEditor: state.filterByActiveTextEditor === true,
    };
    this._fileDiagnostics = new WeakMap();
  }

  consumeDatatipService(service: DatatipService): IDisposable {
    const datatipProvider: DatatipProvider = {
      // show this datatip for every type of file
      providerName: 'diagnostics-datatip',
      // Diagnostic datatips should have higher priority than most other datatips.
      priority: 10,
      datatip: (editor, position) => {
        const messagesForFile = this._fileDiagnostics.get(editor);
        if (messagesForFile == null) {
          return Promise.resolve(null);
        }
        return getDiagnosticDatatip(
          editor,
          position,
          messagesForFile,
          message => {
            const updater = this._diagnosticUpdaters.getValue();
            if (updater != null) {
              updater.applyFix(message);
            }
          },
          this._codeActionFetcher,
        );
      },
    };
    const disposable = service.addProvider(datatipProvider);
    this._subscriptions.add(disposable);
    return disposable;
  }

  consumeDiagnosticUpdates(
    diagnosticUpdater: ObservableDiagnosticUpdater,
  ): IDisposable {
    this._getStatusBarTile().consumeDiagnosticUpdates(diagnosticUpdater);
    this._subscriptions.add(gutterConsumeDiagnosticUpdates(diagnosticUpdater));

    // Currently, the DiagnosticsView is designed to work with only one DiagnosticUpdater.
    if (this._diagnosticUpdaters.getValue() != null) {
      return new UniversalDisposable();
    }
    this._diagnosticUpdaters.next(diagnosticUpdater);
    const atomCommandsDisposable = addAtomCommands(diagnosticUpdater);
    this._subscriptions.add(atomCommandsDisposable);
    this._subscriptions.add(
      // Track diagnostics for all active editors.
      observeTextEditors((editor: TextEditor) => {
        this._fileDiagnostics.set(editor, []);
        // TODO: this is actually inefficient - this filters all file events
        // by their path, so this is actually O(N^2) in the number of editors.
        // We should merge the store and UI packages to get direct access.
        const subscription = getEditorDiagnosticUpdates(
          editor,
          diagnosticUpdater,
        )
          .finally(() => {
            this._subscriptions.remove(subscription);
            this._fileDiagnostics.delete(editor);
          })
          .subscribe(update => {
            this._fileDiagnostics.set(editor, update.messages);
          });
        this._subscriptions.add(subscription);
      }),
    );
    return new UniversalDisposable(atomCommandsDisposable, () => {
      invariant(this._diagnosticUpdaters.getValue() === diagnosticUpdater);
      this._diagnosticUpdaters.next(null);
    });
  }

  consumeCodeActionFetcher(fetcher: CodeActionFetcher) {
    this._codeActionFetcher = fetcher;
  }

  consumeStatusBar(statusBar: atom$StatusBar): void {
    this._getStatusBarTile().consumeStatusBar(statusBar);
  }

  deserializeDiagnosticsViewModel(): DiagnosticsViewModel {
    return this._createDiagnosticsViewModel();
  }

  dispose(): void {
    this._subscriptions.dispose();
    if (this._statusBarTile) {
      this._statusBarTile.dispose();
      this._statusBarTile = null;
    }
  }

  serialize(): ActivationState {
    return this._state;
  }

  _createDiagnosticsViewModel(): DiagnosticsViewModel {
    return new DiagnosticsViewModel(
      this._diagnosticUpdaters.switchMap(
        updater =>
          updater == null ? Observable.of([]) : updater.allMessageUpdates,
      ),
      ((featureConfig.observeAsStream(
        'atom-ide-diagnostics-ui.showDiagnosticTraces',
      ): any): Observable<boolean>),
      showTraces => {
        featureConfig.set(
          'atom-ide-diagnostics-ui.showDiagnosticTraces',
          showTraces,
        );
      },
      () => {
        AtomLinter.disable();
      },
      AtomLinter.observePackageIsEnabled(),
      this._state.filterByActiveTextEditor,
      filterByActiveTextEditor => {
        if (this._state != null) {
          this._state.filterByActiveTextEditor = filterByActiveTextEditor;
        }
      },
    );
  }

  registerOpenerAndCommand(): IDisposable {
    const commandDisposable = atom.commands.add(
      'atom-workspace',
      'diagnostics:toggle-table',
      () => {
        atom.workspace.toggle(WORKSPACE_VIEW_URI);
      },
    );
    return new UniversalDisposable(
      atom.workspace.addOpener(uri => {
        if (uri === WORKSPACE_VIEW_URI) {
          return this._createDiagnosticsViewModel();
        }
      }),
      () => {
        destroyItemWhere(item => item instanceof DiagnosticsViewModel);
      },
      commandDisposable,
    );
  }

  _getStatusBarTile(): StatusBarTile {
    if (!this._statusBarTile) {
      this._statusBarTile = new StatusBarTile();
    }
    return this._statusBarTile;
  }
}

function gutterConsumeDiagnosticUpdates(
  diagnosticUpdater: ObservableDiagnosticUpdater,
): IDisposable {
  const fixer = diagnosticUpdater.applyFix.bind(diagnosticUpdater);
  const subscriptions = new UniversalDisposable();
  subscriptions.add(
    observeTextEditors((editor: TextEditor) => {
      const subscription = getEditorDiagnosticUpdates(editor, diagnosticUpdater)
        .finally(() => {
          subscriptions.remove(subscription);
        })
        .subscribe(update => {
          // Although the subscription should be cleaned up on editor destroy,
          // the very act of destroying the editor can trigger diagnostic updates.
          // Thus this callback can still be triggered after the editor is destroyed.
          if (!editor.isDestroyed()) {
            applyUpdateToEditor(editor, update, fixer);
          }
        });
      subscriptions.add(subscription);
    }),
  );
  return subscriptions;
}

function addAtomCommands(
  diagnosticUpdater: ObservableDiagnosticUpdater,
): IDisposable {
  const fixAllInCurrentFile = () => {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return;
    }
    const path = editor.getPath();
    if (path == null) {
      return;
    }
    analytics.track('diagnostics-autofix-all-in-file');
    diagnosticUpdater.applyFixesForFile(path);
  };

  const openAllFilesWithErrors = () => {
    analytics.track('diagnostics-panel-open-all-files-with-errors');
    diagnosticUpdater.allMessageUpdates
      .first()
      .subscribe((messages: Array<DiagnosticMessage>) => {
        const errorsToOpen = getTopMostErrorLocationsByFilePath(messages);

        if (errorsToOpen.size > MAX_OPEN_ALL_FILES) {
          atom.notifications.addError(
            `Diagnostics: Will not open more than ${MAX_OPEN_ALL_FILES} files`,
          );
          return;
        }

        const column = 0;
        errorsToOpen.forEach((line, uri) => goToLocation(uri, line, column));
      });
  };

  return new UniversalDisposable(
    atom.commands.add(
      'atom-workspace',
      'diagnostics:fix-all-in-current-file',
      fixAllInCurrentFile,
    ),
    atom.commands.add(
      'atom-workspace',
      'diagnostics:open-all-files-with-errors',
      openAllFilesWithErrors,
    ),
    new KeyboardShortcuts(diagnosticUpdater),
  );
}

function getTopMostErrorLocationsByFilePath(
  messages: Array<DiagnosticMessage>,
): Map<string, number> {
  const errorLocations: Map<string, number> = new Map();

  messages.forEach(message => {
    if (message.scope !== 'file' || message.filePath == null) {
      return;
    }
    const filePath = message.filePath;
    // If initialLine is N, Atom will navigate to line N+1.
    // Flow sometimes reports a row of -1, so this ensures the line is at least one.
    let line = Math.max(message.range ? message.range.start.row : 0, 0);

    const prevMinLine = errorLocations.get(filePath);
    if (prevMinLine != null) {
      line = Math.min(prevMinLine, line);
    }

    errorLocations.set(filePath, line);
  });

  return errorLocations;
}

createPackage(module.exports, Activation);
