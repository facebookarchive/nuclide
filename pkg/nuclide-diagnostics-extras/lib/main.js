"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHomeFragments = getHomeFragments;

function _DiagnosticsViewModel() {
  const data = require("../../../modules/atom-ide-ui/pkg/atom-ide-diagnostics-ui/lib/DiagnosticsViewModel");

  _DiagnosticsViewModel = function () {
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
function getHomeFragments() {
  return {
    feature: {
      title: 'Diagnostics',
      icon: 'law',
      description: 'Displays diagnostics, errors, and lint warnings for your files and projects.',
      command: () => {
        // eslint-disable-next-line nuclide-internal/atom-apis
        atom.workspace.open(_DiagnosticsViewModel().WORKSPACE_VIEW_URI, {
          searchAllPanes: true
        });
      }
    },
    priority: 4
  };
}