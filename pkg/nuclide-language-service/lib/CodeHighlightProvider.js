'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {LanguageService} from './LanguageService';

import {ConnectionCache} from '../../nuclide-remote-connection';
import {getFileVersionOfEditor} from '../../nuclide-open-files';
import {Range} from 'atom';

export type CodeHighlightConfig = {
  version: string,
  priority: number,
};

export class CodeHighlightProvider<T: LanguageService> {
  selector: string;
  inclusionPriority: number;
  _connectionToLanguageService: ConnectionCache<T>;

  constructor(
    selector: string,
    priority: number,
    connectionToLanguageService: ConnectionCache<T>,
  ) {
    this.selector = selector;
    this.inclusionPriority = priority;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  async highlight(editor: atom$TextEditor, position: atom$Point): Promise<Array<atom$Range>> {
    const fileVersion = await getFileVersionOfEditor(editor);
    const languageService = this._connectionToLanguageService.getForUri(editor.getPath());
    if (languageService == null || fileVersion == null) {
      return [];
    }

    return (await (await languageService).highlight(
      fileVersion,
      position)).map(range => new Range(range.start, range.end));
  }

  static register(
    selector: string,
    config: CodeHighlightConfig,
    connectionToLanguageService: ConnectionCache<T>,
  ): IDisposable {
    return atom.packages.serviceHub.provide(
      'nuclide-code-highlight.provider',
      config.version,
      new CodeHighlightProvider(
        selector,
        config.priority,
        connectionToLanguageService,
      ));
  }
}
