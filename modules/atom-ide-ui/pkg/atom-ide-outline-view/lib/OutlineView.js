'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OutlineView = undefined;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _react = _interopRequireDefault(require('react'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _analytics;

function _load_analytics() {
  return _analytics = _interopRequireDefault(require('nuclide-commons-atom/analytics'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('nuclide-commons-ui/LoadingSpinner');
}

var _PanelComponentScroller;

function _load_PanelComponentScroller() {
  return _PanelComponentScroller = require('nuclide-commons-ui/PanelComponentScroller');
}

var _EmptyState;

function _load_EmptyState() {
  return _EmptyState = require('nuclide-commons-ui/EmptyState');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _OutlineViewSearch;

function _load_OutlineViewSearch() {
  return _OutlineViewSearch = require('./OutlineViewSearch');
}

var _groupMatchIndexes;

function _load_groupMatchIndexes() {
  return _groupMatchIndexes = _interopRequireDefault(require('nuclide-commons/groupMatchIndexes'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

const SEARCH_ENABLED_DEFAULT = true;

const TOKEN_KIND_TO_CLASS_NAME_MAP = {
  keyword: 'syntax--keyword',
  'class-name': 'syntax--entity syntax--name syntax--class',
  constructor: 'syntax--entity syntax--name syntax--function',
  method: 'syntax--entity syntax--name syntax--function',
  param: 'syntax--variable',
  string: 'syntax--string',
  whitespace: '',
  plain: '',
  type: 'syntax--support syntax--type'
};

class OutlineView extends _react.default.Component {

  constructor(props) {
    super(props);
    this.state = {
      outline: {
        kind: 'empty'
      },
      searchEnabled: (_featureConfig || _load_featureConfig()).default.getWithDefaults('atom-ide-outline-view.searchEnabled', SEARCH_ENABLED_DEFAULT)
    };
  }

  componentDidMount() {
    if (!(this.subscription == null)) {
      throw new Error('Invariant violation: "this.subscription == null"');
    }

    this.subscription = new (_UniversalDisposable || _load_UniversalDisposable()).default(this.props.outlines.subscribe(outline => {
      this.setState({ outline });
    }), (_featureConfig || _load_featureConfig()).default.observeAsStream('atom-ide-outline-view.searchEnabled').subscribe(searchEnabled => {
      if (typeof searchEnabled === 'boolean') {
        this.setState({ searchEnabled });
      } else {
        this.setState({ searchEnabled: SEARCH_ENABLED_DEFAULT });
      }
    }));
  }

  componentWillUnmount() {
    if (!(this.subscription != null)) {
      throw new Error('Invariant violation: "this.subscription != null"');
    }

    this.subscription.unsubscribe();
    this.subscription = null;
  }

  render() {
    return _react.default.createElement(
      'div',
      { style: { display: 'flex', flexDirection: 'column', width: '100%' } },
      _react.default.createElement(
        (_PanelComponentScroller || _load_PanelComponentScroller()).PanelComponentScroller,
        null,
        _react.default.createElement(
          'div',
          { className: 'nuclide-outline-view' },
          _react.default.createElement(OutlineViewComponent, {
            outline: this.state.outline,
            searchEnabled: this.state.searchEnabled
          })
        )
      )
    );
  }
}

exports.OutlineView = OutlineView;


class OutlineViewComponent extends _react.default.Component {

  constructor(props) {
    super(props);
    this.state = { searchResults: new Map() };
  }

  render() {
    const outline = this.props.outline;
    switch (outline.kind) {
      case 'empty':
      case 'not-text-editor':
        return _react.default.createElement((_EmptyState || _load_EmptyState()).EmptyState, {
          title: 'No outline available',
          message: 'You need to open a file to use outline view.'
        });
      case 'loading':
        return _react.default.createElement(
          'div',
          { className: 'nuclide-outline-view-loading' },
          _react.default.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, {
            className: 'inline-block',
            size: (_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinnerSizes.MEDIUM
          })
        );
      case 'no-provider':
        return outline.grammar === 'Null Grammar' ? _react.default.createElement((_EmptyState || _load_EmptyState()).EmptyState, {
          title: 'No outline available',
          message: 'The current file doesn\'t have an associated grammar. You may want to save it.'
        }) : _react.default.createElement((_EmptyState || _load_EmptyState()).EmptyState, {
          title: 'No outline available',
          message: 'Outline view does not currently support ' + outline.grammar + '.'
        });
      case 'provider-no-outline':
        return _react.default.createElement((_EmptyState || _load_EmptyState()).EmptyState, {
          title: 'No outline available',
          message: 'There are no outline providers registered.'
        });
      case 'outline':
        return _react.default.createElement(
          'div',
          null,
          this.props.searchEnabled ? _react.default.createElement((_OutlineViewSearch || _load_OutlineViewSearch()).OutlineViewSearchComponent, {
            outlineTrees: outline.outlineTrees,
            editor: outline.editor,
            updateSearchResults: searchResults => {
              this.setState({ searchResults });
            }
          }) : null,
          renderTrees(outline.editor, outline.outlineTrees, this.state.searchResults)
        );
      default:
        outline;
    }
  }
}

class OutlineTree extends _react.default.PureComponent {

  render() {
    const { editor, outline, searchResults } = this.props;

    const onClick = () => {
      const pane = atom.workspace.paneForItem(editor);
      if (pane == null) {
        return;
      }
      (_analytics || _load_analytics()).default.track('atom-ide-outline-view:go-to-location');
      pane.activate();
      pane.activateItem(editor);
      (0, (_goToLocation || _load_goToLocation()).goToLocationInEditor)(editor, outline.startPosition.row, outline.startPosition.column);
    };

    const onDoubleClick = () => {
      // Assumes that the click handler has already run, activating the text editor and moving the
      // cursor to the start of the symbol.
      const endPosition = outline.endPosition;
      if (endPosition != null) {
        editor.selectToBufferPosition(endPosition);
      }
    };

    const classNames = ['list-nested-item'];
    if (outline.kind) {
      classNames.push(`kind-${outline.kind}`);
    }
    const classes = (0, (_classnames || _load_classnames()).default)(classNames, {
      selected: outline.highlighted
    });
    return _react.default.createElement(
      'li',
      { className: classes },
      _react.default.createElement(
        'div',
        {
          className: 'list-item nuclide-outline-view-item',
          onClick: onClick,
          onDoubleClick: onDoubleClick },
        renderItem(outline, searchResults.get(outline))
      ),
      renderTrees(editor, outline.children, searchResults)
    );
  }
}

function renderItem(outline, searchResult) {
  const r = [];
  const icon = outline.icon || outline.kind && OUTLINE_KIND_TO_ICON[outline.kind];

  if (icon != null) {
    r.push(_react.default.createElement('span', { key: `icon-${icon}`, className: `icon icon-${icon}` }));
    // Note: icons here are fixed-width, so the text lines up.
  }

  if (outline.tokenizedText != null) {
    let offset = 0;
    r.push(...outline.tokenizedText.map((token, i) => {
      const toReturn = renderTextToken(token, i, searchResult, offset);
      offset += token.value.length;
      return toReturn;
    }));
  } else if (outline.plainText != null) {
    const textWithMatching = searchResult && searchResult.matchingCharacters ? (0, (_groupMatchIndexes || _load_groupMatchIndexes()).default)(outline.plainText, searchResult.matchingCharacters, renderMatchedSubsequence, renderUnmatchedSubsequence) : outline.plainText;
    r.push(...textWithMatching);
  } else {
    r.push('Missing text');
  }
  return r;
}

function renderTextToken(token, index, searchResult, offset) {
  const className = TOKEN_KIND_TO_CLASS_NAME_MAP[token.kind];
  return _react.default.createElement(
    'span',
    { className: className, key: index },
    searchResult && searchResult.matchingCharacters ? (0, (_groupMatchIndexes || _load_groupMatchIndexes()).default)(token.value, searchResult.matchingCharacters.map(el => el - offset).filter(el => el >= 0 && el < token.value.length), renderMatchedSubsequence, renderUnmatchedSubsequence) : token.value
  );
}

function renderSubsequence(seq, props) {
  return _react.default.createElement(
    'span',
    props,
    seq
  );
}

function renderUnmatchedSubsequence(seq, key) {
  return renderSubsequence(seq, { key });
}

function renderMatchedSubsequence(seq, key) {
  return renderSubsequence(seq, {
    key,
    className: 'atom-ide-outline-view-match'
  });
}

function renderTrees(editor, outlines, searchResults) {
  if (outlines.length === 0) {
    return null;
  }
  return (
    // Add `position: relative;` to let `li.selected` style position itself relative to the list
    // tree rather than to its container.
    _react.default.createElement(
      'ul',
      { className: 'list-tree', style: { position: 'relative' } },
      outlines.map((outline, index) => {
        const result = searchResults.get(outline);
        return !result || result.visible ? _react.default.createElement(OutlineTree, {
          editor: editor,
          outline: outline,
          key: index,
          searchResults: searchResults
        }) : null;
      })
    )
  );
}

const OUTLINE_KIND_TO_ICON = {
  array: 'type-array',
  boolean: 'type-boolean',
  class: 'type-class',
  constant: 'type-constant',
  constructor: 'type-constructor',
  enum: 'type-enum',
  field: 'type-field',
  file: 'type-file',
  function: 'type-function',
  interface: 'type-interface',
  method: 'type-method',
  module: 'type-module',
  namespace: 'type-namespace',
  number: 'type-number',
  package: 'type-package',
  property: 'type-property',
  string: 'type-string',
  variable: 'type-variable'
};