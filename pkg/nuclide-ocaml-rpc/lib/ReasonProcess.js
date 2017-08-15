'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatImpl = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let formatImpl = exports.formatImpl = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (content, filePath, language, refmtFlags) {
    // refmt is designed for reason->reason and ocaml->reason formatting
    // ocp-indent is designed for ocaml->ocaml formatting
    const path = language === 're' ? getPathToRefmt() : 'ocp-indent';
    const flags = language === 're' ? refmtFlags : [];
    const options = {
      // Starts the process with the user's bashrc, which might contain a
      // different refmt. See `MerlinProcess` for the same consistent
      // logic. This also implies .nucliderc isn't considered, if there's any
      // extra override; to simulate the same behavior, do this in your bashrc:
      // if [ "$TERM" = "nuclide"]; then someOverrideLogic if
      env: yield (0, (_process || _load_process()).getOriginalEnvironment)(),
      input: content,
      cwd: (_nuclideUri || _load_nuclideUri()).default.dirname(filePath)
    };
    try {
      const stdout = yield (0, (_process || _load_process()).runCommand)(path, flags, options).toPromise();
      return { type: 'result', formattedResult: stdout };
    } catch (err) {
      // Unsuccessfully exited. Two cases: syntax error and refmt nonexistent.
      if (err.errno === 'ENOENT') {
        return {
          type: 'error',
          error: `${path} is not found. Is it available in the path?`
        };
      }
      return { type: 'error', error: err.stderr };
    }
  });

  return function formatImpl(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();
/**
 * @return The path to ocamlmerlin on the user's machine. It is recommended not to cache the result
 *   of this function in case the user updates his or her preferences in Atom, in which case the
 *   return value will be stale.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getPathToRefmt() {
  return global.atom && global.atom.config.get('nuclide.nuclide-ocaml.pathToRefmt') || 'refmt';
}