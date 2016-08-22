'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {RemoteDirectory} from '../../nuclide-remote-connection';
import type {Observable} from 'rxjs';

import {observableFromSubscribeFunction} from '../../commons-node/event';
import {DisposableSubscription} from '../../commons-node/stream';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import FileTreeHelpers from '../../nuclide-file-tree/lib/FileTreeHelpers';
import {CompositeDisposable, Directory as LocalDirectory} from 'atom';
import {BehaviorSubject} from 'rxjs';

type Directory = LocalDirectory | RemoteDirectory;

export class CwdApi {
  _cwd$: Observable<?Directory>;
  _cwdPath$: BehaviorSubject<?string>;
  _disposables: CompositeDisposable;

  constructor(initialCwdPath: ?string) {
    this._cwdPath$ = new BehaviorSubject(initialCwdPath);
    this._cwd$ = this._cwdPath$
      // Re-check the CWD every time the project paths change.
      // Adding/removing projects can affect the validity of cwdPath.
      .merge(
        observableFromSubscribeFunction(cb => atom.project.onDidChangePaths(cb))
          .mapTo(null),
      )
      .map(() => this.getCwd())
      .map(directory => (isValidDirectory(directory) ? directory : null))
      .distinctUntilChanged();

    this._disposables = new CompositeDisposable();
  }

  setCwd(path: string): void {
    if (getDirectory(path) == null) {
      throw new Error(`Path is not a project root: ${path}`);
    }
    this._cwdPath$.next(path);
  }

  observeCwd(callback: (directory: ?Directory) => void): IDisposable {
    const disposable = new DisposableSubscription(
      this._cwd$.subscribe(directory => { callback(directory); }),
    );
    this._disposables.add(disposable);
    return disposable;
  }

  dispose(): void {
    this._disposables.dispose();
  }

  _getDefaultCwdPath(): ?string {
    const directory = atom.project.getDirectories()[0];
    return directory == null ? null : directory.getPath();
  }

  getCwd(): ?Directory {
    return getDirectory(this._cwdPath$.getValue()) || getDirectory(this._getDefaultCwdPath());
  }

}

function getDirectory(path: ?string): ?Directory {
  if (path == null) {
    return null;
  }
  return atom.project.getDirectories().find(dir => dir.getPath() === path);
}

function isValidDirectory(directory: ?Directory): boolean {
  if (directory == null) {
    return true;
  }
  return FileTreeHelpers.isValidDirectory(directory);
}
