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

export type AutocompleteConfig = {
  inclusionPriority: number,
  suggestionPriority: number,
  excludeLowerPriority: boolean,
  version: string,
};

export class AutocompleteProvider {
  selector: string;
  inclusionPriority: number;
  suggestionPriority: number;
  excludeLowerPriority: boolean;
  _connectionToLanguageService: ConnectionCache<LanguageService>;

  constructor(
    selector: string,
    inclusionPriority: number,
    suggestionPriority: number,
    excludeLowerPriority: boolean,
    connectionToLanguageService: ConnectionCache<LanguageService>,
  ) {
    this.selector = selector;
    this.inclusionPriority = inclusionPriority;
    this.suggestionPriority = suggestionPriority;
    this.excludeLowerPriority = excludeLowerPriority;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(
    grammars: Array<string>,
    config: AutocompleteConfig,
    connectionToLanguageService: ConnectionCache<LanguageService>,
  ): IDisposable {
    return atom.packages.serviceHub.provide(
      'autocomplete.provider',
      config.version,
      new AutocompleteProvider(
        grammars.map(grammar => '.' + grammar).join(', '),
        config.inclusionPriority,
        config.suggestionPriority,
        config.excludeLowerPriority,
        connectionToLanguageService,
      ));
  }

  // TODO: Fix tracking ids
  @trackTiming('hack.getAutocompleteSuggestions')
  async getSuggestions(
    request: atom$AutocompleteRequest,
  ): Promise<?Array<atom$AutocompleteSuggestion>> {
    const {editor, activatedManually} = request;
    const fileVersion = await getFileVersionOfEditor(editor);
    const languageService = this._connectionToLanguageService.getForUri(editor.getPath());
    if (languageService == null || fileVersion == null) {
      return [];
    }
    const position = editor.getLastCursor().getBufferPosition();

    return await (await languageService).getAutocompleteSuggestions(
      fileVersion, position, activatedManually == null ? false : activatedManually);
  }
}
