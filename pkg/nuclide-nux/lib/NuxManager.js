'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  CompositeDisposable,
  Disposable,
  Emitter,
} from 'atom';

import passesGK from '../../commons-node/passesGK';
import {arrayCompact} from '../../commons-node/collection';

import analytics from '../../nuclide-analytics';

import {NuxStore} from './NuxStore';
import {NuxTour} from './NuxTour';
import {NuxView} from './NuxView';

import type {NuxTourModel} from './NuxModel';

export const GK_NUX = 'nuclide_all_nuxes';
// Limits the number of NUXes displayed every session
const NUX_PER_SESSION_LIMIT = 3;

export class NuxManager {
  _nuxStore: NuxStore;
  _disposables: CompositeDisposable;
  _emitter: atom$Emitter;
  _activeNuxTour: ?NuxTour;
  // Maps a NUX's unique ID to its corresponding NuxTour
  // Registered NUXes that are waiting to be triggered
  _pendingNuxes: Map<string, NuxTour>;
  // Triggered NUXes that are waiting to be displayed
  _readyToDisplayNuxes: Array<NuxTour>;
  _numNuxesDisplayed: number;

  constructor(
    nuxStore: NuxStore,
  ): void {
    this._nuxStore = nuxStore;

    this._emitter = new Emitter();
    this._disposables = new CompositeDisposable();

    this._pendingNuxes = new Map();
    this._readyToDisplayNuxes = [];
    this._activeNuxTour = null;
    this._numNuxesDisplayed = 0;

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
    this._pendingNuxes.delete(id);
    this._removeNuxFromList(this._readyToDisplayNuxes, id);
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

    const nuxViews = arrayCompact(nuxTourModel.nuxList.map(model => {
      try {
        return new NuxView(
          nuxTourModel.id,
          model.selector,
          model.selectorFunction,
          model.position,
          model.content,
          model.isCustomContent,
          model.completionPredicate,
        );
      } catch (err) {
        this._track(
          nuxTourModel.id,
          'NuxView failed to instantiate.',
          err.toString(),
        );
        return null;
      }
    }));

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
    if (this._readyToDisplayNuxes.length === 0) {
      return;
    }
    const nextNux = this._readyToDisplayNuxes.shift();
    this._emitter.emit('nuxTourReady', nextNux);
  }

  // Handles NUX registry
  _handleNewTour(value: any) {
    const {
      nuxTour,
      nuxTourModel,
    } = value;
    if (nuxTourModel.gatekeeperID != null &&
        !(passesGK(GK_NUX) && passesGK(nuxTourModel.gatekeeperID))) {
      return;
    }
    nuxTour.setNuxCompleteCallback(
        this._handleNuxCompleted.bind(this, nuxTourModel)
    );
    this._pendingNuxes.set(nuxTour.getID(), nuxTour);
  }

  // Handles triggered NUXes that are ready to be displayed
  _handleReadyTour(nuxTour: NuxTour) {
    if (this._activeNuxTour == null && this._numNuxesDisplayed < NUX_PER_SESSION_LIMIT) {
      this._numNuxesDisplayed++;
      this._activeNuxTour = nuxTour;
      nuxTour.begin();
      this._track(
        nuxTour.getID(),
        'Triggered new nux',
      );
    } else {
      this._readyToDisplayNuxes.push(nuxTour);
    }
  }

  _handleActivePaneItemChanged(paneItem: ?mixed): void {
    // The `paneItem` is not guaranteed to be an instance of `TextEditor` from
    // Atom's API, but usually is.  We return if the type is not `TextEditor`
    // since the `NuxTour.isReady` expects a `TextEditor` as its argument.
    if (!atom.workspace.isTextEditor(paneItem)) {
      return;
    }
    // Flow doesn't understand the refinement done above.
    const textEditor: atom$TextEditor = (paneItem: any);
    this._pendingNuxes.forEach((nux: NuxTour, id: string) => {
      if (nux.getTriggerType() !== 'editor' || !nux.isReady(textEditor)) {
        return;
      }
      this._pendingNuxes.delete(id);
      this._emitter.emit('nuxTourReady', nux);
    });
  }

  tryTriggerNux(id: string): void {
    const nuxToTrigger = this._pendingNuxes.get(id);
    // Silently fail if the NUX is not found or has already been completed.
    // This isn't really an "error" to log, since the NUX may be triggered quite
    // often even after it has been seen as it is tied to a package that is
    // instantiated every single time a window is opened.
    if (nuxToTrigger == null || nuxToTrigger.completed) {
      return;
    }
    // Remove from pending list
    this._pendingNuxes.delete(id);
    this._emitter.emit('nuxTourReady', nuxToTrigger);
  }

  dispose() : void {
    this._disposables.dispose();
  }

  _track(
    id: string,
    message: string,
    error: ?string = null,
  ): void {
    analytics.track(
      'nux-manager-action',
      {
        tourId: id,
        message: `${message}`,
        error: `${error}`,
      },
    );
  }
}
