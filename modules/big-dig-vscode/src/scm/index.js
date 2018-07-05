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

import type {ConnectionWrapper} from '../ConnectionWrapper';
import type {RemoteFileSystem} from '../RemoteFileSystem';

import * as vscode from 'vscode';
import {getLogger} from 'log4js';
import {HgScm} from './HgScm';
import {onEachFilesystem} from '../remote';
import {
  HG_TEXT_DOCUMENT_CONTENT_PROVIDER_SCHEME,
  HgTextDocumentContentProvider,
} from './HgTextDocumentContentProvider';

const logger = getLogger('hg-scm');

export function startScm(): IDisposable {
  const sub = onEachFilesystem(fs =>
    fs
      .getServer()
      .onEachConnection(conn => startMercurialForConnection(fs, conn)),
  );

  const hgDocumentProvider = vscode.workspace.registerTextDocumentContentProvider(
    HG_TEXT_DOCUMENT_CONTENT_PROVIDER_SCHEME,
    new HgTextDocumentContentProvider(),
  );

  return vscode.Disposable.from(sub, hgDocumentProvider);
}

async function startMercurialForConnection(
  filesystem: RemoteFileSystem,
  conn: ConnectionWrapper,
): Promise<IDisposable> {
  const failedWorkspaces: Array<string> = [];

  const repos = await Promise.all(
    filesystem.getWorkspaceFolders().map(async workspace => {
      try {
        return await conn.hgIsRepo(filesystem.uriToPath(workspace.uri));
      } catch (error) {
        logger.error(error);
        failedWorkspaces.push(workspace.name);
        // Prevent breaking *all* repos:
        return null;
      }
    }),
  );

  if (failedWorkspaces.length > 0) {
    vscode.window.showErrorMessage(
      'Could not load mercurial repository for workspaces: ' +
        failedWorkspaces.join(', '),
    );
  }

  // Multiple workspace folders may share the same repo
  const roots = [
    ...new Set(
      repos
        .filter(Boolean)
        .map(x => x.root)
        .filter(Boolean),
    ),
  ];

  const hgScms = roots
    .map(root => {
      try {
        return new HgScm(root, filesystem, conn.hgObserveStatus(root));
      } catch (error) {
        logger.error(error);

        vscode.window.showErrorMessage(
          `Mercurial failed for ${filesystem.pathToUri(root).toString()}: ` +
            error.message,
        );
      }
    })
    .filter(Boolean);

  return vscode.Disposable.from(...hgScms);
}
