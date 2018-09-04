"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _Combobox() {
  const data = require("../../../nuclide-ui/Combobox");

  _Combobox = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _nuclideBuckBase() {
  const data = require("../../../nuclide-buck-base");

  _nuclideBuckBase = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const NO_ACTIVE_PROJECT_ERROR = 'No active Buck project. Check your Current Working Root.';

class BuckToolbarTargetSelector extends React.Component {
  // Querying Buck can be slow, so cache aliases by project.
  // Putting the cache here allows the user to refresh it by toggling the UI.
  constructor(props) {
    super(props);

    this._requestOptions = inputText => {
      const {
        buckRoot
      } = this.props.appState;

      if (buckRoot == null) {
        return _RxMin.Observable.throw(Error(NO_ACTIVE_PROJECT_ERROR));
      }

      return (0, _observable().concatLatest)(_RxMin.Observable.of(inputText.trim() === '' ? [] : [inputText]), _RxMin.Observable.fromPromise(this._getActiveOwners(buckRoot)), _RxMin.Observable.fromPromise(this._getAliases(buckRoot))).map(list => Array.from(new Set(list)));
    };

    this._handleBuildTargetChange = value => {
      this._scrollToEnd();

      const trimmed = value.trim();

      if (this.props.appState.buildTarget === trimmed) {
        return;
      }

      this.props.setBuildTarget(trimmed);
    };

    this._scrollToEnd = () => {
      if (this._comboBox != null) {
        this._comboBox.scrollToEnd();
      }
    };

    this._projectAliasesCache = new Map();
  }

  _filterOptions(options, filterValue) {
    const filterLowerCase = filterValue.toLowerCase();
    return options.map((value, index) => {
      const matchIndex = value.toLowerCase().indexOf(filterLowerCase);

      if (matchIndex < 0) {
        return null;
      }

      return {
        value,
        matchIndex,
        index
      };
    }).filter(Boolean).sort((a, b) => {
      // Prefer earlier matches, but don't break ties by string length.
      // Instead, make the sort stable by breaking ties with the index.
      return a.matchIndex - b.matchIndex || a.index - b.index;
    }).map(option => option.value);
  }

  _getAliases(buckRoot) {
    let cachedAliases = this._projectAliasesCache.get(buckRoot);

    if (cachedAliases == null) {
      const buckService = (0, _nuclideBuckBase().getBuckService)(buckRoot);
      cachedAliases = buckService == null ? Promise.resolve([]) : buckService.listAliases(buckRoot).catch(e => {
        atom.notifications.addError(`Error invoking Buck to list aliases:\n${e.toString()}`);
        return [];
      }) // Sort in alphabetical order.
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

    if (path == null || !_nuclideUri().default.contains(buckRoot, path)) {
      return Promise.resolve([]);
    }

    if (path === this._cachedOwnersPath && this._cachedOwners != null) {
      return this._cachedOwners;
    }

    const buckService = (0, _nuclideBuckBase().getBuckService)(buckRoot);
    this._cachedOwners = buckService == null ? Promise.resolve([]) : buckService.getOwners(buckRoot, path, []).then( // Strip off the optional leading "//" to match typical user input.
    owners => owners.map(owner => owner.startsWith('//') ? owner.substring(2) : owner)).catch(err => {
      (0, _log4js().getLogger)('nuclide-buck').error(`Error getting Buck owners for ${path}`, err);
      return [];
    });
    this._cachedOwnersPath = path;
    return this._cachedOwners;
  }

  render() {
    return React.createElement(_Combobox().Combobox // Hack to forcibly refresh the combobox when the target changes.
    // TODO(#11581583): Remove this when Combobox is fully controllable.
    , {
      key: this.props.appState.buildTarget,
      className: "inline-block nuclide-buck-target-combobox",
      formatRequestOptionsErrorMessage: err => err.message,
      filterOptions: this._filterOptions,
      requestOptions: this._requestOptions,
      maxOptionCount: 20,
      size: "sm",
      loadingMessage: "Updating target names...",
      initialTextInput: this.props.appState.buildTarget,
      onSelect: this._handleBuildTargetChange,
      onBlur: this._handleBuildTargetChange,
      placeholderText: "Buck build target",
      width: null,
      ref: box => this._comboBox = box
    });
  }

}

exports.default = BuckToolbarTargetSelector;