'use babel';
/* @flow */

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

function getHgRepository(directoryPath: string) {
  var {findHgRepository} = require('nuclide-source-control-helpers');
  return findHgRepository(directoryPath);
}

module.exports = {
  services: {
    '/sourceControl/getHgRepository': {handler: getHgRepository, method: 'post'},
  }
};
