var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _flux2;

function _flux() {
  return _flux2 = require('flux');
}

var quickopenDispatcher = null;

var QuickSelectionDispatcher = (function () {
  function QuickSelectionDispatcher() {
    _classCallCheck(this, QuickSelectionDispatcher);
  }

  _createClass(QuickSelectionDispatcher, null, [{
    key: 'getInstance',
    value: function getInstance() {
      if (!quickopenDispatcher) {
        quickopenDispatcher = new (_flux2 || _flux()).Dispatcher();
      }
      return quickopenDispatcher;
    }
  }, {
    key: 'ActionType',
    value: Object.freeze({
      ACTIVE_PROVIDER_CHANGED: 'ACTIVE_PROVIDER_CHANGED',
      QUERY: 'QUERY'
    }),
    enumerable: true
  }]);

  return QuickSelectionDispatcher;
})();

module.exports = QuickSelectionDispatcher;