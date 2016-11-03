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

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../nuclide-ui/AtomInput');
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../nuclide-ui/ButtonGroup');
}

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

let RenameBookmarkModal = class RenameBookmarkModal extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._disposables = new _atom.CompositeDisposable();
    this._handleRenameClick = this._handleRenameClick.bind(this);
  }

  componentDidMount() {
    this._disposables.add(atom.commands.add(_reactForAtom.ReactDOM.findDOMNode(this), 'core:confirm', this._handleRenameClick));
    this.refs.atomTextEditor.focus();
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _handleRenameClick() {
    this.props.onRename(this.props.bookmark, this.refs.atomTextEditor.getText(), this.props.repository);
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
          'Rename bookmark'
        )
      ),
      _reactForAtom.React.createElement(
        'label',
        null,
        'New name for bookmark \'',
        this.props.bookmark.bookmark,
        '\':'
      ),
      _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        initialValue: this.props.bookmark.bookmark,
        ref: 'atomTextEditor'
      }),
      _reactForAtom.React.createElement(
        'div',
        { style: { display: 'flex', flexDirection: 'row-reverse' } },
        _reactForAtom.React.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          { size: 'SMALL' },
          _reactForAtom.React.createElement(
            (_Button || _load_Button()).Button,
            { onClick: this.props.onCancel },
            'Cancel'
          ),
          _reactForAtom.React.createElement(
            (_Button || _load_Button()).Button,
            { buttonType: 'PRIMARY', onClick: this._handleRenameClick },
            'Rename'
          )
        )
      )
    );
  }
};
exports.default = RenameBookmarkModal;
module.exports = exports['default'];