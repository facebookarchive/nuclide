'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import electron from 'electron';
import {CompositeDisposable} from 'atom';
import featureConfig from '../../commons-atom/featureConfig';
import {isGkEnabled, onceGkInitialized} from '../../commons-node/passesGK';

const {remote} = electron;
invariant(remote != null);

let subscriptions: CompositeDisposable = (null: any);
let gkEnabled = false;

export function activate(state: ?Object): void {
  subscriptions = new CompositeDisposable(
    // Listen for Atom notifications:
    atom.notifications.onDidAddNotification(proxyToNativeNotification),
    // Listen for the gatekeeper to tell us if we can generate native notifications.
    onceGkInitialized(() => {
      gkEnabled = isGkEnabled('nuclide_native_notifications');
    }),
  );
}

function proxyToNativeNotification(notification: atom$Notification): void {
  const options = notification.getOptions();

  // Don't proceed if user only wants 'nativeFriendly' proxied notifications and this isn't one.
  if (!options.nativeFriendly &&
      featureConfig.get('nuclide-notifications.onlyNativeFriendly')) {
    return;
  }

  raiseNativeNotification(
    `${upperCaseFirst(notification.getType())}: ${notification.getMessage()}`,
    options.detail,
  );

}

function raiseNativeNotification(title: string, body: string): void {
  // Check we're in the gatekeeper for native notifications at all.
  if (!gkEnabled) {
    return;
  }

  if (!featureConfig.get('nuclide-notifications.whenFocused') &&
      remote.getCurrentWindow().isFocused()) {
    return;
  }

  // eslint-disable-next-line no-new, no-undef
  new Notification(
    title, {
      body,
      icon: 'atom://nuclide/pkg/nuclide-notifications/notification.png',
    },
  );
}

export function provideRaiseNativeNotification(): typeof raiseNativeNotification {
  return raiseNativeNotification;
}

export function deactivate(): void {
  subscriptions.dispose();
  subscriptions = (null: any);
}

function upperCaseFirst(str: string): string {
  return `${str[0].toUpperCase()}${str.slice(1)}`;
}
