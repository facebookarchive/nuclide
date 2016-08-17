Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getHgRepository = getHgRepository;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideSourceControlHelpers2;

function _nuclideSourceControlHelpers() {
  return _nuclideSourceControlHelpers2 = require('../../../nuclide-source-control-helpers');
}

/**
 * This is a workaround that should be removed when Atom 2.0 comes out.
 * See t6913624.
 */

function getHgRepository(directoryPath) {
  return Promise.resolve((0, (_nuclideSourceControlHelpers2 || _nuclideSourceControlHelpers()).findHgRepository)(directoryPath));
}