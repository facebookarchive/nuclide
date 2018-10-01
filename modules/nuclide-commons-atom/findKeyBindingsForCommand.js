"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = findKeyBindingsForCommand;

function _humanizeKeystroke() {
  const data = _interopRequireDefault(require("../nuclide-commons/humanizeKeystroke"));

  _humanizeKeystroke = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict
 * @format
 */

/**
 * Determine what the applicable shortcut for a given command is within this component's context.
 * For example, this will return different keybindings on windows vs linux.
 */
function findKeyBindingsForCommand(command, target = atom.views.getView(atom.workspace)) {
  const matchingKeyBindings = atom.keymaps.findKeyBindings({
    command,
    target
  });
  const keystroke = matchingKeyBindings.length && matchingKeyBindings[0].keystrokes || '';
  return (0, _humanizeKeystroke().default)(keystroke, process.platform);
}