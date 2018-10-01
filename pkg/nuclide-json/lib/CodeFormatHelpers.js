"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

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
class CodeFormatHelpers {
  static formatEntireFile(editor, range) {
    return (0, _nuclideAnalytics().trackTiming)('json.formatCode', () => {
      const buffer_as_json = JSON.parse(editor.getBuffer().getText());
      const formatted = JSON.stringify(buffer_as_json, null, editor.getTabLength());
      return Promise.resolve({
        formatted
      });
    });
  }

}

exports.default = CodeFormatHelpers;