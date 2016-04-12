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
//# sourceMappingURL=data:application/json;base64,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QUFJLE9BQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxFQUFFO0FBQ3BDLFdBQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQztHQUMxQixNQUFNO0FBQ0wsV0FBTyxjQUFjLENBQUM7R0FDdkI7Q0FDRjs7QUFFRCxTQUFTLGVBQWUsQ0FBQyxLQUFnQixFQUFFLEtBQWEsRUFBZ0I7QUFDdEUsTUFBTSxTQUFTLEdBQUcsNEJBQTRCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNELFNBQU87O01BQU0sU0FBUyxFQUFFLFNBQVMsQUFBQyxFQUFDLEdBQUcsRUFBRSxLQUFLLEFBQUM7SUFBRSxLQUFLLENBQUMsS0FBSztHQUFRLENBQUM7Q0FDckU7O0FBRUQsU0FBUyxXQUFXLENBQ2xCLE1BQXVCLEVBQ3ZCLFFBQWlDLEVBQ2xCO0FBQ2YsTUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUN6QixXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0Q7OztBQUdFOztRQUFJLFNBQVMsRUFBQyxXQUFXLEVBQUMsS0FBSyxFQUFFLEVBQUMsUUFBUSxFQUFFLFVBQVUsRUFBQyxBQUFDO01BQ3JELFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQyxPQUFPLEVBQUUsS0FBSztlQUFLLFVBQVUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQztPQUFBLENBQUM7S0FDbEU7SUFDTDtDQUNIIiwiZmlsZSI6Ik91dGxpbmVWaWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge09ic2VydmFibGV9IGZyb20gJ3J4JztcbmltcG9ydCB0eXBlIHtPdXRsaW5lRm9yVWksIE91dGxpbmVUcmVlRm9yVWl9IGZyb20gJy4vbWFpbic7XG5pbXBvcnQgdHlwZSB7VGV4dFRva2VufSBmcm9tICcuLi8uLi9udWNsaWRlLXRva2VuaXplZC10ZXh0JztcblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCB7Z29Ub0xvY2F0aW9uSW5FZGl0b3J9IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbnR5cGUgU3RhdGUgPSB7XG4gIG91dGxpbmU6IE91dGxpbmVGb3JVaTtcbn07XG5cbnR5cGUgUHJvcHMgPSB7XG4gIG91dGxpbmVzOiBPYnNlcnZhYmxlPE91dGxpbmVGb3JVaT47XG59O1xuXG5jb25zdCBUT0tFTl9LSU5EX1RPX0NMQVNTX05BTUVfTUFQID0ge1xuICAna2V5d29yZCc6ICdrZXl3b3JkJyxcbiAgJ2NsYXNzLW5hbWUnOiAnZW50aXR5IG5hbWUgY2xhc3MnLFxuICAnY29uc3RydWN0b3InOiAnZW50aXR5IG5hbWUgZnVuY3Rpb24nLFxuICAnbWV0aG9kJzogJ2VudGl0eSBuYW1lIGZ1bmN0aW9uJyxcbiAgJ3BhcmFtJzogJ3ZhcmlhYmxlJyxcbiAgJ3N0cmluZyc6ICdzdHJpbmcnLFxuICAnd2hpdGVzcGFjZSc6ICcnLFxuICAncGxhaW4nOiAnJyxcbn07XG5cbmV4cG9ydCBjbGFzcyBPdXRsaW5lVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRlOiBTdGF0ZTtcbiAgcHJvcHM6IFByb3BzO1xuXG4gIHN1YnNjcmlwdGlvbjogP0lEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgb3V0bGluZToge1xuICAgICAgICBraW5kOiAnZW1wdHknLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuc3Vic2NyaXB0aW9uID09IG51bGwpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9uID0gdGhpcy5wcm9wcy5vdXRsaW5lcy5zdWJzY3JpYmUob3V0bGluZSA9PiB7XG4gICAgICAvLyBJZiB0aGUgb3V0bGluZSB2aWV3IGhhcyBmb2N1cywgd2UgZG9uJ3Qgd2FudCB0byByZS1yZW5kZXIgYW55dGhpbmcuXG4gICAgICBpZiAodGhpcyAhPT0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtvdXRsaW5lfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQodGhpcy5zdWJzY3JpcHRpb24gIT0gbnVsbCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhbmUtaXRlbSBwYWRkZWQgbnVjbGlkZS1vdXRsaW5lLXZpZXdcIj5cbiAgICAgICAgPE91dGxpbmVWaWV3Q29tcG9uZW50IG91dGxpbmU9e3RoaXMuc3RhdGUub3V0bGluZX0gLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBnZXRUaXRsZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnT3V0bGluZSBWaWV3JztcbiAgfVxuXG4gIGdldEljb25OYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdsaXN0LXVub3JkZXJlZCc7XG4gIH1cbn1cblxudHlwZSBPdXRsaW5lVmlld0NvbXBvbmVudFByb3BzID0ge1xuICBvdXRsaW5lOiBPdXRsaW5lRm9yVWk7XG59O1xuXG5jbGFzcyBPdXRsaW5lVmlld0NvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBPdXRsaW5lVmlld0NvbXBvbmVudFByb3BzO1xuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBvdXRsaW5lID0gdGhpcy5wcm9wcy5vdXRsaW5lO1xuICAgIHN3aXRjaCAob3V0bGluZS5raW5kKSB7XG4gICAgICBjYXNlICdlbXB0eSc6XG4gICAgICBjYXNlICdub3QtdGV4dC1lZGl0b3InOlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIGNhc2UgJ25vLXByb3ZpZGVyJzpcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgIE91dGxpbmUgdmlldyBkb2VzIG5vdCBjdXJyZW50bHkgc3VwcG9ydCB7b3V0bGluZS5ncmFtbWFyfS5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICk7XG4gICAgICBjYXNlICdwcm92aWRlci1uby1vdXRsaW5lJzpcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgIE5vIG91dGxpbmUgYXZhaWxhYmxlLlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICAgIGNhc2UgJ291dGxpbmUnOlxuICAgICAgICByZXR1cm4gcmVuZGVyVHJlZXMob3V0bGluZS5lZGl0b3IsIG91dGxpbmUub3V0bGluZVRyZWVzKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnN0IGVycm9yVGV4dCA9IGBFbmNvdW50ZXJlZCB1bmV4cGVjdGVkIG91dGxpbmUga2luZCAke291dGxpbmUua2luZH1gO1xuICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JUZXh0KTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgIEludGVybmFsIEVycm9yOjxiciAvPlxuICAgICAgICAgICAge2Vycm9yVGV4dH1cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICk7XG4gICAgfVxuICB9XG5cbn1cblxuZnVuY3Rpb24gcmVuZGVyVHJlZShcbiAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gIG91dGxpbmU6IE91dGxpbmVUcmVlRm9yVWksXG4gIGluZGV4OiBudW1iZXIsXG4pOiBSZWFjdEVsZW1lbnQge1xuICBjb25zdCBvbkNsaWNrID0gKCkgPT4ge1xuICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShlZGl0b3IpO1xuICAgIGlmIChwYW5lID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcGFuZS5hY3RpdmF0ZSgpO1xuICAgIHBhbmUuYWN0aXZhdGVJdGVtKGVkaXRvcik7XG4gICAgZ29Ub0xvY2F0aW9uSW5FZGl0b3IoZWRpdG9yLCBvdXRsaW5lLnN0YXJ0UG9zaXRpb24ucm93LCBvdXRsaW5lLnN0YXJ0UG9zaXRpb24uY29sdW1uKTtcbiAgfTtcblxuICBjb25zdCBjbGFzc2VzID0gY2xhc3NuYW1lcyhcbiAgICAnbGlzdC1uZXN0ZWQtaXRlbScsXG4gICAgeyAnc2VsZWN0ZWQnOiBvdXRsaW5lLmhpZ2hsaWdodGVkIH0sXG4gICk7XG4gIHJldHVybiAoXG4gICAgPGxpIGNsYXNzTmFtZT17Y2xhc3Nlc30ga2V5PXtpbmRleH0+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImxpc3QtaXRlbSBudWNsaWRlLW91dGxpbmUtdmlldy1pdGVtXCIgb25DbGljaz17b25DbGlja30+XG4gICAgICAgIHtyZW5kZXJJdGVtVGV4dChvdXRsaW5lKX1cbiAgICAgIDwvZGl2PlxuICAgICAge3JlbmRlclRyZWVzKGVkaXRvciwgb3V0bGluZS5jaGlsZHJlbil9XG4gICAgPC9saT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVySXRlbVRleHQob3V0bGluZTogT3V0bGluZVRyZWVGb3JVaSk6IEFycmF5PFJlYWN0RWxlbWVudD4gfCBzdHJpbmcge1xuICBpZiAob3V0bGluZS50b2tlbml6ZWRUZXh0ICE9IG51bGwpIHtcbiAgICByZXR1cm4gb3V0bGluZS50b2tlbml6ZWRUZXh0Lm1hcChyZW5kZXJUZXh0VG9rZW4pO1xuICB9IGVsc2UgaWYgKG91dGxpbmUucGxhaW5UZXh0ICE9IG51bGwpIHtcbiAgICByZXR1cm4gb3V0bGluZS5wbGFpblRleHQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICdNaXNzaW5nIHRleHQnO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlclRleHRUb2tlbih0b2tlbjogVGV4dFRva2VuLCBpbmRleDogbnVtYmVyKTogUmVhY3RFbGVtZW50IHtcbiAgY29uc3QgY2xhc3NOYW1lID0gVE9LRU5fS0lORF9UT19DTEFTU19OQU1FX01BUFt0b2tlbi5raW5kXTtcbiAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT17Y2xhc3NOYW1lfSBrZXk9e2luZGV4fT57dG9rZW4udmFsdWV9PC9zcGFuPjtcbn1cblxuZnVuY3Rpb24gcmVuZGVyVHJlZXMoXG4gIGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxuICBvdXRsaW5lczogQXJyYXk8T3V0bGluZVRyZWVGb3JVaT5cbik6ID9SZWFjdEVsZW1lbnQge1xuICBpZiAob3V0bGluZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIChcbiAgICAvLyBBZGQgYHBvc2l0aW9uOiByZWxhdGl2ZTtgIHRvIGxldCBgbGkuc2VsZWN0ZWRgIHN0eWxlIHBvc2l0aW9uIGl0c2VsZiByZWxhdGl2ZSB0byB0aGUgbGlzdFxuICAgIC8vIHRyZWUgcmF0aGVyIHRoYW4gdG8gaXRzIGNvbnRhaW5lci5cbiAgICA8dWwgY2xhc3NOYW1lPVwibGlzdC10cmVlXCIgc3R5bGU9e3twb3NpdGlvbjogJ3JlbGF0aXZlJ319PlxuICAgICAge291dGxpbmVzLm1hcCgob3V0bGluZSwgaW5kZXgpID0+IHJlbmRlclRyZWUoZWRpdG9yLCBvdXRsaW5lLCBpbmRleCkpfVxuICAgIDwvdWw+XG4gICk7XG59XG4iXX0=