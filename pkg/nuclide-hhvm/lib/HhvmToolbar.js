var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideHackCommonLibConstantsJs;

function _load_nuclideHackCommonLibConstantsJs() {
  return _nuclideHackCommonLibConstantsJs = require('../../nuclide-hack-common/lib/constants.js');
}

var _nuclideUiAtomInput;

function _load_nuclideUiAtomInput() {
  return _nuclideUiAtomInput = require('../../nuclide-ui/AtomInput');
}

var _nuclideUiDropdown;

function _load_nuclideUiDropdown() {
  return _nuclideUiDropdown = require('../../nuclide-ui/Dropdown');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var WEB_SERVER_OPTION = { label: 'Attach to WebServer', value: 'webserver' };
var SCRIPT_OPTION = { label: 'Launch Script', value: 'script' };

var DEBUG_OPTIONS = [WEB_SERVER_OPTION, SCRIPT_OPTION];

var NO_LAUNCH_DEBUG_OPTIONS = [WEB_SERVER_OPTION];

var HhvmToolbar = (function (_React$Component) {
  _inherits(HhvmToolbar, _React$Component);

  function HhvmToolbar(props) {
    _classCallCheck(this, HhvmToolbar);

    _get(Object.getPrototypeOf(HhvmToolbar.prototype), 'constructor', this).call(this, props);
    this._handleDropdownChange = this._handleDropdownChange.bind(this);
    this._updateLastScriptCommand = this._updateLastScriptCommand.bind(this);
  }

  _createClass(HhvmToolbar, [{
    key: '_updateLastScriptCommand',
    value: function _updateLastScriptCommand(command) {
      if (this.props.projectStore.getDebugMode() === 'script') {
        this.props.projectStore.updateLastScriptCommand(command);
      }
    }
  }, {
    key: '_getMenuItems',
    value: function _getMenuItems() {
      return this._isTargetLaunchable(this.props.projectStore.getCurrentFilePath()) ? DEBUG_OPTIONS : NO_LAUNCH_DEBUG_OPTIONS;
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
          return (_nuclideHackCommonLibConstantsJs || _load_nuclideHackCommonLibConstantsJs()).HACK_GRAMMARS.indexOf(grammar.scopeName) >= 0;
        }
        return false;
      });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      // Reset selected item to webserver if target is not launchable anymore.
      // TODO[jeffreytan]: this is ugly, refactor to make it more elegant.
      var store = this.props.projectStore;
      if (store.getDebugMode() === 'script' && !this._isTargetLaunchable(store.getCurrentFilePath())) {
        store.setDebugMode('webserver');
      }
      this.refs.debugTarget.setText(store.getDebugTarget());
    }
  }, {
    key: 'render',
    value: function render() {
      var store = this.props.projectStore;
      var isDebugScript = store.getDebugMode() === 'script';
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'hhvm-toolbar block' },
        (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiDropdown || _load_nuclideUiDropdown()).Dropdown, {
          className: 'inline-block',
          options: this._getMenuItems(),
          value: store.getDebugMode(),
          onChange: this._handleDropdownChange,
          ref: 'dropdown',
          size: 'sm'
        }),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'inline-block', style: { width: '500px' } },
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiAtomInput || _load_nuclideUiAtomInput()).AtomInput, {
            ref: 'debugTarget',
            initialValue: store.getDebugTarget(),
            disabled: !isDebugScript,
            onDidChange: this._updateLastScriptCommand,
            size: 'sm'
          })
        )
      );
    }
  }, {
    key: '_handleDropdownChange',
    value: function _handleDropdownChange(value) {
      this.props.projectStore.setDebugMode(value);
    }
  }]);

  return HhvmToolbar;
})((_reactForAtom || _load_reactForAtom()).React.Component);

module.exports = HhvmToolbar;