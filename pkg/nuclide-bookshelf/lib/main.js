'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  Action,
  BookShelfState,
  SerializedBookShelfState,
} from './types';

import {accumulateState} from './accumulateState';
import {
  ActiveShortHeadChangeBehavior,
  ACTIVE_SHORTHEAD_CHANGE_BEHAVIOR_CONFIG,
} from './constants';
import {arrayCompact} from '../../commons-node/collection';
import {applyActionMiddleware} from './applyActionMiddleware';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Commands} from './Commands';
import {Disposable, CompositeDisposable} from 'atom';
import createPackage from '../../commons-atom/createPackage';
import {
  deserializeBookShelfState,
  getEmptBookShelfState,
  serializeBookShelfState,
} from './utils';
import {diffSets} from '../../commons-node/stream';
import {getLogger} from '../../nuclide-logging';
import featureConfig from '../../commons-atom/featureConfig';
import invariant from 'assert';
import {DisposableSubscription} from '../../commons-node/stream';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import {
  shortHeadChangedNotification,
  getShortHeadChangesFromStateStream,
} from './utils';
import {track} from '../../nuclide-analytics';

function createStateStream(
  actions: Observable<Action>,
  initialState: BookShelfState,
): BehaviorSubject<BookShelfState> {
  const states = new BehaviorSubject(initialState);
  actions.scan(accumulateState, initialState).subscribe(states);
  return states;
}

class Activation {
  _disposables: CompositeDisposable;
  _states: BehaviorSubject<BookShelfState>;
  _commands: Commands;

  constructor(state: ?SerializedBookShelfState) {
    let initialState;
    try {
      initialState = deserializeBookShelfState(state);
    } catch (error) {
      getLogger().error('failed to deserialize nuclide-bookshelf state', state, error);
      initialState = getEmptBookShelfState();
    }

    const actions = new Subject();
    const states = this._states = createStateStream(
      applyActionMiddleware(actions, () => this._states.getValue()),
      initialState,
    );

    const dispatch = action => { actions.next(action); };
    const commands = new Commands(dispatch, () => states.getValue());

    function getProjectRepositories() {
      return new Set(
        arrayCompact(atom.project.getRepositories())
          .filter(repository => repository.getType() === 'hg'),
      );
    }

    const currentRepositories =
      observableFromSubscribeFunction(atom.project.onDidChangePaths.bind(atom.project))
      .startWith(null)
      .map(() => getProjectRepositories());

    const repoDiffsSubscription = diffSets(currentRepositories)
      .subscribe(repoDiff => {
        Array.from(repoDiff.added).forEach(commands.addProjectRepository);
      });

    const paneStateChangeSubscription = Observable.merge(
      observableFromSubscribeFunction(
        atom.workspace.onDidAddPaneItem.bind(atom.workspace),
      ),
      observableFromSubscribeFunction(
        atom.workspace.onDidDestroyPaneItem.bind(atom.workspace),
      ),
    ).subscribe(() => {
      commands.updatePaneItemState();
    });

    const shortHeadChangeSubscription = getShortHeadChangesFromStateStream(states)
      .switchMap(({repositoryPath, activeShortHead}) => {
        const repository = atom.project.getRepositories().filter(repo => {
          return repo != null && repo.getWorkingDirectory() === repositoryPath;
        })[0];
        invariant(repository != null, 'shortHead changed on a non-existing repository!');

        switch (featureConfig.get(ACTIVE_SHORTHEAD_CHANGE_BEHAVIOR_CONFIG)) {
          case ActiveShortHeadChangeBehavior.ALWAYS_IGNORE:
            track('bookshelf-always-ignore');
            return Observable.empty();
          case ActiveShortHeadChangeBehavior.ALWAYS_RESTORE:
            track('bookshelf-always-restore');
            // The restore needs to wait for the change shorthead state update to complete
            // before triggering a cascaded state update when handling the restore action.
            // TODO(most): move away from `nextTick`.
            process.nextTick(() => {
              commands.restorePaneItemState(repository, activeShortHead);
            });
            return Observable.empty();
          default: // Including ActiveShortHeadChangeBehavior.PROMPT_TO_RESTORE
            track('bookshelf-prompt-restore');
            return shortHeadChangedNotification(
              repository,
              activeShortHead,
              commands.restorePaneItemState,
            );
        }
      }).subscribe();

    this._disposables = new CompositeDisposable(
      new Disposable(actions.complete.bind(actions)),
      new DisposableSubscription(repoDiffsSubscription),
      new DisposableSubscription(paneStateChangeSubscription),
      new DisposableSubscription(shortHeadChangeSubscription),
    );
  }

  dispose() {
    this._disposables.dispose();
  }

  serialize(): ?SerializedBookShelfState {
    try {
      return serializeBookShelfState(this._states.getValue());
    } catch (error) {
      getLogger().error('failed to serialize nuclide-bookshelf state', error);
      return null;
    }
  }
}

export default createPackage(Activation);
