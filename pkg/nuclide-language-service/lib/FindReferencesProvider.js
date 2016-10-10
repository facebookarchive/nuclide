'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FindReferencesReturn} from '../../nuclide-find-references/lib/rpc-types';
import type {LanguageService} from '../../nuclide-hack-rpc/lib/LanguageService';

import {ConnectionCache} from '../../nuclide-remote-connection';
import {trackOperationTiming} from '../../nuclide-analytics';
import loadingNotification from '../../commons-atom/loading-notification';
import {getFileVersionOfEditor} from '../../nuclide-open-files';

export type FindReferencesConfig = {
  version: string,
};

export class FindReferencesProvider<T: LanguageService> {
  grammarScopes: Array<string>;
  name: string;
  _connectionToLanguageService: ConnectionCache<T>;

  constructor(
    name: string,
    grammarScopes: Array<string>,
    connectionToLanguageService: ConnectionCache<T>,
  ) {
    this.name = name;
    this.grammarScopes = grammarScopes;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(
    name: string,
    grammarScopes: Array<string>,
    config: FindReferencesConfig,
    connectionToLanguageService: ConnectionCache<T>,
  ): IDisposable {
    return atom.packages.serviceHub.provide(
      'nuclide-find-references.provider',
      config.version,
      new FindReferencesProvider(
        name,
        grammarScopes,
        connectionToLanguageService,
      ));
  }

  async isEditorSupported(textEditor: atom$TextEditor): Promise<boolean> {
    return textEditor.getPath() != null
      && this.grammarScopes.includes(textEditor.getGrammar().scopeName);
  }

  findReferences(editor: atom$TextEditor, position: atom$Point): Promise<?FindReferencesReturn> {
    return trackOperationTiming(`${this.name.toLowerCase()}:findReferences`, async () => {
      const fileVersion = await getFileVersionOfEditor(editor);
      const languageService = this._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService == null || fileVersion == null) {
        return null;
      }

      return await loadingNotification(
        (await languageService).findReferences(fileVersion, position),
        `Loading references from ${this.name} server...`,
      );
    });
  }
}
