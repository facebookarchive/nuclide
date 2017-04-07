/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

// TODO: Make it possible to move or split a pane with a VcsLogPaneItem.

import type FileTreeContextMenu from '../../nuclide-file-tree/lib/FileTreeContextMenu';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {VcsLogResponse} from '../../nuclide-hg-rpc/lib/HgService';

import {CompositeDisposable, Disposable} from 'atom';
import VcsLogPaneItem from './VcsLogPaneItem';
import featureConfig from '../../commons-atom/featureConfig';
import invariant from 'assert';
import {getAtomProjectRelativePath} from '../../commons-atom/projects';
import {maybeToString} from '../../commons-node/string';
import querystring from 'querystring';
import {repositoryForPath} from '../../nuclide-vcs-base';
import {shortNameForAuthor as shortNameForAuthorFn} from './util';
import {track} from '../../nuclide-analytics';
import url from 'url';

const SHOW_LOG_FILE_TREE_CONTEXT_MENU_PRIORITY = 500;

const CONTEXT_MENU_LABEL = 'Show history';
const MAX_NUM_LOG_RESULTS = 100;
const VCS_LOG_URI_PREFIX = 'atom://nucide-vcs-log/view';
const VCS_LOG_URI_PATHS_QUERY_PARAM = 'path';

type VcsService = {
  getType(): string,
  log(filePaths: Array<NuclideUri>, limit?: ?number): Promise<VcsLogResponse>,
};

class Activation {
  _subscriptions: CompositeDisposable;

  constructor() {
    this._subscriptions = new CompositeDisposable();
    this._registerOpener();
  }

  _registerOpener() {
    this._subscriptions.add(
      atom.workspace.addOpener((uriToOpen: string) => {
        if (!uriToOpen.startsWith(VCS_LOG_URI_PREFIX)) {
          return;
        }

        const {query} = url.parse(uriToOpen, /* parseQueryString */ true);
        invariant(query);

        // Make sure a non-zero number of paths have been specified.
        const path = query[VCS_LOG_URI_PATHS_QUERY_PARAM];
        return createLogPaneForPath(path);
      }),
    );

    // TODO(mbolin): Once the nuclide-file-tree.context-menu is generalized to automatically add
    // menu items to the editor context menu, as appropriate, it should be possible to eliminate
    // (or at least reduce) the logic here.

    this._subscriptions.add(
      atom.commands.add(
        'atom-text-editor',
        'nuclide-vcs-log:show-log-for-active-editor',
        () => {
          const uri = getActiveTextEditorURI();
          if (uri != null) {
            openLogPaneForURI(uri);
            track('nuclide-vcs-log:open-from-text-editor');
          }
        },
      ),
      atom.contextMenu.add({
        'atom-text-editor': [
          {
            label: 'Source Control',
            submenu: [
              {
                label: CONTEXT_MENU_LABEL,
                command: 'nuclide-vcs-log:show-log-for-active-editor',
                shouldDisplay(): boolean {
                  const uri = getActiveTextEditorURI();
                  return getRepositoryWithLogMethodForPath(uri) != null;
                },
              },
            ],
          },
        ],
      }),
    );
  }

  addItemsToFileTreeContextMenu(contextMenu: FileTreeContextMenu): IDisposable {
    const contextDisposable = contextMenu.addItemToSourceControlMenu(
      {
        label: CONTEXT_MENU_LABEL,
        callback() {
          const node = contextMenu.getSingleSelectedNode();
          if (node == null) {
            return;
          }

          const {uri} = node;
          const repository = getRepositoryWithLogMethodForPath(uri);
          if (repository == null) {
            return;
          }

          openLogPaneForURI(uri);
          track('nuclide-vcs-log:open-from-file-tree');
        },
        shouldDisplay(): boolean {
          const node = contextMenu.getSingleSelectedNode();
          if (node == null) {
            return false;
          }

          return getRepositoryWithLogMethodForPath(node.uri) != null;
        },
      },
      SHOW_LOG_FILE_TREE_CONTEXT_MENU_PRIORITY,
    );

    this._subscriptions.add(contextDisposable);

    // We don't need to dispose of the contextDisposable when the provider is disabled -
    // it needs to be handled by the provider itself. We only should remove it from the list
    // of the disposables we maintain.
    return new Disposable(() => this._subscriptions.remove(contextDisposable));
  }

  dispose() {
    this._subscriptions.dispose();
  }
}

function getRepositoryWithLogMethodForPath(path: ?string): ?VcsService {
  if (path == null) {
    return null;
  }

  const repository = repositoryForPath(path);
  // For now, we only expect HgRepository to work. We should also find a way to
  // make this work for Git.
  if (repository != null && repository.getType() === 'hg') {
    return ((repository: any): VcsService);
  } else {
    return null;
  }
}

function getActiveTextEditorURI(): ?string {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor == null) {
    return null;
  }

  const filePath = editor.getPath();
  if (filePath == null) {
    return null;
  }

  return filePath;
}

function openLogPaneForURI(uri: string) {
  track('nuclide-vcs-log:open');
  const openerURI = VCS_LOG_URI_PREFIX + '?' + querystring.stringify({
    [VCS_LOG_URI_PATHS_QUERY_PARAM]: uri,
  });
  // Not a file URI
  // eslint-disable-next-line nuclide-internal/atom-apis
  atom.workspace.open(openerURI);
}

function createLogPaneForPath(path: string): ?VcsLogPaneItem {
  if (path == null) {
    return null;
  }

  const repository = getRepositoryWithLogMethodForPath(path);
  if (repository == null) {
    return null;
  }

  const pane = new VcsLogPaneItem();
  const {showDifferentialRevision} = ((featureConfig.get('nuclide-vcs-log')): any);
  invariant(typeof showDifferentialRevision === 'boolean');
  pane.initialize({
    iconName: 'repo',
    initialProps: {
      files: [path],
      showDifferentialRevision,
    },
    title: `${repository.getType()} log ${maybeToString(getAtomProjectRelativePath(path))}`,
  });

  repository.log([path], MAX_NUM_LOG_RESULTS).then((response: VcsLogResponse) =>
    pane.updateWithLogEntries(response.entries),
  );

  return pane;
}

let activation: ?Activation;

export function activate(state: ?Object): void {
  if (activation == null) {
    activation = new Activation();
  }
}

export function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

export function addItemsToFileTreeContextMenu(contextMenu: FileTreeContextMenu): IDisposable {
  invariant(activation);
  return activation.addItemsToFileTreeContextMenu(contextMenu);
}

export const shortNameForAuthor = shortNameForAuthorFn;
