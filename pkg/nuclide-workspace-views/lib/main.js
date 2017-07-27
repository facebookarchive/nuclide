'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _workspaceViewsCompat;

function _load_workspaceViewsCompat() {
  return _workspaceViewsCompat = require('nuclide-commons-atom/workspace-views-compat');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO(matthewwithanm): Delete this (along with the services and package) and refactor to workspace
// API once docks land
class CompatActivation {
  provideWorkspaceViewsService() {
    return (0, (_workspaceViewsCompat || _load_workspaceViewsCompat()).getDocksWorkspaceViewsService)();
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

(0, (_createPackage || _load_createPackage()).default)(module.exports, CompatActivation);