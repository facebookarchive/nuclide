'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.notifyInternalError = notifyInternalError;

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();function notifyInternalError(error) {
  let dismissable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  const errorMessage = 'Diff View Internal Error';
  logger.error(errorMessage, error);
  atom.notifications.addError(errorMessage, { detail: error.message, dismissable: dismissable });
}