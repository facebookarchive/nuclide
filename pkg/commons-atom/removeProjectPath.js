'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
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

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (projectPath) {
    // close all the files associated with the project before closing
    const projectEditors = atom.workspace.getTextEditors();
    for (const editor of projectEditors) {
      const path = editor.getPath();
      // if the path of the editor is not null AND
      // is part of the root that would be removed AND
      // is not part of any other open root, then close the file.
      if (path != null && path.startsWith((_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(projectPath)) && atom.project.getPaths().filter(function (root) {
        return path.startsWith((_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(root));
      }).length === 1) {
        // eslint-disable-next-line no-await-in-loop
        const didDestroy = yield atom.workspace.paneForURI(path).destroyItem(editor);

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
  });

  function removeProjectPath(_x) {
    return _ref.apply(this, arguments);
  }

  return removeProjectPath;
})();