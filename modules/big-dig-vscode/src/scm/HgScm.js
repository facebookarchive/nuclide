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

import type {Observable, Subscription} from 'rxjs';
import type {
  HgObserveStatusData,
  HgStatusCode,
} from 'big-dig-vscode-server/Protocol';
import type {RemoteFileSystem} from '../RemoteFileSystem';
import type {QuickDiffProvider, SourceControlResourceState} from 'vscode';

import * as vscode from 'vscode';
import pathModule from 'path';
import {getLogger} from 'log4js';
import {toHgUri} from './HgTextDocumentContentProvider';

const logger = getLogger('hg-scm');

/**
 * This creates an adapter between a Mercurial repository that backs a
 * RemoteFileSystem and VS Code's SCM API:
 * https://code.visualstudio.com/docs/extensionAPI/api-scm.
 */
export class HgScm {
  /**
   * The repoRoot may be an ancestor of a workspace folder.
   */
  _repoRoot: string;
  _remoteFileSystem: RemoteFileSystem;
  _scm: vscode.SourceControl;
  _scmResourceGroup: vscode.SourceControlResourceGroup;
  _subscription: Subscription;

  constructor(
    repoRoot: string,
    remoteFileSystem: RemoteFileSystem,
    statusObservable: Observable<HgObserveStatusData>,
  ) {
    this._repoRoot = repoRoot;
    this._remoteFileSystem = remoteFileSystem;
    const repoUri = remoteFileSystem.pathToUri(repoRoot);
    this._scm = vscode.scm.createSourceControl('hg', 'Hg', repoUri);
    this._scm.quickDiffProvider = new HgQuickDiffProvider();

    this._scmResourceGroup = this._scm.createResourceGroup(
      'workingTree',
      'Changes',
    );
    this._scmResourceGroup.hideWhenEmpty = true;

    this._subscription = statusObservable.subscribe(
      value => this._updateStatus(value),
      err => logger.error(`Failed running mercurial at ${repoRoot}`, err),
      () =>
        logger.info(`\`hg status\` observer of ${this._repoRoot} complete.`),
    );
  }

  _updateStatus(data: HgObserveStatusData) {
    this._scmResourceGroup.resourceStates = Object.entries(data.status).map(
      ([relativePath, code]) =>
        new Resource(relativePath, ((code: any): HgStatusCode), this),
    );
  }

  resolve(pathRelativeToRepoRoot: string): vscode.Uri {
    const fullPath = pathModule.join(this._repoRoot, pathRelativeToRepoRoot);
    return this._remoteFileSystem.pathToUri(fullPath);
  }

  dispose() {
    this._subscription.unsubscribe();
    this._scm.dispose();
  }
}

/**
 * Implementation of SourceControlResourceState that computes its fields lazily,
 * emulating the pattern of VS Code's own Git extension:
 * https://github.com/Microsoft/vscode/blob/master/extensions/git/src/repository.ts.
 */
class Resource implements SourceControlResourceState {
  _relativePath: string;
  _code: HgStatusCode;
  _hgScm: HgScm;

  constructor(relativePath: string, code: HgStatusCode, hgScm: HgScm) {
    this._relativePath = relativePath;
    this._code = code;
    this._hgScm = hgScm;
  }

  get resourceUri(): vscode.Uri {
    return this._hgScm.resolve(this._relativePath);
  }

  /**
   * Command to open the file when the user clicks on it in the Source Control
   * pane.
   */
  get command(): vscode.Command {
    return {
      command: 'vscode.open',
      title: 'Open',
      arguments: [this.resourceUri],
    };
  }

  get decorations(): vscode.SourceControlResourceDecorations {
    // We attempt to match the UI treatment of VS Code's own Git extension by
    // using some additional decoration properties (color, letter) that are
    // undocumented at the time of this writing. These are used in favor of the
    // light and dark icons.
    return {
      tooltip: codeToName(this._code),
      strikeThrough: this._code === 'R',
      faded: false,
      letter: this._code,
      color: codeToColor(this._code),
    };
  }
}

function codeToName(code: HgStatusCode): string {
  switch (code) {
    case 'M':
      return 'modified';
    case 'A':
      return 'added';
    case 'R':
      return 'deleted';
    case '!':
      return 'missing';
    case '?':
      return 'untracked';
    default:
      (code: empty);
      throw new Error(`Unknown code: ${code}`);
  }
}

function codeToColor(code: HgStatusCode): vscode.ThemeColor {
  // These colors match those of VS Code's built-in Git extension.
  // We might be in trouble if the user has disabled that extension...
  switch (code) {
    case 'M':
      return new vscode.ThemeColor('gitDecoration.modifiedResourceForeground');
    case 'A':
      return new vscode.ThemeColor('gitDecoration.untrackedResourceForeground');
    case 'R':
      return new vscode.ThemeColor(
        'gitDecoration.conflictingResourceForeground',
      );
    case '!':
      return new vscode.ThemeColor(
        'gitDecoration.conflictingResourceForeground',
      );
    case '?':
      return new vscode.ThemeColor('gitDecoration.untrackedResourceForeground');
    default:
      (code: empty);
      throw new Error(`Unknown code: ${code}`);
  }
}

class HgQuickDiffProvider implements QuickDiffProvider {
  provideOriginalResource(
    uri: vscode.Uri,
    token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.Uri> {
    return toHgUri(uri);
  }
}
