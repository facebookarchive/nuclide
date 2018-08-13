/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import {destroyItemWhere} from 'nuclide-commons-atom/destroyItemWhere';
// for homedir
import os from 'os';

import createPackage from 'nuclide-commons-atom/createPackage';
import getElementFilePath from 'nuclide-commons-atom/getElementFilePath';
import {goToLocation} from 'nuclide-commons-atom/go-to-location';
import nuclideUri from 'nuclide-commons/nuclideUri';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

import {setRpcService, setGkService} from './AtomServiceContainer';
import {deserializeTerminalView, TerminalView} from './terminal-view';
import {infoFromUri, uriFromInfo, URI_PREFIX} from './nuclide-terminal-uri';
import {FocusManager} from './FocusManager';

import type {CreatePasteFunction} from 'atom-ide-ui/pkg/atom-ide-console/lib/types';
import type {GatekeeperService} from 'nuclide-commons-atom/types';
import type {TerminalApi, TerminalInfo, TerminalInstance} from './types';

class Activation {
  _subscriptions: UniversalDisposable;
  _cwd: ?nuclide$CwdApi;

  constructor() {
    const focusManager = new FocusManager();
    this._subscriptions = new UniversalDisposable(
      focusManager,
      atom.workspace.addOpener((uri, options) => {
        if (uri.startsWith(URI_PREFIX)) {
          const info = infoFromUri(uri);
          if (info.cwd === '') {
            // $FlowFixMe we're threading cwd through options; it's not part of its type
            const cwd = options.cwd || (this._cwd && this._cwd.getCwd());
            if (cwd != null) {
              info.cwd = cwd;
            }
          }
          return new TerminalView(info);
        }
      }),
      atom.commands.add(
        'atom-workspace',
        'atom-ide-terminal:new-terminal',
        event => {
          // HACK: we pass along the cwd in the opener's options to be able to
          // read from it above.
          // eslint-disable-next-line nuclide-internal/atom-apis
          atom.workspace.open(URI_PREFIX, {
            cwd: this._getPathOrCwd(event),
            searchAllPanes: false,
          });
        },
      ),
      atom.commands.add(
        'atom-workspace',
        'atom-ide-terminal:new-local-terminal',
        () => {
          // HACK: we pass along the cwd in the opener's options to be able to
          // read from it above.
          // eslint-disable-next-line nuclide-internal/atom-apis
          atom.workspace.open(URI_PREFIX, {cwd: os.homedir()});
        },
      ),
      atom.commands.add(
        'atom-workspace',
        'atom-ide-terminal:toggle-terminal-focus',
        () => focusManager.toggleFocus(),
      ),
    );
  }

  provideTerminal(): TerminalApi {
    return {
      open: (info: TerminalInfo): Promise<TerminalInstance> => {
        const terminalView: any = goToLocation(uriFromInfo(info));
        return terminalView;
      },
      close: (key: string) => {
        destroyItemWhere(item => {
          // $FlowFixMe this is on TerminalViews only
          if (typeof item.getTerminalKey !== 'function') {
            return false;
          }

          return item.getTerminalKey() === key;
        });
      },
    };
  }

  dispose() {
    this._subscriptions.dispose();
  }

  consumeToolBar(getToolBar: toolbar$GetToolbar): IDisposable {
    const toolBar = getToolBar('nuclide-terminal');
    toolBar.addButton({
      icon: 'terminal',
      callback: 'atom-ide-terminal:new-terminal',
      tooltip: 'New Terminal',
      priority: 700,
    });

    const disposable = new UniversalDisposable(() => {
      toolBar.removeItems();
    });
    this._subscriptions.add(disposable);
    return disposable;
  }

  consumePasteProvider(provider: any): IDisposable {
    const createPaste: CreatePasteFunction = provider.createPaste;
    const disposable = new UniversalDisposable(
      atom.commands.add(
        '.terminal-pane',
        'atom-ide-terminal:create-paste',
        async event => {
          const {
            currentTarget: {terminal},
          } = (event: any);
          const uri = await createPaste(
            terminal.getSelection(),
            {
              title: 'Paste from Atom IDE Terminal',
            },
            'terminal paste',
          );
          atom.notifications.addSuccess(`Created paste at ${uri}`);
        },
      ),
      atom.contextMenu.add({
        '.terminal-pane': [
          {
            label: 'Create Paste',
            command: 'atom-ide-terminal:create-paste',
            shouldDisplay: event => {
              const div = event.target.closest('.terminal-pane');
              if (div == null) {
                return false;
              }
              const {terminal} = (div: any);
              if (terminal == null) {
                return false;
              }
              return terminal.hasSelection();
            },
          },
          {type: 'separator'},
        ],
      }),
    );
    this._subscriptions.add(disposable);
    return new UniversalDisposable(() => {
      disposable.dispose();
      this._subscriptions.remove(disposable);
    });
  }

  initializeCwdApi(cwd: nuclide$CwdApi): IDisposable {
    this._cwd = cwd;
    return new UniversalDisposable(() => {
      this._cwd = null;
    });
  }

  consumeRpcService(rpcService: nuclide$RpcService): IDisposable {
    return setRpcService(rpcService);
  }

  consumeGatekeeperService(service: GatekeeperService): IDisposable {
    return setGkService(service);
  }

  _getPathOrCwd(event: Event): ?string {
    const editorPath = getElementFilePath(
      ((event.target: any): HTMLElement),
      true,
    );

    if (editorPath != null) {
      return nuclideUri.endsWithSeparator(editorPath)
        ? editorPath
        : nuclideUri.dirname(editorPath);
    }

    if (this._cwd != null) {
      return this._cwd.getCwd();
    }

    return null;
  }
}

// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports = {
  // exported for package.json entry
  deserializeTerminalView,
};

createPackage(module.exports, Activation);
