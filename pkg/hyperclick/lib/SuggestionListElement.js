var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-env browser */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

/**
 * We need to create this custom HTML element so we can hook into the view
 * registry. The overlay decoration only works through the view registry.
 */

var SuggestionListElement = (function (_HTMLElement) {
  _inherits(SuggestionListElement, _HTMLElement);

  function SuggestionListElement() {
    _classCallCheck(this, SuggestionListElement);

    _get(Object.getPrototypeOf(SuggestionListElement.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SuggestionListElement, [{
    key: 'initialize',
    value: function initialize(model) {
      this._model = model;
      return this;
    }
  }, {
    key: 'attachedCallback',
    value: function attachedCallback() {
      _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(SuggestionList, { suggestionList: this._model }), this);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      _reactForAtom.ReactDOM.unmountComponentAtNode(this);
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    }
  }]);

  return SuggestionListElement;
})(HTMLElement);

var SuggestionList = (function (_React$Component) {
  _inherits(SuggestionList, _React$Component);

  function SuggestionList(props) {
    _classCallCheck(this, SuggestionList);

    _get(Object.getPrototypeOf(SuggestionList.prototype), 'constructor', this).call(this, props);
    this.state = {
      selectedIndex: 0
    };
    this._subscriptions = new _atom.CompositeDisposable();
    this._boundConfirm = this._confirm.bind(this);
  }

  _createClass(SuggestionList, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var suggestionList = this.props.suggestionList;

      var suggestion = suggestionList.getSuggestion();
      (0, _assert2['default'])(suggestion);
      // TODO(nmote): This is assuming `suggestion.callback` is always an Array, which is not true
      //   according to hyperclick-interfaces/types. It can also be a function.
      this._items = suggestion.callback;
      this._textEditor = suggestionList.getTextEditor();
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      var textEditor = this._textEditor;
      (0, _assert2['default'])(textEditor);
      var textEditorView = atom.views.getView(textEditor);
      var boundClose = this._close.bind(this);
      this._subscriptions.add(atom.commands.add(textEditorView, {
        'core:move-up': this._moveSelectionUp.bind(this),
        'core:move-down': this._moveSelectionDown.bind(this),
        'core:move-to-top': this._moveSelectionToTop.bind(this),
        'core:move-to-bottom': this._moveSelectionToBottom.bind(this),
        'core:cancel': boundClose,
        'editor:newline': this._boundConfirm
      }));

      this._subscriptions.add(textEditor.onDidChange(boundClose));
      this._subscriptions.add(textEditor.onDidChangeCursorPosition(boundClose));

      // Prevent scrolling the editor when scrolling the suggestion list.
      var stopPropagation = function stopPropagation(event) {
        return event.stopPropagation();
      };
      _reactForAtom.ReactDOM.findDOMNode(this.refs['scroller']).addEventListener('mousewheel', stopPropagation);
      this._subscriptions.add(new _atom.Disposable(function () {
        _reactForAtom.ReactDOM.findDOMNode(_this.refs['scroller']).removeEventListener('mousewheel', stopPropagation);
      }));

      var keydown = function keydown(event) {
        // If the user presses the enter key, confirm the selection.
        if (event.keyCode === 13) {
          event.stopImmediatePropagation();
          _this._confirm();
        }
      };
      textEditorView.addEventListener('keydown', keydown);
      this._subscriptions.add(new _atom.Disposable(function () {
        textEditorView.removeEventListener('keydown', keydown);
      }));
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var itemComponents = this._items.map(function (item, index) {
        var className = 'hyperclick-result-item';
        if (index === _this2.state.selectedIndex) {
          className += ' selected';
        }
        return _reactForAtom.React.createElement(
          'li',
          { className: className,
            key: index,
            onMouseDown: _this2._boundConfirm,
            onMouseEnter: _this2._setSelectedIndex.bind(_this2, index) },
          item.title,
          _reactForAtom.React.createElement(
            'span',
            { className: 'right-label' },
            item.rightLabel
          )
        );
      });

      return _reactForAtom.React.createElement(
        'div',
        { className: 'popover-list select-list hyperclick-suggestion-list-scroller', ref: 'scroller' },
        _reactForAtom.React.createElement(
          'ol',
          { className: 'list-group', ref: 'selectionList' },
          itemComponents
        )
      );
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevState.selectedIndex !== this.state.selectedIndex) {
        this._updateScrollPosition();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
    }
  }, {
    key: '_confirm',
    value: function _confirm() {
      this._items[this.state.selectedIndex].callback();
      this._close();
    }
  }, {
    key: '_close',
    value: function _close() {
      this.props.suggestionList.hide();
    }
  }, {
    key: '_setSelectedIndex',
    value: function _setSelectedIndex(index) {
      this.setState({
        selectedIndex: index
      });
    }
  }, {
    key: '_moveSelectionDown',
    value: function _moveSelectionDown(event) {
      if (this.state.selectedIndex < this._items.length - 1) {
        this.setState({ selectedIndex: this.state.selectedIndex + 1 });
      } else {
        this._moveSelectionToTop();
      }
      if (event) {
        event.stopImmediatePropagation();
      }
    }
  }, {
    key: '_moveSelectionUp',
    value: function _moveSelectionUp(event) {
      if (this.state.selectedIndex > 0) {
        this.setState({ selectedIndex: this.state.selectedIndex - 1 });
      } else {
        this._moveSelectionToBottom();
      }
      if (event) {
        event.stopImmediatePropagation();
      }
    }
  }, {
    key: '_moveSelectionToBottom',
    value: function _moveSelectionToBottom(event) {
      this.setState({ selectedIndex: Math.max(this._items.length - 1, 0) });
      if (event) {
        event.stopImmediatePropagation();
      }
    }
  }, {
    key: '_moveSelectionToTop',
    value: function _moveSelectionToTop(event) {
      this.setState({ selectedIndex: 0 });
      if (event) {
        event.stopImmediatePropagation();
      }
    }
  }, {
    key: '_updateScrollPosition',
    value: function _updateScrollPosition() {
      var listNode = _reactForAtom.ReactDOM.findDOMNode(this.refs['selectionList']);
      var selectedNode = listNode.getElementsByClassName('selected')[0];
      selectedNode.scrollIntoViewIfNeeded(false);
    }
  }]);

  return SuggestionList;
})(_reactForAtom.React.Component);

module.exports = SuggestionListElement = document.registerElement('hyperclick-suggestion-list', {
  prototype: SuggestionListElement.prototype
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlN1Z2dlc3Rpb25MaXN0RWxlbWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFlOEMsTUFBTTs7NEJBSTdDLGdCQUFnQjs7c0JBQ0QsUUFBUTs7Ozs7Ozs7O0lBTXhCLHFCQUFxQjtZQUFyQixxQkFBcUI7O1dBQXJCLHFCQUFxQjswQkFBckIscUJBQXFCOzsrQkFBckIscUJBQXFCOzs7ZUFBckIscUJBQXFCOztXQUdmLG9CQUFDLEtBQXlCLEVBQUU7QUFDcEMsVUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDcEIsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBRWUsNEJBQUc7QUFDakIsNkJBQVMsTUFBTSxDQUFDLGtDQUFDLGNBQWMsSUFBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLE1BQU0sQUFBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDeEU7OztXQUVNLG1CQUFHO0FBQ1IsNkJBQVMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEMsVUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQ25CLFlBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ25DO0tBQ0Y7OztTQWpCRyxxQkFBcUI7R0FBUyxXQUFXOztJQTRCekMsY0FBYztZQUFkLGNBQWM7O0FBU1AsV0FUUCxjQUFjLENBU04sS0FBWSxFQUFFOzBCQVR0QixjQUFjOztBQVVoQiwrQkFWRSxjQUFjLDZDQVVWLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxtQkFBYSxFQUFFLENBQUM7S0FDakIsQ0FBQztBQUNGLFFBQUksQ0FBQyxjQUFjLEdBQUcsK0JBQXlCLENBQUM7QUFDaEQsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUMvQzs7ZUFoQkcsY0FBYzs7V0FrQkEsOEJBQUc7VUFDWixjQUFjLEdB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QyxFQUFDLENBQUMsQ0FBQztBQUNsQyxVQUFJLEtBQUssRUFBRTtBQUNULGFBQUssQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO09BQ2xDO0tBQ0Y7OztXQUVvQixpQ0FBRztBQUN0QixVQUFNLFFBQVEsR0FBRyx1QkFBUyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO0FBQ2xFLFVBQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRSxrQkFBWSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzVDOzs7U0EvSkcsY0FBYztHQUFTLG9CQUFNLFNBQVM7O0FBa0s1QyxNQUFNLENBQUMsT0FBTyxHQUFHLHFCQUFxQixHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsNEJBQTRCLEVBQUU7QUFDOUYsV0FBUyxFQUFFLHFCQUFxQixDQUFDLFNBQVM7Q0FDM0MsQ0FBQyxDQUFDIiwiZmlsZSI6IlN1Z2dlc3Rpb25MaXN0RWxlbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuXG5pbXBvcnQgdHlwZSBTdWdnZXN0aW9uTGlzdFR5cGUgZnJvbSAnLi9TdWdnZXN0aW9uTGlzdCc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuLyoqXG4gKiBXZSBuZWVkIHRvIGNyZWF0ZSB0aGlzIGN1c3RvbSBIVE1MIGVsZW1lbnQgc28gd2UgY2FuIGhvb2sgaW50byB0aGUgdmlld1xuICogcmVnaXN0cnkuIFRoZSBvdmVybGF5IGRlY29yYXRpb24gb25seSB3b3JrcyB0aHJvdWdoIHRoZSB2aWV3IHJlZ2lzdHJ5LlxuICovXG5jbGFzcyBTdWdnZXN0aW9uTGlzdEVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIF9tb2RlbDogU3VnZ2VzdGlvbkxpc3RUeXBlO1xuXG4gIGluaXRpYWxpemUobW9kZWw6IFN1Z2dlc3Rpb25MaXN0VHlwZSkge1xuICAgIHRoaXMuX21vZGVsID0gbW9kZWw7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhdHRhY2hlZENhbGxiYWNrKCkge1xuICAgIFJlYWN0RE9NLnJlbmRlcig8U3VnZ2VzdGlvbkxpc3Qgc3VnZ2VzdGlvbkxpc3Q9e3RoaXMuX21vZGVsfSAvPiwgdGhpcyk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcyk7XG4gICAgaWYgKHRoaXMucGFyZW50Tm9kZSkge1xuICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgIH1cbiAgfVxufVxuXG50eXBlIFByb3BzID0ge1xuICBzdWdnZXN0aW9uTGlzdDogU3VnZ2VzdGlvbkxpc3RUeXBlO1xufTtcblxudHlwZSBTdGF0ZSA9IHtcbiAgc2VsZWN0ZWRJbmRleDogbnVtYmVyO1xufTtcblxuY2xhc3MgU3VnZ2VzdGlvbkxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG4gIHN0YXRlOiBTdGF0ZTtcblxuICBfaXRlbXM6IEFycmF5PHtyaWdodExhYmVsPzogc3RyaW5nOyB0aXRsZTogc3RyaW5nOyBjYWxsYmFjazogKCkgPT4gbWl4ZWR9PjtcbiAgX3RleHRFZGl0b3I6ID9hdG9tJFRleHRFZGl0b3I7XG4gIF9zdWJzY3JpcHRpb25zOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9ib3VuZENvbmZpcm06ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBzZWxlY3RlZEluZGV4OiAwLFxuICAgIH07XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fYm91bmRDb25maXJtID0gdGhpcy5fY29uZmlybS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgIGNvbnN0IHtzdWdnZXN0aW9uTGlzdH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHN1Z2dlc3Rpb24gPSBzdWdnZXN0aW9uTGlzdC5nZXRTdWdnZXN0aW9uKCk7XG4gICAgaW52YXJpYW50KHN1Z2dlc3Rpb24pO1xuICAgIC8vIFRPRE8obm1vdGUpOiBUaGlzIGlzIGFzc3VtaW5nIGBzdWdnZXN0aW9uLmNhbGxiYWNrYCBpcyBhbHdheXMgYW4gQXJyYXksIHdoaWNoIGlzIG5vdCB0cnVlXG4gICAgLy8gICBhY2NvcmRpbmcgdG8gaHlwZXJjbGljay1pbnRlcmZhY2VzL3R5cGVzLiBJdCBjYW4gYWxzbyBiZSBhIGZ1bmN0aW9uLlxuICAgIHRoaXMuX2l0ZW1zID0gKChzdWdnZXN0aW9uLmNhbGxiYWNrOiBhbnkpOlxuICAgICAgICBBcnJheTx7cmlnaHRMYWJlbD86IHN0cmluZzsgdGl0bGU6IHN0cmluZzsgY2FsbGJhY2s6ICgpID0+IG1peGVkfT4pO1xuICAgIHRoaXMuX3RleHRFZGl0b3IgPSBzdWdnZXN0aW9uTGlzdC5nZXRUZXh0RWRpdG9yKCk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gdGhpcy5fdGV4dEVkaXRvcjtcbiAgICBpbnZhcmlhbnQodGV4dEVkaXRvcik7XG4gICAgY29uc3QgdGV4dEVkaXRvclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcodGV4dEVkaXRvcik7XG4gICAgY29uc3QgYm91bmRDbG9zZSA9IHRoaXMuX2Nsb3NlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICAgIGF0b20uY29tbWFuZHMuYWRkKHRleHRFZGl0b3JWaWV3LCB7XG4gICAgICAgICAgJ2NvcmU6bW92ZS11cCc6IHRoaXMuX21vdmVTZWxlY3Rpb25VcC5iaW5kKHRoaXMpLFxuICAgICAgICAgICdjb3JlOm1vdmUtZG93bic6IHRoaXMuX21vdmVTZWxlY3Rpb25Eb3duLmJpbmQodGhpcyksXG4gICAgICAgICAgJ2NvcmU6bW92ZS10by10b3AnOiB0aGlzLl9tb3ZlU2VsZWN0aW9uVG9Ub3AuYmluZCh0aGlzKSxcbiAgICAgICAgICAnY29yZTptb3ZlLXRvLWJvdHRvbSc6IHRoaXMuX21vdmVTZWxlY3Rpb25Ub0JvdHRvbS5iaW5kKHRoaXMpLFxuICAgICAgICAgICdjb3JlOmNhbmNlbCc6IGJvdW5kQ2xvc2UsXG4gICAgICAgICAgJ2VkaXRvcjpuZXdsaW5lJzogdGhpcy5fYm91bmRDb25maXJtLFxuICAgICAgICB9KSk7XG5cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZCh0ZXh0RWRpdG9yLm9uRGlkQ2hhbmdlKGJvdW5kQ2xvc2UpKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZCh0ZXh0RWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oYm91bmRDbG9zZSkpO1xuXG4gICAgLy8gUHJldmVudCBzY3JvbGxpbmcgdGhlIGVkaXRvciB3aGVuIHNjcm9sbGluZyB0aGUgc3VnZ2VzdGlvbiBsaXN0LlxuICAgIGNvbnN0IHN0b3BQcm9wYWdhdGlvbiA9IGV2ZW50ID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snc2Nyb2xsZXInXSkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIHN0b3BQcm9wYWdhdGlvbik7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydzY3JvbGxlciddKS5cbiAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIHN0b3BQcm9wYWdhdGlvbik7XG4gICAgfSkpO1xuXG4gICAgY29uc3Qga2V5ZG93biA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgLy8gSWYgdGhlIHVzZXIgcHJlc3NlcyB0aGUgZW50ZXIga2V5LCBjb25maXJtIHRoZSBzZWxlY3Rpb24uXG4gICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMuX2NvbmZpcm0oKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRleHRFZGl0b3JWaWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBrZXlkb3duKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICB0ZXh0RWRpdG9yVmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywga2V5ZG93bik7XG4gICAgfSkpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IGl0ZW1Db21wb25lbnRzID0gdGhpcy5faXRlbXMubWFwKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgbGV0IGNsYXNzTmFtZSA9ICdoeXBlcmNsaWNrLXJlc3VsdC1pdGVtJztcbiAgICAgIGlmIChpbmRleCA9PT0gdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4KSB7XG4gICAgICAgIGNsYXNzTmFtZSArPSAnIHNlbGVjdGVkJztcbiAgICAgIH1cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgICAgICAgICAgIGtleT17aW5kZXh9XG4gICAgICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5fYm91bmRDb25maXJtfVxuICAgICAgICAgICAgb25Nb3VzZUVudGVyPXt0aGlzLl9zZXRTZWxlY3RlZEluZGV4LmJpbmQodGhpcywgaW5kZXgpfT5cbiAgICAgICAgICAgIHtpdGVtLnRpdGxlfVxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwicmlnaHQtbGFiZWxcIj57aXRlbS5yaWdodExhYmVsfTwvc3Bhbj5cbiAgICAgICAgPC9saT5cbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwb3BvdmVyLWxpc3Qgc2VsZWN0LWxpc3QgaHlwZXJjbGljay1zdWdnZXN0aW9uLWxpc3Qtc2Nyb2xsZXJcIiByZWY9XCJzY3JvbGxlclwiPlxuICAgICAgICA8b2wgY2xhc3NOYW1lPVwibGlzdC1ncm91cFwiIHJlZj1cInNlbGVjdGlvbkxpc3RcIj5cbiAgICAgICAgICB7aXRlbUNvbXBvbmVudHN9XG4gICAgICAgIDwvb2w+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogT2JqZWN0LCBwcmV2U3RhdGU6IE9iamVjdCkge1xuICAgIGlmIChwcmV2U3RhdGUuc2VsZWN0ZWRJbmRleCAhPT0gdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4KSB7XG4gICAgICB0aGlzLl91cGRhdGVTY3JvbGxQb3NpdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX2NvbmZpcm0oKSB7XG4gICAgdGhpcy5faXRlbXNbdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4XS5jYWxsYmFjaygpO1xuICAgIHRoaXMuX2Nsb3NlKCk7XG4gIH1cblxuICBfY2xvc2UoKSB7XG4gICAgdGhpcy5wcm9wcy5zdWdnZXN0aW9uTGlzdC5oaWRlKCk7XG4gIH1cblxuICBfc2V0U2VsZWN0ZWRJbmRleChpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZEluZGV4OiBpbmRleCxcbiAgICB9KTtcbiAgfVxuXG4gIF9tb3ZlU2VsZWN0aW9uRG93bihldmVudCkge1xuICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXggPCB0aGlzLl9pdGVtcy5sZW5ndGggLSAxKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEluZGV4OiB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXggKyAxfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX21vdmVTZWxlY3Rpb25Ub1RvcCgpO1xuICAgIH1cbiAgICBpZiAoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIF9tb3ZlU2VsZWN0aW9uVXAoZXZlbnQpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4ID4gMCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRJbmRleDogdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4IC0gMX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9tb3ZlU2VsZWN0aW9uVG9Cb3R0b20oKTtcbiAgICB9XG4gICAgaWYgKGV2ZW50KSB7XG4gICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICB9XG4gIH1cblxuICBfbW92ZVNlbGVjdGlvblRvQm90dG9tKGV2ZW50KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRJbmRleDogTWF0aC5tYXgodGhpcy5faXRlbXMubGVuZ3RoIC0gMSwgMCl9KTtcbiAgICBpZiAoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIF9tb3ZlU2VsZWN0aW9uVG9Ub3AoZXZlbnQpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEluZGV4OiAwfSk7XG4gICAgaWYgKGV2ZW50KSB7XG4gICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlU2Nyb2xsUG9zaXRpb24oKSB7XG4gICAgY29uc3QgbGlzdE5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ3NlbGVjdGlvbkxpc3QnXSk7XG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlID0gbGlzdE5vZGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2VsZWN0ZWQnKVswXTtcbiAgICBzZWxlY3RlZE5vZGUuc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZChmYWxzZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTdWdnZXN0aW9uTGlzdEVsZW1lbnQgPSBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQoJ2h5cGVyY2xpY2stc3VnZ2VzdGlvbi1saXN0Jywge1xuICBwcm90b3R5cGU6IFN1Z2dlc3Rpb25MaXN0RWxlbWVudC5wcm90b3R5cGUsXG59KTtcbiJdfQ==