'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModalExamples = undefined;

var _reactForAtom = require('react-for-atom');

var _Button;

function _load_Button() {
  return _Button = require('./Button');
}

var _Modal;

function _load_Modal() {
  return _Modal = require('./Modal');
}

class ModalExample extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = { isModalShown: false };
    this._showModal = this._showModal.bind(this);
    this._hideModal = this._hideModal.bind(this);
  }

  _showModal() {
    this.setState({ isModalShown: true });
  }

  _hideModal() {
    this.setState({ isModalShown: false });
  }

  render() {
    const { isModalShown } = this.state;
    const modal = isModalShown ? _reactForAtom.React.createElement(
      (_Modal || _load_Modal()).Modal,
      { onDismiss: this._hideModal },
      _reactForAtom.React.createElement(
        'div',
        null,
        'I\'m a modal. You can add any content you like.'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        { onClick: this._hideModal },
        'hide modal'
      )
    ) : null;
    return _reactForAtom.React.createElement(
      'div',
      null,
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        { onClick: this._showModal },
        'show modal'
      ),
      modal
    );
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

const ModalExamples = exports.ModalExamples = {
  sectionName: 'Modal',
  description: 'Overlays that cover the entire screen. ',
  examples: [{
    title: 'Click the button to toggle a modal:',
    component: ModalExample
  }]
};