Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _VendorLibNodeInspectorLibSession = require('../VendorLib/node-inspector/lib/session');

var _VendorLibNodeInspectorLibSession2 = _interopRequireDefault(_VendorLibNodeInspectorLibSession);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

/**
 * A custom version of node-inspector's Session that ignores commands that we don't support. (We
 * do this here so we can pull in new versions of node-inspector without having to worry about what
 * modifications we've made to the source.)
 */
function CustomSession(config, debuggerPort, wsConnection) {
  _VendorLibNodeInspectorLibSession2['default'].call(this, config, debuggerPort, wsConnection);
  this.frontendCommandHandler._registerNoopCommands('Emulation.canEmulate', 'Network.setMonitoringXHREnabled', 'Worker.enable', 'ServiceWorker.enable', 'Emulation.setScriptExecutionDisabled', 'Page.setOverlayMessage');
}

_util2['default'].inherits(CustomSession, _VendorLibNodeInspectorLibSession2['default']);

var Session = CustomSession;
exports.Session = Session;