'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (args) {
    const message = args.length === 0 ? 'Please pass me an arg!' : args.join(' ');
    console.log(message);
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

/*
 * This is a simple way to see nuclide-atom-scripting in action:
 *
 *   $HOME/.atom/packages/nuclide/pkg/nuclide-atom/scripting/bin/bootstrap \
 *       nuclide/pkg/nuclide-atom/scripting/sample/hello.js 'I overrode the default message!'
 *
 * Unfortunately, Atom seems to write some extra information to stderr that we would generally
 * prefer not to see. We can easily hide this using `2>/dev/null`:
 *
 *   $HOME/.atom/packages/nuclide/pkg/nuclide-atom/scripting/bin/bootstrap \
 *       nuclide/pkg/nuclide-atom/scripting/sample/hello.js 'I overrode the default message!' \
 *       2>/dev/null
 *
 * Note that if you want to load hello.js from ~/.atom/packages/dev instead of ~/.atom/packages,
 * you must set the USE_DEV environment variable when running bootstrap.
 */

/* eslint-disable no-console */