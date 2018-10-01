"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _ConfigManager() {
  const data = _interopRequireDefault(require("./ConfigManager"));

  _ConfigManager = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

/**
 * A wrapper over Atom's config functions for use with FeatureLoader.
 * Each individual loaded package's config is a subconfig of the root package.
 */
const featureConfigManager = new (_ConfigManager().default)(atom.config);
var _default = featureConfigManager;
exports.default = _default;