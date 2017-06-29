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

import type {WorkspaceViewsService} from 'nuclide-commons-atom/workspace-views-compat';

import ActiveEditorRegistry from 'nuclide-commons-atom/ActiveEditorRegistry';
import {observeActivePaneItemDebounced} from 'nuclide-commons-atom/debounced';
import {isValidTextEditor} from 'nuclide-commons-atom/text-editor';
import createPackage from 'nuclide-commons-atom/createPackage';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import analytics from 'nuclide-commons-atom/analytics';
import {consumeWorkspaceViewsCompat} from 'nuclide-commons-atom/workspace-views-compat';

import {OutlineViewPanelState, WORKSPACE_VIEW_URI} from './OutlineViewPanel';
import {createOutlines} from './createOutlines';
import {Observable} from 'rxjs';

import type {Outline, OutlineProvider, ResultsStreamProvider} from './types';

class Activation {
  _disposables: UniversalDisposable;

  _editorService: ActiveEditorRegistry<OutlineProvider, ?Outline>;

  constructor() {
    this._disposables = new UniversalDisposable();
    this._disposables.add(
      consumeWorkspaceViewsCompat(service =>
        this.consumeWorkspaceViewsService(service),
      ),
    );

    this._editorService = new ActiveEditorRegistry(
      (provider, editor) => {
        analytics.track('nuclide-outline-view-getoutline');
        return provider.getOutline(editor);
      },
      {},
      getActiveEditorRegistryEventSources(),
    );
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeOutlineProvider(provider: OutlineProvider): IDisposable {
    return this._editorService.consumeProvider(provider);
  }

  consumeToolBar(getToolBar: toolbar$GetToolbar): IDisposable {
    const toolBar = getToolBar('nuclide-outline-view');
    const {element} = toolBar.addButton({
      icon: 'list-unordered',
      callback: 'nuclide-outline-view:toggle',
      tooltip: 'Toggle Outline View',
      priority: 200,
    });
    // Class added is not defined elsewhere, and is just used to mark the toolbar button
    element.classList.add('nuclide-outline-view-toolbar-button');
    const disposable = new UniversalDisposable(() => {
      toolBar.removeItems();
    });
    this._disposables.add(disposable);
    return disposable;
  }

  _createOutlineViewPanelState(): OutlineViewPanelState {
    analytics.track('nuclide-outline-view-show');
    return new OutlineViewPanelState(createOutlines(this._editorService));
  }

  consumeWorkspaceViewsService(api: WorkspaceViewsService): IDisposable {
    const commandDisposable = atom.commands.add(
      'atom-workspace',
      'outline-view:toggle',
      event => {
        api.toggle(WORKSPACE_VIEW_URI, (event: any).detail);
      },
    );
    this._disposables.add(
      api.addOpener(uri => {
        if (uri === WORKSPACE_VIEW_URI) {
          return this._createOutlineViewPanelState();
        }
      }),
      () => api.destroyWhere(item => item instanceof OutlineViewPanelState),
      commandDisposable,
    );
    return commandDisposable;
  }

  deserializeOutlineViewPanelState(): OutlineViewPanelState {
    return this._createOutlineViewPanelState();
  }

  getOutlineViewResultsStream(): ResultsStreamProvider {
    return {
      getResultsStream: () => this._editorService.getResultsStream(),
    };
  }
}

createPackage(module.exports, Activation);

// TODO this can be removed once we no longer want to support versions of Atom less than 1.17.0
// (D4973408)
function getActiveEditorRegistryEventSources() {
  return {
    activeEditors: observeActivePaneItemDebounced()
      .switchMap(item => {
        if (isValidTextEditor(item)) {
          // Flow cannot understand the type refinement provided by the isValidTextEditor function,
          // so we have to cast.
          return Observable.of(((item: any): atom$TextEditor));
        } else if (item instanceof OutlineViewPanelState) {
          // Ignore switching to the outline view.
          return Observable.empty();
        }
        return Observable.of(null);
      })
      .distinctUntilChanged(),
  };
}
