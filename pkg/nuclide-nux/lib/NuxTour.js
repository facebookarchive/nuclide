'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NuxTour = undefined;

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _NuxView;

function _load_NuxView() {
  return _NuxView = require('./NuxView');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class NuxTour {

  constructor(id, name, nuxList, trigger, gatekeeperID) {
    if (nuxList == null || nuxList.length < 1) {
      throw new Error('You must create a NuxTour with at least one NuxView element!');
    }
    this._currentStep = 0;
    this._id = id;
    this._name = name;
    this._nuxList = nuxList;
    this._trigger = trigger;
    this._gatekeeperID = gatekeeperID;

    const boundNextStep = this._nextStep.bind(this);
    nuxList.forEach(n => {
      n.setNuxCompleteCallback(boundNextStep);
    });
  }

  getGatekeeperID() {
    return this._gatekeeperID;
  }

  begin() {
    try {
      this._nuxList[0].showNux();
    } catch (err) {
      this._track(false, err.toString());
    }
  }

  /**
   * Force the NUX tour to end. Used when a package or the NUX framework is deactivated.
   *
   * @param {boolean} shouldMarkAsCompleted - Whether or not to mark the NUX as completed.
   * If marked as completed, it will not be shown again.
   * To be used when the user dismisses the NUX and doesn't want to see it again.
   */
  forceEnd(shouldMarkAsCompleted = false) {
    if (shouldMarkAsCompleted) {
      this._track(true, 'NuxTour was dismissed by the user.');
    } else {
      this._track(false, 'NuxTour was forcibly ended.');
    }
    this._nuxList[this._currentStep].dispose();
    // Skip remaining NUXes. No disposal is needed since they are lazily instantiated.
    this._onNuxComplete(shouldMarkAsCompleted);
  }

  _nextStep(stepWasSuccesful) {
    if (!stepWasSuccesful) {
      // Mark the NUX as completed, since the step was exited prematurely (skipped)
      this.forceEnd(true);
    } else if (this._currentStep < this._nuxList.length - 1) {
      this._track(true);
      try {
        this._nuxList[++this._currentStep].showNux();
      } catch (err) {
        this._track(false, err.toString());
      }
    } else {
      this._onNuxComplete();
    }
  }

  _onNuxComplete(completionSuccesful = true) {
    this._track(completionSuccesful);
    if (this._callback != null) {
      this._callback();
    }
  }

  _track(completed = false, error) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nux-tour-action', {
      tourId: this._id,
      tourName: this._name,
      step: `${this._currentStep + 1}/${this._nuxList.length + 1}`,
      completed: `${completed.toString()}`,
      error: (0, (_string || _load_string()).maybeToString)(error)
    });
  }

  setNuxCompleteCallback(callback) {
    this._callback = callback;
  }

  isReady(editor) {
    return this._trigger != null ? this._trigger.triggerCallback(editor) : true;
  }

  getTriggerType() {
    return this._trigger != null ? this._trigger.triggerType : null;
  }

  getID() {
    return this._id;
  }

  getName() {
    return this._name;
  }
}
exports.NuxTour = NuxTour;