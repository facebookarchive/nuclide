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
  NuxTourModel,
} from './NuxModel';

const NUX_NAMESPACE = 'nuclide-nux';
export const NUX_SAVED_STORE = `${NUX_NAMESPACE}.saved-nux-data-store`;
export const NUX_SAMPLE_OUTLINE_VIEW_TOUR = `${NUX_NAMESPACE}.outline-view-tour`;

export class NuxStore {
  _emitter: atom$Emitter;
  _shouldSeedNux: boolean;
  // Maps a Nux's unique ID to the boolean representing its viewed state
  _nuxMap: Map<string, boolean>;

  constructor(
    shouldSeedNux: boolean = false,
  ): void {
    this._shouldSeedNux = shouldSeedNux;

    this._nuxMap = new Map();
    this._emitter = new Emitter();
  }

  dispose(): void {
    this._emitter.dispose();
  }

  // Tries to load saved NUXes.
  // If none exist, will attempt to seed a NUX iff `_seedNux` is true.
  initialize(): void {
    // TODO [ @rageandqq | 05-25-16 ]: Replace with `IndexedDB` since `localStorage` is blocking
    this._nuxMap = new Map(
      JSON.parse(window.localStorage.getItem(NUX_SAVED_STORE))
    );
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
    const nuxState = this._nuxMap.get(nux.id);
    if (nuxState) {
      return;
    }
    this._nuxMap.set(
      nux.id,
      false,
    );
    this._emitter.emit('newNux', nux);
  }

  serialize(): void {
    this._saveNuxState();
  }

  _saveNuxState(): void {
    // TODO [ @rageandqq | 05-25-16 ]: Replace with `IndexedDB` since `localStorage` is blocking
    window.localStorage.setItem(
      NUX_SAVED_STORE,
      // $FlowIgnore -- Flow thinks the spread operator is incompatible with Maps
      JSON.stringify([...this._nuxMap]),
    );
  }

  /**
   * Register a change handler that is invoked whenever the store changes.
   */
  onNewNux(callback: (nux: NuxTourModel) => void): IDisposable {
    return this._emitter.on('newNux', callback);
  }

  onNuxCompleted(nuxModel: NuxTourModel): void {
    if (!this._nuxMap.has(nuxModel.id)) {
      return;
    }
    this._nuxMap.set(
      nuxModel.id,
      /* completed */ true,
    );
    this._saveNuxState();
  }
}
