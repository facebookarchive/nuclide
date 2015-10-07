'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// TODO: Remove this once all services have been moved to framework v3.
var {
  getClient,
  getFileForPath,
  getService,
  getServiceLogger,
  getServiceByNuclideUri,
} = require('nuclide-remote-connection');

module.exports = {
  getClient,
  getFileForPath,
  getService,
  getServiceLogger,
  getServiceByNuclideUri,
};
