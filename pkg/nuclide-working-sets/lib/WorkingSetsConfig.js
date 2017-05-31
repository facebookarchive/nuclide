'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkingSetsConfig = undefined;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CONFIG_KEY = 'nuclide-working-sets.workingSets'; /**
                                                        * Copyright (c) 2015-present, Facebook, Inc.
                                                        * All rights reserved.
                                                        *
                                                        * This source code is licensed under the license found in the LICENSE file in
                                                        * the root directory of this source tree.
                                                        *
                                                        * 
                                                        * @format
                                                        */

class WorkingSetsConfig {
  observeDefinitions(callback) {
    const wrapped = definitions => {
      // Got to create a deep copy, otherwise atom.config invariants might break
      const copiedDefinitions = definitions.map(def => {
        return {
          name: def.name,
          active: def.active,
          uris: def.uris.slice()
        };
      });

      callback(copiedDefinitions);
    };

    return (_featureConfig || _load_featureConfig()).default.observe(CONFIG_KEY, wrapped);
  }

  getDefinitions() {
    return (_featureConfig || _load_featureConfig()).default.get(CONFIG_KEY);
  }

  setDefinitions(definitions) {
    (_featureConfig || _load_featureConfig()).default.set(CONFIG_KEY, definitions);
  }
}
exports.WorkingSetsConfig = WorkingSetsConfig;