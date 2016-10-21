'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Message} from '../nuclide-console/lib/types';
import type {ProcessMessage} from '../commons-node/process-rpc-types';

import {Subject} from 'rxjs';

export function dispatchConsoleToggle(visible: boolean): void {
  atom.commands.dispatch(
    atom.views.getView(atom.workspace),
    'nuclide-console:toggle',
    {visible},
  );
}

export function pipeProcessMessagesToConsole(
  processName: string,
  progressUpdates: Subject<Message>,
  processMessage: ProcessMessage,
): void {
  switch (processMessage.kind) {
    case 'stderr':
      progressUpdates.next({text: processMessage.data, level: 'error'});
      break;

    case 'stdout':
      progressUpdates.next({text: processMessage.data, level: 'info'});
      break;

    case 'error':
      const {error} = processMessage;
      progressUpdates.next({text: error.message || String(error), level: 'error'});
      break;

    case 'exit':
      if (processMessage.exitCode === 0) {
        // TODO(asriram) t13831340 Check if console was initially open, if yes then dont close here
        progressUpdates.next({text: `${processName} completed successfully`, level: 'success'});
        atom.notifications.addSuccess(
          'Operation completed successfully', {
            detail: `${processName} finished`,
          },
        );
      } else {
        // Keep console open
        progressUpdates.next({text: `${processName} exited with non zero code`, level: 'error'});
        atom.notifications.addError(
          'Smartlog Operation Failed', {
            detail: 'Check console for output',
          },
        );
      }
      break;
  }
}
