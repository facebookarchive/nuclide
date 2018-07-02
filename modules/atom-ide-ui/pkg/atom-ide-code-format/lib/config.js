"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFormatOnSave = getFormatOnSave;
exports.getFormatOnType = getFormatOnType;

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
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
 * 
 * @format
 */
function getFormatOnSave(editor) {
  const formatOnSave = _featureConfig().default.get('atom-ide-code-format.formatOnSave', {
    scope: editor.getRootScopeDescriptor()
  });

  return formatOnSave == null ? false : formatOnSave;
}

function getFormatOnType() {
  return _featureConfig().default.getWithDefaults('atom-ide-code-format.formatOnType', false);
}