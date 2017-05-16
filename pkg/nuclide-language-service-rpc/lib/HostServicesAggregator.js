/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {ShowNotificationLevel, HostServices} from './rpc-types';
import type {CategoryLogger} from '../../nuclide-logging';

import invariant from 'assert';
import {Subject} from 'rxjs';

// This is how we declare in Flow that a type fulfills an interface.
(((null: any): HostServicesAggregator): HostServices);
(((null: any): HostServicesRelay): HostServices);

export async function forkHostServices(
  host: HostServices,
  logger: CategoryLogger,
): Promise<HostServices> {
  const child = new HostServicesAggregator();
  const howChildShouldRelayBackToHost = await host.childRegister(child);
  child.initialize(howChildShouldRelayBackToHost, logger);
  return child;

  // Here's an example tree of forked aggregators, with a vertical line to show
  // client-side objects on the left and server-side objects on the right.
  //
  // root            |
  //   <-> relayR0   |
  //   <-> relayR1 <-|-> aggregator
  //                 |    <-> relayA0
  //                 |    <-> relayA1 <-> child1
  //                 |    <-> relayA2 <-> child2
  //
  // If you call child1.consoleNotification(), it forwards to relayA1, which
  // forwards it on to relayR1. The buck stops at the root which is responsible
  // for displaying it.
  //
  // We also offer the same HostServices API on aggregator itself.
  // If you call aggregator.consoleNotification() it just dispatches to relayA0,
  // which behaves identically to relayA1 above. (We use relayA0 here, rather
  // than handling the call inside aggregator itself, to avoid code duplication)
  //
  // If you dispose child1, it relays news of its disposal via relayA1, which
  // removes it from aggregator's list of children.
  //
  // If you dispose aggregator, it disposes all of its remaining children, and
  // relays news of its disposal via relayR1, which removes it from root's
  // list of children.
  //
  // The call to 'root.childRegister(aggregator)' is what creates relayR1.
  // This call might be across nuclide-rpc, which is why childRegister has to
  // return a promise.
  //
  // Why do we use relays? so that each child can relay messages to its parent
  // aggregator, and so the parent aggregator can know which child that message
  // was relayed from, and so we can do all this without lots of duplicate
  // methods in the HostServices interface.
}

class HostServicesAggregator {
  _parent: HostServices;
  _childRelays: Map<number, HostServicesRelay> = new Map();
  _counter: number = 0;
  _logger: CategoryLogger;

  initialize(parent: HostServices, logger: CategoryLogger): void {
    this._parent = parent;
    this._logger = logger;
    const relay = new HostServicesRelay(this, 0, null);
    this._childRelays.set(0, relay);
  }

  _selfRelay(): HostServicesRelay {
    const relay = this._childRelays.get(0);
    invariant(relay != null);
    return relay;
  }

  consoleNotification(
    source: string,
    level: ShowNotificationLevel,
    text: string,
  ): void {
    this._selfRelay().consoleNotification(source, level, text);
  }

  dispose(): void {
    // Folks call this "dispose" method to dispose of the aggregate and
    // all of its children.
    this._selfRelay()._childIsDisposed.complete();
    for (const relay of this._childRelays.values()) {
      if (relay._child != null) {
        relay._child.dispose();
      }
    }
    // We'll throw a runtime exception upon any operations after dispose.
    this._childRelays = ((null: any): Map<number, HostServicesRelay>);
    this._parent.dispose();
  }

  async childRegister(child: HostServices): Promise<HostServices> {
    this._counter++;
    const relay = new HostServicesRelay(this, this._counter, child);
    this._childRelays.set(this._counter, relay);
    return relay;
  }
}

class HostServicesRelay {
  _aggregator: HostServicesAggregator;
  _id: number;
  //
  _child: ?HostServices;
  _childIsDisposed: Subject<void> = new Subject();

  constructor(
    aggregator: HostServicesAggregator,
    id: number,
    child: ?HostServices,
  ) {
    this._aggregator = aggregator;
    this._id = id;
    this._child = child;
  }

  consoleNotification(
    source: string,
    level: ShowNotificationLevel,
    text: string,
  ): void {
    this._aggregator._parent.consoleNotification(source, level, text);
  }

  dispose(): void {
    // Remember, this is a notification relayed from one of the children that
    // it has just finished its "dispose" method. That's what a relay is.
    // It is *NOT* a means to dispose of this relay
    this._childIsDisposed.complete();
    this._aggregator._childRelays.delete(this._id);
  }

  childRegister(child: HostServices): Promise<HostServices> {
    invariant(false, 'relay should never be asked to relay childRegister');
  }
}
