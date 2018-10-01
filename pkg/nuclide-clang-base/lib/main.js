"use strict";

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
 *  strict-local
 * @format
 */
// Matches string defined in fb-cquery/lib/main.js.
const USE_CQUERY_CONFIG = 'fb-cquery.use-cquery'; // eslint-disable-next-line nuclide-internal/no-commonjs

module.exports = {
  // If true, skip calling to clang service for given path.
  checkCqueryOverride: async path => {
    let cqueryBlacklist = async _ => false;

    try {
      // $FlowFB
      cqueryBlacklist = require("./fb-cquery-blacklist").default;
    } catch (exc) {}

    return _featureConfig().default.get(USE_CQUERY_CONFIG) === true && !(await cqueryBlacklist(path));
  }
};