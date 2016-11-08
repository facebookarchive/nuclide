'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable no-console */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _chalk;

function _load_chalk() {
  return _chalk = _interopRequireDefault(require('chalk'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    const ctx = new (_chalk || _load_chalk()).default.constructor({ enabled: true });
    const out = Object.keys(process.versions).map(function (key) {
      return [key, process.versions[key]];
    }).concat([['atom', atom.getVersion()]]).map(function (_ref2) {
      var _ref3 = _slicedToArray(_ref2, 2);

      let name = _ref3[0],
          version = _ref3[1];
      return `${ ctx.yellow(name) }=${ ctx.green(version) }`;
    }).sort().join('\n');
    console.log(out);
    return 0;
  });

  function runCommand() {
    return _ref.apply(this, arguments);
  }

  return runCommand;
})();

module.exports = exports['default'];