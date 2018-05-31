/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {LanguageStatusProvider} from './types';

import ProviderRegistry from 'nuclide-commons-atom/ProviderRegistry';
import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import {TextEditorBanner} from 'nuclide-commons-ui/TextEditorBanner';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Subject, Observable} from 'rxjs';
import StatusComponent from './StatusComponent';

import * as React from 'react';

export class LanguageStatusManager {
  _providerRegistry: ProviderRegistry<LanguageStatusProvider>;
  _providersChanged: Subject<void>;
  _disposables: UniversalDisposable;

  constructor() {
    this._providerRegistry = new ProviderRegistry();
    this._providersChanged = new Subject();
    this._disposables = new UniversalDisposable();
    this._disposables.add(
      atom.workspace.observeTextEditors(this._onTextEditor),
    );
  }

  dispose() {
    this._disposables.dispose();
  }

  addProvider(provider: LanguageStatusProvider): IDisposable {
    this._disposables.add(this._providerRegistry.addProvider(provider));
    this._providersChanged.next();

    return new UniversalDisposable(() => this._removeProvider(provider));
  }

  _removeProvider(provider: LanguageStatusProvider): void {
    this._providerRegistry.removeProvider(provider);
    this._providersChanged.next();
  }

  _onTextEditor = (editor: atom$TextEditor): void => {
    const props = this._providersChanged
      .switchMap(() => {
        const providers = Array.from(
          this._providerRegistry.getAllProvidersForEditor(editor),
        );
        return providers
          .map(provider => {
            return provider
              .observeStatus(editor)
              .startWith({kind: 'null'})
              .map(statusData => ({
                name: provider.name,
                statusData,
              }));
          })
          .reduce(
            (a, b) => Observable.combineLatest,
            Observable.of({name: '', statusData: {kind: 'null'}}),
          );
      })
      .map(serverStatuses => ({serverStatuses}));
    const StatusComponentWithProps = bindObservableAsProps(
      props,
      StatusComponent,
    );
    const statusComponentWrapper = new TextEditorBanner(editor);
    statusComponentWrapper.render(<StatusComponentWithProps />);
    this._disposables.add(statusComponentWrapper);
    editor.onDidDestroy(() => {
      this._disposables.remove(statusComponentWrapper);
      statusComponentWrapper.dispose();
    });
  };
}
