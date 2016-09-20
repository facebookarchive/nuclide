'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TypeHint} from '../../nuclide-type-hint/lib/rpc-types';

import {getHackLanguageForUri} from './HackLanguage';
import {getFileVersionOfEditor} from '../../nuclide-open-files';
import {trackTiming} from '../../nuclide-analytics';

module.exports = class TypeHintProvider {

  @trackTiming('hack.typeHint')
  async typeHint(editor: atom$TextEditor, position: atom$Point): Promise<?TypeHint> {
    const fileVersion = await getFileVersionOfEditor(editor);
    const hackLanguage = await getHackLanguageForUri(editor.getPath());
    if (hackLanguage == null || fileVersion == null) {
      return null;
    }
    return await hackLanguage.typeHint(fileVersion, position);
  }

};
