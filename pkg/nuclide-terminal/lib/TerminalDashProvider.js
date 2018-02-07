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
  GenericResult,
  DashProvider,
  QueryContext,
  // $FlowFB
} from '../../fb-dash/lib/types';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';

import nuclideUri from 'nuclide-commons/nuclideUri';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import highlightText from 'nuclide-commons-ui/highlightText';
import {goToLocation} from 'nuclide-commons-atom/go-to-location';
import {uriFromInfo} from '../../commons-node/nuclide-terminal-uri';

export default class TerminalDashProvider
  implements DashProvider<GenericResult> {
  _getCwdApi: () => ?CwdApi;
  debounceDelay = 0;
  display = {
    title: 'Terminal',
    prompt: 'Run a terminal command...',
    action: 'terminal-dash-provider:toggle-provider',
  };

  name = 'TerminalProvider';
  prefix = '!';
  priority = 10;

  constructor(opts: {getCwdApi: () => ?CwdApi}) {
    this._getCwdApi = opts.getCwdApi;
  }

  executeQuery(
    query: string,
    queryContext: QueryContext,
    callback: (items: Array<GenericResult>) => mixed,
  ): IDisposable {
    let results;
    if (query === '') {
      results = [
        {
          type: 'generic',
          primaryText: 'Enter a command to run in the terminal',
          relevance: 1,
        },
      ];
    } else {
      const cwdApi = this._getCwdApi();
      const cwd = cwdApi ? cwdApi.getCwd() : null;
      const cwdPath = cwd ? cwd.getPath() : nuclideUri.expandHomeDir('~');
      results = [
        {
          type: 'generic',
          primaryText: highlightText`Run ${query} in the terminal`,
          secondaryText: `at ${cwdPath}`,
          relevance: 1,
          callback: () => {
            goToLocation(
              uriFromInfo({
                cwd: cwdPath,
                defaultLocation: 'bottom',
                icon: 'terminal',
                remainOnCleanExit: true,
                title: this.prefix + query,
                command: {
                  file: '/bin/bash',
                  args: ['-c', query],
                },
              }),
            );
          },
        },
      ];
    }

    callback(results);
    return new UniversalDisposable();
  }
}
