'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OutlineViewSearchComponent = undefined;
exports.updateSearchSet = updateSearchSet;

var _react = _interopRequireWildcard(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('nuclide-commons/debounce'));
}

var _analytics;

function _load_analytics() {
  return _analytics = _interopRequireDefault(require('nuclide-commons-atom/analytics'));
}

var _fuzzaldrinPlus;

function _load_fuzzaldrinPlus() {
  return _fuzzaldrinPlus = _interopRequireDefault(require('fuzzaldrin-plus'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const SCORE_THRESHOLD = 0.1; /**
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

class OutlineViewSearchComponent extends _react.Component {

  constructor(props) {
    super(props);
    // An element is considered visible if it is not in the Map or if it has a
    // Search result that has the visible property set to true. Therefore, all
    // elements are visible when the Map is empty.
    this.SEARCH_PLACEHOLDER = 'Search Outline View';
    this.DEBOUNCE_TIME = 100;

    this._onConfirm = () => {
      const firstElement = this._findFirstResult(this.searchResults, this.props.outlineTrees);
      if (firstElement == null) {
        return;
      }
      const pane = atom.workspace.paneForItem(this.props.editor);
      if (pane == null) {
        return;
      }
      (_analytics || _load_analytics()).default.track('atom-ide-outline-view:search-enter');
      pane.activate();
      pane.activateItem(this.props.editor);
      (0, (_goToLocation || _load_goToLocation()).goToLocationInEditor)(this.props.editor, firstElement.startPosition.row, firstElement.startPosition.column);
      this.setState({ currentQuery: '' });
    };

    this._onDidChange = (0, (_debounce || _load_debounce()).default)(query => {
      this.setState({ currentQuery: query });
    }, this.DEBOUNCE_TIME);

    this._onDidClear = () => {
      this.setState({ currentQuery: '' });
    };

    this.searchResults = new Map();
    this.state = {
      currentQuery: ''
    };
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
      this.setState({ currentQuery: '' });
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
    return _react.createElement(
      'div',
      { className: 'atom-ide-outline-view-search-bar' },
      _react.createElement((_Icon || _load_Icon()).Icon, { icon: 'search', className: 'atom-ide-outline-view-search-icon' }),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        className: 'atom-ide-outline-view-search-pane',
        onConfirm: this._onConfirm,
        onCancel: this._onDidClear,
        onDidChange: this._onDidChange,
        placeholderText: this.state.currentQuery || this.SEARCH_PLACEHOLDER,
        value: this.state.currentQuery,
        size: 'sm'
      }),
      this.state.currentQuery.length > 0 ? _react.createElement((_Icon || _load_Icon()).Icon, {
        icon: 'x',
        className: 'atom-ide-outline-view-search-clear',
        onClick: this._onDidClear
      }) : null
    );
  }
}

exports.OutlineViewSearchComponent = OutlineViewSearchComponent; /* Exported for testing */

function updateSearchSet(query, root, map, prevMap, prevQuery) {
  root.children.forEach(child => updateSearchSet(query, child, map, prevMap, prevQuery));
  // Optimization using results from previous query.
  // flowlint-next-line sketchy-null-string:off
  if (prevQuery) {
    const previousResult = prevMap.get(root);
    if (previousResult && (query === prevQuery || query.startsWith(prevQuery) && !previousResult.visible)) {
      map.set(root, previousResult);
      return;
    }
  }
  const text = root.tokenizedText ? root.tokenizedText.map(e => e.value).join('') : root.plainText || '';
  const matches = query === '' || (_fuzzaldrinPlus || _load_fuzzaldrinPlus()).default.score(text, query) / (_fuzzaldrinPlus || _load_fuzzaldrinPlus()).default.score(query, query) > SCORE_THRESHOLD;
  const visible = matches || Boolean(root.children.find(child => {
    const childResult = map.get(child);
    return !childResult || childResult.visible;
  }));
  let matchingCharacters;
  if (matches) {
    matchingCharacters = (_fuzzaldrinPlus || _load_fuzzaldrinPlus()).default.match(text, query);
  }
  map.set(root, { matches, visible, matchingCharacters });
}