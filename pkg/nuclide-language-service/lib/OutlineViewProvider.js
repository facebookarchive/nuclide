'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Outline} from '../../nuclide-outline-view/lib/rpc-types';
import type {LanguageService} from '../../nuclide-hack-rpc/lib/LanguageService';

import {ConnectionCache} from '../../nuclide-remote-connection';
import {getFileVersionOfEditor} from '../../nuclide-open-files';

export type OutlineViewConfig = {
  version: string,
  priority: number,
};

export class OutlineViewProvider<T: LanguageService> {
  grammarScopes: string;
  priority: number;
  name: string;
  _connectionToLanguageService: ConnectionCache<T>;

  constructor(
    name: string,
    selector: string,
    priority: number,
    connectionToLanguageService: ConnectionCache<T>,
  ) {
    this.name = name;
    this.grammarScopes = selector;
    this.priority = priority;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(
    name: string,
    selector: string,
    config: OutlineViewConfig,
    connectionToLanguageService: ConnectionCache<T>,
  ): IDisposable {
    return atom.packages.serviceHub.provide(
      'nuclide-outline-view',
      config.version,
      new OutlineViewProvider(
        name,
        selector,
        config.priority,
        connectionToLanguageService,
      ));
  }

  async getOutline(editor: atom$TextEditor): Promise<?Outline> {
    const fileVersion = await getFileVersionOfEditor(editor);
    const languageService = this._connectionToLanguageService.getForUri(editor.getPath());
    if (languageService == null || fileVersion == null) {
      return null;
    }

    return await (await languageService).getOutline(fileVersion);
  }
}
