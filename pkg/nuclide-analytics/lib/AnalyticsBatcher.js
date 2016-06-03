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

var _commonsNodeBatchProcessedQueue2;

function _commonsNodeBatchProcessedQueue() {
  return _commonsNodeBatchProcessedQueue2 = _interopRequireDefault(require('../../commons-node/BatchProcessedQueue'));
}

var REPORTING_PERIOD = 1000;

var AnalyticsBatcher = (function () {
  function AnalyticsBatcher(track) {
    var _this = this;

    _classCallCheck(this, AnalyticsBatcher);

    this._track = track;
    this._queue = new (_commonsNodeBatchProcessedQueue2 || _commonsNodeBatchProcessedQueue()).default(REPORTING_PERIOD, function (events) {
      _this._handleBatch(events);
    });
  }

  _createClass(AnalyticsBatcher, [{
    key: '_handleBatch',
    value: function _handleBatch(events) {
      this._track(events);
    }
  }, {
    key: 'track',
    value: function track(key, values) {
      this._queue.add({ key: key, values: values });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._queue.dispose();
    }
  }]);

  return AnalyticsBatcher;
})();

exports.AnalyticsBatcher = AnalyticsBatcher;