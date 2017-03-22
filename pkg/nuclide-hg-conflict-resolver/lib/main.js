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
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let conflictDetector; /**
                       * Copyright (c) 2015-present, Facebook, Inc.
                       * All rights reserved.
                       *
                       * This source code is licensed under the license found in the LICENSE file in
                       * the root directory of this source tree.
                       *
                       * 
                       */

function activate() {}

function deactivate() {
  if (conflictDetector != null) {
    conflictDetector.dispose();
    conflictDetector = null;
  }
}

function consumeMergeConflictsApi(api) {
  (0, (_passesGK || _load_passesGK()).default)('nuclide_conflict_resolver').then(enabled => {
    if (!enabled) {
      conflictDetector = new (_MercurialConflictDetector || _load_MercurialConflictDetector()).MercurialConflictDetector();
      conflictDetector.setConflictsApi(api);
    }
  });
}