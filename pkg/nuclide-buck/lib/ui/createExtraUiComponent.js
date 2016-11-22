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
exports.createExtraUiComponent = createExtraUiComponent;

var _BuckToolbar;

function _load_BuckToolbar() {
  return _BuckToolbar = _interopRequireDefault(require('../BuckToolbar'));
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a component for the extra UI in the Buck version of the toolbar. We use a component
 * (instead of an element) so that we can pass down props from the toolbar itself in the future
 * (e.g. dimensions), and create the component in a closure so that we can close over Buck state
 * too.
 */
function createExtraUiComponent(store, actions) {

  return class ExtraUi extends _reactForAtom.React.Component {

    render() {
      return _reactForAtom.React.createElement((_BuckToolbar || _load_BuckToolbar()).default, {
        activeTaskType: this.props.activeTaskType,
        store: store,
        actions: actions
      });
    }

  };
}