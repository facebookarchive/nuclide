"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOpenFileEditorForRemoteProject = getOpenFileEditorForRemoteProject;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _RemoteTextEditorPlaceholder() {
  const data = require("./RemoteTextEditorPlaceholder");

  _RemoteTextEditorPlaceholder = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
function* getOpenFileEditorForRemoteProject() {
  for (const pane of atom.workspace.getPanes()) {
    const paneItems = pane.getItems();

    for (const paneItem of paneItems) {
      if (!(paneItem instanceof _RemoteTextEditorPlaceholder().RemoteTextEditorPlaceholder)) {
        continue;
      }

      const uri = paneItem.getPath();
      const repositoryDescription = paneItem.getRepositoryDescription();

      const {
        path: filePath
      } = _nuclideUri().default.parse(uri);

      yield {
        pane,
        editor: paneItem,
        uri,
        filePath,
        repositoryDescription
      };
    }
  }
}