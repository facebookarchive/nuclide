'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFlowServiceByNuclideUri = getFlowServiceByNuclideUri;
exports.getLocalFlowService = getLocalFlowService;
exports.getServerStatusUpdates = getServerStatusUpdates;
exports.getCurrentServiceInstances = getCurrentServiceInstances;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

const FLOW_SERVICE = 'FlowService';

const serverStatusUpdates = new _rxjsBundlesRxMinJs.Subject();

const serviceInstances = new Set();

function getFlowServiceByNuclideUri(file) {
  return getFlowServiceByNullableUri(file);
}

function getLocalFlowService() {
  return getFlowServiceByNullableUri(null);
}

/** Returns the FlowService for the given URI, or the local FlowService if the given URI is null. */
function getFlowServiceByNullableUri(file) {
  const flowService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)(FLOW_SERVICE, file);

  if (!(flowService != null)) {
    throw new Error('Invariant violation: "flowService != null"');
  }

  if (!serviceInstances.has(flowService)) {
    serviceInstances.add(flowService);
    const statusUpdates = flowService.getServerStatusUpdates().refCount();
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