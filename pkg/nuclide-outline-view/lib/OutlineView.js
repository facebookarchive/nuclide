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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

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
          return renderTrees(outline.editor, outline.outlineTrees);
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

  var classes = (0, _classnames2['default'])('list-nested-item', { 'selected': outline.highlighted });
  return _reactForAtom.React.createElement(
    'li',
    { className: classes, key: index },
    _reactForAtom.React.createElement(
      'div',
      { className: 'list-item nuclide-outline-view-item', onClick: onClick },
      outline.tokenizedText.map(renderTextToken)
    ),
    renderTrees(editor, outline.children)
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
  if (outlines.length === 0) {
    return null;
  }
  return(
    // Add `position: relative;` to let `li.selected` style position itself relative to the list
    // tree rather than to its container.
    _reactForAtom.React.createElement(
      'ul',
      { className: 'list-tree', style: { position: 'relative' } },
      outlines.map(function (outline, index) {
        return renderTree(editor, outline, index);
      })
    )
  );
}
//# sourceMappingURL=data:application/json;base64,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LEVBQUUsU0FBUyxBQUFDLEVBQUMsR0FBRyxFQUFFLEtBQUssQUFBQztJQUFFLEtBQUssQ0FBQyxLQUFLO0dBQVEsQ0FBQztDQUNyRTs7QUFFRCxTQUFTLFdBQVcsQ0FDbEIsTUFBdUIsRUFDdkIsUUFBaUMsRUFDbEI7QUFDZixNQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3pCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7QUFDRDs7O0FBR0U7O1FBQUksU0FBUyxFQUFDLFdBQVcsRUFBQyxLQUFLLEVBQUUsRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFDLEFBQUM7TUFDckQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFDLE9BQU8sRUFBRSxLQUFLO2VBQUssVUFBVSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDO09BQUEsQ0FBQztLQUNsRTtJQUNMO0NBQ0giLCJmaWxlIjoiT3V0bGluZVZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7T2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuaW1wb3J0IHR5cGUge091dGxpbmVGb3JVaSwgT3V0bGluZVRyZWVGb3JVaX0gZnJvbSAnLi9tYWluJztcbmltcG9ydCB0eXBlIHtUZXh0VG9rZW59IGZyb20gJy4uLy4uL251Y2xpZGUtdG9rZW5pemVkLXRleHQnO1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuaW1wb3J0IHtnb1RvTG9jYXRpb25JbkVkaXRvcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxudHlwZSBTdGF0ZSA9IHtcbiAgb3V0bGluZTogT3V0bGluZUZvclVpO1xufTtcblxudHlwZSBQcm9wcyA9IHtcbiAgb3V0bGluZXM6IE9ic2VydmFibGU8T3V0bGluZUZvclVpPjtcbn07XG5cbmNvbnN0IFRPS0VOX0tJTkRfVE9fQ0xBU1NfTkFNRV9NQVAgPSB7XG4gICdrZXl3b3JkJzogJ2tleXdvcmQnLFxuICAnY2xhc3MtbmFtZSc6ICdlbnRpdHkgbmFtZSBjbGFzcycsXG4gICdjb25zdHJ1Y3Rvcic6ICdlbnRpdHkgbmFtZSBmdW5jdGlvbicsXG4gICdtZXRob2QnOiAnZW50aXR5IG5hbWUgZnVuY3Rpb24nLFxuICAncGFyYW0nOiAndmFyaWFibGUnLFxuICAnc3RyaW5nJzogJ3N0cmluZycsXG4gICd3aGl0ZXNwYWNlJzogJycsXG4gICdwbGFpbic6ICcnLFxufTtcblxuZXhwb3J0IGNsYXNzIE91dGxpbmVWaWV3IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGU6IFN0YXRlO1xuICBwcm9wczogUHJvcHM7XG5cbiAgc3Vic2NyaXB0aW9uOiA/SURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBvdXRsaW5lOiB7XG4gICAgICAgIGtpbmQ6ICdlbXB0eScsXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQodGhpcy5zdWJzY3JpcHRpb24gPT0gbnVsbCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb24gPSB0aGlzLnByb3BzLm91dGxpbmVzLnN1YnNjcmliZShvdXRsaW5lID0+IHtcbiAgICAgIC8vIElmIHRoZSBvdXRsaW5lIHZpZXcgaGFzIGZvY3VzLCB3ZSBkb24ndCB3YW50IHRvIHJlLXJlbmRlciBhbnl0aGluZy5cbiAgICAgIGlmICh0aGlzICE9PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe291dGxpbmV9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIGludmFyaWFudCh0aGlzLnN1YnNjcmlwdGlvbiAhPSBudWxsKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb24gPSBudWxsO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFuZS1pdGVtIHBhZGRlZCBudWNsaWRlLW91dGxpbmUtdmlld1wiPlxuICAgICAgICA8T3V0bGluZVZpZXdDb21wb25lbnQgb3V0bGluZT17dGhpcy5zdGF0ZS5vdXRsaW5lfSAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIGdldFRpdGxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdPdXRsaW5lIFZpZXcnO1xuICB9XG5cbiAgZ2V0SWNvbk5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ2xpc3QtdW5vcmRlcmVkJztcbiAgfVxufVxuXG50eXBlIE91dGxpbmVWaWV3Q29tcG9uZW50UHJvcHMgPSB7XG4gIG91dGxpbmU6IE91dGxpbmVGb3JVaTtcbn1cblxuY2xhc3MgT3V0bGluZVZpZXdDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogT3V0bGluZVZpZXdDb21wb25lbnRQcm9wcztcblxuICByZW5kZXIoKTogP1JlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qgb3V0bGluZSA9IHRoaXMucHJvcHMub3V0bGluZTtcbiAgICBzd2l0Y2ggKG91dGxpbmUua2luZCkge1xuICAgICAgY2FzZSAnZW1wdHknOlxuICAgICAgY2FzZSAnbm90LXRleHQtZWRpdG9yJzpcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICBjYXNlICduby1wcm92aWRlcic6XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICBPdXRsaW5lIHZpZXcgZG9lcyBub3QgY3VycmVudGx5IHN1cHBvcnQge291dGxpbmUuZ3JhbW1hcn0uXG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICApO1xuICAgICAgY2FzZSAncHJvdmlkZXItbm8tb3V0bGluZSc6XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICBObyBvdXRsaW5lIGF2YWlsYWJsZS5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICk7XG4gICAgICBjYXNlICdvdXRsaW5lJzpcbiAgICAgICAgcmV0dXJuIHJlbmRlclRyZWVzKG91dGxpbmUuZWRpdG9yLCBvdXRsaW5lLm91dGxpbmVUcmVlcyk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb25zdCBlcnJvclRleHQgPSBgRW5jb3VudGVyZWQgdW5leHBlY3RlZCBvdXRsaW5lIGtpbmQgJHtvdXRsaW5lLmtpbmR9YDtcbiAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yVGV4dCk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICBJbnRlcm5hbCBFcnJvcjo8YnIgLz5cbiAgICAgICAgICAgIHtlcnJvclRleHR9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICApO1xuICAgIH1cbiAgfVxuXG59XG5cbmZ1bmN0aW9uIHJlbmRlclRyZWUoXG4gIGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxuICBvdXRsaW5lOiBPdXRsaW5lVHJlZUZvclVpLFxuICBpbmRleDogbnVtYmVyLFxuKTogUmVhY3RFbGVtZW50IHtcbiAgY29uc3Qgb25DbGljayA9ICgpID0+IHtcbiAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oZWRpdG9yKTtcbiAgICBpZiAocGFuZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHBhbmUuYWN0aXZhdGUoKTtcbiAgICBwYW5lLmFjdGl2YXRlSXRlbShlZGl0b3IpO1xuICAgIGdvVG9Mb2NhdGlvbkluRWRpdG9yKGVkaXRvciwgb3V0bGluZS5zdGFydFBvc2l0aW9uLnJvdywgb3V0bGluZS5zdGFydFBvc2l0aW9uLmNvbHVtbik7XG4gIH07XG5cbiAgY29uc3QgY2xhc3NlcyA9IGNsYXNzbmFtZXMoXG4gICAgJ2xpc3QtbmVzdGVkLWl0ZW0nLFxuICAgIHsgJ3NlbGVjdGVkJzogb3V0bGluZS5oaWdobGlnaHRlZCB9LFxuICApO1xuICByZXR1cm4gKFxuICAgIDxsaSBjbGFzc05hbWU9e2NsYXNzZXN9IGtleT17aW5kZXh9PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJsaXN0LWl0ZW0gbnVjbGlkZS1vdXRsaW5lLXZpZXctaXRlbVwiIG9uQ2xpY2s9e29uQ2xpY2t9PlxuICAgICAgICB7b3V0bGluZS50b2tlbml6ZWRUZXh0Lm1hcChyZW5kZXJUZXh0VG9rZW4pfVxuICAgICAgPC9kaXY+XG4gICAgICB7cmVuZGVyVHJlZXMoZWRpdG9yLCBvdXRsaW5lLmNoaWxkcmVuKX1cbiAgICA8L2xpPlxuICApO1xufVxuXG5mdW5jdGlvbiByZW5kZXJUZXh0VG9rZW4odG9rZW46IFRleHRUb2tlbiwgaW5kZXg6IG51bWJlcik6IFJlYWN0RWxlbWVudCB7XG4gIGNvbnN0IGNsYXNzTmFtZSA9IFRPS0VOX0tJTkRfVE9fQ0xBU1NfTkFNRV9NQVBbdG9rZW4ua2luZF07XG4gIHJldHVybiA8c3BhbiBjbGFzc05hbWU9e2NsYXNzTmFtZX0ga2V5PXtpbmRleH0+e3Rva2VuLnZhbHVlfTwvc3Bhbj47XG59XG5cbmZ1bmN0aW9uIHJlbmRlclRyZWVzKFxuICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgb3V0bGluZXM6IEFycmF5PE91dGxpbmVUcmVlRm9yVWk+XG4pOiA/UmVhY3RFbGVtZW50IHtcbiAgaWYgKG91dGxpbmVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiAoXG4gICAgLy8gQWRkIGBwb3NpdGlvbjogcmVsYXRpdmU7YCB0byBsZXQgYGxpLnNlbGVjdGVkYCBzdHlsZSBwb3NpdGlvbiBpdHNlbGYgcmVsYXRpdmUgdG8gdGhlIGxpc3RcbiAgICAvLyB0cmVlIHJhdGhlciB0aGFuIHRvIGl0cyBjb250YWluZXIuXG4gICAgPHVsIGNsYXNzTmFtZT1cImxpc3QtdHJlZVwiIHN0eWxlPXt7cG9zaXRpb246ICdyZWxhdGl2ZSd9fT5cbiAgICAgIHtvdXRsaW5lcy5tYXAoKG91dGxpbmUsIGluZGV4KSA9PiByZW5kZXJUcmVlKGVkaXRvciwgb3V0bGluZSwgaW5kZXgpKX1cbiAgICA8L3VsPlxuICApO1xufVxuIl19