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

import * as Action from './redux/Actions';
import createPackage from '../../commons-atom/createPackage';
import {Disposable} from 'atom';
import InteractiveFileChanges from './ui/InteractiveFileChanges';
import invariant from 'assert';
import {isValidTextEditor} from '../../commons-atom/text-editor';
import {Observable} from 'rxjs';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import parse from 'diffparser';
import React from 'react';
import ReactDOM from 'react-dom';
import {repositoryForPath} from '../../commons-atom/vcs';
import UniversalDisposable from '../../commons-node/UniversalDisposable';

class Activation {
  _subscriptions: UniversalDisposable;
  constructor(rawState: ?Object) {
    this._subscriptions = new UniversalDisposable();
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
    }).subscribe(renderOverEditor);

    this._subscriptions.add(subscription);
    return new Disposable(() => {
      this._subscriptions.remove(subscription);
    });
  }
}

function renderOverEditor(editor: atom$TextEditor): void {
  const diffContent = editor.getText();
  const patch = parse(diffContent);
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
    Action.registerPatchEditor(editorPath, patch);

    const element = (
      <InteractiveFileChanges
        onConfirm={() => onConfirm(editor, diffContent)}
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
      Action.deregisterPatchEditor(editorPath);
    });
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
