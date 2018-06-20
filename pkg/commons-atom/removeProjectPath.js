'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../modules/nuclide-commons/nuclideUri'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('commons-atom'); /**
                                                                            * Copyright (c) 2015-present, Facebook, Inc.
                                                                            * All rights reserved.
                                                                            *
                                                                            * This source code is licensed under the license found in the LICENSE file in
                                                                            * the root directory of this source tree.
                                                                            *
                                                                            * 
                                                                            * @format
                                                                            */

exports.default = async function removeProjectPath(projectPath) {
  logger.info(`Removing project path ${projectPath}`);

  // close all the files associated with the project before closing
  const projectEditors = atom.workspace.getTextEditors();
  for (const editor of projectEditors) {
    const path = editor.getPath();
    // if the path of the editor is not null AND
    // is part of the root that would be removed AND
    // is not part of any other open root, then close the file.
    if (path != null && path.startsWith((_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(projectPath)) && atom.project.getPaths().filter(root => path.startsWith((_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(root))).length === 1) {
      // eslint-disable-next-line no-await-in-loop
      const didDestroy = await atom.workspace.paneForURI(path).destroyItem(editor);

      // Atom has a bug where, in some cases, destroyItem returns nonsense.
      // Luckily, in the case we care about, it returns a literal `false`,
      // so we check for that explictly.
      // https://github.com/atom/atom/issues/15157
      if (didDestroy === false) {
        return;
      }
    }
  }

  // actually close the project
  atom.project.removePath((_nuclideUri || _load_nuclideUri()).default.trimTrailingSeparator(projectPath));
};