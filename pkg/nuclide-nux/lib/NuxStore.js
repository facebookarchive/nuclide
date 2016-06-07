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

import type {
  NuxStateModel,
  NuxTourModel,
} from './NuxModel';

import {
  NUX_SAVED_STORE,
  NUX_SAMPLE_OUTLINE_VIEW_TOUR,
} from './main';

export class NuxStore {
  _emitter: atom$Emitter;
  _shouldSeedNux: boolean;
  _nuxList: Array<NuxStateModel>;

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
    // TODO [ @rageandqq | 05-25-16 ]: Replace with `IndexedDB` since `localStorage` is blocking
    this._nuxList = JSON.parse(window.localStorage.getItem(NUX_SAVED_STORE)) || [];
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
      position: 'auto',
      displayPredicate: null,
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

    const isJavaScriptFile = editor => {
      if (editor == null) {
        return false;
      }
      const path = editor.getPath();
      if (path == null) {
        return false;
      }
      return path.endsWith('.js');
    };
    const nuxTriggerModel = {
      triggerType: 'editor',
      triggerCallback: isJavaScriptFile,
    };

    const sampleOutlineNuxTour = {
      completed: false,
      id: NUX_SAMPLE_OUTLINE_VIEW_TOUR,
      nuxList: [nuxTriggerOutline, nuxOutlineView],
      trigger: nuxTriggerModel,
    };

    return sampleOutlineNuxTour;
  }

  addNewNux(nux: NuxTourModel) {
    const nuxState = this._nuxList.find(n => n.id === nux.id);
    if (nuxState != null && nuxState.completed) {
      return;
    }
    this._nuxList.push({
      id: nux.id,
      completed: false,
    });
    this._emitter.emit('newNux', nux);
  }

  serialize(): void {
    this._saveNuxState();
  }

  _saveNuxState(): void {
    // TODO [ @rageandqq | 05-25-16 ]: Replace with `IndexedDB` since `localStorage` is blocking
    window.localStorage.setItem(
      NUX_SAVED_STORE,
      JSON.stringify(this._nuxList),
    );
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
    nuxToMark.completed = true;
    this._saveNuxState();
  }
}
