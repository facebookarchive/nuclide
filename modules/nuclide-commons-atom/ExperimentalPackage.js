/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {Socket} from './ExperimentalMessageRouter';
import type ExperimentalMessageRouter from './ExperimentalMessageRouter';

export type PackageParams = {|
  main: string,
  providedServices: ProvidedServices,
  consumedServices: ConsumedServices,
|};

type ProvidedServices = {
  [key: string]: {|
    rawConnections: Array<{|socket: Socket, config: Object|}>,
  |},
};

type ConsumedServices = {
  [key: string]: {|
    socket: Socket,
    // Path to JS module that creates the client object.
    client: string,
  |},
};

export function activateExperimentalPackage(
  {main, providedServices, consumedServices}: PackageParams,
  messageRouter: ExperimentalMessageRouter,
): IDisposable {
  const connections = Object.create(null);
  Object.keys(providedServices).forEach(key => {
    const {rawConnections} = providedServices[key];
    connections[key] = rawConnections.map(({socket, config}) =>
      messageRouter.createConnection(socket, config),
    );
  });

  // Create clients for each consumed service.
  const clients = Object.create(null);
  Object.keys(consumedServices).forEach(key => {
    const {socket, client} = consumedServices[key];
    // $FlowIgnore
    const clientFactory = require(client).default;
    clients[key] = clientFactory(messageRouter.createConnection(socket));
  });

  // $FlowIgnore
  const packageClass = require(main).default;
  return new packageClass(clients, connections);
}
