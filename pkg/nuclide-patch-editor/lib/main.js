/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {HgRepositoryClient} from '../../nuclide-hg-repository-client';
import type {AppState, Store} from './types';
import typeof * as BoundActionCreators from './redux/Actions';

import * as Actions from './redux/Actions';
import {bindActionCreators, createStore} from 'redux';
import {createEmptyAppState} from './redux/createEmptyAppState';
import createPackage from '../../commons-atom/createPackage';
import {Disposable} from 'atom';
import InteractiveFileChanges from './ui/InteractiveFileChanges';
import invariant from 'assert';
import {isValidTextEditor} from '../../commons-atom/text-editor';
import {Observable, BehaviorSubject} from 'rxjs';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import {parseWithAnnotations} from './utils';
import React from 'react';
import ReactDOM from 'react-dom';
import {repositoryForPath} from '../../commons-atom/vcs';
import {rootReducer} from './redux/Reducers';
import UniversalDisposable from '../../commons-node/UniversalDisposable';

class Activation {
  _store: Store;
  _subscriptions: UniversalDisposable;
  _actionCreators: BoundActionCreators;
  _states: BehaviorSubject<AppState>;

  constructor(rawState: ?Object) {
    this._subscriptions = new UniversalDisposable();

    const initialState = createEmptyAppState();
    this._states = new BehaviorSubject(initialState);

    this._store = createStore(
      rootReducer,
      initialState,
    );

    this._actionCreators = bindActionCreators(Actions, this._store.dispatch);
  }

  consumeCwdApi(cwdApi: CwdApi): IDisposable {
    const subscription = observableFromSubscribeFunction(cwdApi.observeCwd.bind(cwdApi))
    .switchMap(directory => {
      const repository = directory ? repositoryForPath(directory.getPath()) : null;
      if (repository == null || repository.getType() !== 'hg') {
        return Observable.of(false);
      }

      const hgRepository: HgRepositoryClient = (repository: any);

      return observableFromSubscribeFunction(
        hgRepository.onDidChangeInteractiveMode.bind(hgRepository),
      );
    }).switchMap(isInteractiveMode => {
      if (!isInteractiveMode) {
        return Observable.empty();
      }
      return observableFromSubscribeFunction(
        atom.workspace.observePanes.bind(atom.workspace),
      ).flatMap(pane => {
        return observableFromSubscribeFunction(pane.observeActiveItem.bind(pane))
          .switchMap(paneItem => {
            if (!isValidTextEditor(paneItem)) {
              return Observable.empty();
            }

            const editor: atom$TextEditor = (paneItem: any);

            return observableFromSubscribeFunction(editor.onDidChangePath.bind(editor))
              .startWith(editor.getPath())
              .switchMap(editorPath => {
                if (editorPath == null || !editorPath.endsWith('.diff')) {
                  return Observable.empty();
                }

                return Observable.of(editor);
              });
          }).takeUntil(observableFromSubscribeFunction(pane.onDidDestroy.bind(pane)));
      });
    }).subscribe(this._renderOverEditor.bind(this));

    this._subscriptions.add(subscription);
    return new Disposable(() => {
      this._subscriptions.remove(subscription);
    });
  }

  _renderOverEditor(editor: atom$TextEditor): void {
    const diffContent = editor.getText();
    const patch = parseWithAnnotations(diffContent);
    if (patch.length > 0) {
      // Clear the editor so that closing the tab without hitting 'Confirm' won't
      // cause the commit to go through by default
      editor.setText('');
      editor.save();
      editor.getGutters().forEach(gutter => gutter.hide());
      const editorView = atom.views.getView(editor);
      editorView.style.visibility = 'hidden';
      const item = document.createElement('div');

      const editorPath = editor.getPath();
      invariant(editorPath != null);
      this._actionCreators.registerPatchEditor(editorPath, patch);

      const element = (
        <InteractiveFileChanges
          onConfirm={content => onConfirm(editor, content)}
          onManualEdit={() => onManualEdit(editor, diffContent, marker, editorView)}
          onQuit={() => atom.workspace.getActivePane().destroyItem(editor)}
          patch={patch}
        />
      );
      ReactDOM.render(element, item);
      item.style.visibility = 'visible';

      const marker = editor.markScreenPosition([0, 0]);
      editor.decorateMarker(marker, {
        type: 'block',
        item,
      });

      marker.onDidDestroy(() => {
        ReactDOM.unmountComponentAtNode(item);
        this._actionCreators.deregisterPatchEditor(editorPath);
      });
    }
  }
}

function onConfirm(editor: atom$TextEditor, content: string): void {
  editor.setText(content);
  editor.save();
  atom.workspace.getActivePane().destroyItem(editor);
}

function onManualEdit(
  editor: atom$TextEditor,
  content: string,
  marker: atom$Marker,
  editorView: atom$TextEditorElement,
): void {
  editor.setText(content);
  editor.save();
  editor.setGrammar(atom.grammars.grammarForScopeName('source.mercurial.diff'));
  marker.destroy();
  editorView.style.visibility = 'visible';
  editor.getGutters().forEach(gutter => gutter.show());
}

createPackage(module.exports, Activation);
