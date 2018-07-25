"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkingSetsConfig = void 0;

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const CONFIG_KEY = 'nuclide-working-sets.workingSets';

class WorkingSetsConfig {
  observeDefinitions(callback) {
    const wrapped = definitions => {
      // Got to create a deep copy, otherwise atom.config invariants might break
      const copiedDefinitions = definitions.map(def => {
        return Object.assign({}, def);
      });
      callback(copiedDefinitions);
    };

    return _featureConfig().default.observe(CONFIG_KEY, wrapped);
  }

  getDefinitions() {
    return _featureConfig().default.get(CONFIG_KEY);
  }

  setDefinitions(definitions) {
    _featureConfig().default.set(CONFIG_KEY, definitions.filter(d => !d.isActiveProject));
  }

}

exports.WorkingSetsConfig = WorkingSetsConfig;