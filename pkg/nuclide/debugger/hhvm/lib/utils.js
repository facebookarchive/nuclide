'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function log(message: string): void {
  var logger = require('nuclide-logging').getLogger();
  logger.info('hhvm debugger: ' + message);
}

function logError(message: string): void {
  var logger = require('nuclide-logging').getLogger();
  logger.error('hhvm debugger: ' + message);
}

module.exports = {
  log,
  logError,
};
