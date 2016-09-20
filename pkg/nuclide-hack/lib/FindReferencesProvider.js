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

import {HACK_GRAMMARS_SET} from '../../nuclide-hack-common';
import {trackOperationTiming} from '../../nuclide-analytics';
import {getHackLanguageForUri} from './HackLanguage';
import loadingNotification from '../../commons-atom/loading-notification';
import {getFileVersionOfEditor} from '../../nuclide-open-files';

module.exports = {
  async isEditorSupported(textEditor: atom$TextEditor): Promise<boolean> {
    const fileUri = textEditor.getPath();
    if (!fileUri || !HACK_GRAMMARS_SET.has(textEditor.getGrammar().scopeName)) {
      return false;
    }
    return true;
  },

  findReferences(editor: atom$TextEditor, position: atom$Point): Promise<?FindReferencesReturn> {
    return trackOperationTiming('hack:findReferences', async () => {
      const fileVersion = await getFileVersionOfEditor(editor);
      const hackLanguage = await getHackLanguageForUri(editor.getPath());
      if (hackLanguage == null || fileVersion == null) {
        return null;
      }
      return await loadingNotification(
        hackLanguage.findReferences(fileVersion, position),
        'Loading references from Hack server...',
      );
    });
  },
};
