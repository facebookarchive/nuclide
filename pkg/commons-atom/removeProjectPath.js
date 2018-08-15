"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
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
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('commons-atom');

var removeProjectPath = async function removeProjectPath(projectPath) {
  logger.info(`Removing project path ${projectPath}`); // close all the files associated with the project before closing

  const projectEditors = atom.workspace.getTextEditors();

  for (const editor of projectEditors) {
    const path = editor.getPath(); // if the path of the editor is not null AND
    // is part of the root that would be removed AND
    // is not part of any other open root, then close the file.

    if (path != null && path.startsWith(_nuclideUri().default.ensureTrailingSeparator(projectPath)) && atom.project.getPaths().filter(root => path.startsWith(_nuclideUri().default.ensureTrailingSeparator(root))).length === 1) {
      // eslint-disable-next-line no-await-in-loop
      const didDestroy = await atom.workspace.paneForURI(path).destroyItem(editor); // Atom has a bug where, in some cases, destroyItem returns nonsense.
      // Luckily, in the case we care about, it returns a literal `false`,
      // so we check for that explictly.
      // https://github.com/atom/atom/issues/15157

      if (didDestroy === false) {
        return;
      }
    }
  } // actually close the project


  atom.project.removePath(_nuclideUri().default.trimTrailingSeparator(projectPath));
};

exports.default = removeProjectPath;