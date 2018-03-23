'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.debug = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let debug = exports.debug = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (debugMode, activeProjectRoot, target, useTerminal, scriptArguments) {
    let processInfo = null;

    if (!(activeProjectRoot != null)) {
      throw new Error('Active project is null');
    }

    // See if this is a custom debug mode type.


    try {
      // $FlowFB
      const helper = require('./fb-hhvm');
      processInfo = yield helper.getCustomLaunchInfo(debugMode, activeProjectRoot, target, scriptArguments);
    } catch (e) {}

    if (processInfo == null) {
      if (debugMode === 'script') {
        processInfo = yield (0, (_HhvmLaunchAttachProvider || _load_HhvmLaunchAttachProvider()).getLaunchProcessInfo)(activeProjectRoot, target, scriptArguments, null /* script wrapper */
        , useTerminal, '' /* cwdPath */
        );
      } else {
        processInfo = yield (0, (_HhvmLaunchAttachProvider || _load_HhvmLaunchAttachProvider()).getAttachProcessInfo)(activeProjectRoot, null);
      }
    }

    const debuggerService = yield (0, (_debugger || _load_debugger()).getDebuggerService)();
    yield debuggerService.startDebugging(processInfo);
  });

  return function debug(_x, _x2, _x3, _x4, _x5) {
    return _ref.apply(this, arguments);
  };
})();
// eslint-disable-next-line rulesdir/no-cross-atom-imports

// eslint-disable-next-line rulesdir/no-cross-atom-imports
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

var _debugger;

function _load_debugger() {
  return _debugger = require('../../commons-atom/debugger');
}

var _HhvmLaunchAttachProvider;

function _load_HhvmLaunchAttachProvider() {
  return _HhvmLaunchAttachProvider = require('../../nuclide-debugger-vsp/lib/HhvmLaunchAttachProvider');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }