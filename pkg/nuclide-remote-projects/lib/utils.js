'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sanitizeNuclideUri = sanitizeNuclideUri;
exports.getOpenFileEditorForRemoteProject = getOpenFileEditorForRemoteProject;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NUCLIDE_PROTOCOL_PREFIX = 'nuclide:/';
const NUCLIDE_PROTOCOL_PREFIX_WIN = 'nuclide:\\';
const NUCLIDE_PROTOCOL_PREFIX_LENGTH = NUCLIDE_PROTOCOL_PREFIX.length;

/**
 * Clean a nuclide URI from the prepended absolute path prefixes and fix
 * the broken uri, in the sense that it's nuclide:/server/path/to/dir instead of
 * nuclide://server/path/to/dir because Atom called path.normalize() on the directory uri.
 */
function sanitizeNuclideUri(uri_) {
  let uri = uri_;
  // Remove the leading absolute path prepended to the file paths
  // between atom reloads.
  const protocolIndex = uri.indexOf(NUCLIDE_PROTOCOL_PREFIX);
  if (protocolIndex > 0) {
    uri = uri.substring(protocolIndex);
  }
  // Add the missing slash, if removed through a path.normalize() call.
  if (uri.startsWith(NUCLIDE_PROTOCOL_PREFIX) && uri[NUCLIDE_PROTOCOL_PREFIX_LENGTH] !== '/' /* protocol missing last slash */) {

      uri = uri.substring(0, NUCLIDE_PROTOCOL_PREFIX_LENGTH) + '/' + uri.substring(NUCLIDE_PROTOCOL_PREFIX_LENGTH);
    }

  // On Windows path normalization converts all of the '/' chars to '\'
  // we need to revert that
  if (uri.startsWith(NUCLIDE_PROTOCOL_PREFIX_WIN)) {
    uri = NUCLIDE_PROTOCOL_PREFIX + '/' + uri.substring(NUCLIDE_PROTOCOL_PREFIX_LENGTH).replace(/\\/g, '/');
  }
  return uri;
}

function* getOpenFileEditorForRemoteProject(connectionConfig) {
  for (const pane of atom.workspace.getPanes()) {
    const paneItems = pane.getItems();
    for (const paneItem of paneItems) {
      if (!atom.workspace.isTextEditor(paneItem) || !paneItem.getURI()) {
        // Ignore non-text editors and new editors with empty uris / paths.
        continue;
      }
      const uri = sanitizeNuclideUri(paneItem.getURI());

      var _nuclideUri$parse = (_nuclideUri || _load_nuclideUri()).default.parse(uri);

      const fileHostname = _nuclideUri$parse.hostname,
            filePath = _nuclideUri$parse.path;

      if (fileHostname === connectionConfig.host) {
        if (!fileHostname) {
          throw new Error('Invariant violation: "fileHostname"');
        }

        yield {
          pane: pane,
          editor: paneItem,
          uri: uri,
          filePath: filePath
        };
      }
    }
  }
}