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

exports.activate = activate;
exports.consumeProvider = consumeProvider;
exports.deactivate = deactivate;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Activation = (function () {
  function Activation() {
    _classCallCheck(this, Activation);
  }

  _createClass(Activation, [{
    key: 'activate',
    value: function activate() {
      var HighlightManager = require('./CodeHighlightManager');
      // $FlowIssue -- https://github.com/facebook/flow/issues/996
      this._codeHighlightManager = new HighlightManager();
    }
  }, {
    key: 'consumeProvider',
    value: function consumeProvider(provider) {
      this._codeHighlightManager.addProvider(provider);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._codeHighlightManager.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (!activation) {
    activation = new Activation(state);
    activation.activate();
  }
}

function consumeProvider(provider) {
  if (activation != null) {
    activation.consumeProvider(provider);
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}