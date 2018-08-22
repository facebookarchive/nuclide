"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateSearchSet = updateSearchSet;
exports.OutlineViewSearchComponent = void 0;

var React = _interopRequireWildcard(require("react"));

function _AtomInput() {
  const data = require("../../../../nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _Icon() {
  const data = require("../../../../nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../../nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _debounce() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/debounce"));

  _debounce = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/analytics"));

  _analytics = function () {
    return data;
  };

  return data;
}

function _fuzzaldrinPlus() {
  const data = _interopRequireDefault(require("fuzzaldrin-plus"));

  _fuzzaldrinPlus = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const SCORE_THRESHOLD = 0.1;

class OutlineViewSearchComponent extends React.Component {
  constructor(props) {
    super(props); // An element is considered visible if it is not in the Map or if it has a
    // Search result that has the visible property set to true. Therefore, all
    // elements are visible when the Map is empty.

    this.SEARCH_PLACEHOLDER = 'Filter';
    this.DEBOUNCE_TIME = 100;

    this._handleInputRef = element => {
      this._inputRef = element;
    };

    this._onConfirm = () => {
      const firstElement = this._findFirstResult(this.searchResults, this.props.outlineTrees);

      if (firstElement == null) {
        return;
      }

      const pane = atom.workspace.paneForItem(this.props.editor);

      if (pane == null) {
        return;
      }

      _analytics().default.track('outline-view:search-enter');

      pane.activate();
      pane.activateItem(this.props.editor);
      const landingPosition = firstElement.landingPosition != null ? firstElement.landingPosition : firstElement.startPosition;
      (0, _goToLocation().goToLocationInEditor)(this.props.editor, {
        line: landingPosition.row,
        column: landingPosition.column
      });
      this.setState({
        currentQuery: ''
      });
    };

    this._onDidChange = (0, _debounce().default)(query => {
      _analytics().default.track('outline-view:change-query');

      this.setState({
        currentQuery: query
      });
    }, this.DEBOUNCE_TIME);

    this._onDidClear = () => {
      this.setState({
        currentQuery: ''
      });
    };

    this.searchResults = new Map();
    this.state = {
      currentQuery: ''
    };
  }

  focus() {
    if (this._inputRef != null) {
      this._inputRef.focus();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentQuery === '' && this.state.currentQuery === '') {
      return;
    }

    if (this.state.currentQuery === '') {
      this.props.updateSearchResults(new Map());
      return;
    }

    if (prevProps.editor !== this.props.editor) {
      this.setState({
        currentQuery: ''
      });
      return;
    }

    if (prevState.currentQuery !== this.state.currentQuery || prevProps.outlineTrees !== this.props.outlineTrees) {
      const newMap = new Map();
      this.props.outlineTrees.forEach(root => updateSearchSet(this.state.currentQuery, root, newMap, this.searchResults, prevState.currentQuery));
      this.searchResults = newMap;
      this.props.updateSearchResults(this.searchResults);
    }
  }

  _findFirstResult(searchResults, tree) {
    for (let i = 0; i < tree.length; i++) {
      const result = searchResults.get(tree[i]);

      if (result && result.matches) {
        return tree[i];
      }

      const child = this._findFirstResult(searchResults, tree[i].children);

      if (child) {
        return child;
      }
    }
  }

  render() {
    return React.createElement("div", {
      className: "outline-view-search-bar"
    }, React.createElement(_AtomInput().AtomInput, {
      className: "outline-view-search-pane",
      onConfirm: this._onConfirm,
      onCancel: this._onDidClear,
      onDidChange: this._onDidChange,
      placeholderText: this.state.currentQuery || this.SEARCH_PLACEHOLDER,
      ref: this._handleInputRef,
      value: this.state.currentQuery,
      size: "sm"
    }), this.state.currentQuery.length > 0 ? React.createElement(_Icon().Icon, {
      icon: "x",
      className: "outline-view-search-clear",
      onClick: this._onDidClear
    }) : null);
  }

}
/* Exported for testing */


exports.OutlineViewSearchComponent = OutlineViewSearchComponent;

function updateSearchSet(query, root, map, prevMap, prevQuery) {
  root.children.forEach(child => updateSearchSet(query, child, map, prevMap, prevQuery)); // Optimization using results from previous query.
  // flowlint-next-line sketchy-null-string:off

  if (prevQuery) {
    const previousResult = prevMap.get(root);

    if (previousResult && (query === prevQuery || query.startsWith(prevQuery) && !previousResult.visible)) {
      map.set(root, previousResult);
      return;
    }
  }

  const text = root.tokenizedText ? root.tokenizedText.map(e => e.value).join('') : root.plainText || '';
  const matches = query === '' || _fuzzaldrinPlus().default.score(text, query) / _fuzzaldrinPlus().default.score(query, query) > SCORE_THRESHOLD;
  const visible = matches || Boolean(root.children.find(child => {
    const childResult = map.get(child);
    return !childResult || childResult.visible;
  }));
  let matchingCharacters;

  if (matches) {
    matchingCharacters = _fuzzaldrinPlus().default.match(text, query);
  }

  map.set(root, {
    matches,
    visible,
    matchingCharacters
  });
}