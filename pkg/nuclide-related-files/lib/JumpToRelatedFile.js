"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _RelatedFileFinder() {
  const data = _interopRequireDefault(require("./RelatedFileFinder"));

  _RelatedFileFinder = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../modules/nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
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

/**
 * Sets up listeners so the user can jump to related files.
 *
 * Clients must call `dispose()` once they're done with an instance.
 */
class JumpToRelatedFile {
  constructor() {
    this._subscription = atom.commands.add('atom-workspace', {
      'nuclide-related-files:switch-between-header-source': () => {
        const editor = atom.workspace.getActiveTextEditor();

        if (editor == null) {
          return;
        }

        const path = editor.getPath(); // flowlint-next-line sketchy-null-string:off

        if (path) {
          (0, _nuclideAnalytics().trackTiming)('nuclide-related-files:switch-between-header-source', async () => this._open((await this.getNextRelatedFile(path))));
        }
      },
      'nuclide-related-files:jump-to-next-related-file': () => {
        const editor = atom.workspace.getActiveTextEditor();

        if (editor == null) {
          return;
        }

        const path = editor.getPath(); // flowlint-next-line sketchy-null-string:off

        if (path) {
          (0, _nuclideAnalytics().trackTiming)('nuclide-related-files:jump-to-next-related-file', async () => this._open((await this.getNextRelatedFile(path))));
        }
      },
      'nuclide-related-files:jump-to-previous-related-file': () => {
        const editor = atom.workspace.getActiveTextEditor();

        if (editor == null) {
          return;
        }

        const path = editor.getPath(); // flowlint-next-line sketchy-null-string:off

        if (path) {
          (0, _nuclideAnalytics().trackTiming)('nuclide-related-files:jump-to-previous-related-file', async () => this._open((await this.getPreviousRelatedFile(path))));
        }
      }
    });
  }

  dispose() {
    this._subscription.dispose();
  }
  /**
   * Gets the next related file, which Xcode defines as the one that comes
   * before the current one alphabetically.
   */


  async getNextRelatedFile(path) {
    const {
      relatedFiles,
      index
    } = await _RelatedFileFinder().default.find(path, this._getFileTypeWhitelist());

    if (index === -1) {
      return path;
    }

    return relatedFiles[(relatedFiles.length + index - 1) % relatedFiles.length];
  }
  /**
   * Gets the previous related file, which Xcode defines as the one that comes
   * after the current one alphabetically.
   */


  async getPreviousRelatedFile(path) {
    const {
      relatedFiles,
      index
    } = await _RelatedFileFinder().default.find(path, this._getFileTypeWhitelist());

    if (index === -1) {
      return path;
    }

    return relatedFiles[(index + 1) % relatedFiles.length];
  }

  _getFileTypeWhitelist() {
    const fileTypeWhitelist = _featureConfig().default.get('nuclide-related-files.fileTypeWhitelist');

    return new Set(fileTypeWhitelist);
  }

  _open(path) {
    if (_featureConfig().default.get('nuclide-related-files.openInNextPane')) {
      atom.workspace.activateNextPane();
    }

    (0, _goToLocation().goToLocation)(path);
  }

}

exports.default = JumpToRelatedFile;