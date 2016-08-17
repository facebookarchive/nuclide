'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable} from 'rxjs';

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {
  ServerStatusUpdate,
} from '../../nuclide-flow-rpc';
import typeof * as FlowService from '../../nuclide-flow-rpc';

import invariant from 'assert';
import {Subject} from 'rxjs';

import {getServiceByNuclideUri} from '../../nuclide-remote-connection';

const FLOW_SERVICE = 'FlowService';

const serverStatusUpdates: Subject<ServerStatusUpdate> = new Subject();

const serviceInstances = new Set();

export function getFlowServiceByNuclideUri(file: NuclideUri): FlowService {
  return getFlowServiceByNullableUri(file);
}

export function getLocalFlowService(): FlowService {
  return getFlowServiceByNullableUri(null);
}

/** Returns the FlowService for the given URI, or the local FlowService if the given URI is null. */
function getFlowServiceByNullableUri(file: ?NuclideUri): FlowService {
  const flowService: ?FlowService = getServiceByNuclideUri(FLOW_SERVICE, file);
  invariant(flowService != null);
  if (!serviceInstances.has(flowService)) {
    serviceInstances.add(flowService);
    const statusUpdates: Observable<ServerStatusUpdate>
      = flowService.getServerStatusUpdates().refCount();
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

export function getServerStatusUpdates(): Observable<ServerStatusUpdate> {
  return serverStatusUpdates.asObservable();
}

export function getCurrentServiceInstances(): Set<FlowService> {
  return new Set(serviceInstances);
}
