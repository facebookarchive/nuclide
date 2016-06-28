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

/**
 * This is a workaround that should be removed when Atom 2.0 comes out.
 * See t6913624.
 */

exports.getHgRepository = getHgRepository;

function getHgRepository(directoryPath) {
  var _require = require('../../../nuclide-source-control-helpers');

  var findHgRepository = _require.findHgRepository;

  return Promise.resolve(findHgRepository(directoryPath));
}