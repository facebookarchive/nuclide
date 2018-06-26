'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POSIX_TOOLS = exports.WINDOWS_TOOLS = undefined;
exports.resolveTool = resolveTool;
exports.searchWithTool = searchWithTool;

var _promise;

function _load_promise() {
  return _promise = require('../../../modules/nuclide-commons/promise');
}

var _os = _interopRequireDefault(require('os'));

var _which;

function _load_which() {
  return _which = _interopRequireDefault(require('../../../modules/nuclide-commons/which'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _AckHandler;

function _load_AckHandler() {
  return _AckHandler = require('./AckHandler');
}

var _GrepHandler;

function _load_GrepHandler() {
  return _GrepHandler = require('./GrepHandler');
}

var _RgHandler;

function _load_RgHandler() {
  return _RgHandler = require('./RgHandler');
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

const WINDOWS_TOOLS = exports.WINDOWS_TOOLS = ['rg', 'grep'];
const POSIX_TOOLS = exports.POSIX_TOOLS = ['rg', 'ack', 'grep'];

const searchToolHandlers = Object.freeze({
  ack: (_AckHandler || _load_AckHandler()).search,
  rg: (_RgHandler || _load_RgHandler()).search,
  grep: (_GrepHandler || _load_GrepHandler()).search
});

async function resolveTool(tool) {
  if (tool != null) {
    return tool;
  }
  return (0, (_promise || _load_promise()).asyncFind)(_os.default.platform() === 'win32' ? WINDOWS_TOOLS : POSIX_TOOLS, t => (0, (_which || _load_which()).default)(t).then(cmd => cmd != null ? t : null));
}

function searchWithTool(tool, params) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => resolveTool(tool)).switchMap(actualTool => {
    if (actualTool != null) {
      const handler = searchToolHandlers[actualTool];
      return handler(params);
    }
    return _rxjsBundlesRxMinJs.Observable.empty();
  });
}