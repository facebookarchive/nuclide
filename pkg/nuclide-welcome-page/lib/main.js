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

import type {
  WelcomePage,
  SerializedState,
  Store,
  WelcomePageApi,
} from './types';

import {goToLocation} from 'nuclide-commons-atom/go-to-location';
import * as React from 'react';
import createPackage from 'nuclide-commons-atom/createPackage';
import {destroyItemWhere} from 'nuclide-commons-atom/destroyItemWhere';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {createStore} from 'redux';
import {viewableFromReactElement} from '../../commons-atom/viewableFromReactElement';
import * as Actions from './redux/Actions';
import {createEmptyAppState} from './redux/createEmptyAppState';
import rootReducer from './redux/rootReducer';
import {WELCOME_PAGE_VIEW_URI} from './ui/WelcomePageGadget';
import WelcomePageGadget from './ui/WelcomePageGadget';

export type {WelcomePage, WelcomePageApi};

const SHOW_COMMAND_NAME = 'nuclide-welcome-page:show-welcome-page';
const SHOW_ALL_COMMAND_NAME = 'nuclide-welcome-page:show-all-welcome-pages';

class Activation {
  _disposables: UniversalDisposable;
  _store: Store;

  constructor(serializedState: ?SerializedState) {
    this._store = createStore(
      rootReducer,
      createEmptyAppState(serializedState),
    );
    this._disposables = new UniversalDisposable(
      this._registerDisplayCommandAndOpener(),
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }

  consumeWelcomePage(welcomePage: WelcomePage): IDisposable {
    this._store.dispatch(Actions.addWelcomePage(welcomePage));
    return new UniversalDisposable(() => {
      this._store.dispatch(Actions.deleteWelcomePage(welcomePage.topic));
    });
  }

  _registerDisplayCommandAndOpener(): IDisposable {
    return new UniversalDisposable(
      atom.workspace.addOpener(uri => {
        if (uri === WELCOME_PAGE_VIEW_URI) {
          return this._createWelcomePageViewable();
        }
      }),
      () => destroyItemWhere(item => item instanceof WelcomePageGadget),
      atom.commands.add('atom-workspace', SHOW_COMMAND_NAME, () => {
        if (this._hasWelcomePagesToShow()) {
          goToLocation(WELCOME_PAGE_VIEW_URI);
        }
      }),
      atom.commands.add('atom-workspace', SHOW_ALL_COMMAND_NAME, () => {
        this._store.dispatch(Actions.setShowAll());
        atom.workspace.toggle(WELCOME_PAGE_VIEW_URI);
      }),
    );
  }

  // TODO: is there a better place to put this?
  _createWelcomePageViewable(): atom$Pane {
    return viewableFromReactElement(<WelcomePageGadget store={this._store} />);
  }

  _hasWelcomePagesToShow(): boolean {
    const {welcomePages, hiddenTopics} = this._store.getState();
    for (const topic of welcomePages.keys()) {
      if (!hiddenTopics.has(topic)) {
        // if any topic is not hidden
        return true;
      }
    }
    return false;
  }

  provideWelcomePageApi(): WelcomePageApi {
    return this;
  }

  showPageForTopic(topic: string): void {
    const {welcomePages, hiddenTopics} = this._store.getState();
    if (welcomePages.has(topic) && !hiddenTopics.has(topic)) {
      // if the topic exists and isn't hidden
      this._store.dispatch(Actions.setShowOne(topic));
      atom.workspace.toggle(WELCOME_PAGE_VIEW_URI);
    }
  }

  serialize(): SerializedState {
    return {
      hiddenTopics: Array.from(this._store.getState().hiddenTopics),
    };
  }
}

createPackage(module.exports, Activation);
