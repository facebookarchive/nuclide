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

export function activate(state: ?Object): void {
  subscriptions = new CompositeDisposable(

    // Listen for changes to the native notification settings:
    featureConfig.onDidChange('nuclide-notifications', event => {
      currentConfig = event.newValue;
    }),

  );
}

export function deactivate(): void {
  subscriptions.dispose();
  subscriptions = (null: any);
}
