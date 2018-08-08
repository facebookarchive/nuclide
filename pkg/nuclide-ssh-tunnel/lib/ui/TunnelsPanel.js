"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TunnelsPanel = exports.WORKSPACE_VIEW_URI = void 0;

function _bindObservableAsProps() {
  const data = require("../../../../modules/nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _CreateObservables() {
  const data = require("../CreateObservables");

  _CreateObservables = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("../redux/Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _TunnelsPanelContents() {
  const data = require("./TunnelsPanelContents");

  _TunnelsPanelContents = function () {
    return data;
  };

  return data;
}

function _renderReactRoot() {
  const data = require("../../../../modules/nuclide-commons-ui/renderReactRoot");

  _renderReactRoot = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const WORKSPACE_VIEW_URI = 'atom://nuclide/ssh-tunnels';
exports.WORKSPACE_VIEW_URI = WORKSPACE_VIEW_URI;

class TunnelsPanel {
  constructor(store) {
    this._store = store;
  }

  getTitle() {
    return 'Nuclide tunnels';
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
    const states = _RxMin.Observable.from(this._store);

    const props = states.map(state => {
      let workingDirectoryHost;

      if (state.currentWorkingDirectory == null) {
        workingDirectoryHost = null;
      } else {
        const path = state.currentWorkingDirectory;

        if (_nuclideUri().default.isLocal(path)) {
          workingDirectoryHost = 'localhost';
        } else {
          workingDirectoryHost = _nuclideUri().default.getHostname(path);
        }
      }

      return {
        tunnels: state.tunnels.toList(),
        openTunnel: tunnel => {
          let noMoreNotifications = false;
          (0, _CreateObservables().createObservableForTunnel)(tunnel, this._store).do(() => noMoreNotifications = true).subscribe({
            error: e => {
              if (!noMoreNotifications) {
                atom.notifications.addError('Failed to open tunnel', {
                  detail: e.code,
                  dismissable: true
                });
              }
            }
          });
        },
        closeTunnel: tunnel => this._store.dispatch(Actions().closeTunnel(tunnel, new Error('Closed from panel'))),
        workingDirectoryHost
      };
    });
    const BoundPanelContents = (0, _bindObservableAsProps().bindObservableAsProps)(props, _TunnelsPanelContents().TunnelsPanelContents);
    return (0, _renderReactRoot().renderReactRoot)(React.createElement(BoundPanelContents, null));
  }

  serialize() {
    return {
      deserializer: 'nuclide.SshTunnelsPanel'
    };
  }

}

exports.TunnelsPanel = TunnelsPanel;