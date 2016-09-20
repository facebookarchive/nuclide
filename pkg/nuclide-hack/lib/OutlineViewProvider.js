'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Outline} from '../../nuclide-outline-view/lib/rpc-types';
import {getHackLanguageForUri} from './HackLanguage';
import {getFileVersionOfEditor} from '../../nuclide-open-files';

export class OutlineViewProvider {
  async getOutline(editor: atom$TextEditor): Promise<?Outline> {
    const fileVersion = await getFileVersionOfEditor(editor);
    const hackLanguage = await getHackLanguageForUri(editor.getPath());
    if (hackLanguage == null || fileVersion == null) {
      return null;
    }

    return await hackLanguage.getOutline(fileVersion);
  }
}
