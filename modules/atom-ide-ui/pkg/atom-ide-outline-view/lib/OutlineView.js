'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OutlineView = undefined;

var _HighlightedText;

function _load_HighlightedText() {
  return _HighlightedText = _interopRequireDefault(require('nuclide-commons-ui/HighlightedText'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _react = _interopRequireWildcard(require('react'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _matchIndexesToRanges;

function _load_matchIndexesToRanges() {
  return _matchIndexesToRanges = _interopRequireDefault(require('nuclide-commons/matchIndexesToRanges'));
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

var _EmptyState;

function _load_EmptyState() {
  return _EmptyState = require('nuclide-commons-ui/EmptyState');
}

var _Tree;

function _load_Tree() {
  return _Tree = require('nuclide-commons-ui/Tree');
}

var _OutlineViewSearch;

function _load_OutlineViewSearch() {
  return _OutlineViewSearch = require('./OutlineViewSearch');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
}; /**
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

class OutlineView extends _react.PureComponent {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {
      fontFamily: atom.config.get('editor.fontFamily'),
      fontSize: atom.config.get('editor.fontSize'),
      lineHeight: atom.config.get('editor.lineHeight')
    }, this._setOutlineViewRef = element => {
      this._outlineViewRef = element;
    }, _temp;
  }

  componentDidMount() {
    if (!(this.subscription == null)) {
      throw new Error('Invariant violation: "this.subscription == null"');
    }

    this.subscription = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.config.observe('editor.fontSize', size => {
      this.setState({ fontSize: size });
    }), atom.config.observe('editor.fontFamily', font => {
      this.setState({ fontFamily: font });
    }), atom.config.observe('editor.lineHeight', size => {
      this.setState({ lineHeight: size });
    }));

    // Ensure that focus() gets called during the initial mount.
    if (this.props.visible) {
      this.focus();
    }
  }

  componentWillUnmount() {
    if (!(this.subscription != null)) {
      throw new Error('Invariant violation: "this.subscription != null"');
    }

    this.subscription.unsubscribe();
    this.subscription = null;
  }

  componentDidUpdate(prevProps) {
    if (this.props.visible && !prevProps.visible) {
      this.focus();
    }
  }

  focus() {
    if (this._outlineViewRef != null) {
      this._outlineViewRef.focus();
    }
  }

  render() {
    return _react.createElement(
      'div',
      { className: 'outline-view' },
      _react.createElement('style', {
        dangerouslySetInnerHTML: {
          __html: `
              .outline-view-core {
                line-height: ${this.state.lineHeight};
                font-size: ${this.state.fontSize}px;
                font-family: ${this.state.fontFamily};
              }
          `
        }
      }),
      _react.createElement(OutlineViewComponent, {
        outline: this.props.outline,
        ref: this._setOutlineViewRef
      })
    );
  }
}

exports.OutlineView = OutlineView;


class OutlineViewComponent extends _react.PureComponent {

  constructor(props) {
    super(props);

    this._setOutlineViewCoreRef = element => {
      this._outlineViewCoreRef = element;
    };
  }

  focus() {
    if (this._outlineViewCoreRef != null) {
      this._outlineViewCoreRef.focus();
    }
  }

  render() {
    const { outline } = this.props;

    switch (outline.kind) {
      case 'empty':
      case 'not-text-editor':
        return _react.createElement((_EmptyState || _load_EmptyState()).EmptyState, {
          title: 'No outline available',
          message: 'Open a file to see its outline.'
        });
      case 'loading':
        return _react.createElement(
          'div',
          { className: 'outline-view-loading' },
          _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, {
            className: 'inline-block',
            size: (_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinnerSizes.MEDIUM
          })
        );
      case 'no-provider':
        return outline.grammar === 'Null Grammar' ? _react.createElement((_EmptyState || _load_EmptyState()).EmptyState, {
          title: 'No outline available',
          message: 'Atom doesn\'t recognize this file\'s language. Make sure this file has an extension and has been saved.'
        }) : _react.createElement((_EmptyState || _load_EmptyState()).EmptyState, {
          title: 'No outline available',
          message: _react.createElement(
            'div',
            null,
            outline.grammar,
            ' files do not currently support outlines.',
            ' ',
            _react.createElement(
              'a',
              {
                href: '#',
                onClick: () => (0, (_goToLocation || _load_goToLocation()).goToLocation)(`atom://config/install/package:ide-${outline.grammar}`) },
              'Install an IDE package first.'
            )
          )
        });
      case 'provider-no-outline':
        return _react.createElement((_EmptyState || _load_EmptyState()).EmptyState, {
          title: 'No outline available',
          message: 'This is likely an error with the language package.'
        });
      case 'outline':
        return _react.createElement(OutlineViewCore, {
          outline: outline,
          ref: this._setOutlineViewCoreRef
        });
      default:
        outline;
    }
  }
}

/**
 * Contains both the search field and the scrollable outline tree
 */
class OutlineViewCore extends _react.PureComponent {
  constructor(...args) {
    var _temp2;

    return _temp2 = super(...args), this.state = {
      searchResults: new Map()
    }, this._setSearchRef = element => {
      this._searchRef = element;
    }, _temp2;
  }

  focus() {
    if (this._searchRef != null) {
      this._searchRef.focus();
    }
  }

  render() {
    const { outline } = this.props;

    if (!(outline.kind === 'outline')) {
      throw new Error('Invariant violation: "outline.kind === \'outline\'"');
    }

    return _react.createElement(
      'div',
      { className: 'outline-view-core' },
      _react.createElement((_OutlineViewSearch || _load_OutlineViewSearch()).OutlineViewSearchComponent, {
        outlineTrees: outline.outlineTrees,
        editor: outline.editor,
        updateSearchResults: searchResults => {
          this.setState({ searchResults });
        },
        ref: this._setSearchRef
      }),
      _react.createElement(
        'div',
        { className: 'outline-view-trees-scroller' },
        _react.createElement(
          (_Tree || _load_Tree()).Tree,
          { className: 'outline-view-trees' },
          renderTrees(outline.editor, outline.outlineTrees, this.state.searchResults)
        )
      )
    );
  }
}

class OutlineTree extends _react.PureComponent {
  constructor(...args) {
    var _temp3;

    return _temp3 = super(...args), this._handleSelect = () => {
      const { editor, outline } = this.props;
      // single click moves the cursor, but does not focus the editor
      (_analytics || _load_analytics()).default.track('atom-ide-outline-view:go-to-location');
      const landingPosition = outline.landingPosition != null ? outline.landingPosition : outline.startPosition;
      (0, (_goToLocation || _load_goToLocation()).goToLocationInEditor)(editor, {
        line: landingPosition.row,
        column: landingPosition.column
      });
    }, this._handleConfirm = () => {
      this._focusEditor();
    }, this._handleTripleClick = () => {
      const { editor, outline } = this.props;
      // triple click selects the symbol's region
      const endPosition = outline.endPosition;
      if (endPosition != null) {
        editor.selectToBufferPosition(endPosition);
      }
      this._focusEditor();
    }, this._focusEditor = () => {
      const { editor } = this.props;
      // double and triple clicks focus the editor afterwards
      const pane = atom.workspace.paneForItem(editor);
      if (pane == null) {
        return;
      }

      // Assumes that the click handler has already run, which moves the
      // cursor to the start of the symbol. Let's activate the pane now.
      pane.activate();
      pane.activateItem(editor);
    }, _temp3;
  }

  render() {
    const { editor, outline, searchResults } = this.props;

    const classes = (0, (_classnames || _load_classnames()).default)('outline-view-item', outline.kind ? `kind-${outline.kind}` : null, {
      selected: outline.highlighted
    });

    const childTrees = renderTrees(editor, outline.children, searchResults);
    const itemContent = renderItem(outline, searchResults.get(outline));

    if (childTrees.length === 0) {
      return _react.createElement(
        (_Tree || _load_Tree()).TreeItem,
        {
          className: classes,
          onConfirm: this._handleConfirm,
          onSelect: this._handleSelect,
          onTripleClick: this._handleTripleClick },
        itemContent
      );
    }
    return (
      // Set fontSize for the li to make the highlighted region of selected
      // lines (set equal to 2em) look reasonable relative to size of the font.
      _react.createElement(
        (_Tree || _load_Tree()).NestedTreeItem,
        {
          className: classes,
          onConfirm: this._handleConfirm,
          onSelect: this._handleSelect,
          onTripleClick: this._handleTripleClick,
          title: itemContent },
        childTrees
      )
    );
  }
}

function renderItem(outline, searchResult) {
  const r = [];
  const icon =
  // flowlint-next-line sketchy-null-string:off
  outline.icon || outline.kind && OUTLINE_KIND_TO_ICON[outline.kind];

  if (icon != null) {
    r.push(_react.createElement('span', { key: `icon-${icon}`, className: `icon icon-${icon}` }));
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
    const textWithMatching = searchResult && searchResult.matchingCharacters ? _react.createElement((_HighlightedText || _load_HighlightedText()).default, {
      highlightedRanges: (0, (_matchIndexesToRanges || _load_matchIndexesToRanges()).default)(searchResult.matchingCharacters),
      text: outline.plainText || ''
    }) : outline.plainText;
    r.push(textWithMatching);
  } else {
    r.push('Missing text');
  }

  return _react.createElement(
    'span',
    null,
    r
  );
}

function renderTextToken(token, index, searchResult, offset) {
  const className = TOKEN_KIND_TO_CLASS_NAME_MAP[token.kind];
  return _react.createElement(
    'span',
    { className: className, key: index },
    searchResult && searchResult.matchingCharacters ? _react.createElement((_HighlightedText || _load_HighlightedText()).default, {
      highlightedRanges: (0, (_matchIndexesToRanges || _load_matchIndexesToRanges()).default)(searchResult.matchingCharacters.map(el => el - offset).filter(el => el >= 0 && el < token.value.length)),
      text: token.value
    }) : token.value
  );
}

function renderTrees(editor, outlines, searchResults) {
  return outlines.map((outline, index) => {
    const result = searchResults.get(outline);
    return !result || result.visible ? _react.createElement(OutlineTree, {
      editor: editor,
      outline: outline,
      key: index,
      searchResults: searchResults
    }) : null;
  });
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