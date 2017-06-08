'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeMergeConflictsApi = consumeMergeConflictsApi;

var _MercurialConflictDetector;

function _load_MercurialConflictDetector() {
  return _MercurialConflictDetector = require('./MercurialConflictDetector');
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = require('../../commons-node/passesGK');
}

let conflictDetector; /**
                       * Copyright (c) 2015-present, Facebook, Inc.
                       * All rights reserved.
                       *
                       * This source code is licensed under the license found in the LICENSE file in
                       * the root directory of this source tree.
                       *
                       * 
                       * @format
                       */

function activate() {}

function deactivate() {
  if (conflictDetector != null) {
    conflictDetector.dispose();
    conflictDetector = null;
  }
}

function consumeMergeConflictsApi(api) {
  (0, (_passesGK || _load_passesGK()).onceGkInitialized)(() => {
    if (!(0, (_passesGK || _load_passesGK()).isGkEnabled)('nuclide_conflict_resolver')) {
      conflictDetector = new (_MercurialConflictDetector || _load_MercurialConflictDetector()).MercurialConflictDetector();
      conflictDetector.setConflictsApi(api);
    }
  });
}