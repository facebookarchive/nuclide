Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = syncAtomCommands;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createAtomCommands = require('./createAtomCommands');

var _createAtomCommands2 = _interopRequireDefault(_createAtomCommands);

/**
 * Keep the Atom commands in sync with the application state. If the returned subscription is
 * disposed, the Atom commands will be removed.
 */

function syncAtomCommands(gadget$, appCommands) {
  var atomCommands = undefined;

  return gadget$.distinctUntilChanged().subscribe(function (gadgets) {
    // Add Atom commands idempotently...
    // Dispose of the previous commands.
    if (atomCommands != null) {
      atomCommands.dispose();
    }
    // Add new ones.
    if (gadgets && gadgets.size > 0) {
      atomCommands = (0, _createAtomCommands2['default'])(gadgets, appCommands);
    }
  });
}

module.exports = exports['default'];