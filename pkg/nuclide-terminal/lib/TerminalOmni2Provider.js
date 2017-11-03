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

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import type {
  GenericResult,
  QueryContext,
  Omni2Provider,
} from '../../fb-omni2/lib/types';
import highlightText from 'nuclide-commons-ui/highlightText';

export default class TerminalOmni2Provider
  implements Omni2Provider<GenericResult> {
  debounceDelay = 0;
  display = {
    title: 'Terminal',
    prompt: 'Run a terminal command...',
    action: 'terminal-omni2-provider:toggle-provider',
  };

  name = 'TerminalProvider';
  prefix = '!';
  priority = 10;

  executeQuery(
    query: string,
    queryContext: QueryContext,
    callback: (items: Array<GenericResult>) => mixed,
  ): IDisposable {
    if (query === '') {
      callback([
        {
          type: 'generic',
          primaryText: 'Enter a command to run in the terminal',
        },
      ]);
      return new UniversalDisposable();
    }

    callback([
      {
        type: 'generic',
        primaryText: highlightText`Run ${query} in the terminal`,
      },
    ]);
    return new UniversalDisposable();
  }
}
