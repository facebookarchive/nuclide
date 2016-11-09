'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (fileNames, skip) {
    const serviceToFileNames = new Map();
    for (const file of fileNames) {
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getArcanistServiceByNuclideUri)(file);
      let files = serviceToFileNames.get(service);
      if (files == null) {
        files = [];
        serviceToFileNames.set(service, files);
      }
      files.push(file);
    }

    const results = [];
    for (const _ref2 of serviceToFileNames) {
      var _ref3 = _slicedToArray(_ref2, 2);

      const service = _ref3[0];
      const files = _ref3[1];

      results.push(service.findDiagnostics(files, skip));
    }

    return [].concat(...(yield Promise.all(results)));
  });

  function aggregateFindDiagnostics(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return aggregateFindDiagnostics;
})();

module.exports = exports['default'];