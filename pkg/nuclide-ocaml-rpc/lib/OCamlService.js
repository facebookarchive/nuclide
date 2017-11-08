'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUseLspConnection = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getUseLspConnection = exports.getUseLspConnection = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    return (0, (_passesGK || _load_passesGK()).default)('nuclide_ocaml_lsp');
  });

  return function getUseLspConnection() {
    return _ref.apply(this, arguments);
  };
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

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }