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

import type {LanguageStatusProvider, StatusKind} from './types';

import ProviderRegistry from 'nuclide-commons-atom/ProviderRegistry';
import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import {TextEditorBanner} from 'nuclide-commons-ui/TextEditorBanner';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Observable, BehaviorSubject} from 'rxjs';
import StatusComponent from './StatusComponent';

import * as React from 'react';

const DEFAULT_SETTINGS_KIND: StatusKind = 'yellow';

export class LanguageStatusManager {
  _providerRegistry: ProviderRegistry<LanguageStatusProvider>;
  _providersChanged: BehaviorSubject<void>;
  _settings: Map<LanguageStatusProvider, StatusKind>;
  // TODO (T30575384): This is currently a hack for deserializing settings.
  // The (key,value) pairs in _deserializedSettings are (server name, kind)
  // are populated immediately after LanguageStatusManager is constructed.
  // When new entries are inserted into _settings, we look up whether or not
  // there is an entry in _deserializedSettings first and use it if there is
  // one, defaulting to DEFAULT_SETTINGS_KIND otherwise.
  _deserializedSettings: Map<string, StatusKind> = new Map();
  _statusComponentDisposables: Map<atom$TextEditor, IDisposable>;
  _disposables: UniversalDisposable;

  constructor() {
    this._providerRegistry = new ProviderRegistry();
    this._providersChanged = new BehaviorSubject();
    this._statusComponentDisposables = new Map();
    this._settings = new Map();
    this._disposables = new UniversalDisposable();
    this._disposables.add(() =>
      this._statusComponentDisposables.forEach(d => d.dispose),
    );
    this._disposables.add(
      atom.workspace.observeActiveTextEditor(this._onActiveTextEditor),
    );
  }

  serialize(): any {
    const serializedSettings = {};
    // TODO (T30575384): Figure out how to serialize information to uniquely
    // identify a provider instead of just the name.
    for (const [providerName, kind] of this._deserializedSettings) {
      serializedSettings[providerName] = kind;
    }
    // Add any changes made to the settings during this Nuclide session.
    for (const [provider, kind] of this._settings) {
      serializedSettings[provider.name] = kind;
    }

    return {
      settings: serializedSettings,
    };
  }

  deserialize(state: any): void {
    for (const key in state.settings) {
      this._deserializedSettings.set(key, state.settings[key]);
    }
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

  // Atom doesn't provide a way to observe all text editors that are
  // visible. We manage this manually by looking at all the panes and
  // keeping track of the active text editors.
  _onActiveTextEditor = (_: atom$TextEditor): void => {
    const activePaneItems = atom.workspace
      .getPanes()
      .map(pane => pane.getActiveItem());
    const textEditors = atom.workspace.getTextEditors();
    const activeTextEditors = activePaneItems.filter(item =>
      textEditors.includes(item),
    );
    // Dispose of status components on text editors that are no longer active.
    for (const [editor, disposable] of this._statusComponentDisposables) {
      if (!activeTextEditors.includes(editor)) {
        disposable.dispose();
        this._statusComponentDisposables.delete(editor);
      }
    }
    // Add status components to text editors that are now active.
    for (const editor of activeTextEditors) {
      if (editor == null) {
        continue;
      }

      if (!this._statusComponentDisposables.has(editor)) {
        this._statusComponentDisposables.set(
          editor,
          this._addStatusComponent(editor),
        );
      }
    }
  };

  _onUpdateSettings = (
    newSettings: Map<LanguageStatusProvider, StatusKind>,
  ) => {
    this._settings = newSettings;
    this._providersChanged.next();
  };

  _addStatusComponent = (editor: atom$TextEditor): IDisposable => {
    const props = this._providersChanged
      .switchMap(() => {
        const providers = Array.from(
          this._providerRegistry.getAllProvidersForEditor(editor),
        );
        // Add providers to settings map.
        for (const provider of providers) {
          if (!this._settings.has(provider)) {
            // TODO (T30575384): This is a hack for deserialization
            const deserializedKind = this._deserializedSettings.get(
              provider.name,
            );
            this._settings.set(
              provider,
              deserializedKind != null
                ? deserializedKind
                : DEFAULT_SETTINGS_KIND,
            );
          }
        }
        return providers
          .map(provider => {
            return provider
              .observeStatus(editor)
              .startWith({kind: 'null'})
              .map(data => ({
                provider,
                data,
              }));
          })
          .reduce(
            (a, b) => Observable.combineLatest(a, b, (x, y) => x.concat(y)),
            Observable.of([]),
          );
      })
      .map(serverStatuses => ({
        serverStatuses,
        editor,
        settings: this._settings,
        onUpdateSettings: this._onUpdateSettings,
      }));
    const StatusComponentWithProps = bindObservableAsProps(
      props,
      StatusComponent,
    );
    const statusComponentWrapper = new TextEditorBanner(editor);
    statusComponentWrapper.renderUnstyled(<StatusComponentWithProps />);
    this._disposables.addUntilDestroyed(editor, statusComponentWrapper);
    return statusComponentWrapper;
  };
}
