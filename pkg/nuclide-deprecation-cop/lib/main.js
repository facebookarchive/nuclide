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

import {getLogger} from 'log4js';
import createPackage from 'nuclide-commons-atom/createPackage';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {track} from '../../nuclide-analytics';
import updateKeymap from './updateKeymap';

/**
 * Put deprecated commands with their new equivalents here.
 * This will:
 * - automatically warn and forward direct dispatches of the old command
 * - prompt to automatically update the user keybindings
 */
const DEPRECATED_COMMANDS = {
  'nuclide-console:toggle': 'console:toggle',
  'nuclide-console:clear': 'console:clear',
  'nuclide-console:copy-message': 'console:copy-message',
  'nuclide-debugger:toggle': 'debugger:toggle',
  'nuclide-debugger:show': 'debugger:show',
  'nuclide-debugger:hide': 'debugger:hide',
  'nuclide-debugger:restart-debugging': 'debugger:restart-debugging',
  'nuclide-debugger:continue-debugging': 'debugger:continue-debugging',
  'nuclide-debugger:stop-debugging': 'debugger:stop-debugging',
  'nuclide-debugger:step-over': 'debugger:step-over',
  'nuclide-debugger:step-into': 'debugger:step-into',
  'nuclide-debugger:step-out': 'debugger:step-out',
  'nuclide-debugger:run-to-location': 'debugger:run-to-location',
  'nuclide-debugger:toggle-breakpoint': 'debugger:toggle-breakpoint',
};

class Activation {
  _disposables: UniversalDisposable;
  _warnedCommands: Set<string>;

  constructor() {
    this._warnedCommands = new Set();
    this._disposables = new UniversalDisposable(this._deprecateCommands());

    // $FlowIgnore: private API
    const keymapPath = atom.keymaps.getUserKeymapPath();
    updateKeymap(keymapPath, DEPRECATED_COMMANDS).catch(err => {
      // Nonexistent keymaps are normal.
      if (err.code !== 'ENOENT') {
        getLogger('nuclide-deprecation-cop').error(
          'Error updating user keymap:',
          err,
        );
      }
    });
  }

  _deprecateCommands(): IDisposable {
    // Catch any direct invocations of the commands (context menu, dispatch).
    return atom.commands.onWillDispatch((event: any) => {
      const command = event.type;
      if (!DEPRECATED_COMMANDS.hasOwnProperty(command)) {
        return;
      }
      const newCommand = DEPRECATED_COMMANDS[command];
      if (!this._warnedCommands.has(command)) {
        track('deprecated-command-dispatched', {command});
        atom.notifications.addWarning('Nuclide: Deprecated Command', {
          icon: 'nuclicon-nuclide',
          description:
            `The command \`${command}\` has been deprecated.\n` +
            `Please use the new command \`${newCommand}\`.`,
          dismissable: true,
        });
        this._warnedCommands.add(command);
      }
      atom.commands.dispatch(event.target, newCommand, event.detail);
    });
  }

  dispose(): void {
    this._disposables.dispose();
  }
}

createPackage(module.exports, Activation);
