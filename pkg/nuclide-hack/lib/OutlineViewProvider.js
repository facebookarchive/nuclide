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
import type {HackOutline} from '../../nuclide-hack-base/lib/HackService';

import {outlineFromEditor} from './hack';

export class OutlineViewProvider {
  async getOutline(editor: atom$TextEditor): Promise<?Outline> {
    const hackOutline = await outlineFromEditor(editor);
    if (hackOutline == null) {
      return null;
    }
    return outlineFromHackOutline(hackOutline);
  }
}

function outlineFromHackOutline(hackOutline: HackOutline): Outline {
  // TODO return real outline
  return (null: any);
}
