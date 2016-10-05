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

// A Queue which will process elements at intervals, only if the
// queue contains any elements.

var BatchProcessedQueue = (function () {
  function BatchProcessedQueue(batchPeriod, handler) {
    _classCallCheck(this, BatchProcessedQueue);

    this._batchPeriod = batchPeriod;
    this._handler = handler;
    this._timeoutId = null;
    this._items = [];
  }

  _createClass(BatchProcessedQueue, [{
    key: 'add',
    value: function add(item) {
      var _this = this;

      this._items.push(item);
      if (this._timeoutId === null) {
        this._timeoutId = setTimeout(function () {
          _this._handleBatch();
        }, this._batchPeriod);
      }
    }
  }, {
    key: '_handleBatch',
    value: function _handleBatch() {
      this._timeoutId = null;
      var batch = this._items;
      this._items = [];
      this._handler(batch);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._timeoutId !== null) {
        clearTimeout(this._timeoutId);
        this._handleBatch();
      }
    }
  }]);

  return BatchProcessedQueue;
})();

exports.default = BatchProcessedQueue;
module.exports = exports.default;