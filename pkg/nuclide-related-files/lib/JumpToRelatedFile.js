'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _RelatedFileFinder;

function _load_RelatedFileFinder() {
  return _RelatedFileFinder = _interopRequireDefault(require('./RelatedFileFinder'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Sets up listeners so the user can jump to related files.
 *
 * Clients must call `dispose()` once they're done with an instance.
 */
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

class JumpToRelatedFile {

  constructor() {
    var _this = this;

    this._subscription = atom.commands.add('atom-workspace', {
      'nuclide-related-files:switch-between-header-source': () => {
        const editor = atom.workspace.getActiveTextEditor();
        if (editor == null) {
          return;
        }
        const path = editor.getPath();
        // flowlint-next-line sketchy-null-string:off
        if (path) {
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-related-files:switch-between-header-source', (0, _asyncToGenerator.default)(function* () {
            return _this._open((yield _this.getNextRelatedFile(path)));
          }));
        }
      },
      'nuclide-related-files:jump-to-next-related-file': () => {
        const editor = atom.workspace.getActiveTextEditor();
        if (editor == null) {
          return;
        }
        const path = editor.getPath();
        // flowlint-next-line sketchy-null-string:off
        if (path) {
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-related-files:jump-to-next-related-file', (0, _asyncToGenerator.default)(function* () {
            return _this._open((yield _this.getNextRelatedFile(path)));
          }));
        }
      },
      'nuclide-related-files:jump-to-previous-related-file': () => {
        const editor = atom.workspace.getActiveTextEditor();
        if (editor == null) {
          return;
        }
        const path = editor.getPath();
        // flowlint-next-line sketchy-null-string:off
        if (path) {
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-related-files:jump-to-previous-related-file', (0, _asyncToGenerator.default)(function* () {
            return _this._open((yield _this.getPreviousRelatedFile(path)));
          }));
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
  getNextRelatedFile(path) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { relatedFiles, index } = yield (_RelatedFileFinder || _load_RelatedFileFinder()).default.find(path, _this2._getFileTypeWhitelist());
      if (index === -1) {
        return path;
      }
      return relatedFiles[(relatedFiles.length + index - 1) % relatedFiles.length];
    })();
  }

  /**
   * Gets the previous related file, which Xcode defines as the one that comes
   * after the current one alphabetically.
   */
  getPreviousRelatedFile(path) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { relatedFiles, index } = yield (_RelatedFileFinder || _load_RelatedFileFinder()).default.find(path, _this3._getFileTypeWhitelist());
      if (index === -1) {
        return path;
      }
      return relatedFiles[(index + 1) % relatedFiles.length];
    })();
  }

  _getFileTypeWhitelist() {
    const fileTypeWhitelist = (_featureConfig || _load_featureConfig()).default.get('nuclide-related-files.fileTypeWhitelist');
    return new Set(fileTypeWhitelist);
  }

  _open(path) {
    if ((_featureConfig || _load_featureConfig()).default.get('nuclide-related-files.openInNextPane')) {
      atom.workspace.activateNextPane();
    }
    (0, (_goToLocation || _load_goToLocation()).goToLocation)(path);
  }
}
exports.default = JumpToRelatedFile;