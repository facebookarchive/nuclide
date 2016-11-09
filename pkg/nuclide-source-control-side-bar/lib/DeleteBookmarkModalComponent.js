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

var _reactForAtom = require('react-for-atom');

let DeleteBookmarkModalComponent = class DeleteBookmarkModalComponent extends _reactForAtom.React.Component {

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
    return _reactForAtom.React.createElement(
      'div',
      null,
      _reactForAtom.React.createElement(
        'h6',
        { style: { marginTop: 0 } },
        _reactForAtom.React.createElement(
          'strong',
          null,
          'Delete bookmark ',
          this.props.bookmark.bookmark,
          '?'
        )
      ),
      _reactForAtom.React.createElement(
        'div',
        { className: 'block' },
        'Are you sure you want to delete the bookmark ',
        this.props.bookmark.bookmark,
        '? This can not be undone.'
      ),
      _reactForAtom.React.createElement(
        'div',
        { className: 'text-right' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'btn-group btn-group-sm' },
          _reactForAtom.React.createElement(
            'button',
            { className: 'btn', onClick: this.props.onCancel, ref: 'cancelButton' },
            'Cancel'
          ),
          _reactForAtom.React.createElement(
            'button',
            { className: 'btn btn-error', onClick: this._handleDeleteClick },
            'Delete'
          )
        )
      )
    );
  }
};
exports.default = DeleteBookmarkModalComponent;
module.exports = exports['default'];