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

import {Subject} from 'rxjs';

let services: ?HostServices;

export async function getHostServices(): Promise<HostServices> {
  if (services == null) {
    services = new RootHostServices();
  }
  return services;
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

  dispose(): void {}
}
