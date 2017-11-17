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

import type {Observable} from 'rxjs';
import type ClangFlagsManager from '../ClangFlagsManager';
import type {ClangRequestSettings} from '../rpc-types';
import typeof * as ClangProcessService from '../ClangProcessService';

import {augmentDefaultFlags} from '../ClangServerManager';
import {RC} from './RC';
import {rcCommand} from './utils';

function rcCompileCommand(
  src: string,
  flags: Array<string>,
): Observable<string> {
  return rcCommand(['--compile', `${flags.concat([src]).join(' ')}`]);
}

export default class RTagsManager {
  _flagsManager: ClangFlagsManager;
  _compilationDatabases: Set<string>; // string because we only use .file

  constructor(flagsManager: ClangFlagsManager) {
    this._flagsManager = flagsManager;
    this._compilationDatabases = new Set();
    // TODO pelmers: lazily initialize the 'rdm' process on first getService.
  }

  async _fallbackGetService(
    src: string,
    defaultFlags: ?Array<string>,
  ): Promise<?ClangProcessService> {
    if (defaultFlags != null) {
      await rcCompileCommand(
        src,
        await augmentDefaultFlags(src, defaultFlags),
      ).toPromise();
      return new RC(src);
    } else {
      return null;
    }
  }

  async getService(
    src: string,
    contents: string,
    _requestSettings: ?ClangRequestSettings,
    defaultFlags?: ?Array<string>,
  ): Promise<?ClangProcessService> {
    const requestSettings = _requestSettings || {
      compilationDatabase: null,
      projectRoot: null,
    };
    // First try to ensure the compilation database is loaded.
    const file = await this._flagsManager.getDatabaseForSrc(src);
    if (file != null) {
      if (!this._compilationDatabases.has(file)) {
        this._compilationDatabases.add(file);
        await rcCommand(['--load-compile-commands', file]).toPromise();
      }
      return new RC(src);
    }
    // Otherwise the file may be new/a header, ask for compilation flags.
    const flags = await this._flagsManager.getFlagsForSrc(src, requestSettings);
    if (flags && flags.flags) {
      await rcCompileCommand(src, flags.flags).toPromise();
      return new RC(src);
    }
    return this._fallbackGetService(src, defaultFlags);
  }

  reset(src?: string): void {
    this._compilationDatabases.clear();
    if (src == null) {
      rcCommand(['--clear']);
    }
  }
}
