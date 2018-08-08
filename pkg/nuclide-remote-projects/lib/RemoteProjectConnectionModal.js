"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _connectionProfileUtils() {
  const data = require("./connection-profile-utils");

  _connectionProfileUtils = function () {
    return data;
  };

  return data;
}

function _ConnectionDialog() {
  const data = _interopRequireDefault(require("./ConnectionDialog"));

  _ConnectionDialog = function () {
    return data;
  };

  return data;
}

function _CreateConnectionProfileForm() {
  const data = _interopRequireDefault(require("./CreateConnectionProfileForm"));

  _CreateConnectionProfileForm = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

/* globals Element */
class RemoteProjectConnectionModal extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._updatePanelClass = () => {
      const el = _reactDom.default.findDOMNode(this);

      if (!(el instanceof Element)) {
        return;
      }

      const panelEl = el.closest('atom-panel');

      if (panelEl == null) {
        return;
      } // Remove existing classes.


      ['connect', 'create-connection'].forEach(screen => {
        panelEl.classList.remove(`nuclide-remote-projects-panel-${screen}`);
      }); // Add a class for the current screen.

      panelEl.classList.add(`nuclide-remote-projects-panel-${this.props.screen}`);
    }, _temp;
  }

  componentDidMount() {
    this._updatePanelClass();
  }

  componentDidUpdate(prevProps) {
    if (this.props.screen !== prevProps.screen) {
      this._updatePanelClass();
    }
  }
  /**
   * Reach outside the component to change the modal size. This is a little gross and would probably
   * ideally be done by the thing that creates the modal panel.
   */


  render() {
    switch (this.props.screen) {
      case 'connect':
        return React.createElement(_ConnectionDialog().default, {
          selectedProfileIndex: this.props.selectedProfileIndex,
          connectionProfiles: this.props.connectionProfiles,
          onAddProfileClicked: () => {
            this.props.onScreenChange('create-connection');
          },
          onCancel: this.props.onCancel,
          onClosed: this.props.onClosed,
          onConnect: this.props.onConnect,
          onError: this.props.onError,
          onDeleteProfileClicked: this.props.onDeleteProfileClicked,
          onSaveProfile: this.props.onSaveProfile,
          onProfileSelected: this.props.onProfileSelected
        });

      case 'create-connection':
        return React.createElement(_CreateConnectionProfileForm().default, {
          onCancel: () => {
            this.props.onScreenChange('connect');
          },
          onSave: this.props.onProfileCreated,
          initialFormFields: this.props.initialFormFields,
          profileHosts: (0, _connectionProfileUtils().getUniqueHostsForProfiles)(this.props.connectionProfiles)
        });

      default:
        this.props.screen;
        throw new Error(`Invalid screen: ${this.props.screen}`);
    }
  }

}

exports.default = RemoteProjectConnectionModal;