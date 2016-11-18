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
exports.OutlineView = undefined;

var _reactForAtom = require('react-for-atom');

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../commons-atom/go-to-location');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('../../nuclide-ui/LoadingSpinner');
}

var _PanelComponentScroller;

function _load_PanelComponentScroller() {
  return _PanelComponentScroller = require('../../nuclide-ui/PanelComponentScroller');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

const TOKEN_KIND_TO_CLASS_NAME_MAP = {
  'keyword': 'keyword',
  'class-name': 'entity name class',
  'constructor': 'entity name function',
  'method': 'entity name function',
  'param': 'variable',
  'string': 'string',
  'whitespace': '',
  'plain': '',
  'type': 'support type'
};

let OutlineView = exports.OutlineView = class OutlineView extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = {
      outline: {
        kind: 'empty'
      }
    };
  }

  componentDidMount() {
    if (!(this.subscription == null)) {
      throw new Error('Invariant violation: "this.subscription == null"');
    }

    this.subscription = this.props.outlines.subscribe(outline => {
      // If the outline view has focus, we don't want to re-render anything.
      if (this !== atom.workspace.getActivePaneItem()) {
        this.setState({ outline: outline });
      }
    });
  }

  componentWillUnmount() {
    if (!(this.subscription != null)) {
      throw new Error('Invariant violation: "this.subscription != null"');
    }

    this.subscription.unsubscribe();
    this.subscription = null;
  }

  render() {
    return _reactForAtom.React.createElement(
      'div',
      { style: { display: 'flex', flexDirection: 'column', width: '100%' } },
      _reactForAtom.React.createElement(
        (_PanelComponentScroller || _load_PanelComponentScroller()).PanelComponentScroller,
        null,
        _reactForAtom.React.createElement(
          'div',
          { className: 'padded nuclide-outline-view' },
          _reactForAtom.React.createElement(OutlineViewComponent, { outline: this.state.outline })
        )
      )
    );
  }
};
let OutlineViewComponent = class OutlineViewComponent extends _reactForAtom.React.Component {

  render() {
    const outline = this.props.outline;
    switch (outline.kind) {
      case 'empty':
      case 'not-text-editor':
        return null;
      case 'loading':
        return _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-outline-view-loading' },
          _reactForAtom.React.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, {
            className: 'inline-block',
            size: (_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinnerSizes.MEDIUM
          })
        );
      case 'no-provider':
        return _reactForAtom.React.createElement(
          'span',
          null,
          'Outline view does not currently support ',
          outline.grammar,
          '.'
        );
      case 'provider-no-outline':
        return _reactForAtom.React.createElement(
          'span',
          null,
          'No outline available.'
        );
      case 'outline':
        return renderTrees(outline.editor, outline.outlineTrees);
      default:
        const errorText = `Encountered unexpected outline kind ${ outline.kind }`;
        logger.error(errorText);
        return _reactForAtom.React.createElement(
          'span',
          null,
          'Internal Error:',
          _reactForAtom.React.createElement('br', null),
          errorText
        );
    }
  }

};


function renderTree(editor, outline, index) {
  const onClick = () => {
    const pane = atom.workspace.paneForItem(editor);
    if (pane == null) {
      return;
    }
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-outline-view:go-to-location');
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

  const classes = (0, (_classnames || _load_classnames()).default)('list-nested-item', { selected: outline.highlighted });
  return _reactForAtom.React.createElement(
    'li',
    { className: classes, key: index },
    _reactForAtom.React.createElement(
      'div',
      {
        className: 'list-item nuclide-outline-view-item',
        onClick: onClick,
        onDoubleClick: onDoubleClick },
      renderItemText(outline)
    ),
    renderTrees(editor, outline.children)
  );
}

function renderItemText(outline) {
  if (outline.tokenizedText != null) {
    return outline.tokenizedText.map(renderTextToken);
  } else if (outline.plainText != null) {
    return outline.plainText;
  } else {
    return 'Missing text';
  }
}

function renderTextToken(token, index) {
  const className = TOKEN_KIND_TO_CLASS_NAME_MAP[token.kind];
  return _reactForAtom.React.createElement(
    'span',
    { className: className, key: index },
    token.value
  );
}

function renderTrees(editor, outlines) {
  if (outlines.length === 0) {
    return null;
  }
  return (
    // Add `position: relative;` to let `li.selected` style position itself relative to the list
    // tree rather than to its container.
    _reactForAtom.React.createElement(
      'ul',
      { className: 'list-tree', style: { position: 'relative' } },
      outlines.map((outline, index) => renderTree(editor, outline, index))
    )
  );
}