'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import {
  CompositeDisposable,
  Disposable,
  Emitter,
  TextEditor,
} from 'atom';
import passesGK from '../../commons-node/passesGK';

import {NuxStore} from './NuxStore';
import {NuxTour} from './NuxTour';
import {NuxView} from './NuxView';

import type {NuxTourModel} from './NuxModel';

const GK_NUX_OUTLINE_VIEW = 'nuclide_outline_view_nux';

export class NuxManager {
  _nuxStore: NuxStore;
  _disposables: CompositeDisposable;
  _emitter: atom$Emitter;
  _activeNuxTour: ?NuxTour;
  // Registered NUXes that are waiting to be triggered
  _pendingNuxList: Array<NuxTour>;
  // Triggered NUXes that are waiting to be displayed
  _readyToDisplayNuxList: Array<NuxTour>;

  constructor(
    nuxStore: NuxStore,
  ): void {
    this._nuxStore = nuxStore;

    this._emitter = new Emitter();
    this._disposables = new CompositeDisposable();

    this._pendingNuxList = [];
    this._readyToDisplayNuxList = [];
    this._activeNuxTour = null;

    this._emitter.on('newTour', this._handleNewTour.bind(this));
    this._emitter.on('nuxTourReady', this._handleReadyTour.bind(this));

    this._disposables.add(this._nuxStore.onNewNux(this._handleNewNux.bind(this)));
    this._disposables.add(
      atom.workspace.onDidStopChangingActivePaneItem(
        this._handleActivePaneItemChanged.bind(this)
      ),
    );

    this._nuxStore.initialize();
  }

  // Routes new NUX through the NuxStore so that the store can deal with
  // registering of previously completed or existing NUXes.
  addNewNux(nux: NuxTourModel): Disposable {
    this._nuxStore.addNewNux(nux);
    return new Disposable(() => {
      this._removeNux(nux.id);
    });
  }

  _removeNux(id: string): void {
    if (this._activeNuxTour != null && this._activeNuxTour.getID() === id) {
      this._activeNuxTour.forceEnd();
      return;
    }
    this._removeNuxFromList(this._pendingNuxList, id);
    this._removeNuxFromList(this._readyToDisplayNuxList, id);
  }

  _removeNuxFromList(
    list: Array<NuxTour>,
    id: string,
  ): void {
    for (let i = 0; i < list.length; i++) {
      if (list[i].getID() === id) {
        list.splice(i--, 1);
        return;
      }
    }
  }

  // Handles new NUXes emitted from the store
  _handleNewNux(nuxTourModel: NuxTourModel): void {
    if (nuxTourModel.completed) {
      return;
    }

    const nuxViews = nuxTourModel.nuxList.map(model =>
      new NuxView(
        model.selector,
        model.selectorFunction,
        model.position,
        model.content,
        model.isCustomContent,
        model.displayPredicate,
        model.completionPredicate,
      )
    );

    const nuxTour = new NuxTour(
      nuxTourModel.id,
      nuxViews,
      nuxTourModel.trigger,
    );

    this._emitter.emit(
      'newTour',
      {
        nuxTour,
        nuxTourModel,
      },
    );
  }

  _handleNuxCompleted(nuxTourModel: NuxTourModel): void {
    this._activeNuxTour = null;
    this._nuxStore.onNuxCompleted(nuxTourModel);
    if (this._readyToDisplayNuxList.length === 0) {
      return;
    }
    const nextNux = this._readyToDisplayNuxList.shift();
    this._emitter.emit('nuxTourReady', nextNux);
  }

  // Handles NUX registry
  _handleNewTour(value: any) {
    const {
      nuxTour,
      nuxTourModel,
    } = value;
    if (!passesGK(GK_NUX_OUTLINE_VIEW)) {
      return;
    }
    nuxTour.setNuxCompleteCallback(
        this._handleNuxCompleted.bind(this, nuxTourModel)
    );
    this._pendingNuxList.push(nuxTour);
  }

  // Handles triggered NUXes that are ready to be displayed
  _handleReadyTour(nuxTour: NuxTour) {
    if (this._activeNuxTour == null) {
      this._activeNuxTour = nuxTour;
      nuxTour.begin();
    } else {
      this._readyToDisplayNuxList.push(nuxTour);
    }
  }

  _handleActivePaneItemChanged(paneItem: ?mixed): void {
    // The `paneItem` is not guaranteed to be an instance of `TextEditor` from
    // Atom's API, but usually is.  We return if the type is not `TextEditor`
    // since the `NuxTour.isReady` expects a `TextEditor` as its argument.
    if (paneItem == null || !(paneItem instanceof TextEditor)) {
      return;
    }
    invariant(paneItem instanceof TextEditor);
    for (let i = 0; i < this._pendingNuxList.length; i++) {
      const nuxToCheck = this._pendingNuxList[i];
      if (nuxToCheck.getTriggerType() !== 'editor' ||
          !nuxToCheck.isReady(paneItem)) {
        continue;
      }
      this._pendingNuxList.splice(i--, 1);
      this._emitter.emit('nuxTourReady', nuxToCheck);
    }
  }

  tryTriggerNux(id: string): void {
    const nuxToTrigger = this._pendingNuxList.find(nux => nux.getID() === id);
    if (nuxToTrigger == null) {
      throw new Error('Please enter a valid ID of a registered NUX.');
    }
    if (nuxToTrigger.completed) {
      //TODO [ @rageandqq | 05-27-16 ]: Inform the package more gracefully
      throw new Error('You cannot trigger a NUX that has already been viewed!');
    }
    // Remove from pending list
    this._removeNuxFromList(this._pendingNuxList, id);
    this._emitter.emit('nuxTourReady', nuxToTrigger);
  }

  dispose() : void {
    this._disposables.dispose();
  }
}
