Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideDebuggerAtom = require('../../nuclide-debugger-atom');

var _reactForAtom = require('react-for-atom');

var _flux = require('flux');

var _LaunchAttachStore = require('./LaunchAttachStore');

var _LaunchUIComponent = require('./LaunchUIComponent');

var _AttachUIComponent = require('./AttachUIComponent');

var _LaunchAttachActions = require('./LaunchAttachActions');

var LLDBLaunchAttachProvider = (function (_DebuggerLaunchAttachProvider) {
  _inherits(LLDBLaunchAttachProvider, _DebuggerLaunchAttachProvider);

  function LLDBLaunchAttachProvider(debuggingTypeName, targetUri) {
    _classCallCheck(this, LLDBLaunchAttachProvider);

    _get(Object.getPrototypeOf(LLDBLaunchAttachProvider.prototype), 'constructor', this).call(this, debuggingTypeName, targetUri);
    this._dispatcher = new _flux.Dispatcher();
    this._actions = new _LaunchAttachActions.LaunchAttachActions(this._dispatcher, this.getTargetUri());
    this._store = new _LaunchAttachStore.LaunchAttachStore(this._dispatcher);
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
        return _reactForAtom.React.createElement(_LaunchUIComponent.LaunchUIComponent, { store: this._store, actions: this._actions });
      } else if (action === 'Attach') {
        this._actions.updateAttachTargetList();
        return _reactForAtom.React.createElement(_AttachUIComponent.AttachUIComponent, { store: this._store, actions: this._actions });
      } else {
        return null;
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._store.dispose();
    }
  }]);

  return LLDBLaunchAttachProvider;
})(_nuclideDebuggerAtom.DebuggerLaunchAttachProvider);

exports.LLDBLaunchAttachProvider = LLDBLaunchAttachProvider;