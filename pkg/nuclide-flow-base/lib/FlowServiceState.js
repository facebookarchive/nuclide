Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _FlowRootContainer2;

function _FlowRootContainer() {
  return _FlowRootContainer2 = require('./FlowRootContainer');
}

var _FlowExecInfoContainer2;

function _FlowExecInfoContainer() {
  return _FlowExecInfoContainer2 = require('./FlowExecInfoContainer');
}

var FlowServiceState = (function () {
  function FlowServiceState() {
    _classCallCheck(this, FlowServiceState);
  }

  _createClass(FlowServiceState, [{
    key: 'getRootContainer',
    value: function getRootContainer() {
      if (this._rootContainer == null) {
        this._rootContainer = new (_FlowRootContainer2 || _FlowRootContainer()).FlowRootContainer(this.getExecInfoContainer());
      }
      return this._rootContainer;
    }
  }, {
    key: 'getExecInfoContainer',
    value: function getExecInfoContainer() {
      if (this._execInfoContainer == null) {
        this._execInfoContainer = new (_FlowExecInfoContainer2 || _FlowExecInfoContainer()).FlowExecInfoContainer();
      }
      return this._execInfoContainer;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._rootContainer != null) {
        this._rootContainer.dispose();
        this._rootContainer = null;
      }
      if (this._execInfoContainer != null) {
        this._execInfoContainer.dispose();
        this._execInfoContainer = null;
      }
    }
  }]);

  return FlowServiceState;
})();

exports.FlowServiceState = FlowServiceState;