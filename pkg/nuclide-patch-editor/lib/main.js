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

import createPackage from '../../commons-atom/createPackage';
import InteractiveFileChanges from './ui/InteractiveFileChanges';
import {isValidTextEditor} from '../../commons-atom/text-editor';
import {Observable} from 'rxjs';
import {observableFromSubscribeFunction} from '../../commons-node/event';
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
    return new UniversalDisposable(() => {
      this._subscriptions.remove(subscription);
    });
  }
}

function renderOverEditor(editor: atom$TextEditor): void {
  const element = <InteractiveFileChanges diffContent={editor.getText()} />;

  // Clear the editor so that closing the tab without changing anything won't
  // cause the commit to go through by default
  editor.setText('');
  editor.save();
  editor.getGutters().forEach(gutter => gutter.hide());
  atom.views.getView(editor).style.visibility = 'hidden';

  const item = document.createElement('div');
  ReactDOM.render(element, item);
  item.style.visibility = 'visible';

  const marker = editor.markScreenPosition([0, 0]);
  marker.onDidDestroy(() => {
    ReactDOM.unmountComponentAtNode(item);
  });
  editor.decorateMarker(marker, {
    type: 'block',
    item,
  });
}

createPackage(module.exports, Activation);
