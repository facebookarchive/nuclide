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

import type {
  HostServices,
  ShowNotificationLevel,
} from '../../nuclide-language-service-rpc/lib/rpc-types';
import type {OutputService, Message} from '../../nuclide-console/lib/types';

import invariant from 'assert';
import {getCategoryLogger} from '../../nuclide-logging';
import {Subject} from 'rxjs';
import {
  forkHostServices,
} from '../../nuclide-language-service-rpc/lib/HostServicesAggregator';

let rootAggregatorPromise: ?Promise<HostServices>;
const logger = getCategoryLogger('HostServices');

export async function getHostServices(): Promise<HostServices> {
  // This method doesn't need to be async. But out of laziness we're
  // reusing 'forkHostServices', which is designed to work over NuclideRPC
  // if necessary, so it has to be async.
  if (rootAggregatorPromise == null) {
    const rootServices = new RootHostServices();
    rootAggregatorPromise = forkHostServices(rootServices, logger);
  }
  return forkHostServices(await rootAggregatorPromise, logger);
}

// Following type implements the HostServicesForLanguage interface
(((null: any): RootHostServices): HostServices);

class RootHostServices {
  _consoleSubjects: Map<string, Promise<Subject<Message>>> = new Map();
  // lazily created map from source, to how we'll push messages from that source

  consoleNotification(
    source: string,
    level: ShowNotificationLevel,
    text: string,
  ): void {
    let subjectPromise = this._consoleSubjects.get(source);
    if (subjectPromise == null) {
      subjectPromise = new Promise((resolve, reject) => {
        const subject: Subject<Message> = new Subject();
        const consumer = (service: OutputService) => {
          service.registerOutputProvider({
            messages: subject,
            id: source,
          });
          resolve(subject);
        };
        atom.packages.serviceHub.consume('nuclide-output', '0.0.0', consumer);
      });
      this._consoleSubjects.set(source, subjectPromise);
    }
    subjectPromise.then(subject => subject.next({level, text}));

    // This method creates registrations to the nuclide-output service,
    // but never disposes those registrations; there's not much point. The
    // now-defunct sources will be visible in the Sources UI.
  }

  dispose(): void {
    // No one can ever call this function because RootHostServices and
    // RootAggregator are private to this module, and we don't call dispose.
    invariant(false, 'RootHostServices and RootAggregator cannot be disposed.');
  }

  async childRegister(child: HostServices): Promise<HostServices> {
    return this;
    // Root only ever has exactly one child, the RootAggregator,
    // so we don't bother with registration: when the aggregator relays
    // commands, it will relay them straight to root services.
  }
}
