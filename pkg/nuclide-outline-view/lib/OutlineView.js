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

var _nuclideAnalytics = require('../../nuclide-analytics');

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
      this.subscription.unsubscribe();
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
    (0, _nuclideAnalytics.track)('nuclide-outline-view:go-to-location');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk91dGxpbmVWaWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBZW9CLGdCQUFnQjs7c0JBQ2QsUUFBUTs7OzswQkFDUCxZQUFZOzs7O2dDQUVmLHlCQUF5Qjs7a0NBQ1YsNEJBQTRCOzs4QkFDdkMsdUJBQXVCOztBQUMvQyxJQUFNLE1BQU0sR0FBRyxnQ0FBVyxDQUFDOztBQVUzQixJQUFNLDRCQUE0QixHQUFHO0FBQ25DLFdBQVMsRUFBRSxTQUFTO0FBQ3BCLGNBQVksRUFBRSxtQkFBbUI7QUFDakMsZUFBYSxFQUFFLHNCQUFzQjtBQUNyQyxVQUFRLEVBQUUsc0JBQXNCO0FBQ2hDLFNBQU8sRUFBRSxVQUFVO0FBQ25CLFVBQVEsRUFBRSxRQUFRO0FBQ2xCLGNBQVksRUFBRSxFQUFFO0FBQ2hCLFNBQU8sRUFBRSxFQUFFO0NBQ1osQ0FBQzs7SUFFVyxXQUFXO1lBQVgsV0FBVzs7QUFNWCxXQU5BLFdBQVcsQ0FNVixLQUFZLEVBQUU7MEJBTmYsV0FBVzs7QUFPcEIsK0JBUFMsV0FBVyw2Q0FPZCxLQUFLLEVBQUU7QUFDYixRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsYUFBTyxFQUFFO0FBQ1AsWUFBSSxFQUFFLE9BQU87T0FDZDtLQUNGLENBQUM7R0FDSDs7ZUFiVSxXQUFXOztXQWVMLDZCQUFTOzs7QUFDeEIsK0JBQVUsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsQ0FBQztBQUNyQyxVQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxVQUFBLE9BQU8sRUFBSTs7QUFFM0QsWUFBSSxVQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsRUFBRTtBQUMvQyxnQkFBSyxRQUFRLENBQUMsRUFBQyxPQUFPLEVBQVAsT0FBTyxFQUFDLENBQUMsQ0FBQztTQUMxQjtPQUNGLENBQUMsQ0FBQztLQUNKOzs7V0FFbUIsZ0NBQVM7QUFDM0IsK0JBQVUsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsQ0FBQztBQUNyQyxVQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0tBQzFCOzs7V0FFSyxrQkFBa0I7QUFDdEIsYUFDRTs7VUFBSyxTQUFTLEVBQUMsdUNBQXVDO1FBQ3BELGtDQUFDLG9CQUFvQixJQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQUFBQyxHQUFHO09BQ2pELENBQ047S0FDSDs7O1dBRU8sb0JBQVc7QUFDakIsYUFBTyxjQUFjLENBQUM7S0FDdkI7OztXQUVVLHVCQUFXO0FBQ3BCLGFBQU8sZ0JBQWdCLENBQUM7S0FDekI7OztTQTdDVSxXQUFXO0dBQVMsb0JBQU0sU0FBUzs7OztJQW9EMUMsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7OztlQUFwQixvQkFBb0I7O1dBR2xCLGtCQUFtQjtBQUN2QixVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztBQUNuQyxjQUFRLE9BQU8sQ0FBQyxJQUFJO0FBQ2xCLGFBQUssT0FBTyxDQUFDO0FBQ2IsYUFBSyxpQkFBaUI7QUFDcEIsaUJBQU8sSUFBSSxDQUFDO0FBQUEsQUFDZCxhQUFLLGFBQWE7QUFDaEIsaUJBQ0U7Ozs7WUFDMkMsT0FBTyxDQUFDLE9BQU87O1dBQ25ELENBQ1A7QUFBQSxBQUNKLGFBQUsscUJBQXFCO0FBQ3hCLGlCQUNFOzs7O1dBRU8sQ0FDUDtBQUFBLEFBQ0osYUFBSyxTQUFTO0FBQ1osaUJBQU8sV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQUEsQUFDM0Q7QUFDRSxjQUFNLFNBQVMsNENBQTBDLE9BQU8sQ0FBQyxJQUFJLEFBQUUsQ0FBQztBQUN4RSxnQkFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN4QixpQkFDRTs7OztZQUNpQiw2Q0FBTTtZQUNwQixTQUFTO1dBQ0wsQ0FDUDtBQUFBLE9BQ0w7S0FDRjs7O1NBakNHLG9CQUFvQjtHQUFTLG9CQUFNLFNBQVM7O0FBcUNsRCxTQUFTLFVBQVUsQ0FDakIsTUFBdUIsRUFDdkIsT0FBeUIsRUFDekIsS0FBYSxFQUNFO0FBQ2YsTUFBTSxPQUFPLEdBQUcsU0FBVixPQUFPLEdBQVM7QUFDcEIsUUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEQsUUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO0FBQ2hCLGFBQU87S0FDUjtBQUNELGlDQUFNLHFDQUFxQyxDQUFDLENBQUM7QUFDN0MsUUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUIsa0RBQXFCLE1BQU0sRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ3ZGLENBQUM7O0FBRUYsTUFBTSxPQUFPLEdBQUcsNkJBQ2Qsa0JBQWtCLEVBQ2xCLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FDcEMsQ0FBQztBQUNGLFNBQ0U7O01BQUksU0FBUyxFQUFFLE9BQU8sQUFBQyxFQUFDLEdBQUcsRUFBRSxLQUFLLEFBQUM7SUFDakM7O1FBQUssU0FBUyxFQUFDLHFDQUFxQyxFQUFDLE9BQU8sRUFBRSxPQUFPLEFBQUM7TUFDbkUsY0FBYyxDQUFDLE9BQU8sQ0FBQztLQUNwQjtJQUNMLFdBQVcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQztHQUNuQyxDQUNMO0NBQ0g7O0FBRUQsU0FBUyxjQUFjLENBQUMsT0FBeUIsRUFBaUM7QUFDaEYsTUFBSSxPQUFPLENBQUMsYUFBYSxJQUFJLElBQUksRUFBRTtBQUNqQyxXQUFPLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0dBQ25ELE1BQU0sSUFBSSxPQUFPLENBQUMsU0FBUyxJQUFJLElBQUksRUFBRTtBQUNwQyxXQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUM7R0FDMUIsTUFBTTtBQUNMLFdBQU8sY0FBYyxDQUFDO0dBQ3ZCO0NBQ0Y7O0FBRUQsU0FBUyxlQUFlLENBQUMsS0FBZ0IsRUFBRSxLQUFhLEVBQWlCO0FBQ3ZFLE1BQU0sU0FBUyxHQUFHLDRCQUE0QixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzRCxTQUFPOztNQUFNLFNBQVMsRUFBRSxTQUFTLEFBQUMsRUFBQyxHQUFHLEVBQUUsS0FBSyxBQUFDO0lBQUUsS0FBSyxDQUFDLEtBQUs7R0FBUSxDQUFDO0NBQ3JFOztBQUVELFNBQVMsV0FBVyxDQUNsQixNQUF1QixFQUN2QixRQUFpQyxFQUNqQjtBQUNoQixNQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3pCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7QUFDRDs7O0FBR0U7O1FBQUksU0FBUyxFQUFDLFdBQVcsRUFBQyxLQUFLLEVBQUUsRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFDLEFBQUM7TUFDckQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFDLE9BQU8sRUFBRSxLQUFLO2VBQUssVUFBVSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDO09BQUEsQ0FBQztLQUNsRTtJQUNMO0NBQ0giLCJmaWxlIjoiT3V0bGluZVZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7T2JzZXJ2YWJsZX0gZnJvbSAnQHJlYWN0aXZleC9yeGpzJztcbmltcG9ydCB0eXBlIHtPdXRsaW5lRm9yVWksIE91dGxpbmVUcmVlRm9yVWl9IGZyb20gJy4vbWFpbic7XG5pbXBvcnQgdHlwZSB7VGV4dFRva2VufSBmcm9tICcuLi8uLi9udWNsaWRlLXRva2VuaXplZC10ZXh0JztcblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7Z29Ub0xvY2F0aW9uSW5FZGl0b3J9IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbnR5cGUgU3RhdGUgPSB7XG4gIG91dGxpbmU6IE91dGxpbmVGb3JVaTtcbn07XG5cbnR5cGUgUHJvcHMgPSB7XG4gIG91dGxpbmVzOiBPYnNlcnZhYmxlPE91dGxpbmVGb3JVaT47XG59O1xuXG5jb25zdCBUT0tFTl9LSU5EX1RPX0NMQVNTX05BTUVfTUFQID0ge1xuICAna2V5d29yZCc6ICdrZXl3b3JkJyxcbiAgJ2NsYXNzLW5hbWUnOiAnZW50aXR5IG5hbWUgY2xhc3MnLFxuICAnY29uc3RydWN0b3InOiAnZW50aXR5IG5hbWUgZnVuY3Rpb24nLFxuICAnbWV0aG9kJzogJ2VudGl0eSBuYW1lIGZ1bmN0aW9uJyxcbiAgJ3BhcmFtJzogJ3ZhcmlhYmxlJyxcbiAgJ3N0cmluZyc6ICdzdHJpbmcnLFxuICAnd2hpdGVzcGFjZSc6ICcnLFxuICAncGxhaW4nOiAnJyxcbn07XG5cbmV4cG9ydCBjbGFzcyBPdXRsaW5lVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRlOiBTdGF0ZTtcbiAgcHJvcHM6IFByb3BzO1xuXG4gIHN1YnNjcmlwdGlvbjogP3J4JElTdWJzY3JpcHRpb247XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBvdXRsaW5lOiB7XG4gICAgICAgIGtpbmQ6ICdlbXB0eScsXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQodGhpcy5zdWJzY3JpcHRpb24gPT0gbnVsbCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb24gPSB0aGlzLnByb3BzLm91dGxpbmVzLnN1YnNjcmliZShvdXRsaW5lID0+IHtcbiAgICAgIC8vIElmIHRoZSBvdXRsaW5lIHZpZXcgaGFzIGZvY3VzLCB3ZSBkb24ndCB3YW50IHRvIHJlLXJlbmRlciBhbnl0aGluZy5cbiAgICAgIGlmICh0aGlzICE9PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe291dGxpbmV9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIGludmFyaWFudCh0aGlzLnN1YnNjcmlwdGlvbiAhPSBudWxsKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lLWl0ZW0gcGFkZGVkIG51Y2xpZGUtb3V0bGluZS12aWV3XCI+XG4gICAgICAgIDxPdXRsaW5lVmlld0NvbXBvbmVudCBvdXRsaW5lPXt0aGlzLnN0YXRlLm91dGxpbmV9IC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ091dGxpbmUgVmlldyc7XG4gIH1cblxuICBnZXRJY29uTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnbGlzdC11bm9yZGVyZWQnO1xuICB9XG59XG5cbnR5cGUgT3V0bGluZVZpZXdDb21wb25lbnRQcm9wcyA9IHtcbiAgb3V0bGluZTogT3V0bGluZUZvclVpO1xufTtcblxuY2xhc3MgT3V0bGluZVZpZXdDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogT3V0bGluZVZpZXdDb21wb25lbnRQcm9wcztcblxuICByZW5kZXIoKTogP1JlYWN0LkVsZW1lbnQge1xuICAgIGNvbnN0IG91dGxpbmUgPSB0aGlzLnByb3BzLm91dGxpbmU7XG4gICAgc3dpdGNoIChvdXRsaW5lLmtpbmQpIHtcbiAgICAgIGNhc2UgJ2VtcHR5JzpcbiAgICAgIGNhc2UgJ25vdC10ZXh0LWVkaXRvcic6XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgY2FzZSAnbm8tcHJvdmlkZXInOlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgT3V0bGluZSB2aWV3IGRvZXMgbm90IGN1cnJlbnRseSBzdXBwb3J0IHtvdXRsaW5lLmdyYW1tYXJ9LlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICAgIGNhc2UgJ3Byb3ZpZGVyLW5vLW91dGxpbmUnOlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgTm8gb3V0bGluZSBhdmFpbGFibGUuXG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICApO1xuICAgICAgY2FzZSAnb3V0bGluZSc6XG4gICAgICAgIHJldHVybiByZW5kZXJUcmVlcyhvdXRsaW5lLmVkaXRvciwgb3V0bGluZS5vdXRsaW5lVHJlZXMpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29uc3QgZXJyb3JUZXh0ID0gYEVuY291bnRlcmVkIHVuZXhwZWN0ZWQgb3V0bGluZSBraW5kICR7b3V0bGluZS5raW5kfWA7XG4gICAgICAgIGxvZ2dlci5lcnJvcihlcnJvclRleHQpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgSW50ZXJuYWwgRXJyb3I6PGJyIC8+XG4gICAgICAgICAgICB7ZXJyb3JUZXh0fVxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICB9XG4gIH1cblxufVxuXG5mdW5jdGlvbiByZW5kZXJUcmVlKFxuICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgb3V0bGluZTogT3V0bGluZVRyZWVGb3JVaSxcbiAgaW5kZXg6IG51bWJlcixcbik6IFJlYWN0LkVsZW1lbnQge1xuICBjb25zdCBvbkNsaWNrID0gKCkgPT4ge1xuICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShlZGl0b3IpO1xuICAgIGlmIChwYW5lID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdHJhY2soJ251Y2xpZGUtb3V0bGluZS12aWV3OmdvLXRvLWxvY2F0aW9uJyk7XG4gICAgcGFuZS5hY3RpdmF0ZSgpO1xuICAgIHBhbmUuYWN0aXZhdGVJdGVtKGVkaXRvcik7XG4gICAgZ29Ub0xvY2F0aW9uSW5FZGl0b3IoZWRpdG9yLCBvdXRsaW5lLnN0YXJ0UG9zaXRpb24ucm93LCBvdXRsaW5lLnN0YXJ0UG9zaXRpb24uY29sdW1uKTtcbiAgfTtcblxuICBjb25zdCBjbGFzc2VzID0gY2xhc3NuYW1lcyhcbiAgICAnbGlzdC1uZXN0ZWQtaXRlbScsXG4gICAgeyAnc2VsZWN0ZWQnOiBvdXRsaW5lLmhpZ2hsaWdodGVkIH0sXG4gICk7XG4gIHJldHVybiAoXG4gICAgPGxpIGNsYXNzTmFtZT17Y2xhc3Nlc30ga2V5PXtpbmRleH0+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImxpc3QtaXRlbSBudWNsaWRlLW91dGxpbmUtdmlldy1pdGVtXCIgb25DbGljaz17b25DbGlja30+XG4gICAgICAgIHtyZW5kZXJJdGVtVGV4dChvdXRsaW5lKX1cbiAgICAgIDwvZGl2PlxuICAgICAge3JlbmRlclRyZWVzKGVkaXRvciwgb3V0bGluZS5jaGlsZHJlbil9XG4gICAgPC9saT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVySXRlbVRleHQob3V0bGluZTogT3V0bGluZVRyZWVGb3JVaSk6IEFycmF5PFJlYWN0LkVsZW1lbnQ+IHwgc3RyaW5nIHtcbiAgaWYgKG91dGxpbmUudG9rZW5pemVkVGV4dCAhPSBudWxsKSB7XG4gICAgcmV0dXJuIG91dGxpbmUudG9rZW5pemVkVGV4dC5tYXAocmVuZGVyVGV4dFRva2VuKTtcbiAgfSBlbHNlIGlmIChvdXRsaW5lLnBsYWluVGV4dCAhPSBudWxsKSB7XG4gICAgcmV0dXJuIG91dGxpbmUucGxhaW5UZXh0O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnTWlzc2luZyB0ZXh0JztcbiAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJUZXh0VG9rZW4odG9rZW46IFRleHRUb2tlbiwgaW5kZXg6IG51bWJlcik6IFJlYWN0LkVsZW1lbnQge1xuICBjb25zdCBjbGFzc05hbWUgPSBUT0tFTl9LSU5EX1RPX0NMQVNTX05BTUVfTUFQW3Rva2VuLmtpbmRdO1xuICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPXtjbGFzc05hbWV9IGtleT17aW5kZXh9Pnt0b2tlbi52YWx1ZX08L3NwYW4+O1xufVxuXG5mdW5jdGlvbiByZW5kZXJUcmVlcyhcbiAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gIG91dGxpbmVzOiBBcnJheTxPdXRsaW5lVHJlZUZvclVpPlxuKTogP1JlYWN0LkVsZW1lbnQge1xuICBpZiAob3V0bGluZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIChcbiAgICAvLyBBZGQgYHBvc2l0aW9uOiByZWxhdGl2ZTtgIHRvIGxldCBgbGkuc2VsZWN0ZWRgIHN0eWxlIHBvc2l0aW9uIGl0c2VsZiByZWxhdGl2ZSB0byB0aGUgbGlzdFxuICAgIC8vIHRyZWUgcmF0aGVyIHRoYW4gdG8gaXRzIGNvbnRhaW5lci5cbiAgICA8dWwgY2xhc3NOYW1lPVwibGlzdC10cmVlXCIgc3R5bGU9e3twb3NpdGlvbjogJ3JlbGF0aXZlJ319PlxuICAgICAge291dGxpbmVzLm1hcCgob3V0bGluZSwgaW5kZXgpID0+IHJlbmRlclRyZWUoZWRpdG9yLCBvdXRsaW5lLCBpbmRleCkpfVxuICAgIDwvdWw+XG4gICk7XG59XG4iXX0=