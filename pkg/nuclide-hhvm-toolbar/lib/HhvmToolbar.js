var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var callDebugService = _asyncToGenerator(function* (processInfo) {
  // Use commands here to trigger package activation.
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  var debuggerService = yield (0, (_commonsAtomConsumeFirstProvider2 || _commonsAtomConsumeFirstProvider()).default)('nuclide-debugger.remote');
  debuggerService.startDebugging(processInfo);
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideUiLibAtomInput2;

function _nuclideUiLibAtomInput() {
  return _nuclideUiLibAtomInput2 = require('../../nuclide-ui/lib/AtomInput');
}

var _nuclideUiLibDropdown2;

function _nuclideUiLibDropdown() {
  return _nuclideUiLibDropdown2 = require('../../nuclide-ui/lib/Dropdown');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

var _nuclideUiLibButtonGroup2;

function _nuclideUiLibButtonGroup() {
  return _nuclideUiLibButtonGroup2 = require('../../nuclide-ui/lib/ButtonGroup');
}

var _ProjectStore2;

function _ProjectStore() {
  return _ProjectStore2 = _interopRequireDefault(require('./ProjectStore'));
}

var _commonsAtomConsumeFirstProvider2;

function _commonsAtomConsumeFirstProvider() {
  return _commonsAtomConsumeFirstProvider2 = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var WEB_SERVER_OPTION = { label: 'WebServer', value: 0 };
var SCRIPT_OPTION = { label: 'Script', value: 1 };
var DEFAULT_OPTION_INDEX = WEB_SERVER_OPTION.value;

var DEBUG_OPTIONS = [WEB_SERVER_OPTION, SCRIPT_OPTION];

var NO_LAUNCH_DEBUG_OPTIONS = [WEB_SERVER_OPTION];

var HhvmToolbar = (function (_React$Component) {
  _inherits(HhvmToolbar, _React$Component);

  _createClass(HhvmToolbar, null, [{
    key: 'propTypes',
    value: {
      targetFilePath: (_reactForAtom2 || _reactForAtom()).React.PropTypes.string.isRequired,
      projectStore: (_reactForAtom2 || _reactForAtom()).React.PropTypes.instanceOf((_ProjectStore2 || _ProjectStore()).default).isRequired
    },
    enumerable: true
  }]);

  function HhvmToolbar(props) {
    _classCallCheck(this, HhvmToolbar);

    _get(Object.getPrototypeOf(HhvmToolbar.prototype), 'constructor', this).call(this, props);
    this.state = {
      selectedIndex: DEFAULT_OPTION_INDEX
    };
    this._debug = this._debug.bind(this);
    this._handleDropdownChange = this._handleDropdownChange.bind(this);
    this._updateLastScriptCommand = this._updateLastScriptCommand.bind(this);
    this._getLastScriptCommand = this._getLastScriptCommand.bind(this);
  }

  _createClass(HhvmToolbar, [{
    key: '_updateLastScriptCommand',
    value: function _updateLastScriptCommand(command) {
      if (this._isDebugScript(this.state.selectedIndex)) {
        this.props.projectStore.updateLastScriptCommand(command);
      }
    }
  }, {
    key: '_getLastScriptCommand',
    value: function _getLastScriptCommand(filePath) {
      return this.props.projectStore.getLastScriptCommand(filePath);
    }
  }, {
    key: '_getMenuItems',
    value: function _getMenuItems() {
      return this._isTargetLaunchable(this.props.targetFilePath) ? DEBUG_OPTIONS : NO_LAUNCH_DEBUG_OPTIONS;
    }
  }, {
    key: '_isTargetLaunchable',
    value: function _isTargetLaunchable(targetFilePath) {
      return targetFilePath.endsWith('.php') || targetFilePath.endsWith('.hh');
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var selectedIndex = this.state.selectedIndex;
      // Reset selected item to DEFAULT_OPTION_INDEX if target is not launchable anymore.
      // TODO[jeffreytan]: this is ugly, refactor to make it more elegant.
      if (!this._isTargetLaunchable(nextProps.targetFilePath)) {
        selectedIndex = DEFAULT_OPTION_INDEX;
        this.setState({ selectedIndex: selectedIndex });
      }
      this.refs.debugTarget.setText(this._getDebugTarget(selectedIndex, nextProps.targetFilePath));
    }
  }, {
    key: 'render',
    value: function render() {
      var debugTarget = this._getDebugTarget(this.state.selectedIndex, this.props.targetFilePath);
      var isDebugScript = this._isDebugScript(this.state.selectedIndex);
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'buck-toolbar hhvm-toolbar block padded' },
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibDropdown2 || _nuclideUiLibDropdown()).Dropdown, {
          className: 'inline-block',
          options: this._getMenuItems(),
          value: this.state.selectedIndex,
          onChange: this._handleDropdownChange,
          ref: 'dropdown',
          size: 'sm'
        }),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'inline-block', style: { width: '500px' } },
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomInput2 || _nuclideUiLibAtomInput()).AtomInput, {
            ref: 'debugTarget',
            initialValue: debugTarget,
            disabled: !isDebugScript,
            onDidChange: this._updateLastScriptCommand,
            size: 'sm'
          })
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiLibButtonGroup2 || _nuclideUiLibButtonGroup()).ButtonGroup,
          { size: (_nuclideUiLibButtonGroup2 || _nuclideUiLibButtonGroup()).ButtonGroupSizes.SMALL, className: 'inline-block' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
            { onClick: this._debug },
            isDebugScript ? 'Launch' : 'Attach'
          )
        )
      );
    }
  }, {
    key: '_isDebugScript',
    value: function _isDebugScript(index) {
      return index === SCRIPT_OPTION.value;
    }
  }, {
    key: '_getDebugTarget',
    value: function _getDebugTarget(index, targetFilePath) {
      if (this._isDebugScript(index)) {
        var targetPath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.getPath(targetFilePath);
        var lastScriptCommand = this._getLastScriptCommand(targetPath);
        if (lastScriptCommand === '') {
          return targetPath;
        }
        return lastScriptCommand;
      }
      return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.getHostname(targetFilePath);
    }
  }, {
    key: '_handleDropdownChange',
    value: function _handleDropdownChange(newIndex) {
      var debugTarget = this._getDebugTarget(newIndex, this.props.targetFilePath);
      if (this.refs.debugTarget) {
        this.refs.debugTarget.setText(debugTarget);
      }
      this.setState({ selectedIndex: newIndex });
    }

    /**
     * Use void here to explictly disallow async function in react component.
     */
  }, {
    key: '_debug',
    value: function _debug() {
      // TODO: is this.props.targetFilePath best one for targetUri?
      var processInfo = null;
      if (this._isDebugScript(this.state.selectedIndex)) {
        var scriptTarget = this.refs.debugTarget.getText();

        var _require = require('../../nuclide-debugger-hhvm/lib/LaunchProcessInfo');

        var LaunchProcessInfo = _require.LaunchProcessInfo;

        processInfo = new LaunchProcessInfo(this.props.targetFilePath, scriptTarget);
      } else {
        var _require2 = require('../../nuclide-debugger-hhvm/lib/AttachProcessInfo');

        var AttachProcessInfo = _require2.AttachProcessInfo;

        processInfo = new AttachProcessInfo(this.props.targetFilePath);
      }
      callDebugService(processInfo);
    }
  }]);

  return HhvmToolbar;
})((_reactForAtom2 || _reactForAtom()).React.Component);

module.exports = HhvmToolbar;