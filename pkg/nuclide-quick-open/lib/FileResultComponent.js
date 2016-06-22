var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _commonsAtomFileTypeClass2;

function _commonsAtomFileTypeClass() {
  return _commonsAtomFileTypeClass2 = _interopRequireDefault(require('../../commons-atom/file-type-class'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

function renderSubsequence(seq, props) {
  return seq.length === 0 ? null : (_reactForAtom2 || _reactForAtom()).React.createElement(
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

var FileResultComponent = (function () {
  function FileResultComponent() {
    _classCallCheck(this, FileResultComponent);
  }

  _createClass(FileResultComponent, null, [{
    key: 'getComponentForItem',
    value: function getComponentForItem(item, serviceName, dirName) {
      // Trim the `dirName` off the `filePath` since that's shown by the group
      var filePath = item.path;
      var matchIndexes = item.matchIndexes || [];
      if (filePath.startsWith(dirName)) {
        filePath = '.' + filePath.slice(dirName.length);
        matchIndexes = matchIndexes.map(function (i) {
          return i - (dirName.length - 1);
        });
      }

      var streakOngoing = false;
      var start = 0;
      var pathComponents = [];
      // Split the path into highlighted and non-highlighted subsequences for optimal rendering perf.
      // Do this in O(n) where n is the number of matchIndexes (ie. less than the length of the path).
      matchIndexes.forEach(function (i, n) {
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
              pathComponents.push(renderUnmatchedSubsequence(filePath.slice(start, i), 'before' + i));
            }
            pathComponents.push(renderMatchedSubsequence(filePath.slice(i, i + 1), i));
          }
          start = i + 1;
        }
      });
      pathComponents.push(renderUnmatchedSubsequence(filePath.slice(start, filePath.length), 'last'));

      var filenameClasses = ['file', 'icon', (0, (_commonsAtomFileTypeClass2 || _commonsAtomFileTypeClass()).default)(filePath)].join(' ');
      // `data-name` is support for the "file-icons" package.
      // See: https://atom.io/packages/file-icons
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: filenameClasses, 'data-name': (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(filePath) },
        pathComponents
      );
    }
  }]);

  return FileResultComponent;
})();

module.exports = FileResultComponent;