'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TunnelsPanel = exports.WORKSPACE_VIEW_URI = undefined;

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('nuclide-commons-ui/bindObservableAsProps');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('../redux/Actions'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _TunnelsPanelContents;

function _load_TunnelsPanelContents() {
  return _TunnelsPanelContents = require('./TunnelsPanelContents');
}

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('nuclide-commons-ui/renderReactRoot');
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    return 400;
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
      let workingDirectoryHost;
      if (state.currentWorkingDirectory == null) {
        workingDirectoryHost = null;
      } else {
        const path = state.currentWorkingDirectory.getPath();
        if ((_nuclideUri || _load_nuclideUri()).default.isLocal(path)) {
          workingDirectoryHost = 'localhost';
        } else {
          workingDirectoryHost = (_nuclideUri || _load_nuclideUri()).default.getHostname(path);
        }
      }
      return {
        tunnels: Array.from(state.openTunnels.entries()),
        openTunnel: tunnel => {
          if (this._store.getState().status === 'opening') {
            return;
          }
          this._store.dispatch((_Actions || _load_Actions()).openTunnel(tunnel,
          // onOpen
          error => {
            if (error != null) {
              atom.notifications.addError(error.message);
            }
          },
          // onClose
          () => {}));
        },
        closeTunnel: tunnel => this._store.dispatch((_Actions || _load_Actions()).closeTunnel(tunnel)),
        workingDirectoryHost
      };
    });

    const BoundPanelContents = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props, (_TunnelsPanelContents || _load_TunnelsPanelContents()).TunnelsPanelContents);
    return (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.createElement(BoundPanelContents, null));
  }

  serialize() {
    return {
      deserializer: 'nuclide.SshTunnelsPanel'
    };
  }
}
exports.TunnelsPanel = TunnelsPanel;