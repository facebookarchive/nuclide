'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {trackTiming} from '../../nuclide-analytics';
import {getHackLanguageForUri} from './HackLanguage';
import {getFileVersionOfEditor} from '../../nuclide-open-files';

export default class AutocompleteProvider {

  @trackTiming('hack.getAutocompleteSuggestions')
  async getAutocompleteSuggestions(
    request: atom$AutocompleteRequest,
  ): Promise<?Array<atom$AutocompleteSuggestion>> {
    const {editor, activatedManually} = request;
    const fileVersion = await getFileVersionOfEditor(editor);
    const hackLanguage = await getHackLanguageForUri(editor.getPath());
    if (hackLanguage == null || fileVersion == null) {
      return [];
    }
    const position = editor.getLastCursor().getBufferPosition();

    return await hackLanguage.getAutocompleteSuggestions(
      fileVersion, position, activatedManually == null ? false : activatedManually);
  }
}
