'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('nuclide-commons-ui/Checkbox');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ReactNativeCommonUiComponent extends _react.Component {

  constructor(props) {
    super(props);

    this._debugButtonShouldEnable = () => {
      return this.state.workspacePath.trim() !== '';
    };

    this.handleLaunchClick = (0, _asyncToGenerator.default)(function* () {
      throw new Error('Launch click not implemented!');
    });
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  deserializeState() {
    throw new Error('Deserialize debugger not implemented!');
  }

  componentDidMount() {
    this.deserializeState();
    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:confirm': () => {
        if (this._debugButtonShouldEnable()) {
          this.handleLaunchClick();
        }
      }
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  setState(newState) {
    super.setState(newState);
    this.props.configIsValidChanged(this._debugButtonShouldEnable());
  }

  _deriveProgramFromWorkspace(workspacePath) {
    return (_nuclideUri || _load_nuclideUri()).default.getPath((_nuclideUri || _load_nuclideUri()).default.join(workspacePath, '.vscode', 'launchReactNative.js'));
  }

  _deriveOutDirFromWorkspace(workspacePath) {
    return (_nuclideUri || _load_nuclideUri()).default.getPath((_nuclideUri || _load_nuclideUri()).default.join(workspacePath, '.vscode', '.react'));
  }

  stateToArgs() {
    const workspace = this.state.workspacePath.trim();
    const { sourceMaps } = this.state;
    const program = this._deriveProgramFromWorkspace(workspace);
    let { outDir } = this.state;
    if (outDir.length === 0) {
      outDir = this._deriveOutDirFromWorkspace(workspace);
    }
    // If parsing fails we fall back to default.
    let port = (_utils || _load_utils()).REACT_NATIVE_PACKAGER_DEFAULT_PORT;
    let sourceMapPathOverrides = {};
    try {
      port = Number.parseInt(this.state.port, 10);
      sourceMapPathOverrides = JSON.parse(this.state.sourceMapPathOverrides);
    } catch (e) {}
    return { program, outDir, sourceMapPathOverrides, port, sourceMaps };
  }

  render() {
    return _react.createElement(
      'div',
      { className: 'block' },
      _react.createElement(
        'label',
        null,
        'Workspace path (should contain package.json): '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        placeholderText: 'Path containing package.json',
        value: this.state.workspacePath,
        onDidChange: value => this.setState({ workspacePath: value }),
        autofocus: true
      }),
      _react.createElement(
        'label',
        null,
        'Debug port number: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        tabIndex: '1',
        placeholderText: `React Native packager port (default ${(_utils || _load_utils()).REACT_NATIVE_PACKAGER_DEFAULT_PORT})`,
        value: this.state.port,
        onDidChange: port => this.setState({ port })
      }),
      this.state.port !== (_utils || _load_utils()).REACT_NATIVE_PACKAGER_DEFAULT_PORT.toString() && _react.createElement(
        'label',
        null,
        'Note: first consult',
        ' ',
        _react.createElement(
          'a',
          { href: 'https://github.com/facebook/react-native/issues/9145' },
          'React Native issue #9145'
        ),
        ' ',
        'for setting a port other than 8081.'
      ),
      _react.createElement('br', null),
      _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        checked: this.state.sourceMaps,
        label: 'Use sourcemaps',
        onChange: checked => this.setState({ sourceMaps: checked })
      }),
      _react.createElement('br', null),
      _react.createElement(
        'label',
        null,
        'Location for output bundle files:'
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        tabIndex: '1',
        placeholderText: 'Default: ${WorkspacePath}/.vscode/.react',
        value: '',
        onDidChange: outDir => this.setState({ outDir })
      }),
      _react.createElement(
        'label',
        null,
        'Source map path overrides.',
        ' ',
        _react.createElement(
          'a',
          { href: 'https://github.com/Microsoft/vscode-node-debug2#sourcemappathoverrides' },
          '(see documentation on GitHub)'
        )
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        tabIndex: '1',
        placeholderText: '(Optional) JSON-parsable text.',
        value: '',
        onDidChange: sourceMapPathOverrides => this.setState({ sourceMapPathOverrides })
      })
    );
  }

}
exports.default = ReactNativeCommonUiComponent; /**
                                                 * Copyright (c) 2015-present, Facebook, Inc.
                                                 * All rights reserved.
                                                 *
                                                 * This source code is licensed under the license found in the LICENSE file in
                                                 * the root directory of this source tree.
                                                 *
                                                 * 
                                                 * @format
                                                 */