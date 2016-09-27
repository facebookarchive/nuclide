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

var _nuclideHackCommonLibConstantsJs2;

function _nuclideHackCommonLibConstantsJs() {
  return _nuclideHackCommonLibConstantsJs2 = require('../../nuclide-hack-common/lib/constants.js');
}

var _nuclideUiAtomInput2;

function _nuclideUiAtomInput() {
  return _nuclideUiAtomInput2 = require('../../nuclide-ui/AtomInput');
}

var _nuclideUiDropdown2;

function _nuclideUiDropdown() {
  return _nuclideUiDropdown2 = require('../../nuclide-ui/Dropdown');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiButton2;

function _nuclideUiButton() {
  return _nuclideUiButton2 = require('../../nuclide-ui/Button');
}

var _nuclideUiButtonGroup2;

function _nuclideUiButtonGroup() {
  return _nuclideUiButtonGroup2 = require('../../nuclide-ui/ButtonGroup');
}

var _commonsAtomConsumeFirstProvider2;

function _commonsAtomConsumeFirstProvider() {
  return _commonsAtomConsumeFirstProvider2 = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideDebuggerPhpLibLaunchProcessInfo2;

function _nuclideDebuggerPhpLibLaunchProcessInfo() {
  return _nuclideDebuggerPhpLibLaunchProcessInfo2 = require('../../nuclide-debugger-php/lib/LaunchProcessInfo');
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideDebuggerPhpLibAttachProcessInfo2;

function _nuclideDebuggerPhpLibAttachProcessInfo() {
  return _nuclideDebuggerPhpLibAttachProcessInfo2 = require('../../nuclide-debugger-php/lib/AttachProcessInfo');
}

var WEB_SERVER_OPTION = { label: 'WebServer', value: 0 };
var SCRIPT_OPTION = { label: 'Script', value: 1 };
var DEFAULT_OPTION_INDEX = WEB_SERVER_OPTION.value;

var DEBUG_OPTIONS = [WEB_SERVER_OPTION, SCRIPT_OPTION];

var NO_LAUNCH_DEBUG_OPTIONS = [WEB_SERVER_OPTION];

var HhvmToolbar = (function (_React$Component) {
  _inherits(HhvmToolbar, _React$Component);

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
      if (targetFilePath.endsWith('.php') || targetFilePath.endsWith('.hh')) {
        return true;
      }
      return atom.workspace.getTextEditors().some(function (editor) {
        var editorPath = editor.getPath();
        if (editorPath != null && editorPath.endsWith(targetFilePath)) {
          var grammar = editor.getGrammar();
          return (_nuclideHackCommonLibConstantsJs2 || _nuclideHackCommonLibConstantsJs()).HACK_GRAMMARS.indexOf(grammar.scopeName) >= 0;
        }
        return false;
      });
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
        { className: 'hhvm-toolbar block padded' },
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiDropdown2 || _nuclideUiDropdown()).Dropdown, {
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
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiAtomInput2 || _nuclideUiAtomInput()).AtomInput, {
            ref: 'debugTarget',
            initialValue: debugTarget,
            disabled: !isDebugScript,
            onDidChange: this._updateLastScriptCommand,
            size: 'sm'
          })
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiButtonGroup2 || _nuclideUiButtonGroup()).ButtonGroup,
          { size: (_nuclideUiButtonGroup2 || _nuclideUiButtonGroup()).ButtonGroupSizes.SMALL, className: 'inline-block' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiButton2 || _nuclideUiButton()).Button,
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
        var targetPath = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.getPath(targetFilePath);
        var lastScriptCommand = this._getLastScriptCommand(targetPath);
        if (lastScriptCommand === '') {
          return targetPath;
        }
        return lastScriptCommand;
      }
      return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.getHostname(targetFilePath);
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
        processInfo = new (_nuclideDebuggerPhpLibLaunchProcessInfo2 || _nuclideDebuggerPhpLibLaunchProcessInfo()).LaunchProcessInfo(this.props.targetFilePath, scriptTarget);
      } else {
        processInfo = new (_nuclideDebuggerPhpLibAttachProcessInfo2 || _nuclideDebuggerPhpLibAttachProcessInfo()).AttachProcessInfo(this.props.targetFilePath);
      }
      callDebugService(processInfo);
    }
  }]);

  return HhvmToolbar;
})((_reactForAtom2 || _reactForAtom()).React.Component);

module.exports = HhvmToolbar;