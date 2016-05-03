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

// This type is highly likely to change in the near future as we add information like *which* parts
// of the file are covered. Expect breaking changes.
export type CoverageResult = number;

export type CoverageProvider = {
  getCoverage(path: NuclideUri): Promise<?CoverageResult>;
  priority: number;
  grammarScopes: Array<string>;
};

import {React, ReactDOM} from 'react-for-atom';

import {CompositeDisposable, Disposable} from 'atom';

import invariant from 'assert';

import {ActiveEditorBasedService} from '../../nuclide-active-editor-based-service';

import {StatusBarTile} from './StatusBarTile';

const STATUS_BAR_PRIORITY = 1000;

class Activation {
  _disposables: CompositeDisposable;
  _activeEditorBasedService: ActiveEditorBasedService<CoverageProvider, ?CoverageResult>;

  constructor(state: ?Object) {
    this._disposables = new CompositeDisposable();
    const resultFunction = (
      provider: CoverageProvider,
      editor: atom$TextEditor,
    ) => {
      const path = editor.getPath();
      if (path == null) {
        return Promise.resolve(null);
      }
      return provider.getCoverage(path);
    };
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
