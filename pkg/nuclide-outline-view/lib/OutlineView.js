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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom = require('react-for-atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _nuclideLogging = require('../../nuclide-logging');

var logger = (0, _nuclideLogging.getLogger)();

var TOKEN_KIND_TO_CLASS_NAME_MAP = {
  'keyword': 'keyword',
  'class-name': 'entity name class',
  'constructor': 'entity name function',
  'method': 'entity name function',
  'param': 'variable',
  'string': 'string',
  'whitespace': '',
  'plain': ''
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

      (0, _assert2['default'])(this.subscription == null);
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
      (0, _assert2['default'])(this.subscription != null);
      this.subscription.dispose();
      this.subscription = null;
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'div',
        { className: 'pane-item padded nuclide-outline-view' },
        _reactForAtom.React.createElement(OutlineViewComponent, { outline: this.state.outline })
      );
    }
  }, {
    key: 'getTitle',
    value: function getTitle() {
      return 'Outline View';
    }
  }, {
    key: 'getIconName',
    value: function getIconName() {
      return 'list-unordered';
    }
  }]);

  return OutlineView;
})(_reactForAtom.React.Component);

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
          return _reactForAtom.React.createElement(
            'div',
            null,
            renderTrees(outline.editor, outline.outlineTrees)
          );
        default:
          var errorText = 'Encountered unexpected outline kind ' + outline.kind;
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
  }]);

  return OutlineViewComponent;
})(_reactForAtom.React.Component);

function renderTree(editor, outline, index) {
  var onClick = function onClick() {
    var pane = atom.workspace.paneForItem(editor);
    if (pane == null) {
      return;
    }
    pane.activate();
    pane.activateItem(editor);
    (0, _nuclideAtomHelpers.goToLocationInEditor)(editor, outline.startPosition.row, outline.startPosition.column);
  };
  return _reactForAtom.React.createElement(
    'ul',
    { className: 'list-tree', key: index },
    _reactForAtom.React.createElement(
      'li',
      { className: 'list-nested-item' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'list-item nuclide-outline-view-item', onClick: onClick },
        outline.tokenizedText.map(renderTextToken)
      ),
      renderTrees(editor, outline.children)
    )
  );
}

function renderTextToken(token, index) {
  var className = TOKEN_KIND_TO_CLASS_NAME_MAP[token.kind];
  return _reactForAtom.React.createElement(
    'span',
    { className: className, key: index },
    token.value
  );
}

function renderTrees(editor, outlines) {
  return outlines.map(function (outline, index) {
    return renderTree(editor, outline, index);
  });
}
//# sourceMappingURL=data:application/json;base64,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SztHQUFRLENBQUM7Q0FDckU7O0FBRUQsU0FBUyxXQUFXLENBQ2xCLE1BQXVCLEVBQ3ZCLFFBQWlDLEVBQ1o7QUFDckIsU0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUMsT0FBTyxFQUFFLEtBQUs7V0FBSyxVQUFVLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUM7R0FBQSxDQUFDLENBQUM7Q0FDN0UiLCJmaWxlIjoiT3V0bGluZVZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7T2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuaW1wb3J0IHR5cGUge091dGxpbmVGb3JVaSwgT3V0bGluZVRyZWVGb3JVaX0gZnJvbSAnLi9tYWluJztcbmltcG9ydCB0eXBlIHtUZXh0VG9rZW59IGZyb20gJy4uLy4uL251Y2xpZGUtdG9rZW5pemVkLXRleHQnO1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7Z29Ub0xvY2F0aW9uSW5FZGl0b3J9IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbnR5cGUgU3RhdGUgPSB7XG4gIG91dGxpbmU6IE91dGxpbmVGb3JVaTtcbn07XG5cbnR5cGUgUHJvcHMgPSB7XG4gIG91dGxpbmVzOiBPYnNlcnZhYmxlPE91dGxpbmVGb3JVaT47XG59O1xuXG5jb25zdCBUT0tFTl9LSU5EX1RPX0NMQVNTX05BTUVfTUFQID0ge1xuICAna2V5d29yZCc6ICdrZXl3b3JkJyxcbiAgJ2NsYXNzLW5hbWUnOiAnZW50aXR5IG5hbWUgY2xhc3MnLFxuICAnY29uc3RydWN0b3InOiAnZW50aXR5IG5hbWUgZnVuY3Rpb24nLFxuICAnbWV0aG9kJzogJ2VudGl0eSBuYW1lIGZ1bmN0aW9uJyxcbiAgJ3BhcmFtJzogJ3ZhcmlhYmxlJyxcbiAgJ3N0cmluZyc6ICdzdHJpbmcnLFxuICAnd2hpdGVzcGFjZSc6ICcnLFxuICAncGxhaW4nOiAnJyxcbn07XG5cbmV4cG9ydCBjbGFzcyBPdXRsaW5lVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRlOiBTdGF0ZTtcbiAgcHJvcHM6IFByb3BzO1xuXG4gIHN1YnNjcmlwdGlvbjogP0lEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgb3V0bGluZToge1xuICAgICAgICBraW5kOiAnZW1wdHknLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuc3Vic2NyaXB0aW9uID09IG51bGwpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9uID0gdGhpcy5wcm9wcy5vdXRsaW5lcy5zdWJzY3JpYmUob3V0bGluZSA9PiB7XG4gICAgICAvLyBJZiB0aGUgb3V0bGluZSB2aWV3IGhhcyBmb2N1cywgd2UgZG9uJ3Qgd2FudCB0byByZS1yZW5kZXIgYW55dGhpbmcuXG4gICAgICBpZiAodGhpcyAhPT0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtvdXRsaW5lfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQodGhpcy5zdWJzY3JpcHRpb24gIT0gbnVsbCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhbmUtaXRlbSBwYWRkZWQgbnVjbGlkZS1vdXRsaW5lLXZpZXdcIj5cbiAgICAgICAgPE91dGxpbmVWaWV3Q29tcG9uZW50IG91dGxpbmU9e3RoaXMuc3RhdGUub3V0bGluZX0gLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBnZXRUaXRsZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnT3V0bGluZSBWaWV3JztcbiAgfVxuXG4gIGdldEljb25OYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdsaXN0LXVub3JkZXJlZCc7XG4gIH1cbn1cblxudHlwZSBPdXRsaW5lVmlld0NvbXBvbmVudFByb3BzID0ge1xuICBvdXRsaW5lOiBPdXRsaW5lRm9yVWk7XG59XG5cbmNsYXNzIE91dGxpbmVWaWV3Q29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IE91dGxpbmVWaWV3Q29tcG9uZW50UHJvcHM7XG5cbiAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IG91dGxpbmUgPSB0aGlzLnByb3BzLm91dGxpbmU7XG4gICAgc3dpdGNoIChvdXRsaW5lLmtpbmQpIHtcbiAgICAgIGNhc2UgJ2VtcHR5JzpcbiAgICAgIGNhc2UgJ25vdC10ZXh0LWVkaXRvcic6XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgY2FzZSAnbm8tcHJvdmlkZXInOlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgT3V0bGluZSB2aWV3IGRvZXMgbm90IGN1cnJlbnRseSBzdXBwb3J0IHtvdXRsaW5lLmdyYW1tYXJ9LlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICAgIGNhc2UgJ3Byb3ZpZGVyLW5vLW91dGxpbmUnOlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgTm8gb3V0bGluZSBhdmFpbGFibGUuXG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICApO1xuICAgICAgY2FzZSAnb3V0bGluZSc6XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIHtyZW5kZXJUcmVlcyhvdXRsaW5lLmVkaXRvciwgb3V0bGluZS5vdXRsaW5lVHJlZXMpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29uc3QgZXJyb3JUZXh0ID0gYEVuY291bnRlcmVkIHVuZXhwZWN0ZWQgb3V0bGluZSBraW5kICR7b3V0bGluZS5raW5kfWA7XG4gICAgICAgIGxvZ2dlci5lcnJvcihlcnJvclRleHQpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgSW50ZXJuYWwgRXJyb3I6PGJyIC8+XG4gICAgICAgICAgICB7ZXJyb3JUZXh0fVxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICB9XG4gIH1cblxufVxuXG5mdW5jdGlvbiByZW5kZXJUcmVlKFxuICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgb3V0bGluZTogT3V0bGluZVRyZWVGb3JVaSxcbiAgaW5kZXg6IG51bWJlcixcbik6IFJlYWN0RWxlbWVudCB7XG4gIGNvbnN0IG9uQ2xpY2sgPSAoKSA9PiB7XG4gICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKGVkaXRvcik7XG4gICAgaWYgKHBhbmUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBwYW5lLmFjdGl2YXRlKCk7XG4gICAgcGFuZS5hY3RpdmF0ZUl0ZW0oZWRpdG9yKTtcbiAgICBnb1RvTG9jYXRpb25JbkVkaXRvcihlZGl0b3IsIG91dGxpbmUuc3RhcnRQb3NpdGlvbi5yb3csIG91dGxpbmUuc3RhcnRQb3NpdGlvbi5jb2x1bW4pO1xuICB9O1xuICByZXR1cm4gKFxuICAgIDx1bCBjbGFzc05hbWU9XCJsaXN0LXRyZWVcIiBrZXk9e2luZGV4fT5cbiAgICAgIDxsaSBjbGFzc05hbWU9XCJsaXN0LW5lc3RlZC1pdGVtXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGlzdC1pdGVtIG51Y2xpZGUtb3V0bGluZS12aWV3LWl0ZW1cIiBvbkNsaWNrPXtvbkNsaWNrfT5cbiAgICAgICAgICB7b3V0bGluZS50b2tlbml6ZWRUZXh0Lm1hcChyZW5kZXJUZXh0VG9rZW4pfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge3JlbmRlclRyZWVzKGVkaXRvciwgb3V0bGluZS5jaGlsZHJlbil9XG4gICAgICA8L2xpPlxuICAgIDwvdWw+XG4gICk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclRleHRUb2tlbih0b2tlbjogVGV4dFRva2VuLCBpbmRleDogbnVtYmVyKTogUmVhY3RFbGVtZW50IHtcbiAgY29uc3QgY2xhc3NOYW1lID0gVE9LRU5fS0lORF9UT19DTEFTU19OQU1FX01BUFt0b2tlbi5raW5kXTtcbiAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT17Y2xhc3NOYW1lfSBrZXk9e2luZGV4fT57dG9rZW4udmFsdWV9PC9zcGFuPjtcbn1cblxuZnVuY3Rpb24gcmVuZGVyVHJlZXMoXG4gIGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxuICBvdXRsaW5lczogQXJyYXk8T3V0bGluZVRyZWVGb3JVaT5cbik6IEFycmF5PFJlYWN0RWxlbWVudD4ge1xuICByZXR1cm4gb3V0bGluZXMubWFwKChvdXRsaW5lLCBpbmRleCkgPT4gcmVuZGVyVHJlZShlZGl0b3IsIG91dGxpbmUsIGluZGV4KSk7XG59XG4iXX0=