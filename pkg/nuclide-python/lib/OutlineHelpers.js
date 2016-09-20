'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof * as PythonService from '../../nuclide-python-rpc';
import type {Outline} from '../../nuclide-outline-view/lib/rpc-types';

import {getServiceByNuclideUri} from '../../nuclide-remote-connection';
import {getShowGlobalVariables} from './config';
import {itemsToOutline} from './outline';

export default class OutlineHelpers {
  static async getOutline(editor: atom$TextEditor): Promise<?Outline> {
    const src = editor.getPath();
    if (!src) {
      return null;
    }
    const contents = editor.getText();
    const mode = getShowGlobalVariables() ? 'all' : 'constants';

    const service: ?PythonService = await getServiceByNuclideUri('PythonService', src);
    if (!service) {
      return null;
    }

    const items = await service.getOutline(src, contents);
    if (items == null) {
      return null;
    }

    return {
      outlineTrees: itemsToOutline(mode, items),
    };
  }
}
