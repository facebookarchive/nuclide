'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import analytics from '../../nuclide-analytics';
import {NuxView} from './NuxView';

export class NuxTour {
  _nuxList : Array<NuxView>;
  _callback: ?(() => void);
  _currentStep: number;
  _id: string;

  constructor(
    id: string,
    nuxList : ?(Array<NuxView>),
  ): void {
    if (nuxList == null || nuxList.length < 1) {
      throw new Error('You must create a NuxTour with at least one NuxView element!');
    }
    this._currentStep = 0;
    this._id = id;
    this._nuxList = nuxList;

    const boundNextStep = this._nextStep.bind(this);
    nuxList.forEach(n => { n.setNuxCompleteCallback(boundNextStep); });
  }

  begin(): void {
    try {
      this._nuxList[0].showNux();
    } catch (e) {
      this._track(false, e.toString());
    }
  }

  _nextStep(): void {
    if (this._currentStep < this._nuxList.length - 1) {
      this._track(true);
      try {
        this._nuxList[++this._currentStep].showNux();
      } catch (e) {
        this._track(false, e.toString());
      }
    } else {
      this._onNuxComplete();
    }
  }

  _onNuxComplete() : void {
    this._track(true);
    if (this._callback != null) {
      this._callback();
    }
  }

  _track(
    completed: boolean = false,
    error: ?string,
  ) : void {
    analytics.track(
      'nux-tour-action',
      {
        tourId: this._id,
        step: `${this._currentStep + 1}/${this._nuxList.length + 1}`,
        completed: `${completed}`,
        error: `${error}`,
      },
    );
  }

  setNuxCompleteCallback(callback: (() => void)): void {
    this._callback = callback;
  }
}
