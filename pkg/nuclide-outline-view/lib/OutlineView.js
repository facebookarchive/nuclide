Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsAtomGoToLocation2;

function _commonsAtomGoToLocation() {
  return _commonsAtomGoToLocation2 = require('../../commons-atom/go-to-location');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _nuclideUiLibLoadingSpinner2;

function _nuclideUiLibLoadingSpinner() {
  return _nuclideUiLibLoadingSpinner2 = require('../../nuclide-ui/lib/LoadingSpinner');
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

var TOKEN_KIND_TO_CLASS_NAME_MAP = {
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

var OutlineView = (function (_React$Component) {
  _inherits(OutlineView, _React$Component);

  function OutlineView(props) {
    _classCallCheck(this, OutlineView);

    _get(Object.getPrototypeOf(OutlineView.prototype), 'constructor', this).call(this, props);
    this.state = {
      outline: {
        kind: 'empty'
      }
    };
  }

  _createClass(OutlineView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      (0, (_assert2 || _assert()).default)(this.subscription == null);
      this.subscription = this.props.outlines.subscribe(function (outline) {
        // If the outline view has focus, we don't want to re-render anything.
        if (_this !== atom.workspace.getActivePaneItem()) {
          _this.setState({ outline: outline });
        }
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      (0, (_assert2 || _assert()).default)(this.subscription != null);
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'pane-item padded nuclide-outline-view' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(OutlineViewComponent, { outline: this.state.outline })
      );
    }
  }]);

  return OutlineView;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.OutlineView = OutlineView;

var OutlineViewComponent = (function (_React$Component2) {
  _inherits(OutlineViewComponent, _React$Component2);

  function OutlineViewComponent() {
    _classCallCheck(this, OutlineViewComponent);

    _get(Object.getPrototypeOf(OutlineViewComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(OutlineViewComponent, [{
    key: 'render',
    value: function render() {
      var outline = this.props.outline;
      switch (outline.kind) {
        case 'empty':
        case 'not-text-editor':
          return null;
        case 'loading':
          return (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-outline-view-loading' },
            (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibLoadingSpinner2 || _nuclideUiLibLoadingSpinner()).LoadingSpinner, {
              className: 'inline-block',
              size: (_nuclideUiLibLoadingSpinner2 || _nuclideUiLibLoadingSpinner()).LoadingSpinnerSizes.MEDIUM
            })
          );
        case 'no-provider':
          return (_reactForAtom2 || _reactForAtom()).React.createElement(
            'span',
            null,
            'Outline view does not currently support ',
            outline.grammar,
            '.'
          );
        case 'provider-no-outline':
          return (_reactForAtom2 || _reactForAtom()).React.createElement(
            'span',
            null,
            'No outline available.'
          );
        case 'outline':
          return renderTrees(outline.editor, outline.outlineTrees);
        default:
          var errorText = 'Encountered unexpected outline kind ' + outline.kind;
          logger.error(errorText);
          return (_reactForAtom2 || _reactForAtom()).React.createElement(
            'span',
            null,
            'Internal Error:',
            (_reactForAtom2 || _reactForAtom()).React.createElement('br', null),
            errorText
          );
      }
    }
  }]);

  return OutlineViewComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

function renderTree(editor, outline, index) {
  var onClick = function onClick() {
    var pane = atom.workspace.paneForItem(editor);
    if (pane == null) {
      return;
    }
    (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-outline-view:go-to-location');
    pane.activate();
    pane.activateItem(editor);
    (0, (_commonsAtomGoToLocation2 || _commonsAtomGoToLocation()).goToLocationInEditor)(editor, outline.startPosition.row, outline.startPosition.column);
  };

  var onDoubleClick = function onDoubleClick() {
    // Assumes that the click handler has already run, activating the text editor and moving the
    // cursor to the start of the symbol.
    var endPosition = outline.endPosition;
    if (endPosition != null) {
      editor.selectToBufferPosition(endPosition);
    }
  };

  var classes = (0, (_classnames2 || _classnames()).default)('list-nested-item', { selected: outline.highlighted });
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'li',
    { className: classes, key: index },
    (_reactForAtom2 || _reactForAtom()).React.createElement(
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
  var className = TOKEN_KIND_TO_CLASS_NAME_MAP[token.kind];
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'span',
    { className: className, key: index },
    token.value
  );
}

function renderTrees(editor, outlines) {
  if (outlines.length === 0) {
    return null;
  }
  return(
    // Add `position: relative;` to let `li.selected` style position itself relative to the list
    // tree rather than to its container.
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      'ul',
      { className: 'list-tree', style: { position: 'relative' } },
      outlines.map(function (outline, index) {
        return renderTree(editor, outline, index);
      })
    )
  );
}