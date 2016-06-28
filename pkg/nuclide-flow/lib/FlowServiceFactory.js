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

exports.getFlowServiceByNuclideUri = getFlowServiceByNuclideUri;
exports.getLocalFlowService = getLocalFlowService;
exports.getServerStatusUpdates = getServerStatusUpdates;
exports.getCurrentServiceInstances = getCurrentServiceInstances;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _nuclideClient2;

function _nuclideClient() {
  return _nuclideClient2 = require('../../nuclide-client');
}

var FLOW_SERVICE = 'FlowService';

var serverStatusUpdates = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Subject();

var serviceInstances = new Set();

function getFlowServiceByNuclideUri(file) {
  return getFlowServiceByNullableUri(file);
}

function getLocalFlowService() {
  return getFlowServiceByNullableUri(null);
}

/** Returns the FlowService for the given URI, or the local FlowService if the given URI is null. */
function getFlowServiceByNullableUri(file) {
  var flowService = (0, (_nuclideClient2 || _nuclideClient()).getServiceByNuclideUri)(FLOW_SERVICE, file);
  (0, (_assert2 || _assert()).default)(flowService != null);
  if (!serviceInstances.has(flowService)) {
    serviceInstances.add(flowService);
    var statusUpdates = flowService.getServerStatusUpdates();
    // TODO Unsubscribe at some point. To do that, we need a hook into the service framework so we
    // can learn when a given service instance is gone. I would expect the service framework to send
    // onCompleted when it disconnects, but that seemingly doesn't happen. So, we should do this
    // manually. However, the bound on the number of services is the number of remote connections
    // initiated during this Nuclide session, plus the local one. So while this is a memory leak,
    // it's very small.
    statusUpdates.subscribe(serverStatusUpdates);
  }
  return flowService;
}

function getServerStatusUpdates() {
  return serverStatusUpdates.asObservable();
}

function getCurrentServiceInstances() {
  return new Set(serviceInstances);
}