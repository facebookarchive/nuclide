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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

exports.default = _asyncToGenerator(function* (args) {
  var message = args.length === 0 ? 'Please pass me an arg!' : args.join(' ');
  console.log(message); // eslint-disable-line no-console
  return 0;
});
module.exports = exports.default;