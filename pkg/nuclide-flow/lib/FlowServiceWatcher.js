'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';

import {getServerStatusUpdates} from './FlowServiceFactory';

export class FlowServiceWatcher {
  _subscription: rx$ISubscription;

  constructor() {
    this._subscription = getServerStatusUpdates()
      .filter(({status}) => status === 'failed')
      .subscribe(({pathToRoot}) => {
        this._handleFailure(pathToRoot);
      });
  }

  dispose(): void {
    this._subscription.unsubscribe();
  }

  _handleFailure(pathToRoot: NuclideUri): void {
    const failureMessage = `Flow has failed in '${pathToRoot}'.<br/><br/>` +
      'Flow features will be disabled for the remainder of this Nuclide session. ' +
      'You may re-enable them by clicking below or by running the "Restart Flow Server" command ' +
      'from the command palette later.'
    ;
    const notification = atom.notifications.addError(
      failureMessage,
      {
        dismissable: true,
        buttons: [{
          className: 'icon icon-zap',
          onDidClick() {
            notification.dismiss();
            atom.commands.dispatch(
              atom.views.getView(atom.workspace),
              'nuclide-flow:restart-flow-server',
            );
          },
          text: 'Restart Flow Server',
        }],
      }
    );
  }
}
