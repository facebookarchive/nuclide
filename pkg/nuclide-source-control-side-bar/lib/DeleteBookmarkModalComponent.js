'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../nuclide-ui/ButtonGroup');
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
 */

class DeleteBookmarkModalComponent extends _react.default.Component {

  constructor(props) {
    super(props);
    this._handleDeleteClick = this._handleDeleteClick.bind(this);
  }

  componentDidMount() {
    this.refs.cancelButton.focus();
  }

  _handleDeleteClick() {
    this.props.onDelete(this.props.bookmark, this.props.repository);
  }

  render() {
    return _react.default.createElement(
      'div',
      null,
      _react.default.createElement(
        'h6',
        { style: { marginTop: 0 } },
        _react.default.createElement(
          'strong',
          null,
          'Delete bookmark ',
          this.props.bookmark.bookmark,
          '?'
        )
      ),
      _react.default.createElement(
        'div',
        { className: 'block' },
        'Are you sure you want to delete the bookmark ',
        this.props.bookmark.bookmark,
        '? This can not be undone.'
      ),
      _react.default.createElement(
        'div',
        { className: 'text-right' },
        _react.default.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          { size: (_ButtonGroup || _load_ButtonGroup()).ButtonGroupSizes.SMALL },
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            { onClick: this.props.onCancel, ref: 'cancelButton' },
            'Cancel'
          ),
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            { buttonType: (_Button || _load_Button()).ButtonTypes.ERROR, onClick: this._handleDeleteClick },
            'Delete'
          )
        )
      )
    );
  }
}
exports.default = DeleteBookmarkModalComponent;