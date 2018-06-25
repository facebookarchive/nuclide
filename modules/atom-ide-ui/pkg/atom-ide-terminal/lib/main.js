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
import PulseButtonWithTooltip from 'nuclide-commons-ui/PulseButtonWithTooltip';
import {renderReactRoot} from 'nuclide-commons-ui/renderReactRoot';
import {makeToolbarButtonSpec} from 'nuclide-commons-ui/ToolbarUtils';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import os from 'os';
import nullthrows from 'nullthrows';
import React from 'react';
import ReactDOM from 'react-dom';

import createPackage from 'nuclide-commons-atom/createPackage';
import getElementFilePath from 'nuclide-commons-atom/getElementFilePath';
import {goToLocation} from 'nuclide-commons-atom/go-to-location';
import nuclideUri from 'nuclide-commons/nuclideUri';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import AsyncStorage from 'idb-keyval';

import {Observable} from 'rxjs';
import {setRpcService} from './AtomServiceContainer';
import {deserializeTerminalView, TerminalView} from './terminal-view';
import {infoFromUri, uriFromInfo, URI_PREFIX} from './nuclide-terminal-uri';
import {FocusManager} from './FocusManager';

import type {CreatePasteFunction} from 'atom-ide-ui/pkg/atom-ide-console/lib/types';
import type {TerminalApi, TerminalInfo, TerminalInstance} from './types';

const NUX_SEEN_KEY = 'atom_ide_terminal_nux_seen';

class Activation {
  _subscriptions: UniversalDisposable;
  _cwd: ?nuclide$CwdApi;

  constructor() {
    const focusManager = new FocusManager();
    this._subscriptions = new UniversalDisposable(
      focusManager,
      atom.workspace.addOpener(uri => {
        if (uri.startsWith(URI_PREFIX)) {
          return new TerminalView(uri);
        }
      }),
      atom.commands.add(
        'atom-workspace',
        'atom-ide-terminal:new-terminal',
        event => {
          const cwd = this._getPathOrCwd(event);
          const uri = cwd != null ? uriFromInfo({cwd}) : uriFromInfo({});
          goToLocation(uri);
        },
      ),
      atom.commands.add(
        'atom-workspace',
        'atom-ide-terminal:new-local-terminal',
        event => {
          const uri = uriFromInfo({cwd: os.homedir()});
          goToLocation(uri);
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
          if (item.getURI == null || item.getURI() == null) {
            return false;
          }

          const uri = nullthrows(item.getURI());
          try {
            // Only close terminal tabs with the same unique key.
            const otherInfo = infoFromUri(uri);
            return otherInfo.key === key;
          } catch (e) {}
          return false;
        });
      },
    };
  }

  dispose() {
    this._subscriptions.dispose();
  }

  consumeToolBar(getToolBar: toolbar$GetToolbar): IDisposable {
    const toolBar = getToolBar('nuclide-terminal');
    const buttonView = toolBar.addButton(
      makeToolbarButtonSpec({
        icon: 'terminal',
        callback: 'atom-ide-terminal:new-terminal',
        tooltip: 'New Terminal',
        priority: 700,
      }),
    );

    const disposable = new UniversalDisposable(
      () => {
        toolBar.removeItems();
      },
      Observable.defer(() => AsyncStorage.get(NUX_SEEN_KEY))
        .filter(seen => !seen)
        // monitor changes in the tool-bar's position, size, and visibility
        // and recreate the PulseButton on every significant change
        .switchMap(() =>
          Observable.combineLatest(
            observableFromSubscribeFunction(cb =>
              atom.config.observe('tool-bar.visible', cb),
            ),
            observableFromSubscribeFunction(cb =>
              atom.config.observe('tool-bar.position', cb),
            ),
            observableFromSubscribeFunction(cb =>
              atom.config.observe('tool-bar.iconSize', cb),
            ),
          ),
        )
        .map(([visibility]) => visibility)
        // only show if the tool-bar is open
        .switchMap(isVisible => {
          if (!isVisible) {
            return Observable.empty();
          }

          return Observable.create(() => {
            const rect = buttonView.element.getBoundingClientRect();
            const nuxRoot = renderReactRoot(
              <PulseButtonWithTooltip
                ariaLabel="Try the Terminal"
                tooltipText="There's now a new built-in terminal. Click here to launch one!"
                onDismiss={() => AsyncStorage.set(NUX_SEEN_KEY, true)}
              />,
            );
            nuxRoot.style.position = 'absolute';
            // attach a pulse button, offset so not to obscure the icon
            nuxRoot.style.top = rect.top + 15 + 'px';
            nuxRoot.style.left = rect.left + 18 + 'px';
            nullthrows(document.body).appendChild(nuxRoot);

            return () => {
              ReactDOM.unmountComponentAtNode(nuxRoot);
              nuxRoot.remove();
            };
          });
        })
        .subscribe(),
    );
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
