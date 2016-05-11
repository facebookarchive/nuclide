'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CoverageResult, CoverageProvider} from './types';
import type {NuclideUri} from '../../nuclide-remote-uri';
import type {
  ObservableDiagnosticProvider,
  DiagnosticProviderUpdate,
  FileDiagnosticMessage,
} from '../../nuclide-diagnostics-base';
import type {Result} from '../../nuclide-active-editor-based-service';

import {React, ReactDOM} from 'react-for-atom';

import {CompositeDisposable, Disposable} from 'atom';

import invariant from 'assert';
import {Observable} from 'rxjs';

import {ActiveEditorBasedService} from '../../nuclide-active-editor-based-service';
import {passesGK, compact} from '../../nuclide-commons';

import {StatusBarTile} from './StatusBarTile';

const STATUS_BAR_PRIORITY = 1000;
const GK_TYPE_COVERAGE = 'nuclide_type_coverage';

async function resultFunction(
  provider: CoverageProvider,
  editor: atom$TextEditor,
): Promise<?CoverageResult> {
  if (!await passesGK(GK_TYPE_COVERAGE, 0)) {
    return null;
  }
  const path = editor.getPath();
  if (path == null) {
    return null;
  }
  return await provider.getCoverage(path);
}

class Activation {
  _disposables: CompositeDisposable;
  _activeEditorBasedService: ActiveEditorBasedService<CoverageProvider, ?CoverageResult>;

  constructor(state: ?Object) {
    this._disposables = new CompositeDisposable();
    this._activeEditorBasedService = new ActiveEditorBasedService(
      resultFunction,
      {updateOnEdit: false},
    );
  }

  consumeCoverageProvider(provider: CoverageProvider): IDisposable {
    return this._activeEditorBasedService.consumeProvider(provider);
  }

  consumeStatusBar(statusBar: atom$StatusBar): IDisposable {
    const item = document.createElement('div');
    item.className = 'inline-block';

    const statusBarTile = statusBar.addLeftTile({
      item,
      priority: STATUS_BAR_PRIORITY,
    });

    const resultStream = this._activeEditorBasedService.getResultsStream();
    ReactDOM.render(
      <StatusBarTile results={resultStream} />,
      item,
    );
    const disposable = new Disposable(() => {
      statusBarTile.destroy();
    });
    this._disposables.add(disposable);
    return disposable;
  }

  getDiagnosticsProvider(): ObservableDiagnosticProvider {
    return diagnosticProviderForResultStream(this._activeEditorBasedService.getResultsStream());
  }

  dispose() {
    this._disposables.dispose();
  }
}

let activation: ?Activation = null;

export function activate(state: ?Object) {
  if (activation == null) {
    activation = new Activation(state);
  }
}

export function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

export function consumeCoverageProvider(provider: CoverageProvider): IDisposable {
  invariant(activation != null);
  return activation.consumeCoverageProvider(provider);
}

export function consumeStatusBar(statusBar: atom$StatusBar): IDisposable {
  invariant(activation != null);
  return activation.consumeStatusBar(statusBar);
}

export function getDiagnosticsProvider(): ObservableDiagnosticProvider {
  invariant(activation != null);
  return activation.getDiagnosticsProvider();
}

function diagnosticProviderForResultStream(
  results: Observable<Result<?CoverageResult>>,
): ObservableDiagnosticProvider {
  return {
    updates: compact(results.map(diagnosticsForResult)),
    invalidations: results.filter(result => {
      switch (result.kind) {
        case 'not-text-editor':
        case 'no-provider':
        case 'provider-error':
        case 'pane-change':
          return true;
        case 'result':
          return result.result == null;
        default:
          return false;
      }
    }).mapTo({scope: 'all'}),
  };
}

/**
 * Preconditions:
 *   result.editor.getPath() != null
 *
 * This is reasonable because we only query providers when there is a path available for the current
 * text editor.
 */
function diagnosticsForResult(result: Result<?CoverageResult>): ?DiagnosticProviderUpdate {
  if (result.kind !== 'result') {
    return null;
  }
  const value = result.result;
  if (value == null) {
    return null;
  }

  const editorPath = result.editor.getPath();
  invariant(editorPath != null);

  const diagnostics = value.uncoveredRanges.map(
    range => uncoveredRangeToDiagnostic(range, editorPath)
  );

  return {
    filePathToMessages: new Map([[editorPath, diagnostics]]),
  };
}

function uncoveredRangeToDiagnostic(range: atom$Range, path: NuclideUri): FileDiagnosticMessage {
  return {
    scope: 'file',
    providerName: 'Type Coverage',
    type: 'Warning',
    filePath: path,
    range,
    text: 'Not covered by the type system',
  };
}
