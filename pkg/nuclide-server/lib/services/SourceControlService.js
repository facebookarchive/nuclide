"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHgRepository = getHgRepository;

function _nuclideSourceControlHelpers() {
  const data = require("../../../nuclide-source-control-helpers");

  _nuclideSourceControlHelpers = function () {
    return data;
  };

  return data;
}

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
function getHgRepository(directoryPath) {
  return Promise.resolve((0, _nuclideSourceControlHelpers().findHgRepository)(directoryPath));
}