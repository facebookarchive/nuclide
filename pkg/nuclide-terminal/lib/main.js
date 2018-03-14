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

// for homedir
import os from 'os';
import invariant from 'assert';
import dedent from 'dedent';

import createPackage from 'nuclide-commons-atom/createPackage';
import getElementFilePath from '../../commons-atom/getElementFilePath';
import {goToLocation} from 'nuclide-commons-atom/go-to-location';
import nuclideUri from 'nuclide-commons/nuclideUri';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

import TerminalDashProvider from './TerminalDashProvider';
import {deserializeTerminalView, TerminalView} from './terminal-view';
import {uriFromCwd, URI_PREFIX} from '../../commons-node/nuclide-terminal-uri';

// $FlowFB
import type {CreatePasteFunction} from 'atom-ide-ui/pkg/atom-ide-console/lib/types';
import type {RegisterProvider} from '../../fb-dash/lib/types';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type FileTreeContextMenu from '../../nuclide-file-tree/lib/FileTreeContextMenu';

const TERMINAL_CONTEXT_MENU_PRIORITY = 100;

class Activation {
  _subscriptions: UniversalDisposable;
  _styleSheet: IDisposable;
  _cwd: ?CwdApi;

  constructor() {
    this._subscriptions = new UniversalDisposable(
      atom.workspace.addOpener(uri => {
        if (uri.startsWith(URI_PREFIX)) {
          return new TerminalView(uri);
        }
      }),
      atom.commands.add(
        'atom-workspace',
        'nuclide-terminal:new-terminal',
        event => {
          const cwd = this._getPathOrCwd(event);
          const uri = uriFromCwd(cwd);
          goToLocation(uri);
        },
      ),
      atom.commands.add(
        'atom-workspace',
        'nuclide-terminal:new-local-terminal',
        event => {
          const uri = uriFromCwd(os.homedir());
          goToLocation(uri);
        },
      ),
      atom.config.onDidChange(
        'editor.fontSize',
        this._syncAtomStyle.bind(this),
      ),
      atom.config.onDidChange(
        'editor.fontFamily',
        this._syncAtomStyle.bind(this),
      ),
      atom.config.onDidChange(
        'editor.lineHeight',
        this._syncAtomStyle.bind(this),
      ),
      () => this._styleSheet.dispose(),
    );
    this._syncAtomStyle();
  }

  dispose() {
    this._subscriptions.dispose();
  }

  _syncAtomStyle() {
    if (this._styleSheet != null) {
      this._styleSheet.dispose();
    }
    // Based on workspace-element in Atom
    this._styleSheet = atom.styles.addStyleSheet(
      dedent`
      .terminal {
        font-size: ${(atom.config.get('editor.fontSize'): any)}px !important;
        font-family: ${(atom.config.get('editor.fontFamily'): any)} !important;
        line-height: ${(atom.config.get('editor.lineHeight'): any)} !important;
      }`,
      {
        sourcePath: 'nuclide-terminal-sync-with-atom',
        priority: -1,
      },
    );
  }

  consumePasteProvider(provider: any): IDisposable {
    const createPaste: CreatePasteFunction = provider.createPaste;
    const disposable = new UniversalDisposable(
      atom.commands.add(
        '.terminal-pane',
        'nuclide-terminal:create-paste',
        async event => {
          const {currentTarget: {terminal}} = (event: any);
          const uri = await createPaste(
            terminal.getSelection(),
            {
              title: 'Paste from Nuclide Terminal',
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
            command: 'nuclide-terminal:create-paste',
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

  addItemsToFileTreeContextMenu(contextMenu: FileTreeContextMenu): IDisposable {
    const menuItemSubscriptions = new UniversalDisposable();
    menuItemSubscriptions.add(
      contextMenu.addItemToShowInSection(
        {
          label: 'New Terminal Here',
          callback() {
            const node = contextMenu.getSingleSelectedNode();
            invariant(node != null);
            const cwd = node.isContainer
              ? node.uri
              : nuclideUri.dirname(node.uri);
            goToLocation(uriFromCwd(cwd));
          },
          shouldDisplay(): boolean {
            const node = contextMenu.getSingleSelectedNode();
            return node != null && node.uri != null && node.uri.length > 0;
          },
        },
        TERMINAL_CONTEXT_MENU_PRIORITY,
      ),
    );
    this._subscriptions.add(menuItemSubscriptions);

    return new UniversalDisposable(() =>
      this._subscriptions.remove(menuItemSubscriptions),
    );
  }

  initializeCwdApi(cwd: CwdApi): IDisposable {
    this._cwd = cwd;
    return new UniversalDisposable(() => {
      this._cwd = null;
    });
  }

  consumeDash(registerProvider: RegisterProvider): IDisposable {
    const subscription = registerProvider(
      new TerminalDashProvider({
        getCwdApi: () => this._cwd,
      }),
    );
    this._subscriptions.add(subscription);
    return subscription;
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
      const cwd = this._cwd.getCwd();
      if (cwd != null) {
        return cwd.getPath();
      }
    }

    return null;
  }
}

// eslint-disable-next-line rulesdir/no-commonjs
module.exports = {
  // exported for package.json entry
  deserializeTerminalView,
};

createPackage(module.exports, Activation);
