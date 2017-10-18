'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _PathWithFileIcon;

function _load_PathWithFileIcon() {
  return _PathWithFileIcon = _interopRequireDefault(require('../../nuclide-ui/PathWithFileIcon'));
}

var _groupMatchIndexes;

function _load_groupMatchIndexes() {
  return _groupMatchIndexes = _interopRequireDefault(require('nuclide-commons/groupMatchIndexes'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function renderSubsequence(seq, props) {
  return seq.length === 0 ? null : _react.createElement(
    'span',
    props,
    seq
  );
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function renderUnmatchedSubsequence(seq, key) {
  return renderSubsequence(seq, { key });
}

function renderMatchedSubsequence(seq, key) {
  return renderSubsequence(seq, {
    key,
    className: 'quick-open-file-search-match'
  });
}

class FileResultComponent {
  static getComponentForItem(item, serviceName, dirName) {
    // Trim the `dirName` off the `filePath` since that's shown by the group
    let filePath = item.path;
    let matchIndexes = item.matchIndexes || [];
    if (filePath.startsWith(dirName)) {
      filePath = '.' + filePath.slice(dirName.length);
      matchIndexes = matchIndexes.map(i => i - (dirName.length - 1));
    }

    const pathComponents = (0, (_groupMatchIndexes || _load_groupMatchIndexes()).default)(filePath, matchIndexes, renderMatchedSubsequence, renderUnmatchedSubsequence);
    return _react.createElement(
      (_PathWithFileIcon || _load_PathWithFileIcon()).default,
      { path: (_nuclideUri || _load_nuclideUri()).default.basename(filePath) },
      pathComponents
    );
  }
}
exports.default = FileResultComponent;