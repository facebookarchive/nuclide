'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Outline} from '../../nuclide-outline-view';

import {getShowGlobalVariables} from './config';
import {generateOutline} from './outline';

export default class OutlineHelpers {
  static async getOutline(editor: atom$TextEditor): Promise<?Outline> {
    const src = editor.getPath();
    if (!src) {
      return null;
    }
    const contents = editor.getText();
    const mode = getShowGlobalVariables() ? 'all' : 'constants';
    return generateOutline(src, contents, mode);
  }
}
