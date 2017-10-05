'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TunnelsPanel = exports.WORKSPACE_VIEW_URI = undefined;

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('nuclide-commons-ui/bindObservableAsProps');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('../redux/Actions'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _TunnelsPanelTable;

function _load_TunnelsPanelTable() {
  return _TunnelsPanelTable = require('./TunnelsPanelTable');
}

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('nuclide-commons-ui/renderReactRoot');
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/ssh-tunnels'; /**
                                                                                       * Copyright (c) 2015-present, Facebook, Inc.
                                                                                       * All rights reserved.
                                                                                       *
                                                                                       * This source code is licensed under the license found in the LICENSE file in
                                                                                       * the root directory of this source tree.
                                                                                       *
                                                                                       * 
                                                                                       * @format
                                                                                       */

class TunnelsPanel {

  constructor(store) {
    this._store = store;
  }

  getTitle() {
    return 'SSH tunnels';
  }

  getIconName() {
    return 'milestone';
  }

  getPreferredWidth() {
    return 300;
  }

  getDefaultLocation() {
    return 'right';
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  getElement() {
    // $FlowFixMe: We need to teach Flow about Symbol.observable
    const states = _rxjsBundlesRxMinJs.Observable.from(this._store);

    const props = states.map(state => {
      return {
        tunnels: Array.from(state.openTunnels.entries()),
        closeTunnel: tunnel => this._store.dispatch((_Actions || _load_Actions()).closeTunnel(tunnel))
      };
    });

    const BoundTable = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props, (_TunnelsPanelTable || _load_TunnelsPanelTable()).TunnelsPanelTable);
    return (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.createElement(BoundTable, null));
  }

  serialize() {
    return {
      deserializer: 'nuclide.SshTunnelsPanel'
    };
  }
}
exports.TunnelsPanel = TunnelsPanel;