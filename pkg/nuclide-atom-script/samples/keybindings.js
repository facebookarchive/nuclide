'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (args) {
    const commands = [];
    for (const keybinding of atom.keymaps.getKeyBindings()) {
      commands.push(keybinding.command);
    }

    commands.sort();
    commands.forEach(function (command) {
      return console.log(command);
    });
    return 0;
  });

  function runCommand(_x) {
    return _ref.apply(this, arguments);
  }

  return runCommand;
})(); /**
       * Copyright (c) 2015-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the license found in the LICENSE file in
       * the root directory of this source tree.
       *
       * 
       * @format
       */

/* eslint-disable no-console */