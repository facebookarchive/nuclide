'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _matchIndexesToRanges;

function _load_matchIndexesToRanges() {
  return _matchIndexesToRanges = _interopRequireDefault(require('../../../modules/nuclide-commons/matchIndexesToRanges'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _HighlightedText;

function _load_HighlightedText() {
  return _HighlightedText = _interopRequireDefault(require('../../../modules/nuclide-commons-ui/HighlightedText'));
}

var _PathWithFileIcon;

function _load_PathWithFileIcon() {
  return _PathWithFileIcon = _interopRequireDefault(require('../../nuclide-ui/PathWithFileIcon'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class FileResultComponent {
  static getComponentForItem(item, serviceName, dirName) {
    // Trim the `dirName` off the `filePath` since that's shown by the group
    let filePath = item.path;
    let matchIndexes = item.matchIndexes || [];
    if (filePath.startsWith(dirName)) {
      filePath = '.' + filePath.slice(dirName.length);
      matchIndexes = matchIndexes.map(i => i - (dirName.length - 1)).filter(i => i >= 0);
    }

    return _react.createElement(
      (_PathWithFileIcon || _load_PathWithFileIcon()).default,
      { path: (_nuclideUri || _load_nuclideUri()).default.basename(filePath) },
      _react.createElement((_HighlightedText || _load_HighlightedText()).default, {
        highlightedRanges: (0, (_matchIndexesToRanges || _load_matchIndexesToRanges()).default)(matchIndexes),
        text: filePath
      })
    );
  }
}
exports.default = FileResultComponent;