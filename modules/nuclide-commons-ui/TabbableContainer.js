'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._TABBABLE_CLASS_NAME = undefined;

var _react = _interopRequireDefault(require('react'));

var _tabbable;

function _load_tabbable() {
  return _tabbable = _interopRequireDefault(require('tabbable'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// NOTE: This constant must be kept in sync with the keybinding in
//       ../nuclide-tab-focus/keymaps/nuclide-tab-focus.json
const _TABBABLE_CLASS_NAME = exports._TABBABLE_CLASS_NAME = 'nuclide-tabbable';

/**
 * Enables focusing between inputs with tab and shift-tab. Can also be used to
 * trap focus within the container by using the contained property.
 */
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

class TabbableContainer extends _react.default.Component {

  componentDidMount() {
    const rootNode = this._rootNode;

    if (!(rootNode != null)) {
      throw new Error('Invariant violation: "rootNode != null"');
    }

    // If focus has been deliberately set inside the container, don't try
    // to override it


    if (!rootNode.contains(document.activeElement)) {
      const tabbableElements = (0, (_tabbable || _load_tabbable()).default)(rootNode);
      const firstTabbableElement = tabbableElements[0];
      if (firstTabbableElement != null) {
        firstTabbableElement.focus();
      }
    }
  }

  render() {
    return _react.default.createElement(
      'div',
      {
        className: (0, (_classnames || _load_classnames()).default)(_TABBABLE_CLASS_NAME, this.props.className),
        'data-contained': this.props.contained,
        ref: node => this._rootNode = node },
      this.props.children
    );
  }
}
exports.default = TabbableContainer;
TabbableContainer.defaultProps = {
  contained: false,
  autoFocus: false
};