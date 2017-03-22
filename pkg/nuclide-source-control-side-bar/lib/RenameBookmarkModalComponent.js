'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RenameBookmarkModal extends _react.default.Component {

  constructor(props) {
    super(props);
    this._disposables = new _atom.CompositeDisposable();
    this._handleRenameClick = this._handleRenameClick.bind(this);
  }

  componentDidMount() {
    this._disposables.add(
    // $FlowFixMe
    atom.commands.add(_reactDom.default.findDOMNode(this), 'core:confirm', this._handleRenameClick));
    this.refs.atomTextEditor.focus();
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _handleRenameClick() {
    this.props.onRename(this.props.bookmark, this.refs.atomTextEditor.getText(), this.props.repository);
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
          'Rename bookmark'
        )
      ),
      _react.default.createElement(
        'label',
        null,
        'New name for bookmark \'',
        this.props.bookmark.bookmark,
        '\':'
      ),
      _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        initialValue: this.props.bookmark.bookmark,
        ref: 'atomTextEditor'
      }),
      _react.default.createElement(
        'div',
        { style: { display: 'flex', flexDirection: 'row-reverse' } },
        _react.default.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          { size: 'SMALL' },
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            { onClick: this.props.onCancel },
            'Cancel'
          ),
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            { buttonType: 'PRIMARY', onClick: this._handleRenameClick },
            'Rename'
          )
        )
      )
    );
  }
}
exports.default = RenameBookmarkModal; /**
                                        * Copyright (c) 2015-present, Facebook, Inc.
                                        * All rights reserved.
                                        *
                                        * This source code is licensed under the license found in the LICENSE file in
                                        * the root directory of this source tree.
                                        *
                                        * 
                                        */