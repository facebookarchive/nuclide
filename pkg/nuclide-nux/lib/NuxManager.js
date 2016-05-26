'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable, Emitter} from 'atom';
import passesGK from '../../commons-node/passesGK';

import {NuxStore} from './NuxStore';
import {NuxTour} from './NuxTour';
import {NuxView} from './NuxView';
import {NUX_SAMPLE_OUTLINE_VIEW_TOUR} from './main';

import type {NuxTourModel} from './NuxModel';

const GK_NUX_OUTLINE_VIEW = 'nuclide_outline_view_nux';

export class NuxManager {
  _nuxStore: NuxStore;
  _disposables: CompositeDisposable;
  _emitter: atom$Emitter;
  _nuxTours: Array<NuxTour>;

  constructor(
    nuxStore: NuxStore,
  ): void {
    this._nuxStore = nuxStore;

    this._emitter = new Emitter();
    this._disposables = new CompositeDisposable();
    this._nuxTours = [];

    this._emitter.on('newTour', this._handleNewTour.bind(this));
    this._disposables.add(this._nuxStore.onNewNux(this._handleNewNux.bind(this)));
    this._nuxStore.initialize();
  }

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

    const nuxTour = new NuxTour(nuxTourModel.id, nuxViews);
    this._nuxTours.push(nuxTour);

    this._emitter.emit(
      'newTour',
      {
        nuxTour,
        nuxTourModel,
      },
    );
  }

  _handleNewTour(value: any) {
    const {
      nuxTour,
      nuxTourModel,
    } = value;
    if (nuxTourModel.id === NUX_SAMPLE_OUTLINE_VIEW_TOUR && passesGK(GK_NUX_OUTLINE_VIEW)) {
      nuxTour.setNuxCompleteCallback(
        this._nuxStore.onNuxCompleted.bind(this._nuxStore, nuxTourModel)
      );
      nuxTour.begin();
    }
  }

  dispose() : void {
    this._disposables.dispose();
  }
}
