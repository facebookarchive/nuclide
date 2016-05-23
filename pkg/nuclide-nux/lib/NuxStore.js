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

  initialize(): void {
    //TODO [rageandqq | 05-19-16]: Deserialize 'saved' NUXes
    if (this._shouldSeedNux) {
      // TODO [rageandqq | 05-19-16]: Seed with sample NUX
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
      displayPredicate: (() => document.querySelector('div.nuclide-outline-view') == null),
      completionPredicate: null,
      completed: false,
    };
    const sampleOutlineNuxTour = {
      numNuxes: 2,
      completed: false,
      id: 'outline-view-tour',
      nuxList: [nuxTriggerOutline, nuxOutlineView],
    };
    return sampleOutlineNuxTour;
  }

  addNewNux(nux: NuxTourModel) {
    this._nuxList.push(nux);
    this._emitter.emit('newNux', nux);
  }

  /**
   * Register a change handler that is invoked whenever the store changes.
   */
  onNewNux(callback: (nux: NuxTourModel) => void): IDisposable {
    return this._emitter.on('newNux', callback);
  }

  onNuxCompleted(nux: NuxTourModel): void {
    const nuxToMark = this._nuxList.find(tour => tour.id === nux.id);
    nuxToMark.completed = true;
    // TODO [rageandqq | 05-19-16]: Save 'completed' state of nux.
  }
}
