"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AttachUiComponent = void 0;

var React = _interopRequireWildcard(require("react"));

function _Dropdown() {
  const data = require("../../../modules/nuclide-commons-ui/Dropdown");

  _Dropdown = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nuclideDebuggerCommon() {
  const data = require("../../../modules/nuclide-debugger-common");

  _nuclideDebuggerCommon = function () {
    return data;
  };

  return data;
}

function _Table() {
  const data = require("../../../modules/nuclide-commons-ui/Table");

  _Table = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _expected() {
  const data = require("../../../modules/nuclide-commons/expected");

  _expected = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
}

class AttachUiComponent extends React.Component {
  constructor(props) {
    super(props);

    this._handlePathsDropdownChange = newIndex => {
      this.setState({
        selectedPathIndex: newIndex
      });
    };

    this._disposables = new (_UniversalDisposable().default)();
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
      pathMenuItems: _expected().Expect.pending(),
      attachPort: null,
      attachType: 'webserver',
      attachTargets: _expected().Expect.pending()
    };
  }

  _getSerializationArgs() {
    return [_nuclideUri().default.isRemote(this.props.targetUri) ? _nuclideUri().default.getHostname(this.props.targetUri) : 'local', 'attach', 'php'];
  }

  componentDidMount() {
    this._disposables.add(_RxMin.Observable.fromPromise(this._getPathMenuItems()).subscribe(pathMenuItems => {
      (0, _nuclideDebuggerCommon().deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
        const items = pathMenuItems.getOrDefault([]);
        const savedPath = items.find(item => item.label === savedSettings.selectedPath);
        const savedIndex = items.indexOf(savedPath);
        this.setState({
          selectedPathIndex: savedIndex < 0 ? 0 : savedIndex,
          attachType: savedSettings.attachType != null ? savedSettings.attachType : 'webserver'
        });
      });
    }));

    this.props.configIsValidChanged(this._debugButtonShouldEnable());

    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:confirm': () => {
        if (this._debugButtonShouldEnable()) {
          this._handleAttachButtonClick();
        }
      }
    }));

    this._attachTargetSub = _RxMin.Observable.interval(2000).switchMap(async () => {
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
    const selectedPath = !this.state.pathMenuItems.isPending && !this.state.pathMenuItems.isError ? this.state.pathMenuItems.value[this.state.selectedPathIndex] : null;
    return this.state.attachType === 'webserver' && selectedPath != null || this.state.attachPort != null;
  }

  async _refreshTargetList() {
    const service = await (0, _nuclideRemoteConnection().getHhvmDebuggerServiceByNuclideUri)(this.props.targetUri);

    if (service != null) {
      const attachTargets = await service.getAttachTargetList();
      this.setState({
        attachTargets: _expected().Expect.value(attachTargets)
      });
    }
  }

  render() {
    const emptyComponent = this.state.attachTargets.isPending ? () => React.createElement("div", {
      className: "debugger-php-attach-list-empty"
    }, "Loading...") : () => React.createElement("div", {
      className: "debugger-php-attach-list-empty"
    }, "To enable attaching this debugger, pass the arguments:", React.createElement("br", null), React.createElement("b", null, "--mode vsdebug --vsDebugPort <port>"), React.createElement("br", null), "and optionally ", React.createElement("b", null, "--vsDebugNoWait"), " to HHVM when launching your script. The script should then show in this list.");
    const rows = this.state.attachTargets.getOrDefault([]).map(target => ({
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

    const pathMenuItems = this.state.pathMenuItems.isPending || this.state.pathMenuItems.isError ? [] : this.state.pathMenuItems.value;
    return React.createElement("div", {
      className: "block"
    }, React.createElement("div", {
      className: "nuclide-ui-radiogroup-div"
    }, React.createElement("input", {
      className: "input-radio",
      type: "radio",
      checked: this.state.attachType === 'webserver',
      name: "radiogroup-attachtype",
      onChange: () => this.setState({
        attachType: 'webserver',
        attachPort: null
      })
    }), React.createElement("label", {
      className: "input-label nuclide-ui-radiogroup-label"
    }, React.createElement("b", null, "Attach to webserver")), React.createElement("div", {
      className: "debugger-php-launch-attach-ui-select-project"
    }, React.createElement("label", null, "Selected Project Directory: "), pathMenuItems.length > 0 ? React.createElement(_Dropdown().Dropdown, {
      className: "inline-block debugger-connection-box",
      options: pathMenuItems.map(item => Object.assign({}, item, {
        disabled: false
      })),
      onChange: this._handlePathsDropdownChange,
      value: this.state.selectedPathIndex,
      disabled: this.state.attachType !== 'webserver'
    }) : React.createElement("div", null, this.state.pathMenuItems.isPending ? 'Loading project roots...' : 'No Hack roots found! Try adding a directory that contains your .hhconfig file to the file tree!')), React.createElement("div", null, React.createElement("input", {
      className: "input-radio",
      type: "radio",
      checked: this.state.attachType === 'script',
      name: "radiogroup-attachtype",
      onChange: () => this.setState({
        attachType: 'script',
        attachPort: selectedIndex >= 0 && selectedIndex < rows.length ? this._getPortFromHHVMArgs(rows[selectedIndex].data.command) : null
      })
    }), React.createElement("label", {
      className: "input-label nuclide-ui-radiogroup-label"
    }, React.createElement("b", null, "Attach to an already-running PHP/Hack script")), React.createElement("div", {
      className: "debugger-php-launch-attach-ui-select-script"
    }, this.state.attachType === 'script' ? React.createElement(_Table().Table, {
      emptyComponent: emptyComponent,
      columns: getColumns(),
      fixedHeader: true,
      maxBodyHeight: "30em",
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
    }) : null))));
  }

  _getPortFromHHVMArgs(command) {
    const pattern = /--vsDebugPort(=|\s+)([0-9]+)/gi;
    const match = pattern.exec(command);
    return match != null && match.length >= 3 ? parseInt(match[2], 10) : null;
  }

  async _getPathMenuItems() {
    const connections = _nuclideRemoteConnection().RemoteConnection.getByHostname(_nuclideUri().default.getHostname(this.props.targetUri));

    const pathMenuItems = (await Promise.all(connections.map(async (connection, index) => {
      const pathToProject = connection.getPath();
      const fsSvc = (0, _nuclideRemoteConnection().getFileSystemServiceByNuclideUri)(connection.getUri());

      if ((await fsSvc.findNearestAncestorNamed('.hhconfig', pathToProject)) != null) {
        return {
          label: pathToProject,
          value: index
        };
      }

      return null;
    }))).filter(p => p != null); // Flow missing that pathMenuItems[i] is never null due to the filter above.
    // $FlowIgnore

    const val = _expected().Expect.value([...pathMenuItems]);

    this.setState({
      pathMenuItems: val
    });
    return val;
  }

  async _handleAttachButtonClick() {
    // Start a debug session with the user-supplied information.
    const {
      hostname
    } = _nuclideUri().default.parseRemoteUri(this.props.targetUri);

    const selectedPath = this.state.attachType === 'webserver' && !this.state.pathMenuItems.isPending && !this.state.pathMenuItems.isError ? this.state.pathMenuItems.value[this.state.selectedPathIndex].label : '/';
    await this.props.startAttachProcessConfig(_nuclideUri().default.createRemoteUri(hostname, selectedPath), this.state.attachPort, this.state.attachType === 'webserver');
    (0, _nuclideDebuggerCommon().serializeDebuggerConfig)(...this._getSerializationArgs(), {
      selectedPath,
      attachType: this.state.attachType
    });
  }

}

exports.AttachUiComponent = AttachUiComponent;