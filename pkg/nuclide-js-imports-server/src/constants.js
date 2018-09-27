"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ADD_IMPORT_COMMAND_ID = void 0;

function _uuid() {
  const data = _interopRequireDefault(require("uuid"));

  _uuid = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
// Need to be unique across different js-imports-server instances.
const ADD_IMPORT_COMMAND_ID = 'addImport' + _uuid().default.v4();

exports.ADD_IMPORT_COMMAND_ID = ADD_IMPORT_COMMAND_ID;