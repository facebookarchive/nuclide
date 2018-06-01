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

import type {WelcomePage, Store} from './types';

import {goToLocation} from 'nuclide-commons-atom/go-to-location';
import * as React from 'react';
import createPackage from 'nuclide-commons-atom/createPackage';
import {destroyItemWhere} from 'nuclide-commons-atom/destroyItemWhere';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {createStore} from 'redux';
import {viewableFromReactElement} from '../../commons-atom/viewableFromReactElement';
import {createEmptyAppState} from './redux/createEmptyAppState';
import rootReducer from './redux/rootReducer';
import {WELCOME_PAGE_VIEW_URI} from './ui/WelcomePageGadget';
import WelcomePageGadget from './ui/WelcomePageGadget';

export type {WelcomePage};

const SHOW_COMMAND_NAME = 'nuclide-welcome-page:show-welcome-page';

class Activation {
  _disposables: UniversalDisposable;
  _activeWelcomePages: Map<string, WelcomePage>;
  _store: Store;

  constructor() {
    this._activeWelcomePages = new Map();
    this._store = createStore(rootReducer, createEmptyAppState());
    this._disposables = new UniversalDisposable(
      () => this._activeWelcomePages.clear(),
      this._registerDisplayCommandAndOpener(),
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }

  consumeWelcomePage(welcomePage: WelcomePage): IDisposable {
    const topic = welcomePage.topic;
    this._activeWelcomePages.set(topic, welcomePage);
    return new UniversalDisposable(() => {
      this._activeWelcomePages.delete(topic);
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
        goToLocation(WELCOME_PAGE_VIEW_URI);
      }),
    );
  }

  // TODO: is there a better place to put this?
  _createWelcomePageViewable(): atom$Pane {
    return viewableFromReactElement(<WelcomePageGadget store={this._store} />);
  }
}

createPackage(module.exports, Activation);
