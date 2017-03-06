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
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import {Observable} from 'rxjs';
import {isValidTextEditor} from '../../commons-atom/text-editor';
import {repositoryForPath} from '../../commons-atom/vcs';

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
    }).subscribe(editor => {
      editor.setGrammar(atom.grammars.grammarForScopeName('source.mercurial.diff'));
    });

    this._subscriptions.add(subscription);
    return new UniversalDisposable(() => {
      this._subscriptions.remove(subscription);
    });
  }
}

createPackage(module.exports, Activation);
