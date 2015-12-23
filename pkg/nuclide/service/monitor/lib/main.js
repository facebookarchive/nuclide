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
import ServiceMonitorPaneItem from './ServiceMonitorPaneItem';
import invariant from 'assert';
import {track} from '../../../analytics';

const NUCLIDE_SERVICE_MONITOR_URI = 'nuclide-service-monitor://view';

let subscriptions: ?CompositeDisposable;

module.exports = {

  activate(state: ?Object): void {
    invariant(!subscriptions);
    subscriptions = new CompositeDisposable();

    subscriptions.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-service-monitor:show-monitor',
        () => {
          atom.workspace.open(NUCLIDE_SERVICE_MONITOR_URI);
          track('nuclide-service-monitor:open');
        }
      )
    );

    subscriptions.add(
      atom.workspace.addOpener(uriToOpen => {
        if (uriToOpen !== NUCLIDE_SERVICE_MONITOR_URI) {
          return;
        }

        const pane = new ServiceMonitorPaneItem();
        pane.initialize({
          title: 'Nuclide Services',
          initialProps: {},
        });
        return pane;
      })
    );
  },

  deactivate(): void {
    invariant(subscriptions);
    subscriptions.dispose();
    subscriptions = null;
  },
};
