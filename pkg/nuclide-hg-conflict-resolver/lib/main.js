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

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeMergeConflictsApi = consumeMergeConflictsApi;

var _MercurialConflictDetector;

function _load_MercurialConflictDetector() {
  return _MercurialConflictDetector = require('./MercurialConflictDetector');
}

var conflictDetector = undefined;

function activate() {}

function deactivate() {
  if (conflictDetector != null) {
    conflictDetector.dispose();
    conflictDetector = null;
  }
}

function consumeMergeConflictsApi(api) {
  conflictDetector = new (_MercurialConflictDetector || _load_MercurialConflictDetector()).MercurialConflictDetector();
  conflictDetector.setConflictsApi(api);
}