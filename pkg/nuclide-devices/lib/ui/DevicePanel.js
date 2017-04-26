'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevicePanel = undefined;

var _react = _interopRequireDefault(require('react'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../commons-node/nuclideUri'));
}

var _PanelComponentScroller;

function _load_PanelComponentScroller() {
  return _PanelComponentScroller = require('../../../nuclide-ui/PanelComponentScroller');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../../nuclide-ui/Dropdown');
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

  _createSelectorSection() {
    const hostOptions = this.props.hosts.map(host => ({ value: host, label: host === 'local' ? host : (_nuclideUri || _load_nuclideUri()).default.getHostname(host) }));
    const typeOptions = this.props.deviceTypes.map(type => ({ value: type, label: type }));
    typeOptions.splice(0, 0, { value: null, label: 'Select...' });
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
            onChange: this.props.setDeviceType,
            value: this.props.deviceType
          })
        )
      )
    );
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
          this._createSelectorSection()
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
exports.DevicePanel = DevicePanel; /**
                                    * Copyright (c) 2015-present, Facebook, Inc.
                                    * All rights reserved.
                                    *
                                    * This source code is licensed under the license found in the LICENSE file in
                                    * the root directory of this source tree.
                                    *
                                    * 
                                    */