Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = _interopRequireDefault(require('../../nuclide-analytics'));
}

var _commonsNodeString2;

function _commonsNodeString() {
  return _commonsNodeString2 = require('../../commons-node/string');
}

var _NuxView2;

function _NuxView() {
  return _NuxView2 = require('./NuxView');
}

var NuxTour = (function () {
  function NuxTour(id, nuxList, trigger) {
    _classCallCheck(this, NuxTour);

    if (nuxList == null || nuxList.length < 1) {
      throw new Error('You must create a NuxTour with at least one NuxView element!');
    }
    this._currentStep = 0;
    this._id = id;
    this._nuxList = nuxList;
    this._trigger = trigger;

    var boundNextStep = this._nextStep.bind(this);
    nuxList.forEach(function (n) {
      n.setNuxCompleteCallback(boundNextStep);
    });
  }

  _createClass(NuxTour, [{
    key: 'begin',
    value: function begin() {
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
  }, {
    key: 'forceEnd',
    value: function forceEnd() {
      var shouldMarkAsCompleted = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      if (shouldMarkAsCompleted) {
        this._track(true, 'NuxTour was dismissed by the user.');
      } else {
        this._track(false, 'NuxTour was forcibly ended.');
      }
      this._nuxList[this._currentStep].dispose();
      // Skip remaining NUXes. No disposal is needed since they are lazily instantiated.
      this._onNuxComplete(shouldMarkAsCompleted);
    }
  }, {
    key: '_nextStep',
    value: function _nextStep(stepWasSuccesful) {
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
  }, {
    key: '_onNuxComplete',
    value: function _onNuxComplete() {
      var completionSuccesful = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      this._track(completionSuccesful);
      if (this._callback != null) {
        this._callback();
      }
    }
  }, {
    key: '_track',
    value: function _track(completed, error) {
      if (completed === undefined) completed = false;

      (_nuclideAnalytics2 || _nuclideAnalytics()).default.track('nux-tour-action', {
        tourId: this._id,
        step: this._currentStep + 1 + '/' + (this._nuxList.length + 1),
        completed: '' + completed.toString(),
        error: (0, (_commonsNodeString2 || _commonsNodeString()).maybeToString)(error)
      });
    }
  }, {
    key: 'setNuxCompleteCallback',
    value: function setNuxCompleteCallback(callback) {
      this._callback = callback;
    }
  }, {
    key: 'isReady',
    value: function isReady(editor) {
      return this._trigger != null ? this._trigger.triggerCallback(editor) : true;
    }
  }, {
    key: 'getTriggerType',
    value: function getTriggerType() {
      return this._trigger != null ? this._trigger.triggerType : null;
    }
  }, {
    key: 'getID',
    value: function getID() {
      return this._id;
    }
  }]);

  return NuxTour;
})();

exports.NuxTour = NuxTour;