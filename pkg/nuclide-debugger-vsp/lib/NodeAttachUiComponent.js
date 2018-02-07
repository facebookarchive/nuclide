'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _react = _interopRequireWildcard(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class NodeScriptAttachUiComponent extends _react.Component {

  constructor(props) {
    var _this;

    _this = super(props);
    this._handleAttachButtonClick = (0, _asyncToGenerator.default)(function* () {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-node-debugger-attach-from-dialog');
      const port = Number((0, (_nullthrows || _load_nullthrows()).default)(_this._port).getText().trim());
      const attachInfo = yield (0, (_utils || _load_utils()).getNodeAttachProcessInfo)(_this.props.targetUri, port);

      const debuggerService = yield (0, (_utils || _load_utils()).getDebuggerService)();
      debuggerService.startDebugging(attachInfo);

      (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).serializeDebuggerConfig)(..._this._getSerializationArgs(), {
        port: _this.state.port
      });
    });
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      port: ''
    };
  }

  _getSerializationArgs() {
    return [(_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri) : 'local', 'attach', 'node'];
  }

  setState(newState) {
    super.setState(newState);
    this.props.configIsValidChanged(this._debugButtonShouldEnable());
  }

  componentDidMount() {
    (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
      this.setState({
        port: savedSettings.port || ''
      });
    });

    if (this._port != null) {
      this._port.focus();
    }

    this.props.configIsValidChanged(this._debugButtonShouldEnable());
    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:confirm': () => {
        if (this._debugButtonShouldEnable()) {
          this._handleAttachButtonClick();
        }
      }
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _debugButtonShouldEnable() {
    const { port } = this.state;
    return port.length > 0 && !isNaN(port);
  }

  render() {
    return _react.createElement(
      'div',
      { className: 'block' },
      _react.createElement(
        'p',
        null,
        'Attach to a running node.js process'
      ),
      _react.createElement(
        'label',
        null,
        'Debug port number: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._port = input;
        },
        tabIndex: '1',
        placeholderText: 'Node debug port (e.g. 5858 or 9229)',
        value: this.state.port,
        onDidChange: port => this.setState({ port })
      })
    );
  }

}
exports.default = NodeScriptAttachUiComponent;