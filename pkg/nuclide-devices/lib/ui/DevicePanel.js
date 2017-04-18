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

var _collection;

function _load_collection() {
  return _collection = require('../../../commons-node/collection');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../../nuclide-ui/Dropdown');
}

var _DeviceTable;

function _load_DeviceTable() {
  return _DeviceTable = require('./DeviceTable');
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
    this._deviceFetcherSubscription = _rxjsBundlesRxMinJs.Observable.interval(3000).startWith(0).do(() => this.props.refreshDevices()).subscribe();
  }

  componentWillUnmount() {
    this._deviceFetcherSubscription.unsubscribe();
  }

  _createSelectorSection() {
    const hostOptions = this.props.hosts.map(host => ({ value: host, label: host }));
    const typeOptions = Array.from(this.props.devices.keys()).map(type => ({ value: type, label: type }));
    if (typeOptions.length === 0) {
      typeOptions.push({ value: null, label: 'No devices connected' });
    }
    return _react.default.createElement(
      'table',
      null,
      _react.default.createElement(
        'tr',
        null,
        _react.default.createElement(
          'td',
          null,
          _react.default.createElement(
            'label',
            { className: 'inline-block' },
            'Connection:'
          )
        ),
        _react.default.createElement(
          'td',
          null,
          _react.default.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
            className: 'inline-block',
            options: hostOptions,
            onChange: this.props.setHost,
            value: this.props.host
          })
        )
      ),
      _react.default.createElement(
        'tr',
        null,
        _react.default.createElement(
          'td',
          null,
          _react.default.createElement(
            'label',
            { className: 'inline-block' },
            'Device type:'
          )
        ),
        _react.default.createElement(
          'td',
          null,
          _react.default.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
            className: 'inline-block',
            options: typeOptions,
            disabled: this.props.devices.size === 0,
            onChange: this.props.setDeviceType,
            value: this.props.deviceType
          })
        )
      )
    );
  }

  _createDeviceTable() {
    const selectedDeviceType = this.props.devices.size > 0 && this.props.deviceType == null ? this.props.devices.keys().next().value : this.props.deviceType;

    const devices = Array.from((0, (_collection || _load_collection()).mapFilter)(this.props.devices, (type, _) => type === selectedDeviceType).values())[0] || [];

    return _react.default.createElement((_DeviceTable || _load_DeviceTable()).DeviceTable, { devices: devices, device: this.props.device, setDevice: this.props.setDevice });
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
          this._createSelectorSection()
        ),
        _react.default.createElement(
          'div',
          { className: 'block' },
          this._createDeviceTable()
        )
      )
    );
  }
}
exports.DevicePanel = DevicePanel;