'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConfirmRefactorComponent = undefined;

var _react = _interopRequireWildcard(require('react'));

var _projects;

function _load_projects() {
  return _projects = require('nuclide-commons-atom/projects');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _Tree;

function _load_Tree() {
  return _Tree = require('../../../nuclide-ui/Tree');
}

var _PathWithFileIcon;

function _load_PathWithFileIcon() {
  return _PathWithFileIcon = _interopRequireDefault(require('../../../nuclide-ui/PathWithFileIcon'));
}

var _refactorActions;

function _load_refactorActions() {
  return _refactorActions = _interopRequireWildcard(require('../refactorActions'));
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

class ConfirmRefactorComponent extends _react.PureComponent {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._execute = () => {
      this.props.store.dispatch((_refactorActions || _load_refactorActions()).apply(this.props.phase.response));
    }, _temp;
  }

  render() {
    const { response } = this.props.phase;
    const editCount = new Map();
    for (const [path, edits] of response.edits) {
      editCount.set(path, (editCount.get(path) || 0) + edits.length);
    }
    // TODO: display actual diff output here.
    return _react.createElement(
      'div',
      null,
      'This refactoring will affect ',
      editCount.size,
      ' files. Confirm?',
      _react.createElement(
        'div',
        {
          // Make the text copyable + selectable.
          className: 'nuclide-refactorizer-confirm-list native-key-bindings',
          tabIndex: -1 },
        _react.createElement(
          (_Tree || _load_Tree()).TreeList,
          null,
          Array.from(editCount).map(([path, count]) => _react.createElement(
            (_Tree || _load_Tree()).TreeItem,
            { key: path },
            _react.createElement(
              (_PathWithFileIcon || _load_PathWithFileIcon()).default,
              { path: path },
              _react.createElement(
                'span',
                { className: 'nuclide-refactorizer-confirm-list-path' },
                (0, (_projects || _load_projects()).getAtomProjectRelativePath)(path)
              ),
              ' ',
              '(',
              count,
              ' ',
              (0, (_string || _load_string()).pluralize)('change', count),
              ')'
            )
          ))
        )
      ),
      _react.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'flex-end' } },
        _react.createElement(
          (_Button || _load_Button()).Button,
          {
            buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
            onClick: this._execute,
            autoFocus: true },
          'Confirm'
        )
      )
    );
  }
}
exports.ConfirmRefactorComponent = ConfirmRefactorComponent;