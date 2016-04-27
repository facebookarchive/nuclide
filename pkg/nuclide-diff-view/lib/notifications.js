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

exports.notifyInternalError = notifyInternalError;
exports.notifyFilesystemOverrideUserEdits = notifyFilesystemOverrideUserEdits;

var _nuclideLogging = require('../../nuclide-logging');

var logger = (0, _nuclideLogging.getLogger)();

function notifyInternalError(error) {
  var dismissable = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var errorMessage = 'Diff View Internal Error';
  logger.error(errorMessage, error);
  atom.notifications.addError(errorMessage, { detail: error.message, dismissable: dismissable });
}

function notifyFilesystemOverrideUserEdits(filePath) {
  var message = 'Diff View Override<br/>\nThe filesystem contents of the active file have changed, overriding user changes for file:<br/>\n`' + filePath + '`\n';
  logger.warn(message);
  atom.notifications.addWarning(message);
}