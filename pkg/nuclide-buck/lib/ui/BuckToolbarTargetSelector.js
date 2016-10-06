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

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _nuclideUiCombobox2;

function _nuclideUiCombobox() {
  return _nuclideUiCombobox2 = require('../../../nuclide-ui/Combobox');
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../../commons-node/nuclideUri'));
}

var _commonsNodeObservable2;

function _commonsNodeObservable() {
  return _commonsNodeObservable2 = require('../../../commons-node/observable');
}

var _nuclideBuckBase2;

function _nuclideBuckBase() {
  return _nuclideBuckBase2 = require('../../../nuclide-buck-base');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../../nuclide-logging');
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
    value: function _requestOptions(inputText) {
      var buckRoot = this.props.store.getCurrentBuckRoot();
      if (buckRoot == null) {
        return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.throw(Error(NO_ACTIVE_PROJECT_ERROR));
      }
      return (0, (_commonsNodeObservable2 || _commonsNodeObservable()).concatLatest)((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(inputText.trim() === '' ? [] : [inputText]), (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromPromise(this._getActiveOwners(buckRoot)), (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromPromise(this._getAliases(buckRoot))).map(function (list) {
        return Array.from(new Set(list));
      });
    }
  }, {
    key: '_getAliases',
    value: function _getAliases(buckRoot) {
      var cachedAliases = this._projectAliasesCache.get(buckRoot);
      if (cachedAliases == null) {
        var buckService = (0, (_nuclideBuckBase2 || _nuclideBuckBase()).getBuckService)(buckRoot);
        cachedAliases = buckService == null ? Promise.resolve([]) : buckService.listAliases(buckRoot);
        this._projectAliasesCache.set(buckRoot, cachedAliases);
      }
      return cachedAliases;
    }
  }, {
    key: '_getActiveOwners',
    value: function _getActiveOwners(buckRoot) {
      var editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return Promise.resolve([]);
      }
      var path = editor.getPath();
      if (path == null || !(_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.contains(buckRoot, path)) {
        return Promise.resolve([]);
      }
      if (path === this._cachedOwnersPath && this._cachedOwners != null) {
        return this._cachedOwners;
      }
      var buckService = (0, (_nuclideBuckBase2 || _nuclideBuckBase()).getBuckService)(buckRoot);
      this._cachedOwners = buckService == null ? Promise.resolve([]) : buckService.getOwner(buckRoot, path).then(
      // Strip off the optional leading "//" to match typical user input.
      function (owners) {
        return owners.map(function (owner) {
          return owner.startsWith('//') ? owner.substring(2) : owner;
        });
      }).catch(function (err) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('Error getting Buck owners for ' + path, err);
        return [];
      });
      this._cachedOwnersPath = path;
      return this._cachedOwners;
    }
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
      return (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiCombobox2 || _nuclideUiCombobox()).Combobox, {
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