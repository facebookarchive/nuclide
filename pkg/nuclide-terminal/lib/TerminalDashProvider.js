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
import type {Command} from '../../nuclide-pty-rpc/rpc-types';

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
    prompt: {
      verb: 'Run',
      object: 'a terminal command',
    },
    action: 'terminal-dash-provider:toggle-provider',
  };

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
    const cwdApi = this._getCwdApi();
    const cwd = cwdApi ? cwdApi.getCwd() : null;
    const cwdPath = cwd != null ? cwd : nuclideUri.expandHomeDir('~');
    if (query === '') {
      results = [
        {
          type: 'generic',
          primaryText: 'Enter a command to run in the terminal',
          relevance: 1,
          callback: () => this._openTerminal(cwdPath),
        },
      ];
    } else {
      results = atom.project.getPaths().map(path => ({
        type: 'generic',
        primaryText: highlightText`Run ${query} in the terminal`,
        secondaryText: `at ${nuclideUri.nuclideUriToDisplayString(path)}`,
        relevance: path === cwdPath ? 1 : 0.5,
        callback: () =>
          this._openTerminal(path, this.prefix + query, {
            file: '/bin/bash',
            args: ['-c', query],
          }),
      }));
    }

    callback(results);
    return new UniversalDisposable();
  }

  _openTerminal(cwd: string, title?: string, command?: Command): void {
    goToLocation(
      uriFromInfo({
        cwd,
        defaultLocation: 'bottom',
        icon: 'terminal',
        remainOnCleanExit: true,
        title,
        command,
      }),
    );
  }
}
