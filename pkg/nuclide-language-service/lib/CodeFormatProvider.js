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
import type {BusySignalProviderBase} from '../../nuclide-busy-signal';
import type {
  CodeFormatProvider as CodeFormatProviderType,
} from '../../nuclide-code-format/lib/types';
import type {TextEdit} from '../../nuclide-textedit/lib/rpc-types';

import {ConnectionCache} from '../../nuclide-remote-connection';
import {trackTiming} from '../../nuclide-analytics';
import {getFileVersionOfEditor} from '../../nuclide-open-files';

export type CodeFormatConfig = {|
  version: '0.0.0',
  priority: number,
  analyticsEventName: string,
  formatEntireFile: boolean,
|};

export class CodeFormatProvider<T: LanguageService> {
  name: string;
  selector: string;
  inclusionPriority: number;
  _analyticsEventName: string;
  _connectionToLanguageService: ConnectionCache<T>;
  _busySignalProvider: BusySignalProviderBase;

  constructor(
    name: string,
    selector: string,
    priority: number,
    analyticsEventName: string,
    connectionToLanguageService: ConnectionCache<T>,
    busySignalProvider: BusySignalProviderBase,
  ) {
    this.name = name;
    this.selector = selector;
    this.inclusionPriority = priority;
    this._connectionToLanguageService = connectionToLanguageService;
    this._busySignalProvider = busySignalProvider;
  }

  static register(
    name: string,
    selector: string,
    config: CodeFormatConfig,
    connectionToLanguageService: ConnectionCache<T>,
    busySignalProvider: BusySignalProviderBase,
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
          busySignalProvider,
        )
        : new RangeFormatProvider(
          name,
          selector,
          config.priority,
          config.analyticsEventName,
          connectionToLanguageService,
          busySignalProvider,
        ));
  }
}

class RangeFormatProvider<T: LanguageService> extends CodeFormatProvider<T>
    implements CodeFormatProviderType {
  constructor(
    name: string,
    selector: string,
    priority: number,
    analyticsEventName: string,
    connectionToLanguageService: ConnectionCache<T>,
    busySignalProvider: BusySignalProviderBase,
  ) {
    super(
      name,
      selector,
      priority,
      analyticsEventName,
      connectionToLanguageService,
      busySignalProvider,
    );
  }

  formatCode(editor: atom$TextEditor, range: atom$Range): Promise<Array<TextEdit>> {
    return trackTiming(this._analyticsEventName, async () => {
      const fileVersion = await getFileVersionOfEditor(editor);
      const languageService = this._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService != null && fileVersion != null) {
        const result = await this._busySignalProvider.reportBusy(
          `${this.name}: Formatting ${fileVersion.filePath}`,
          async () => {
            return (await languageService).formatSource(fileVersion, range);
          });
        if (result != null) {
          return result;
        }
      }

      return [];
    });
  }
}

class FileFormatProvider<T: LanguageService> extends CodeFormatProvider<T>
    implements CodeFormatProviderType {
  constructor(
    name: string,
    selector: string,
    priority: number,
    analyticsEventName: string,
    connectionToLanguageService: ConnectionCache<T>,
    busySignalProvider: BusySignalProviderBase,
  ) {
    super(
      name,
      selector,
      priority,
      analyticsEventName,
      connectionToLanguageService,
      busySignalProvider,
    );
  }

  formatEntireFile(editor: atom$TextEditor, range: atom$Range): Promise<{
    newCursor?: number,
    formatted: string,
  }> {
    return trackTiming(this._analyticsEventName, async () => {
      const fileVersion = await getFileVersionOfEditor(editor);
      const languageService = this._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService != null && fileVersion != null) {
        const result = await this._busySignalProvider.reportBusy(
          `${this.name}: Formatting ${fileVersion.filePath}`,
          async () => {
            return (await languageService).formatEntireFile(fileVersion, range);
          });
        if (result != null) {
          return result;
        }
      }

      return {formatted: editor.getText()};
    });
  }
}
