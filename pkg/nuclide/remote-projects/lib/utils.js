'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const NUCLIDE_PROTOCOL_PREFIX = 'nuclide:/';
const NUCLIDE_PROTOCOL_PREFIX_LENGTH = NUCLIDE_PROTOCOL_PREFIX.length;

export type OpenFileEditorInstance = {
  pane: atom$Pane;
  editor: atom$TextEditor;
  uri: NuclideUri;
  filePath: string;
};

import {TextEditor} from 'atom';

/**
 * Clean a nuclide URI from the prepended absolute path prefixes and fix
 * the broken uri, in the sense that it's nuclide:/server:897/path/to/dir instead of
 * nuclide://server:897/path/to/dir because Atom called path.normalize() on the directory uri.
 */
export function sanitizeNuclideUri(uri: string): string {
  // Remove the leading absolute path prepended to the file paths
  // between atom reloads.
  var protocolIndex = uri.indexOf(NUCLIDE_PROTOCOL_PREFIX);
  if (protocolIndex > 0) {
    uri = uri.substring(protocolIndex);
  }
  // Add the missing slash, if removed through a path.normalize() call.
  if (uri.startsWith(NUCLIDE_PROTOCOL_PREFIX) &&
      uri[NUCLIDE_PROTOCOL_PREFIX_LENGTH] !== '/' /*protocol missing last slash*/) {

    uri = uri.substring(0, NUCLIDE_PROTOCOL_PREFIX_LENGTH) +
        '/' + uri.substring(NUCLIDE_PROTOCOL_PREFIX_LENGTH);
  }
  return uri;
}

export function* getOpenFileEditorForRemoteProject(
  projectHostname: string,
  projectDirectory: string,
): Iterator<OpenFileEditorInstance> {
  for (const pane of atom.workspace.getPanes()) {
    const paneItems = pane.getItems();
    for (const paneItem of paneItems) {
      if (!(paneItem instanceof TextEditor) || !paneItem.getURI()) {
        // Ignore nn-text editors and new editors with empty uris / paths.
        continue;
      }
      const uri = sanitizeNuclideUri(paneItem.getURI());
      const {hostname: fileHostname, path: filePath} = require('nuclide-remote-uri').parse(uri);
      if (fileHostname === projectHostname && filePath.startsWith(projectDirectory)) {
        yield {
          pane,
          editor: paneItem,
          uri,
          filePath,
        };
      }
    }
  }
}
