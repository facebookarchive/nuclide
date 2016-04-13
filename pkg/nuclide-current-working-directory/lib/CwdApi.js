'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import FileTreeHelpers from '../../nuclide-file-tree/lib/FileTreeHelpers';
import {RemoteConnection, RemoteDirectory} from '../../nuclide-remote-connection';
import RemoteUri from '../../nuclide-remote-uri';
import {CompositeDisposable, Directory as LocalDirectory} from 'atom';
import Rx from '@reactivex/rxjs';

type Directory = LocalDirectory | RemoteDirectory;

export class CwdApi {
  _cwd$: Rx.Observable<?Directory>;
  _cwdPath$: Rx.BehaviorSubject<?string>;
  _disposables: CompositeDisposable;

  constructor(initialCwdPath: ?string) {
    this._cwdPath$ = new Rx.BehaviorSubject(initialCwdPath);
    this._cwd$ = this._cwdPath$
      .distinctUntilChanged()
      .map(() => this.getCwd())
      .map(directory => isValidDirectory(directory) ? directory : null);

    this._disposables = new CompositeDisposable(
      // If the active directory is removed, fall back to the default.
      atom.project.onDidChangePaths(() => {
        const currentPath = this._cwdPath$.getValue();
        if (currentPath == null || !isValidCwdPath(currentPath)) {
          this._cwdPath$.next(this._getDefaultCwdPath());
        }
      }),
    );
  }

  setCwd(path: string): void {
    if (!isValidCwdPath(path)) {
      throw new Error(`Path is not a project root: ${path}`);
    }
    this._cwdPath$.next(path);
  }

  observeCwd(callback: (directory: ?Directory) => void): IDisposable {
    return this._cwd$.subscribe(directory => { callback(directory); });
  }

  dispose(): void {
    this._disposables.dispose();
  }

  _getDefaultCwdPath(): ?string {
    const directory = atom.project.getDirectories()[0];
    return directory == null ? null : directory.getPath();
  }

  getCwd(): ?Directory {
    return getDirectory(this._cwdPath$.getValue() || this._getDefaultCwdPath());
  }

}

function getDirectory(path: ?string): ?Directory {
  if (path == null) {
    return null;
  }
  if (RemoteUri.isRemote(path)) {
    const connection = RemoteConnection.getForUri(path);
    if (connection == null) {
      return null;
    }
    return new RemoteDirectory(connection.getConnection(), path);
  }
  return new LocalDirectory(path);
}

function isValidDirectory(directory: ?Directory): boolean {
  if (directory == null) {
    return true;
  }
  return FileTreeHelpers.isValidDirectory(directory);
}

function isValidCwdPath(path: ?string): boolean {
  if (path == null) {
    return true;
  }
  const validPaths = atom.project.getDirectories().map(directory => directory.getPath());
  return validPaths.indexOf(path) !== -1;
}
