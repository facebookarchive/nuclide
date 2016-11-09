'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _reactForAtom = require('react-for-atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Combobox;

function _load_Combobox() {
  return _Combobox = require('../../../nuclide-ui/Combobox');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../commons-node/nuclideUri'));
}

var _observable;

function _load_observable() {
  return _observable = require('../../../commons-node/observable');
}

var _nuclideBuckBase;

function _load_nuclideBuckBase() {
  return _nuclideBuckBase = require('../../../nuclide-buck-base');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NO_ACTIVE_PROJECT_ERROR = 'No active Buck project. Check your Current Working Root.';let BuckToolbarTargetSelector = class BuckToolbarTargetSelector extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._requestOptions = this._requestOptions.bind(this);
    this._handleBuildTargetChange = this._handleBuildTargetChange.bind(this);
    this._projectAliasesCache = new Map();
  }

  // Querying Buck can be slow, so cache aliases by project.
  // Putting the cache here allows the user to refresh it by toggling the UI.


  _requestOptions(inputText) {
    const buckRoot = this.props.store.getCurrentBuckRoot();
    if (buckRoot == null) {
      return _rxjsBundlesRxMinJs.Observable.throw(Error(NO_ACTIVE_PROJECT_ERROR));
    }
    return (0, (_observable || _load_observable()).concatLatest)(_rxjsBundlesRxMinJs.Observable.of(inputText.trim() === '' ? [] : [inputText]), _rxjsBundlesRxMinJs.Observable.fromPromise(this._getActiveOwners(buckRoot)), _rxjsBundlesRxMinJs.Observable.fromPromise(this._getAliases(buckRoot))).map(list => Array.from(new Set(list)));
  }

  _getAliases(buckRoot) {
    let cachedAliases = this._projectAliasesCache.get(buckRoot);
    if (cachedAliases == null) {
      const buckService = (0, (_nuclideBuckBase || _load_nuclideBuckBase()).getBuckService)(buckRoot);
      cachedAliases = buckService == null ? Promise.resolve([]) : buckService.listAliases(buckRoot);
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
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`Error getting Buck owners for ${ path }`, err);
      return [];
    });
    this._cachedOwnersPath = path;
    return this._cachedOwners;
  }

  _handleBuildTargetChange(value) {
    const trimmed = value.trim();
    if (this.props.store.getBuildTarget() === trimmed) {
      return;
    }
    this.props.actions.updateBuildTarget(trimmed);
  }

  render() {
    return _reactForAtom.React.createElement((_Combobox || _load_Combobox()).Combobox, {
      className: 'inline-block nuclide-buck-target-combobox',
      formatRequestOptionsErrorMessage: err => err.message,
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

};
exports.default = BuckToolbarTargetSelector;
module.exports = exports['default'];