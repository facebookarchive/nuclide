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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import nuclideUri from 'nuclide-commons/nuclideUri';
import {RemoteTextEditorPlaceholder} from './RemoteTextEditorPlaceholder';

export type OpenFileEditorInstance = {
  pane: atom$Pane,
  editor: RemoteTextEditorPlaceholder,
  uri: NuclideUri,
  filePath: string,
};

export function* getOpenFileEditorForRemoteProject(): Iterator<
  OpenFileEditorInstance,
> {
  for (const pane of atom.workspace.getPanes()) {
    const paneItems = pane.getItems();
    for (const paneItem of paneItems) {
      if (!(paneItem instanceof RemoteTextEditorPlaceholder)) {
        continue;
      }
      const uri = paneItem.getPath();
      const {path: filePath} = nuclideUri.parse(uri);
      yield {
        pane,
        editor: paneItem,
        uri,
        filePath,
      };
    }
  }
}
