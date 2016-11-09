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

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../../nuclide-analytics');
}

let DiffViewNavigatorGadget = class DiffViewNavigatorGadget extends _reactForAtom.React.Component {

  getTitle() {
    return 'Source Control Navigator';
  }

  getIconName() {
    return 'git-branch';
  }

  getPreferredInitialHeight() {
    return 300;
  }

  didChangeVisibility(visible) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-navigator-toggle', { visible: visible });
    this.props.actionCreators.updateDiffNavigatorVisibility(visible);
  }

  render() {
    const Component = this.props.component;

    return _reactForAtom.React.createElement(Component, null);
  }

  serialize() {
    return {
      deserializer: 'nuclide.DiffViewNavigator'
    };
  }
};
exports.default = DiffViewNavigatorGadget;
module.exports = exports['default'];