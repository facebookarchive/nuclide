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

import {Subscription} from 'rxjs';

import {getServerStatusUpdates} from './FlowServiceFactory';

export class FlowServiceWatcher {
  _subscription: Subscription;

  constructor() {
    this._subscription = new Subscription();

    const serverStatusUpdates = getServerStatusUpdates();

    this._subscription.add(serverStatusUpdates
      .filter(({status}) => status === 'failed')
      .subscribe(({pathToRoot}) => {
        handleFailure(pathToRoot);
      }),
    );

    this._subscription.add(serverStatusUpdates
      .filter(({status}) => status === 'not installed')
      .first()
      .subscribe(({pathToRoot}) => {
        handleNotInstalled(pathToRoot);
      }),
    );
  }

  dispose(): void {
    this._subscription.unsubscribe();
  }
}

function handleFailure(pathToRoot: NuclideUri): void {
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

function handleNotInstalled(pathToRoot: NuclideUri): void {
  const message = `Flow was not found when attempting to start it in '${pathToRoot}'.<br/><br/>` +
    'You can download it from <a href="http://flowtype.org/">flowtype.org</a>. ' +
    'Make sure it is installed and on your PATH. ' +
    'If this is a remote repository make sure it is available on the remote machine.<br/><br/>' +
    'You will not see this message again until you restart Nuclide';
  atom.notifications.addError(
    message,
    {
      dismissable: true,
    }
  );
}
