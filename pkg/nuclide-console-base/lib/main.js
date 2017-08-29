'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.changeConsoleVisibility = changeConsoleVisibility;
exports.pipeProcessMessagesToConsole = pipeProcessMessagesToConsole;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

// This must match URI defined in ../../nuclide-console/lib/ui/ConsoleContainer
const CONSOLE_VIEW_URI = 'atom://nuclide/console'; /**
                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                    * All rights reserved.
                                                    *
                                                    * This source code is licensed under the license found in the LICENSE file in
                                                    * the root directory of this source tree.
                                                    *
                                                    * 
                                                    * @format
                                                    */

function changeConsoleVisibility(visible) {
  switch (visible) {
    case true:
      // eslint-disable-next-line nuclide-internal/atom-apis
      atom.workspace.open(CONSOLE_VIEW_URI, { searchAllPanes: true });
      return;
    case false:
      atom.workspace.hide(CONSOLE_VIEW_URI);
      return;
    default:
      atom.workspace.toggle(CONSOLE_VIEW_URI);
      return;
  }
}

function pipeProcessMessagesToConsole(processName, progressUpdates, showNotificationOnCompletion, processMessage /* TODO(T17463635) */
) {
  switch (processMessage.kind) {
    case 'stderr':
      progressUpdates.next({ text: processMessage.data, level: 'error' });
      break;

    case 'stdout':
      progressUpdates.next({ text: processMessage.data, level: 'info' });
      break;

    case 'error':
      const { error } = processMessage;
      progressUpdates.next({
        text: error.message || String(error),
        level: 'error'
      });
      break;

    case 'exit':
      if (processMessage.exitCode === 0) {
        progressUpdates.next({
          text: `${processName} completed successfully`,
          level: 'success'
        });
        if (showNotificationOnCompletion) {
          atom.notifications.addSuccess('Operation completed successfully', {
            detail: `${processName} finished`
          });
        }
      } else {
        progressUpdates.next({
          text: `${processName} exited with non zero code`,
          level: 'error'
        });
        if (showNotificationOnCompletion) {
          atom.notifications.addError('Operation Failed', {
            detail: 'Check console for output'
          });
        }
        changeConsoleVisibility(true /* console visibility */);
      }
      break;
  }
}