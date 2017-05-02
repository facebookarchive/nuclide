'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevicePanel = undefined;

var _react = _interopRequireDefault(require('react'));

var _PanelComponentScroller;

function _load_PanelComponentScroller() {
  return _PanelComponentScroller = require('../../../nuclide-ui/PanelComponentScroller');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Selectors;

function _load_Selectors() {
  return _Selectors = require('./Selectors');
}

var _DeviceTable;

function _load_DeviceTable() {
  return _DeviceTable = require('./DeviceTable');
}

var _InfoTable;

function _load_InfoTable() {
  return _InfoTable = require('./InfoTable');
}

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

class DevicePanel extends _react.default.Component {

  constructor(props) {
    super(props);

    if (!(props.hosts.length > 0)) {
      throw new Error('Invariant violation: "props.hosts.length > 0"');
    }

    this._deviceFetcherSubscription = new _rxjsBundlesRxMinJs.Subscription();
  }

  componentDidMount() {
    this._deviceFetcherSubscription = _rxjsBundlesRxMinJs.Observable.interval(3000).startWith(0).subscribe(() => this.props.refreshDevices());
  }

  componentWillUnmount() {
    this._deviceFetcherSubscription.unsubscribe();
  }

  _createDeviceTable() {
    if (this.props.deviceType === null) {
      return null;
    }
    return _react.default.createElement((_DeviceTable || _load_DeviceTable()).DeviceTable, {
      devices: this.props.devices,
      device: this.props.device,
      setDevice: this.props.setDevice
    });
  }

  _createInfoTables() {
    return Array.from(this.props.infoTables.entries()).map(([title, infoTable]) => _react.default.createElement(
      'div',
      { className: 'block', key: title },
      _react.default.createElement((_InfoTable || _load_InfoTable()).InfoTable, { title: title, table: infoTable })
    ));
  }

  render() {
    return _react.default.createElement(
      (_PanelComponentScroller || _load_PanelComponentScroller()).PanelComponentScroller,
      null,
      _react.default.createElement(
        'div',
        { className: 'nuclide-device-panel-container' },
        _react.default.createElement(
          'div',
          { className: 'block' },
          _react.default.createElement((_Selectors || _load_Selectors()).Selectors, {
            deviceType: this.props.deviceType,
            deviceTypes: this.props.deviceTypes,
            hosts: this.props.hosts,
            host: this.props.host,
            setDeviceType: this.props.setDeviceType,
            setHost: this.props.setHost,
            deviceActions: this.props.deviceActions
          })
        ),
        _react.default.createElement(
          'div',
          { className: 'block' },
          this._createDeviceTable()
        ),
        this._createInfoTables()
      )
    );
  }
}
exports.DevicePanel = DevicePanel;