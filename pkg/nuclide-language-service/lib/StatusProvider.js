/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {IconName} from 'nuclide-commons-ui/Icon';
import type {LanguageService, StatusData} from './LanguageService';

import {Observable} from 'rxjs';
import {ConnectionCache} from '../../nuclide-remote-connection';
import {track, trackTiming} from '../../nuclide-analytics';
import {getFileVersionOfEditor} from '../../nuclide-open-files';

export type StatusConfig = {|
  version: '0.1.0',
  priority: number,
  observeEventName: string,
  clickEventName: string,
  icon?: IconName,
|};

export class StatusProvider<T: LanguageService> {
  name: string;
  priority: number;
  grammarScopes: Array<string>;
  icon: ?IconName;
  _observeEventName: string;
  _clickEventName: string;
  _connectionToLanguageService: ConnectionCache<T>;

  constructor(
    name: string,
    grammars: Array<string>,
    priority: number,
    observeEventName: string,
    clickEventName: string,
    connectionToLanguageService: ConnectionCache<T>,
    icon?: IconName,
  ) {
    this.name = name;
    this.priority = priority;
    this.grammarScopes = grammars;
    this.icon = icon;
    this._observeEventName = observeEventName;
    this._clickEventName = clickEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(
    name: string,
    grammars: Array<string>,
    config: StatusConfig,
    connectionToLanguageService: ConnectionCache<T>,
  ): IDisposable {
    return atom.packages.serviceHub.provide(
      'nuclide-language-status',
      config.version,
      new StatusProvider(
        name,
        grammars,
        config.priority,
        config.observeEventName,
        config.clickEventName,
        connectionToLanguageService,
      ),
    );
  }

  observeStatus(editor: TextEditor): Observable<StatusData> {
    return Observable.fromPromise(
      Promise.all([
        this._connectionToLanguageService.getForUri(editor.getPath()),
        getFileVersionOfEditor(editor),
      ]),
    ).flatMap(([languageService, fileVersion]) => {
      if (languageService == null || fileVersion == null) {
        return Observable.of({kind: 'null'});
      }
      return languageService
        .observeStatus(fileVersion)
        .refCount()
        .map(status => {
          track(this._observeEventName, {status});
          return status;
        });
    });
  }

  async clickStatus(
    editor: TextEditor,
    id: string,
    button: string,
  ): Promise<void> {
    return trackTiming(this._clickEventName, async () => {
      const fileVersion = await getFileVersionOfEditor(editor);
      const languageService = await this._connectionToLanguageService.getForUri(
        editor.getPath(),
      );
      if (languageService == null || fileVersion == null) {
        return;
      }
      await languageService.clickStatus(fileVersion, id, button);
    });
  }
}
