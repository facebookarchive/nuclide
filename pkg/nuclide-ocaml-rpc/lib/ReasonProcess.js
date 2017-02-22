'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.refmt = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

let refmt = exports.refmt = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (content, flags) {
    const refmtPath = getPathToRefmt();
    const options = {
      // Starts the process with the user's bashrc, which might contain a
      // different refmt. See `MerlinProcess` for the same consistent
      // logic. This also implies .nucliderc isn't considered, if there's any
      // extra override; to simulate the same behavior, do this in your bashrc:
      // if [ "$TERM" = "nuclide"]; then someOverrideLogic if
      env: yield (0, (_process || _load_process()).getOriginalEnvironment)(),
      stdin: content
    };
    const result = yield (0, (_process || _load_process()).asyncExecute)(refmtPath, flags, options);
    if (result.exitCode === 0) {
      return { type: 'result', formattedResult: result.stdout };
    }
    // Unsuccessfully exited. Two cases: syntax error and refmt nonexistent.
    if (result.errorCode === 'ENOENT') {
      return { type: 'error', error: 'refmt is not found. Is it available in the path?' };
    }
    return { type: 'error', error: result.stderr };
  });

  return function refmt(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();
/**
 * @return The path to ocamlmerlin on the user's machine. It is recommended not to cache the result
 *   of this function in case the user updates his or her preferences in Atom, in which case the
 *   return value will be stale.
 */


var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getPathToRefmt() {
  return global.atom && global.atom.config.get('nuclide.nuclide-ocaml.pathToRefmt') || 'refmt';
}