/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {LanguageService} from './LanguageService';

import {ConnectionCache} from '../../nuclide-remote-connection';
import {trackTiming} from '../../nuclide-analytics';
import {getFileVersionOfEditor} from '../../nuclide-open-files';

export type CodeFormatConfig = {
  version: '0.0.0',
  priority: number,
  analyticsEventName: string,
  formatEntireFile: boolean,
};

export class CodeFormatProvider<T: LanguageService> {
  name: string;
  selector: string;
  inclusionPriority: number;
  _analyticsEventName: string;
  _connectionToLanguageService: ConnectionCache<T>;

  constructor(
    name: string,
    selector: string,
    priority: number,
    analyticsEventName: string,
    connectionToLanguageService: ConnectionCache<T>,
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
    connectionToLanguageService: ConnectionCache<T>,
  ): IDisposable {
    return atom.packages.serviceHub.provide(
      'nuclide-code-format.provider',
      config.version,
      config.formatEntireFile
        ? new FileFormatProvider(
          name,
          selector,
          config.priority,
          config.analyticsEventName,
          connectionToLanguageService,
        )
        : new RangeFormatProvider(
          name,
          selector,
          config.priority,
          config.analyticsEventName,
          connectionToLanguageService,
        ));
  }
}

class RangeFormatProvider<T: LanguageService> extends CodeFormatProvider<T> {
  constructor(
    name: string,
    selector: string,
    priority: number,
    analyticsEventName: string,
    connectionToLanguageService: ConnectionCache<T>,
  ) {
    super(name, selector, priority, analyticsEventName, connectionToLanguageService);
  }

  formatCode(editor: atom$TextEditor, range: atom$Range): Promise<string> {
    return trackTiming(this._analyticsEventName, async () => {
      const fileVersion = await getFileVersionOfEditor(editor);
      const languageService = this._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService != null && fileVersion != null) {
        const result = await (await languageService).formatSource(fileVersion, range);
        if (result != null) {
          return result;
        }
      }

      return editor.getTextInBufferRange(range);
    });
  }
}

class FileFormatProvider<T: LanguageService> extends CodeFormatProvider<T> {
  constructor(
    name: string,
    selector: string,
    priority: number,
    analyticsEventName: string,
    connectionToLanguageService: ConnectionCache<T>,
  ) {
    super(name, selector, priority, analyticsEventName, connectionToLanguageService);
  }

  formatEntireFile(editor: atom$TextEditor, range: atom$Range): Promise<{
    newCursor?: number,
    formatted: string,
  }> {
    return trackTiming(this._analyticsEventName, async () => {
      const fileVersion = await getFileVersionOfEditor(editor);
      const languageService = this._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService != null && fileVersion != null) {
        const result = await (await languageService).formatEntireFile(fileVersion, range);
        if (result != null) {
          return result;
        }
      }

      return {formatted: editor.getText()};
    });
  }
}
