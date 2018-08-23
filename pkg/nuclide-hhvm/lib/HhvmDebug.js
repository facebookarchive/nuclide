"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.debug = debug;

function _debugger() {
  const data = require("../../../modules/nuclide-commons-atom/debugger");

  _debugger = function () {
    return data;
  };

  return data;
}

function _HhvmLaunchAttachProvider() {
  const data = require("../../nuclide-debugger-vsp/lib/HhvmLaunchAttachProvider");

  _HhvmLaunchAttachProvider = function () {
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
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
async function debug(debugMode, activeProjectRoot, target, useTerminal, scriptArguments) {
  let processConfig = null;

  if (!(activeProjectRoot != null)) {
    throw new Error('Active project is null');
  } // See if this is a custom debug mode type.


  try {
    // $FlowFB
    const helper = require("./fb-hhvm");

    processConfig = await helper.getCustomLaunchInfo(debugMode, activeProjectRoot, target, scriptArguments);
  } catch (e) {}

  if (processConfig == null) {
    if (debugMode === 'script') {
      processConfig = (0, _HhvmLaunchAttachProvider().getLaunchProcessConfig)(activeProjectRoot, target, scriptArguments, null
      /* script wrapper */
      , useTerminal, ''
      /* cwdPath */
      );
    } else {
      await (0, _HhvmLaunchAttachProvider().startAttachProcessConfig)(activeProjectRoot, null
      /* attachPort */
      , true
      /* serverAttach */
      );
      return;
    }
  }

  if (!(processConfig != null)) {
    throw new Error("Invariant violation: \"processConfig != null\"");
  }

  const debuggerService = await (0, _debugger().getDebuggerService)();
  await debuggerService.startVspDebugging(processConfig);
}