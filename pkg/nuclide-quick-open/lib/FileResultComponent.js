'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

var _fileTypeClass;

function _load_fileTypeClass() {
  return _fileTypeClass = _interopRequireDefault(require('../../commons-atom/file-type-class'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function renderSubsequence(seq, props) {
  return seq.length === 0 ? null : _reactForAtom.React.createElement(
    'span',
    props,
    seq
  );
}

function renderUnmatchedSubsequence(seq, key) {
  return renderSubsequence(seq, { key: key });
}

function renderMatchedSubsequence(seq, key) {
  return renderSubsequence(seq, {
    key: key,
    className: 'quick-open-file-search-match'
  });
}

let FileResultComponent = class FileResultComponent {

  static getComponentForItem(item, serviceName, dirName) {
    // Trim the `dirName` off the `filePath` since that's shown by the group
    let filePath = item.path;
    let matchIndexes = item.matchIndexes || [];
    if (filePath.startsWith(dirName)) {
      filePath = '.' + filePath.slice(dirName.length);
      matchIndexes = matchIndexes.map(i => i - (dirName.length - 1));
    }

    let streakOngoing = false;
    let start = 0;
    const pathComponents = [];
    // Split the path into highlighted and non-highlighted subsequences for optimal rendering perf.
    // Do this in O(n) where n is the number of matchIndexes (ie. less than the length of the path).
    matchIndexes.forEach((i, n) => {
      if (matchIndexes[n + 1] === i + 1) {
        if (!streakOngoing) {
          pathComponents.push(renderUnmatchedSubsequence(filePath.slice(start, i), i));
          start = i;
          streakOngoing = true;
        }
      } else {
        if (streakOngoing) {
          pathComponents.push(renderMatchedSubsequence(filePath.slice(start, i + 1), i));
          streakOngoing = false;
        } else {
          if (i > 0) {
            pathComponents.push(renderUnmatchedSubsequence(filePath.slice(start, i), `before${ i }`));
          }
          pathComponents.push(renderMatchedSubsequence(filePath.slice(i, i + 1), i));
        }
        start = i + 1;
      }
    });
    pathComponents.push(renderUnmatchedSubsequence(filePath.slice(start, filePath.length), 'last'));

    const filenameClasses = ['file', 'icon', (0, (_fileTypeClass || _load_fileTypeClass()).default)(filePath)].join(' ');
    // `data-name` is support for the "file-icons" package.
    // See: https://atom.io/packages/file-icons
    return _reactForAtom.React.createElement(
      'div',
      { className: filenameClasses, 'data-name': (_nuclideUri || _load_nuclideUri()).default.basename(filePath) },
      pathComponents
    );
  }
};


module.exports = FileResultComponent;