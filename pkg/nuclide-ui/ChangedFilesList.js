'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _constants;

function _load_constants() {
  return _constants = require('../nuclide-hg-git-bridge/lib/constants');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let ChangedFilesList = class ChangedFilesList extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isCollapsed: false
    };
  }

  _getFileClassname(file, fileChangeValue) {
    const selectedFile = this.props.selectedFile;

    return (0, (_classnames || _load_classnames()).default)('list-item', {
      selected: file === selectedFile
    }, (_constants || _load_constants()).FileChangeStatusToTextColor[fileChangeValue]);
  }

  render() {
    var _props = this.props;
    const fileChanges = _props.fileChanges,
          commandPrefix = _props.commandPrefix;

    if (fileChanges.size === 0 && this.props.hideEmptyFolders) {
      return null;
    }

    const rootClassName = (0, (_classnames || _load_classnames()).default)('list-nested-item', {
      collapsed: this.state.isCollapsed
    });

    const fileClassName = (0, (_classnames || _load_classnames()).default)('icon', 'icon-file-text', 'nuclide-file-changes-file-entry', `${ commandPrefix }-file-entry`);

    return _reactForAtom.React.createElement(
      'ul',
      { className: 'list-tree has-collapsable-children' },
      _reactForAtom.React.createElement(
        'li',
        { className: rootClassName },
        this.props.shouldShowFolderName ? _reactForAtom.React.createElement(
          'div',
          {
            className: 'list-item',
            key: this.props.rootPath,
            onClick: () => this.setState({ isCollapsed: !this.state.isCollapsed }) },
          _reactForAtom.React.createElement(
            'span',
            {
              className: 'icon icon-file-directory nuclide-file-changes-root-entry',
              'data-path': this.props.rootPath },
            (_nuclideUri || _load_nuclideUri()).default.basename(this.props.rootPath)
          )
        ) : null,
        _reactForAtom.React.createElement(
          'ul',
          { className: 'list-tree has-flat-children' },
          Array.from(fileChanges.entries()).map((_ref) => {
            var _ref2 = _slicedToArray(_ref, 2);

            let filePath = _ref2[0],
                fileChangeValue = _ref2[1];
            return _reactForAtom.React.createElement(
              'li',
              {
                'data-path': filePath,
                className: this._getFileClassname(filePath, fileChangeValue),
                key: filePath,
                onClick: () => this.props.onFileChosen(filePath) },
              _reactForAtom.React.createElement(
                'span',
                {
                  className: fileClassName,
                  'data-path': filePath,
                  'data-root': this.props.rootPath },
                (_constants || _load_constants()).FileChangeStatusToPrefix[fileChangeValue],
                (_nuclideUri || _load_nuclideUri()).default.basename(filePath)
              )
            );
          })
        )
      )
    );
  }
};
exports.default = ChangedFilesList;
module.exports = exports['default'];