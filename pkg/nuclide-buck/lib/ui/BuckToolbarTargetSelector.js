Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiLibCombobox2;

function _nuclideUiLibCombobox() {
  return _nuclideUiLibCombobox2 = require('../../../nuclide-ui/lib/Combobox');
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../../commons-node/promise');
}

var _nuclideBuckBase2;

function _nuclideBuckBase() {
  return _nuclideBuckBase2 = require('../../../nuclide-buck-base');
}

var NO_ACTIVE_PROJECT_ERROR = 'No active Buck project. Check your Current Working Root.';

var BuckToolbarTargetSelector = (function (_React$Component) {
  _inherits(BuckToolbarTargetSelector, _React$Component);

  function BuckToolbarTargetSelector(props) {
    _classCallCheck(this, BuckToolbarTargetSelector);

    _get(Object.getPrototypeOf(BuckToolbarTargetSelector.prototype), 'constructor', this).call(this, props);
    this._requestOptions = this._requestOptions.bind(this);
    this._handleBuildTargetChange = this._handleBuildTargetChange.bind(this);
    this._projectAliasesCache = new Map();
  }

  _createClass(BuckToolbarTargetSelector, [{
    key: '_requestOptions',
    value: _asyncToGenerator(function* (inputText) {
      var _this = this;

      var buckRoot = this.props.store.getCurrentBuckRoot();
      if (buckRoot == null) {
        throw new Error(NO_ACTIVE_PROJECT_ERROR);
      }

      var aliases = this._projectAliasesCache.get(buckRoot);
      if (!aliases) {
        (function () {
          var buckProject = (0, (_nuclideBuckBase2 || _nuclideBuckBase()).createBuckProject)(buckRoot);
          aliases = (0, (_commonsNodePromise2 || _commonsNodePromise()).lastly)(buckProject.listAliases(), function () {
            return buckProject.dispose();
          });
          _this._projectAliasesCache.set(buckRoot, aliases);
        })();
      }

      var result = (yield aliases).slice();
      if (inputText.trim() && result.indexOf(inputText) === -1) {
        result.splice(0, 0, inputText);
      }
      return result;
    })
  }, {
    key: '_handleBuildTargetChange',
    value: function _handleBuildTargetChange(value) {
      var trimmed = value.trim();
      if (this.props.store.getBuildTarget() === trimmed) {
        return;
      }
      this.props.actions.updateBuildTarget(trimmed);
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibCombobox2 || _nuclideUiLibCombobox()).Combobox, {
        className: 'inline-block nuclide-buck-target-combobox',
        formatRequestOptionsErrorMessage: function (err) {
          return err.message;
        },
        requestOptions: this._requestOptions,
        size: 'sm',
        loadingMessage: 'Updating target names...',
        initialTextInput: this.props.store.getBuildTarget(),
        onSelect: this._handleBuildTargetChange,
        onBlur: this._handleBuildTargetChange,
        placeholderText: 'Buck build target',
        width: null
      });
    }
  }]);

  return BuckToolbarTargetSelector;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = BuckToolbarTargetSelector;
module.exports = exports.default;

// Querying Buck can be slow, so cache aliases by project.
// Putting the cache here allows the user to refresh it by toggling the UI.