Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _VendorLibNodeInspectorLibSession2;

function _VendorLibNodeInspectorLibSession() {
  return _VendorLibNodeInspectorLibSession2 = _interopRequireDefault(require('../VendorLib/node-inspector/lib/session'));
}

var _util2;

function _util() {
  return _util2 = _interopRequireDefault(require('util'));
}

/**
 * A custom version of node-inspector's Session that ignores commands that we don't support. (We
 * do this here so we can pull in new versions of node-inspector without having to worry about what
 * modifications we've made to the source.)
 */
function CustomSession(config, debuggerPort, wsConnection) {
  (_VendorLibNodeInspectorLibSession2 || _VendorLibNodeInspectorLibSession()).default.call(this, config, debuggerPort, wsConnection);
  this.frontendCommandHandler._registerNoopCommands('Emulation.canEmulate', 'Network.setMonitoringXHREnabled', 'Worker.enable', 'ServiceWorker.enable', 'Emulation.setScriptExecutionDisabled', 'Page.setOverlayMessage');
}

(_util2 || _util()).default.inherits(CustomSession, (_VendorLibNodeInspectorLibSession2 || _VendorLibNodeInspectorLibSession()).default);

CustomSession.prototype.close = function () {
  // Pause frontend client events to ensure none are sent after the debugger has closed the
  // websocket. Omitting this causes a "not opened" error after closing the debugger window. See
  // <https://github.com/node-inspector/node-inspector/issues/870>
  this.frontendClient.pauseEvents();

  // "super.close()"
  (_VendorLibNodeInspectorLibSession2 || _VendorLibNodeInspectorLibSession()).default.prototype.close.call(this);
};

var Session = CustomSession;
exports.Session = Session;