'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Emitter} from 'atom';

import type {NuxTourModel} from './NuxModel';
import featureConfig from '../../nuclide-feature-config';

import {
  NUX_SAVED_STORE,
  NUX_SAMPLE_OUTLINE_VIEW_TOUR,
} from './main';

export class NuxStore {
  _emitter: atom$Emitter;
  _shouldSeedNux: boolean;
  _nuxList: Array<NuxTourModel>;

  constructor(
    shouldSeedNux: boolean = false,
  ): void {
    this._shouldSeedNux = shouldSeedNux;

    this._nuxList = [];
    this._emitter = new Emitter();
  }

  dispose(): void {
    this._emitter.dispose();
  }

  // Tries to load saved NUXes.
  // If none exist, will attempt to seed a NUX iff `_seedNux` is true.
  initialize(): void {
    const serializedNuxes = featureConfig.get(NUX_SAVED_STORE);
    if (Array.isArray(serializedNuxes)) {
      serializedNuxes.forEach((nux: NuxTourModel) => { this.addNewNux(nux); });
      return;
    }
    if (this._shouldSeedNux) {
      this.addNewNux(this._createSampleNux());
    }
  }

  _createSampleNux(): NuxTourModel {
    const nuxTriggerOutline = {
      content: 'Check out the new Outline View!',
      isCustomContent: false,
      selector: '.icon-list-unordered',
      selectorFunction: null,
      position: 'right',
      displayPredicate: (() => document.querySelector('div.nuclide-outline-view') == null),
      completionPredicate: (() => document.querySelector('div.nuclide-outline-view') != null),
      completed: false,
    };
    const nuxOutlineView = {
      content: 'Click on a symbol to jump to its definition.',
      isCustomContent: false,
      selector: 'div.pane-item.nuclide-outline-view',
      selectorFunction: null,
      position: 'left',
      displayPredicate: (() => document.querySelector('div.nuclide-outline-view') != null),
      completionPredicate: null,
      completed: false,
    };
    const sampleOutlineNuxTour = {
      numNuxes: 2,
      completed: false,
      id: NUX_SAMPLE_OUTLINE_VIEW_TOUR,
      nuxList: [nuxTriggerOutline, nuxOutlineView],
    };
    return sampleOutlineNuxTour;
  }

  addNewNux(nux: NuxTourModel) {
    this._nuxList.push(nux);
    this._emitter.emit('newNux', nux);
  }

  serialize(): void {
    this._saveNuxState();
  }

  _saveNuxState(): void {
    featureConfig.set(NUX_SAVED_STORE, this._nuxList);
  }

  /**
   * Register a change handler that is invoked whenever the store changes.
   */
  onNewNux(callback: (nux: NuxTourModel) => void): IDisposable {
    return this._emitter.on('newNux', callback);
  }

  onNuxCompleted(nuxModel: NuxTourModel): void {
    const nuxToMark = this._nuxList.find(tour => tour.id === nuxModel.id);
    if (nuxToMark == null) {
      return;
    }
    nuxToMark.nuxList.forEach(nux => { nux.completed = true; });
    for (let i = 0; i < nuxToMark.nuxList.length; i++) {
      // It's possible that some NuxViews were skipped, and thus not completed.
      // This can be used for internal tracking and logging more useful data.
      nuxToMark.nuxList[i].completed = nuxModel.nuxList[i].completed;
    }
    nuxToMark.completed = true;
    this._saveNuxState();
  }
}
