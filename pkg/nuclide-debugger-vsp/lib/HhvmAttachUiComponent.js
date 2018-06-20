'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AttachUiComponent = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../../modules/nuclide-commons-ui/Dropdown');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('../../../modules/nuclide-debugger-common');
}

var _Table;

function _load_Table() {
  return _Table = require('../../../modules/nuclide-commons-ui/Table');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _expected;

function _load_expected() {
  return _expected = require('../../../modules/nuclide-commons/expected');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function getColumns() {
  return [{
    title: 'PID',
    key: 'pid',
    width: 0.1
  }, {
    title: 'Command Name',
    key: 'command',
    width: 0.9
  }];
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

class AttachUiComponent extends _react.Component {

  constructor(props) {
    super(props);

    this._handlePathsDropdownChange = newIndex => {
      this.setState({
        selectedPathIndex: newIndex,
        pathMenuItems: this._getPathMenuItems()
      });
    };

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._attachTargetSub = null;
    this._disposables.add(() => {
      if (this._attachTargetSub != null) {
        this._attachTargetSub.unsubscribe();
        this._attachTargetSub = null;
      }

      if (this._gkSub != null) {
        this._gkSub.unsubscribe();
        this._gkSub = null;
      }
    });
    this._handleAttachButtonClick = this._handleAttachButtonClick.bind(this);

    this.state = {
      selectedPathIndex: 0,
      pathMenuItems: this._getPathMenuItems(),
      attachPort: null,
      attachType: 'webserver',
      attachTargets: (_expected || _load_expected()).Expect.pendingValue([])
    };
  }

  _getSerializationArgs() {
    return [(_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri) : 'local', 'attach', 'php'];
  }

  componentDidMount() {
    (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
      const savedPath = this.state.pathMenuItems.find(item => item.label === savedSettings.selectedPath);
      if (savedPath != null) {
        this.setState({
          selectedPathIndex: this.state.pathMenuItems.indexOf(savedPath)
        });
      }
      this.setState({
        attachType: savedSettings.attachType != null ? savedSettings.attachType : 'webserver'
      });
    });

    this.props.configIsValidChanged(this._debugButtonShouldEnable());
    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:confirm': () => {
        if (this._debugButtonShouldEnable()) {
          this._handleAttachButtonClick();
        }
      }
    }));

    this._attachTargetSub = _rxjsBundlesRxMinJs.Observable.interval(2000).switchMap(async () => {
      await this._refreshTargetList();
    }).subscribe();
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  setState(newState) {
    super.setState(newState, () => this.props.configIsValidChanged(this._debugButtonShouldEnable()));
  }

  _debugButtonShouldEnable() {
    return this.state.attachType === 'webserver' || this.state.attachPort != null;
  }

  async _refreshTargetList() {
    const service = await (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getHhvmDebuggerServiceByNuclideUri)(this.props.targetUri);
    if (service != null) {
      const attachTargets = await service.getAttachTargetList();
      this.setState({ attachTargets: (_expected || _load_expected()).Expect.value(attachTargets) });
    }
  }

  render() {
    const emptyComponent = this.state.attachTargets.isPending ? () => _react.createElement(
      'div',
      { className: 'debugger-php-attach-list-empty' },
      'Loading...'
    ) : () => _react.createElement(
      'div',
      { className: 'debugger-php-attach-list-empty' },
      'To enable attaching this debugger, pass the arguments:',
      _react.createElement('br', null),
      _react.createElement(
        'b',
        null,
        '--mode vsdebug --vsDebugPort <port>'
      ),
      _react.createElement('br', null),
      'and optionally ',
      _react.createElement(
        'b',
        null,
        '--vsDebugNoWait'
      ),
      ' to HHVM when launching your script. The script should then show in this list.'
    );

    const rows = this.state.attachTargets.isPending || this.state.attachTargets.isError ? [] : this.state.attachTargets.value.map(target => ({
      data: {
        pid: target.pid,
        command: target.command
      }
    }));

    let selectedIndex = -1;
    if (this.state.attachPort != null) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (this.state.attachPort === this._getPortFromHHVMArgs(row.data.command)) {
          selectedIndex = i;
          break;
        }
      }
    }

    return _react.createElement(
      'div',
      { className: 'block' },
      _react.createElement(
        'div',
        { className: 'nuclide-ui-radiogroup-div' },
        _react.createElement('input', {
          className: 'input-radio',
          type: 'radio',
          checked: this.state.attachType === 'webserver',
          name: 'radiogroup-attachtype',
          onChange: () => this.setState({ attachType: 'webserver', attachPort: null })
        }),
        _react.createElement(
          'label',
          { className: 'input-label nuclide-ui-radiogroup-label' },
          _react.createElement(
            'b',
            null,
            'Attach to webserver'
          )
        ),
        _react.createElement(
          'div',
          { className: 'debugger-php-launch-attach-ui-select-project' },
          _react.createElement(
            'label',
            null,
            'Selected Project Directory: '
          ),
          _react.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
            className: 'inline-block debugger-connection-box',
            options: this.state.pathMenuItems,
            onChange: this._handlePathsDropdownChange,
            value: this.state.selectedPathIndex,
            disabled: this.state.attachType !== 'webserver'
          })
        ),
        _react.createElement(
          'div',
          null,
          _react.createElement('input', {
            className: 'input-radio',
            type: 'radio',
            checked: this.state.attachType === 'script',
            name: 'radiogroup-attachtype',
            onChange: () => this.setState({
              attachType: 'script',
              attachPort: selectedIndex >= 0 && selectedIndex < rows.length ? this._getPortFromHHVMArgs(rows[selectedIndex].data.command) : null
            })
          }),
          _react.createElement(
            'label',
            { className: 'input-label nuclide-ui-radiogroup-label' },
            _react.createElement(
              'b',
              null,
              'Attach to an already-running PHP/Hack script'
            )
          ),
          _react.createElement(
            'div',
            { className: 'debugger-php-launch-attach-ui-select-script' },
            this.state.attachType === 'script' ? _react.createElement((_Table || _load_Table()).Table, {
              emptyComponent: emptyComponent,
              columns: getColumns(),
              fixedHeader: true,
              maxBodyHeight: '30em',
              rows: rows,
              sortable: false,
              selectable: true,
              selectedIndex: selectedIndex,
              onSelect: item => {
                this.setState({
                  attachPort: this._getPortFromHHVMArgs(item.command)
                });
              },
              collapsable: true
            }) : null
          )
        )
      )
    );
  }

  _getPortFromHHVMArgs(command) {
    const pattern = /--vsDebugPort(=|\s+)([0-9]+)/gi;
    const match = pattern.exec(command);
    return match != null && match.length >= 3 ? parseInt(match[2], 10) : null;
  }

  _getPathMenuItems() {
    const connections = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.getByHostname((_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri));
    return connections.map((connection, index) => {
      const pathToProject = connection.getPath();
      return {
        label: pathToProject,
        value: index
      };
    });
  }

  async _handleAttachButtonClick() {
    // Start a debug session with the user-supplied information.
    const { hostname } = (_nuclideUri || _load_nuclideUri()).default.parseRemoteUri(this.props.targetUri);
    const selectedPath = this.state.attachType === 'webserver' ? this.state.pathMenuItems[this.state.selectedPathIndex].label : '/';

    await this.props.startAttachProcessConfig((_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, selectedPath), this.state.attachPort, this.state.attachType === 'webserver');

    (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).serializeDebuggerConfig)(...this._getSerializationArgs(), {
      selectedPath,
      attachType: this.state.attachType
    });
  }
}
exports.AttachUiComponent = AttachUiComponent;