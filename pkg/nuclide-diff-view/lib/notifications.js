Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.notifyInternalError = notifyInternalError;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

function notifyInternalError(error) {
  var dismissable = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var errorMessage = 'Diff View Internal Error';
  logger.error(errorMessage, error);
  atom.notifications.addError(errorMessage, { detail: error.message, dismissable: dismissable });
}