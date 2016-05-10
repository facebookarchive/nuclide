'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'atom';
import featureConfig from '../../nuclide-feature-config';

let subscriptions: CompositeDisposable = (null: any);
// eslint-disable-next-line no-unused-vars
let currentConfig = ((featureConfig.get('nuclide-notifications'): any): {[type: string]: bool});
let gkEnabled = false;

export function activate(state: ?Object): void {
  subscriptions = new CompositeDisposable(

    // Listen for changes to the native notification settings:
    featureConfig.onDidChange('nuclide-notifications', event => {
      currentConfig = event.newValue;
    }),

  );

  try {
    // Listen for the gatekeeper to tell us if we can generate native notifications.
    const gatekeeper = require('../../fb-gatekeeper').gatekeeper;
    subscriptions.add(
      gatekeeper.onceInitialized(() => {
        gkEnabled = gatekeeper.isGkEnabled('nuclide_native_notifications');
      }),
    );
  } catch (e) { }

}

export function raiseNativeNotification(title: string, body: string): void {

  // Check we're in the gatekeeper for native notifications at all.
  if (!gkEnabled) {
    return;
  }

  // eslint-disable-next-line no-new, no-undef
  new Notification(
    title, {
      body: body,
      icon: 'atom://nuclide/pkg/nuclide-notifications/notification.png',
    }
  );
}

export function deactivate(): void {
  subscriptions.dispose();
  subscriptions = (null: any);
}
