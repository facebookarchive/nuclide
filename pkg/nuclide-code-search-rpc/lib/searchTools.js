"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveTool = resolveTool;
exports.searchWithTool = searchWithTool;
exports.POSIX_TOOLS = exports.WINDOWS_TOOLS = void 0;

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

function _which() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/which"));

  _which = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _AckHandler() {
  const data = require("./AckHandler");

  _AckHandler = function () {
    return data;
  };

  return data;
}

function _GrepHandler() {
  const data = require("./GrepHandler");

  _GrepHandler = function () {
    return data;
  };

  return data;
}

function _RgHandler() {
  const data = require("./RgHandler");

  _RgHandler = function () {
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
 * 
 * @format
 */
const WINDOWS_TOOLS = ['rg', 'grep'];
exports.WINDOWS_TOOLS = WINDOWS_TOOLS;
const POSIX_TOOLS = ['rg', 'ack', 'grep'];
exports.POSIX_TOOLS = POSIX_TOOLS;
const searchToolHandlers = Object.freeze({
  ack: _AckHandler().search,
  rg: _RgHandler().search,
  grep: _GrepHandler().search
});

async function resolveTool(tool) {
  if (tool != null) {
    return tool;
  }

  return (0, _promise().asyncFind)(_os.default.platform() === 'win32' ? WINDOWS_TOOLS : POSIX_TOOLS, t => (0, _which().default)(t).then(cmd => cmd != null ? t : null));
}

function searchWithTool(tool, params) {
  return _RxMin.Observable.defer(() => resolveTool(tool)).switchMap(actualTool => {
    if (actualTool != null) {
      const handler = searchToolHandlers[actualTool];
      return handler(params);
    }

    return _RxMin.Observable.empty();
  });
}