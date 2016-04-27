Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var CONFIG_KEY = 'nuclide-working-sets.workingSets';

var WorkingSetsConfig = (function () {
  function WorkingSetsConfig() {
    _classCallCheck(this, WorkingSetsConfig);
  }

  _createClass(WorkingSetsConfig, [{
    key: 'observeDefinitions',
    value: function observeDefinitions(callback) {
      var wrapped = function wrapped(definitions) {
        // Got to create a deep copy, otherwise atom.config invariants might break
        var copiedDefinitions = definitions.map(function (def) {
          return {
            name: def.name,
            active: def.active,
            uris: def.uris.slice()
          };
        });

        callback(copiedDefinitions);
      };

      return _nuclideFeatureConfig2['default'].observe(CONFIG_KEY, wrapped);
    }
  }, {
    key: 'getDefinitions',
    value: function getDefinitions() {
      return _nuclideFeatureConfig2['default'].get(CONFIG_KEY);
    }
  }, {
    key: 'setDefinitions',
    value: function setDefinitions(definitions) {
      _nuclideFeatureConfig2['default'].set(CONFIG_KEY, definitions);
    }
  }]);

  return WorkingSetsConfig;
})();

exports.WorkingSetsConfig = WorkingSetsConfig;