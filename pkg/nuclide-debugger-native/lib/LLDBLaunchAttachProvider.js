Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _LaunchAttachStore;

function _load_LaunchAttachStore() {
  return _LaunchAttachStore = require('./LaunchAttachStore');
}

var _LaunchAttachDispatcher;

function _load_LaunchAttachDispatcher() {
  return _LaunchAttachDispatcher = _interopRequireDefault(require('./LaunchAttachDispatcher'));
}

var _LaunchUIComponent;

function _load_LaunchUIComponent() {
  return _LaunchUIComponent = require('./LaunchUIComponent');
}

var _AttachUIComponent;

function _load_AttachUIComponent() {
  return _AttachUIComponent = require('./AttachUIComponent');
}

var _LaunchAttachActions;

function _load_LaunchAttachActions() {
  return _LaunchAttachActions = require('./LaunchAttachActions');
}

var LLDBLaunchAttachProvider = (function (_DebuggerLaunchAttachProvider) {
  _inherits(LLDBLaunchAttachProvider, _DebuggerLaunchAttachProvider);

  function LLDBLaunchAttachProvider(debuggingTypeName, targetUri) {
    _classCallCheck(this, LLDBLaunchAttachProvider);

    _get(Object.getPrototypeOf(LLDBLaunchAttachProvider.prototype), 'constructor', this).call(this, debuggingTypeName, targetUri);
    this._dispatcher = new (_LaunchAttachDispatcher || _load_LaunchAttachDispatcher()).default();
    this._actions = new (_LaunchAttachActions || _load_LaunchAttachActions()).LaunchAttachActions(this._dispatcher, this.getTargetUri());
    this._store = new (_LaunchAttachStore || _load_LaunchAttachStore()).LaunchAttachStore(this._dispatcher);
  }

  _createClass(LLDBLaunchAttachProvider, [{
    key: 'getActions',
    value: function getActions() {
      return ['Attach', 'Launch'];
    }
  }, {
    key: 'getComponent',
    value: function getComponent(action) {
      if (action === 'Launch') {
        return (_reactForAtom || _load_reactForAtom()).React.createElement((_LaunchUIComponent || _load_LaunchUIComponent()).LaunchUIComponent, { store: this._store, actions: this._actions });
      } else if (action === 'Attach') {
        this._actions.updateAttachTargetList();
        return (_reactForAtom || _load_reactForAtom()).React.createElement((_AttachUIComponent || _load_AttachUIComponent()).AttachUIComponent, { store: this._store, actions: this._actions });
      } else {
        return null;
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._store.dispose();
      this._actions.dispose();
    }
  }]);

  return LLDBLaunchAttachProvider;
})((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachProvider);

exports.LLDBLaunchAttachProvider = LLDBLaunchAttachProvider;