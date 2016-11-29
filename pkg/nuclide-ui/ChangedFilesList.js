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

var _Icon;

function _load_Icon() {
  return _Icon = require('./Icon');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ChangedFilesList extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isCollapsed: false
    };
  }

  _getFileClassname(file, fileChangeValue) {
    const { selectedFile } = this.props;
    return (0, (_classnames || _load_classnames()).default)('list-item', {
      selected: file === selectedFile
    }, (_constants || _load_constants()).FileChangeStatusToTextColor[fileChangeValue]);
  }

  render() {
    const { fileChanges, commandPrefix } = this.props;
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
          Array.from(fileChanges.entries()).map(([filePath, fileChangeValue]) => {
            const baseName = (_nuclideUri || _load_nuclideUri()).default.basename(filePath);
            return _reactForAtom.React.createElement(
              'li',
              {
                'data-path': filePath,
                className: this._getFileClassname(filePath, fileChangeValue),
                key: filePath,
                onClick: () => this.props.onFileChosen(filePath) },
              _reactForAtom.React.createElement((_Icon || _load_Icon()).Icon, { icon: (_constants || _load_constants()).FileChangeStatusToIcon[fileChangeValue] }),
              _reactForAtom.React.createElement(
                'span',
                {
                  className: fileClassName,
                  'data-name': baseName,
                  'data-path': filePath,
                  'data-root': this.props.rootPath },
                baseName
              )
            );
          })
        )
      )
    );
  }
}
exports.default = ChangedFilesList;
module.exports = exports['default'];