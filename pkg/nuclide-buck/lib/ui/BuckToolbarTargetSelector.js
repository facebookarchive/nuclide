'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Combobox;

function _load_Combobox() {
  return _Combobox = require('../../../nuclide-ui/Combobox');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _nuclideBuckBase;

function _load_nuclideBuckBase() {
  return _nuclideBuckBase = require('../../../nuclide-buck-base');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const NO_ACTIVE_PROJECT_ERROR = 'No active Buck project. Check your Current Working Root.';

class BuckToolbarTargetSelector extends _react.Component {

  constructor(props) {
    super(props);

    this._requestOptions = inputText => {
      const { buckRoot } = this.props.appState;
      if (buckRoot == null) {
        return _rxjsBundlesRxMinJs.Observable.throw(Error(NO_ACTIVE_PROJECT_ERROR));
      }
      return (0, (_observable || _load_observable()).concatLatest)(_rxjsBundlesRxMinJs.Observable.of(inputText.trim() === '' ? [] : [inputText]), _rxjsBundlesRxMinJs.Observable.fromPromise(this._getActiveOwners(buckRoot)), _rxjsBundlesRxMinJs.Observable.fromPromise(this._getAliases(buckRoot))).map(list => Array.from(new Set(list)));
    };

    this._handleBuildTargetChange = value => {
      const trimmed = value.trim();
      if (this.props.appState.buildTarget === trimmed) {
        return;
      }
      this.props.setBuildTarget(trimmed);
    };

    this._projectAliasesCache = new Map();
  }
  // Querying Buck can be slow, so cache aliases by project.
  // Putting the cache here allows the user to refresh it by toggling the UI.


  _filterOptions(options, filterValue) {
    const filterLowerCase = filterValue.toLowerCase();
    return options.map((value, index) => {
      const matchIndex = value.toLowerCase().indexOf(filterLowerCase);
      if (matchIndex < 0) {
        return null;
      }
      return { value, matchIndex, index };
    }).filter(Boolean).sort((a, b) => {
      // Prefer earlier matches, but don't break ties by string length.
      // Instead, make the sort stable by breaking ties with the index.
      return a.matchIndex - b.matchIndex || a.index - b.index;
    }).map(option => option.value);
  }

  _getAliases(buckRoot) {
    let cachedAliases = this._projectAliasesCache.get(buckRoot);
    if (cachedAliases == null) {
      const buckService = (0, (_nuclideBuckBase || _load_nuclideBuckBase()).getBuckService)(buckRoot);
      cachedAliases = buckService == null ? Promise.resolve([]) : buckService.listAliases(buckRoot)
      // Sort in alphabetical order.
      .then(aliases => aliases.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())));
      this._projectAliasesCache.set(buckRoot, cachedAliases);
    }
    return cachedAliases;
  }

  _getActiveOwners(buckRoot) {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return Promise.resolve([]);
    }
    const path = editor.getPath();
    if (path == null || !(_nuclideUri || _load_nuclideUri()).default.contains(buckRoot, path)) {
      return Promise.resolve([]);
    }
    if (path === this._cachedOwnersPath && this._cachedOwners != null) {
      return this._cachedOwners;
    }
    const buckService = (0, (_nuclideBuckBase || _load_nuclideBuckBase()).getBuckService)(buckRoot);
    this._cachedOwners = buckService == null ? Promise.resolve([]) : buckService.getOwners(buckRoot, path).then(
    // Strip off the optional leading "//" to match typical user input.
    owners => owners.map(owner => owner.startsWith('//') ? owner.substring(2) : owner)).catch(err => {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-buck').error(`Error getting Buck owners for ${path}`, err);
      return [];
    });
    this._cachedOwnersPath = path;
    return this._cachedOwners;
  }

  render() {
    return _react.createElement((_Combobox || _load_Combobox()).Combobox
    // Hack to forcibly refresh the combobox when the target changes.
    // TODO(#11581583): Remove this when Combobox is fully controllable.
    , { key: this.props.appState.buildTarget,
      className: 'inline-block nuclide-buck-target-combobox',
      formatRequestOptionsErrorMessage: err => err.message,
      filterOptions: this._filterOptions,
      requestOptions: this._requestOptions,
      maxOptionCount: 20,
      size: 'sm',
      loadingMessage: 'Updating target names...',
      initialTextInput: this.props.appState.buildTarget,
      onSelect: this._handleBuildTargetChange,
      onBlur: this._handleBuildTargetChange,
      placeholderText: 'Buck build target',
      width: null
    });
  }
}
exports.default = BuckToolbarTargetSelector;