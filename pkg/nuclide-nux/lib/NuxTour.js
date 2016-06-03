Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = _interopRequireDefault(require('../../nuclide-analytics'));
}

var _NuxView2;

function _NuxView() {
  return _NuxView2 = require('./NuxView');
}

var NuxTour = (function () {
  function NuxTour(id, nuxList) {
    _classCallCheck(this, NuxTour);

    if (nuxList == null || nuxList.length < 1) {
      throw new Error('You must create a NuxTour with at least one NuxView element!');
    }
    this._currentStep = 0;
    this._id = id;
    this._nuxList = nuxList;

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
      } catch (e) {
        this._track(false, e.toString());
      }
    }
  }, {
    key: '_nextStep',
    value: function _nextStep() {
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
  }, {
    key: '_onNuxComplete',
    value: function _onNuxComplete() {
      this._track(true);
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
        completed: '' + completed,
        error: '' + error
      });
    }
  }, {
    key: 'setNuxCompleteCallback',
    value: function setNuxCompleteCallback(callback) {
      this._callback = callback;
    }
  }]);

  return NuxTour;
})();

exports.NuxTour = NuxTour;