'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {LanguageService} from '../../nuclide-hack-rpc/lib/LanguageService';

import {ConnectionCache} from '../../nuclide-remote-connection';
import {trackTiming} from '../../nuclide-analytics';
import {getFileVersionOfEditor} from '../../nuclide-open-files';

export type CodeFormatConfig = {
  version: string,
  priority: number,
};

export class CodeFormatProvider {
  name: string;
  selector: string;
  inclusionPriority: number;
  _connectionToLanguageService: ConnectionCache<LanguageService>;

  constructor(
    name: string,
    selector: string,
    priority: number,
    connectionToLanguageService: ConnectionCache<LanguageService>,
  ) {
    this.name = name;
    this.selector = selector;
    this.inclusionPriority = priority;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(
    name: string,
    selector: string,
    config: CodeFormatConfig,
    connectionToLanguageService: ConnectionCache<LanguageService>,
  ): IDisposable {
    return atom.packages.serviceHub.provide(
      'nuclide-code-format.provider',
      config.version,
      new CodeFormatProvider(
        name,
        selector,
        config.priority,
        connectionToLanguageService,
      ));
  }

  // TODO: Fixup tracking ids
  @trackTiming('hack.formatCode')
  async formatCode(editor: atom$TextEditor, range: atom$Range): Promise<string> {
    const fileVersion = await getFileVersionOfEditor(editor);
    const languageService = this._connectionToLanguageService.getForUri(editor.getPath());
    if (languageService == null || fileVersion == null) {
      return editor.getTextInBufferRange(range);
    }

    return await (await languageService).formatSource(fileVersion, range);
  }
}
