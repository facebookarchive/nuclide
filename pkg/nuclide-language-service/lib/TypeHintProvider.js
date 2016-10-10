'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TypeHint} from '../../nuclide-type-hint/lib/rpc-types';
import type {LanguageService} from '../../nuclide-hack-rpc/lib/LanguageService';

import {ConnectionCache} from '../../nuclide-remote-connection';
import {getFileVersionOfEditor} from '../../nuclide-open-files';
import {trackTiming} from '../../nuclide-analytics';

export type TypeHintConfig = {
  version: string,
  priority: number,
};

export class TypeHintProvider<T: LanguageService> {
  providerName: string;
  selector: string;
  inclusionPriority: number;
  _connectionToLanguageService: ConnectionCache<T>;

  constructor(
    name: string,
    selector: string,
    priority: number,
    connectionToLanguageService: ConnectionCache<T>,
  ) {
    this.providerName = name;
    this.selector = selector;
    this.inclusionPriority = priority;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(
    name: string,
    selector: string,
    config: TypeHintConfig,
    connectionToLanguageService: ConnectionCache<T>,
  ): IDisposable {
    return atom.packages.serviceHub.provide(
      'nuclide-type-hint.provider',
      config.version,
      new TypeHintProvider(
        name,
        selector,
        config.priority,
        connectionToLanguageService,
      ));
  }

  // TODO: Fix up tracking names
  @trackTiming('hack.typeHint')
  async typeHint(editor: atom$TextEditor, position: atom$Point): Promise<?TypeHint> {
    const fileVersion = await getFileVersionOfEditor(editor);
    const languageService = this._connectionToLanguageService.getForUri(editor.getPath());
    if (languageService == null || fileVersion == null) {
      return null;
    }

    return await (await languageService).typeHint(fileVersion, position);
  }
}
