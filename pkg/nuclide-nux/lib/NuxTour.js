'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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
    if (nuxList == null || nuxList.length < 2) {
      throw new Error('You must create a NuxTour with at least two NuxView elements!');
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
    }
  }

  _nextStep(): void {
    if (this._currentStep < this._nuxList.length - 1) {
      try {
        this._nuxList[++this._currentStep].showNux();
      } catch (e) {
      }
    } else {
      this._onNuxComplete();
    }
  }

  _onNuxComplete() : void {
    if (this._callback != null) {
      this._callback();
    }
  }
}
