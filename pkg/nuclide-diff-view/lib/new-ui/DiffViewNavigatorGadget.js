'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WORKSPACE_VIEW_URI = undefined;

var _reactForAtom = require('react-for-atom');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../../nuclide-analytics');
}

const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/diff-view-navigator'; /**
                                                                                               * Copyright (c) 2015-present, Facebook, Inc.
                                                                                               * All rights reserved.
                                                                                               *
                                                                                               * This source code is licensed under the license found in the LICENSE file in
                                                                                               * the root directory of this source tree.
                                                                                               *
                                                                                               * 
                                                                                               */

class DiffViewNavigatorGadget extends _reactForAtom.React.Component {

  getTitle() {
    return 'Source Control Navigator';
  }

  getIconName() {
    return 'git-branch';
  }

  getPreferredInitialHeight() {
    return 300;
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation() {
    return 'bottom-panel';
  }

  didChangeVisibility(visible) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-navigator-toggle', { visible });
    this.props.actionCreators.updateDiffNavigatorVisibility(visible);
  }

  render() {
    const { component: Component } = this.props;
    return _reactForAtom.React.createElement(Component, null);
  }

  serialize() {
    return {
      deserializer: 'nuclide.DiffViewNavigator'
    };
  }
}
exports.default = DiffViewNavigatorGadget;