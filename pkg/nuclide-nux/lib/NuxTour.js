'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  NuxTriggerModel,
  NuxTriggerType,
} from './NuxModel';

import analytics from '../../nuclide-analytics';
import {NuxView} from './NuxView';

export class NuxTour {
  _nuxList : Array<NuxView>;
  _callback: ?(() => void);
  _currentStep: number;
  _id: string;
  _trigger: ?NuxTriggerModel;

  constructor(
    id: string,
    nuxList : ?(Array<NuxView>),
    trigger: ?NuxTriggerModel,
  ): void {
    if (nuxList == null || nuxList.length < 1) {
      throw new Error('You must create a NuxTour with at least one NuxView element!');
    }
    this._currentStep = 0;
    this._id = id;
    this._nuxList = nuxList;
    this._trigger = trigger;

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

  /**
   * Force the NUX tour to end. Used when a package or the NUX framework is deactivated.
   *
   * @param {boolean} shouldMarkAsCompleted - Whether or not to mark the NUX as completed.
   * If marked as completed, it will not be shown again.
   * To be used when the user dismisses the NUX and doesn't want to see it again.
   */
  forceEnd(
    shouldMarkAsCompleted: boolean = false,
  ): void {
    if (shouldMarkAsCompleted) {
      this._track(true, 'NuxTour was dismissed by the user.');
    } else {
      this._track(false, 'NuxTour was forcibly ended.');
    }
    this._nuxList[this._currentStep].dispose();
    // Skip remaining NUXes. No disposal is needed since they are lazily instantiated.
    this._onNuxComplete(shouldMarkAsCompleted);
  }

  _nextStep(
    stepWasSuccesful: boolean,
  ): void {
    if (!stepWasSuccesful) {
      // Mark the NUX as completed, since the step was exited prematurely (skipped)
      this.forceEnd(true);
    } else if (this._currentStep < this._nuxList.length - 1) {
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

  _onNuxComplete(
    completionSuccesful: boolean = true,
  ): void {
    this._track(completionSuccesful);
    if (this._callback != null) {
      this._callback();
    }
  }

  _track(
    completed: boolean = false,
    error: ?string,
  ): void {
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

  isReady(editor: atom$TextEditor): boolean {
    return this._trigger != null ? this._trigger.triggerCallback(editor) : true;
  }

  getTriggerType(): NuxTriggerType {
    return this._trigger != null ? this._trigger.triggerType : null;
  }

  getID(): string {
    return this._id;
  }
}
