'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOpenFileEditorForRemoteProject = getOpenFileEditorForRemoteProject;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _RemoteTextEditorPlaceholder;

function _load_RemoteTextEditorPlaceholder() {
  return _RemoteTextEditorPlaceholder = require('./RemoteTextEditorPlaceholder');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function* getOpenFileEditorForRemoteProject(connectionConfig) {
  for (const pane of atom.workspace.getPanes()) {
    const paneItems = pane.getItems();
    for (const paneItem of paneItems) {
      if (!(paneItem instanceof (_RemoteTextEditorPlaceholder || _load_RemoteTextEditorPlaceholder()).RemoteTextEditorPlaceholder)) {
        continue;
      }
      const uri = paneItem.getPath();
      const { hostname: fileHostname, path: filePath } = (_nuclideUri || _load_nuclideUri()).default.parse(uri);
      if (fileHostname === connectionConfig.host) {
        // flowlint-next-line sketchy-null-string:off
        if (!fileHostname) {
          throw new Error('Invariant violation: "fileHostname"');
        }

        yield {
          pane,
          editor: paneItem,
          uri,
          filePath
        };
      }
    }
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   *  strict-local
   * @format
   */