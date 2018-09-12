/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Action} from './redux/Actions';

import {Observable} from 'rxjs';
import featureConfig from 'nuclide-commons-atom/feature-config';
import {track} from '../../nuclide-analytics';
import {getBuckServiceByNuclideUri} from '../../nuclide-remote-connection';
import * as Actions from './redux/Actions';

const CHECK_INTERVAL = 30000;
const CONFIG_KEY = 'nuclide-buck.suggestTaskRunner';

function promptTaskRunner(args: Array<string>): Promise<boolean> {
  return new Promise((resolve, reject) => {
    function dismiss() {
      notification.dismiss();
      featureConfig.set(CONFIG_KEY, false);
    }
    track('buck-prompt.shown', {buildTarget: args[0]});
    const notification = atom.notifications.addInfo(
      `You recently ran \`buck build ${args.join(
        ' ',
      )}\` from the command line.<br />` +
        'Would you like to try building from the Task Runner?',
      {
        dismissable: true,
        icon: 'nuclicon-buck',
        buttons: [
          {
            text: 'Try it!',
            className: 'icon icon-triangle-right',
            onDidClick: () => {
              track('buck-prompt.clicked', {buildTarget: args[0]});
              atom.commands.dispatch(
                atom.views.getView(atom.workspace),
                'nuclide-task-runner:toggle-buck-toolbar',
                {visible: true},
              );
              resolve(true);
              dismiss();
            },
          },
          {
            text: "Don't show me this again",
            onDidClick: () => {
              track('buck-prompt.dismissed');
              dismiss();
            },
          },
        ],
      },
    );
    notification.onDidDismiss(() => resolve(false));
  });
}

export default function observeBuildCommands(
  buckRoot: NuclideUri,
): Observable<Action> {
  // Check the most recent Buck log at a fixed interval to check for
  // Buck command invocations.
  // We can't use Watchman because these logs are typically ignored.
  const buckService = getBuckServiceByNuclideUri(buckRoot);
  return Observable.interval(CHECK_INTERVAL)
    .startWith(0)
    .switchMap(() => {
      return (
        Observable.fromPromise(buckService.getLastBuildCommandInfo(buckRoot))
          // Ignore errors.
          .catch(() => Observable.of(null))
          .filter(Boolean)
          .filter(({timestamp}) => Date.now() - timestamp <= CHECK_INTERVAL)
      );
    })
    .switchMap(({args}) => {
      if (
        featureConfig.get(CONFIG_KEY) !== true ||
        args.length !== 1 ||
        args[0].startsWith('-') ||
        args[0].startsWith('@')
      ) {
        // Only report simple single-target build commands for now.
        return Observable.empty();
      }
      return Observable.fromPromise(promptTaskRunner(args))
        .filter(answer => answer === true)
        .map(answer => Actions.setBuildTarget(args[0]));
    });
}
