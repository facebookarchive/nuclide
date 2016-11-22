'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _DiagnosticStore;

function _load_DiagnosticStore() {
  return _DiagnosticStore = _interopRequireDefault(require('./DiagnosticStore'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Linter APIs, for compatibility with the Atom linter package.
 */

// TODO figure out how to allow the diagnostic consumer to poll (for example, if
// it was just activated and wants diagnostic messages without having to wait
// for an event to occur)
module.exports = {
  DiagnosticStore: (_DiagnosticStore || _load_DiagnosticStore()).default
};