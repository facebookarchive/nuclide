'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AttachUIComponent = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _react = _interopRequireWildcard(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
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

var _JavaDebuggerServiceHelpers;

function _load_JavaDebuggerServiceHelpers() {
  return _JavaDebuggerServiceHelpers = require('./JavaDebuggerServiceHelpers');
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

class AttachUIComponent extends _react.Component {

  constructor(props) {
    var _this;

    _this = super(props);

    this._handleAttachClick = (0, _asyncToGenerator.default)(function* () {
      // TODO: perform some validation for the input.
      const javaPort = parseInt((0, (_nullthrows || _load_nullthrows()).default)(_this._jdwpPort).getText().trim(), 10);

      yield (0, (_JavaDebuggerServiceHelpers || _load_JavaDebuggerServiceHelpers()).debugJavaDebuggerService)(_this.props.targetUri, {
        debugMode: 'attach',
        machineName: 'localhost',
        port: javaPort
      });

      (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).serializeDebuggerConfig)(..._this._getSerializationArgs(), {
        jdwpPort: _this.state.jdwpPort
      });
    });
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      jdwpPort: ''
    };
  }

  _getSerializationArgs() {
    return [(_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri) : 'local', 'attach', 'Java'];
  }

  componentDidMount() {
    var _this2 = this;

    (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
      this.setState({
        jdwpPort: savedSettings.jdwpPort || ''
      });
    });

    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:confirm': (() => {
        var _ref2 = (0, _asyncToGenerator.default)(function* () {
          if (_this2._debugButtonShouldEnable()) {
            yield _this2._handleAttachClick();
          }
        });

        return function coreConfirm() {
          return _ref2.apply(this, arguments);
        };
      })()
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  setState(newState) {
    super.setState(newState, () => this.props.configIsValidChanged(this._debugButtonShouldEnable()));
  }

  _debugButtonShouldEnable() {
    return this.state.jdwpPort.trim() !== '';
  }

  render() {
    // TODO: smart fill the working directory textbox.
    return _react.createElement(
      'div',
      { className: 'block' },
      _react.createElement(
        'label',
        null,
        'Java JDWP Port: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._jdwpPort = input;
        },
        placeholderText: 'Java debugger port',
        value: this.state.jdwpPort,
        onDidChange: value => this.setState({ jdwpPort: value }),
        autofocus: true
      })
    );
  }

}
exports.AttachUIComponent = AttachUIComponent;