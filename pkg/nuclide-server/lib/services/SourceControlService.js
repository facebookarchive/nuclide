'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHgRepository = getHgRepository;

var _nuclideSourceControlHelpers;

function _load_nuclideSourceControlHelpers() {
  return _nuclideSourceControlHelpers = require('../../../nuclide-source-control-helpers');
}

/**
 * This is a workaround that should be removed when Atom 2.0 comes out.
 * See t6913624.
 */
function getHgRepository(directoryPath) {
  return Promise.resolve((0, (_nuclideSourceControlHelpers || _load_nuclideSourceControlHelpers()).findHgRepository)(directoryPath));
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */