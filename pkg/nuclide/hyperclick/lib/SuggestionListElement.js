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

/* eslint-disable react/prop-types */

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlN1Z2dlc3Rpb25MaXN0RWxlbWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFlOEMsTUFBTTs7NEJBSTdDLGdCQUFnQjs7c0JBQ0QsUUFBUTs7Ozs7Ozs7O0lBTXhCLHFCQUFxQjtZQUFyQixxQkFBcUI7O1dBQXJCLHFCQUFxQjswQkFBckIscUJBQXFCOzsrQkFBckIscUJBQXFCOzs7ZUFBckIscUJBQXFCOztXQUdmLG9CQUFDLEtBQXlCLEVBQUU7QUFDcEMsVUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDcEIsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBRWUsNEJBQUc7QUFDakIsNkJBQVMsTUFBTSxDQUFDLGtDQUFDLGNBQWMsSUFBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLE1BQU0sQUFBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDeEU7OztXQUVNLG1CQUFHO0FBQ1IsNkJBQVMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEMsVUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQ25CLFlBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ25DO0tBQ0Y7OztTQWpCRyxxQkFBcUI7R0FBUyxXQUFXOzs7O0lBNkJ6QyxjQUFjO1lBQWQsY0FBYzs7QUFTUCxXQVRQLGNBQWMsQ0FTTixLQUFZLEVBQUU7MEJBVHRCLGNBQWM7O0FBVWhCLCtCQVZFLGNBQWMsNkNBVVYsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLG1CQUFhLEVBQUUsQ0FBQztLQUNqQixDQUFDO0FBQ0YsUUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBeUIsQ0FBQztBQUNoRCxRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQy9DOztlQWhCRyxjQUFjOztXQWtCQSw4QkFBRztVQUNaLGNBQWMs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QUFDLEVBQUMsQ0FBQyxDQUFDO0FBQ2xDLFVBQUksS0FBSyxFQUFFO0FBQ1QsYUFBSyxDQUFDLHdCQUF3QixFQUFFLENBQUM7T0FDbEM7S0FDRjs7O1dBRW9CLGlDQUFHO0FBQ3RCLFVBQU0sUUFBUSxHQUFHLHVCQUFTLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7QUFDbEUsVUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BFLGtCQUFZLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDNUM7OztTQS9KRyxjQUFjO0dBQVMsb0JBQU0sU0FBUzs7QUFrSzVDLE1BQU0sQ0FBQyxPQUFPLEdBQUcscUJBQXFCLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRTtBQUM5RixXQUFTLEVBQUUscUJBQXFCLENBQUMsU0FBUztDQUMzQyxDQUFDLENBQUMiLCJmaWxlIjoiU3VnZ2VzdGlvbkxpc3RFbGVtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyogZXNsaW50LWVudiBicm93c2VyICovXG5cbmltcG9ydCB0eXBlIFN1Z2dlc3Rpb25MaXN0VHlwZSBmcm9tICcuL1N1Z2dlc3Rpb25MaXN0JztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG4vKipcbiAqIFdlIG5lZWQgdG8gY3JlYXRlIHRoaXMgY3VzdG9tIEhUTUwgZWxlbWVudCBzbyB3ZSBjYW4gaG9vayBpbnRvIHRoZSB2aWV3XG4gKiByZWdpc3RyeS4gVGhlIG92ZXJsYXkgZGVjb3JhdGlvbiBvbmx5IHdvcmtzIHRocm91Z2ggdGhlIHZpZXcgcmVnaXN0cnkuXG4gKi9cbmNsYXNzIFN1Z2dlc3Rpb25MaXN0RWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgX21vZGVsOiBTdWdnZXN0aW9uTGlzdFR5cGU7XG5cbiAgaW5pdGlhbGl6ZShtb2RlbDogU3VnZ2VzdGlvbkxpc3RUeXBlKSB7XG4gICAgdGhpcy5fbW9kZWwgPSBtb2RlbDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGF0dGFjaGVkQ2FsbGJhY2soKSB7XG4gICAgUmVhY3RET00ucmVuZGVyKDxTdWdnZXN0aW9uTGlzdCBzdWdnZXN0aW9uTGlzdD17dGhpcy5fbW9kZWx9IC8+LCB0aGlzKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzKTtcbiAgICBpZiAodGhpcy5wYXJlbnROb2RlKSB7XG4gICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgfVxuICB9XG59XG5cbnR5cGUgUHJvcHMgPSB7XG4gIHN1Z2dlc3Rpb25MaXN0OiBTdWdnZXN0aW9uTGlzdFR5cGU7XG59O1xuXG50eXBlIFN0YXRlID0ge1xuICBzZWxlY3RlZEluZGV4OiBudW1iZXI7XG59O1xuXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5jbGFzcyBTdWdnZXN0aW9uTGlzdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcbiAgc3RhdGU6IFN0YXRlO1xuXG4gIF9pdGVtczogQXJyYXk8e3JpZ2h0TGFiZWw/OiBzdHJpbmc7IHRpdGxlOiBzdHJpbmc7IGNhbGxiYWNrOiAoKSA9PiBtaXhlZH0+O1xuICBfdGV4dEVkaXRvcjogP2F0b20kVGV4dEVkaXRvcjtcbiAgX3N1YnNjcmlwdGlvbnM6IGF0b20kQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2JvdW5kQ29uZmlybTogKCkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHNlbGVjdGVkSW5kZXg6IDAsXG4gICAgfTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9ib3VuZENvbmZpcm0gPSB0aGlzLl9jb25maXJtLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgY29uc3Qge3N1Z2dlc3Rpb25MaXN0fSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qgc3VnZ2VzdGlvbiA9IHN1Z2dlc3Rpb25MaXN0LmdldFN1Z2dlc3Rpb24oKTtcbiAgICBpbnZhcmlhbnQoc3VnZ2VzdGlvbik7XG4gICAgLy8gVE9ETyhubW90ZSk6IFRoaXMgaXMgYXNzdW1pbmcgYHN1Z2dlc3Rpb24uY2FsbGJhY2tgIGlzIGFsd2F5cyBhbiBBcnJheSwgd2hpY2ggaXMgbm90IHRydWVcbiAgICAvLyAgIGFjY29yZGluZyB0byBoeXBlcmNsaWNrLWludGVyZmFjZXMvdHlwZXMuIEl0IGNhbiBhbHNvIGJlIGEgZnVuY3Rpb24uXG4gICAgdGhpcy5faXRlbXMgPSAoKHN1Z2dlc3Rpb24uY2FsbGJhY2s6IGFueSk6XG4gICAgICAgIEFycmF5PHtyaWdodExhYmVsPzogc3RyaW5nOyB0aXRsZTogc3RyaW5nOyBjYWxsYmFjazogKCkgPT4gbWl4ZWR9Pik7XG4gICAgdGhpcy5fdGV4dEVkaXRvciA9IHN1Z2dlc3Rpb25MaXN0LmdldFRleHRFZGl0b3IoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IHRleHRFZGl0b3IgPSB0aGlzLl90ZXh0RWRpdG9yO1xuICAgIGludmFyaWFudCh0ZXh0RWRpdG9yKTtcbiAgICBjb25zdCB0ZXh0RWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0Vmlldyh0ZXh0RWRpdG9yKTtcbiAgICBjb25zdCBib3VuZENsb3NlID0gdGhpcy5fY2xvc2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgICAgYXRvbS5jb21tYW5kcy5hZGQodGV4dEVkaXRvclZpZXcsIHtcbiAgICAgICAgICAnY29yZTptb3ZlLXVwJzogdGhpcy5fbW92ZVNlbGVjdGlvblVwLmJpbmQodGhpcyksXG4gICAgICAgICAgJ2NvcmU6bW92ZS1kb3duJzogdGhpcy5fbW92ZVNlbGVjdGlvbkRvd24uYmluZCh0aGlzKSxcbiAgICAgICAgICAnY29yZTptb3ZlLXRvLXRvcCc6IHRoaXMuX21vdmVTZWxlY3Rpb25Ub1RvcC5iaW5kKHRoaXMpLFxuICAgICAgICAgICdjb3JlOm1vdmUtdG8tYm90dG9tJzogdGhpcy5fbW92ZVNlbGVjdGlvblRvQm90dG9tLmJpbmQodGhpcyksXG4gICAgICAgICAgJ2NvcmU6Y2FuY2VsJzogYm91bmRDbG9zZSxcbiAgICAgICAgICAnZWRpdG9yOm5ld2xpbmUnOiB0aGlzLl9ib3VuZENvbmZpcm0sXG4gICAgICAgIH0pKTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKHRleHRFZGl0b3Iub25EaWRDaGFuZ2UoYm91bmRDbG9zZSkpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKHRleHRFZGl0b3Iub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbihib3VuZENsb3NlKSk7XG5cbiAgICAvLyBQcmV2ZW50IHNjcm9sbGluZyB0aGUgZWRpdG9yIHdoZW4gc2Nyb2xsaW5nIHRoZSBzdWdnZXN0aW9uIGxpc3QuXG4gICAgY29uc3Qgc3RvcFByb3BhZ2F0aW9uID0gZXZlbnQgPT4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydzY3JvbGxlciddKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXdoZWVsJywgc3RvcFByb3BhZ2F0aW9uKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ3Njcm9sbGVyJ10pLlxuICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXdoZWVsJywgc3RvcFByb3BhZ2F0aW9uKTtcbiAgICB9KSk7XG5cbiAgICBjb25zdCBrZXlkb3duID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAvLyBJZiB0aGUgdXNlciBwcmVzc2VzIHRoZSBlbnRlciBrZXksIGNvbmZpcm0gdGhlIHNlbGVjdGlvbi5cbiAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xuICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpcy5fY29uZmlybSgpO1xuICAgICAgfVxuICAgIH07XG4gICAgdGV4dEVkaXRvclZpZXcuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGtleWRvd24pO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHRleHRFZGl0b3JWaWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBrZXlkb3duKTtcbiAgICB9KSk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgaXRlbUNvbXBvbmVudHMgPSB0aGlzLl9pdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICBsZXQgY2xhc3NOYW1lID0gJ2h5cGVyY2xpY2stcmVzdWx0LWl0ZW0nO1xuICAgICAgaWYgKGluZGV4ID09PSB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXgpIHtcbiAgICAgICAgY2xhc3NOYW1lICs9ICcgc2VsZWN0ZWQnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGxpIGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuICAgICAgICAgICAga2V5PXtpbmRleH1cbiAgICAgICAgICAgIG9uTW91c2VEb3duPXt0aGlzLl9ib3VuZENvbmZpcm19XG4gICAgICAgICAgICBvbk1vdXNlRW50ZXI9e3RoaXMuX3NldFNlbGVjdGVkSW5kZXguYmluZCh0aGlzLCBpbmRleCl9PlxuICAgICAgICAgICAge2l0ZW0udGl0bGV9XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJyaWdodC1sYWJlbFwiPntpdGVtLnJpZ2h0TGFiZWx9PC9zcGFuPlxuICAgICAgICA8L2xpPlxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInBvcG92ZXItbGlzdCBzZWxlY3QtbGlzdCBoeXBlcmNsaWNrLXN1Z2dlc3Rpb24tbGlzdC1zY3JvbGxlclwiIHJlZj1cInNjcm9sbGVyXCI+XG4gICAgICAgIDxvbCBjbGFzc05hbWU9XCJsaXN0LWdyb3VwXCIgcmVmPVwic2VsZWN0aW9uTGlzdFwiPlxuICAgICAgICAgIHtpdGVtQ29tcG9uZW50c31cbiAgICAgICAgPC9vbD5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBPYmplY3QsIHByZXZTdGF0ZTogT2JqZWN0KSB7XG4gICAgaWYgKHByZXZTdGF0ZS5zZWxlY3RlZEluZGV4ICE9PSB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXgpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVNjcm9sbFBvc2l0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICBfY29uZmlybSgpIHtcbiAgICB0aGlzLl9pdGVtc1t0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXhdLmNhbGxiYWNrKCk7XG4gICAgdGhpcy5fY2xvc2UoKTtcbiAgfVxuXG4gIF9jbG9zZSgpIHtcbiAgICB0aGlzLnByb3BzLnN1Z2dlc3Rpb25MaXN0LmhpZGUoKTtcbiAgfVxuXG4gIF9zZXRTZWxlY3RlZEluZGV4KGluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGVkSW5kZXg6IGluZGV4LFxuICAgIH0pO1xuICB9XG5cbiAgX21vdmVTZWxlY3Rpb25Eb3duKGV2ZW50KSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCA8IHRoaXMuX2l0ZW1zLmxlbmd0aCAtIDEpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkSW5kZXg6IHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCArIDF9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbW92ZVNlbGVjdGlvblRvVG9wKCk7XG4gICAgfVxuICAgIGlmIChldmVudCkge1xuICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgX21vdmVTZWxlY3Rpb25VcChldmVudCkge1xuICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXggPiAwKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEluZGV4OiB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXggLSAxfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX21vdmVTZWxlY3Rpb25Ub0JvdHRvbSgpO1xuICAgIH1cbiAgICBpZiAoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIF9tb3ZlU2VsZWN0aW9uVG9Cb3R0b20oZXZlbnQpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEluZGV4OiBNYXRoLm1heCh0aGlzLl9pdGVtcy5sZW5ndGggLSAxLCAwKX0pO1xuICAgIGlmIChldmVudCkge1xuICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgX21vdmVTZWxlY3Rpb25Ub1RvcChldmVudCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkSW5kZXg6IDB9KTtcbiAgICBpZiAoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVTY3JvbGxQb3NpdGlvbigpIHtcbiAgICBjb25zdCBsaXN0Tm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snc2VsZWN0aW9uTGlzdCddKTtcbiAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSBsaXN0Tm9kZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzZWxlY3RlZCcpWzBdO1xuICAgIHNlbGVjdGVkTm9kZS5zY3JvbGxJbnRvVmlld0lmTmVlZGVkKGZhbHNlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN1Z2dlc3Rpb25MaXN0RWxlbWVudCA9IGRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudCgnaHlwZXJjbGljay1zdWdnZXN0aW9uLWxpc3QnLCB7XG4gIHByb3RvdHlwZTogU3VnZ2VzdGlvbkxpc3RFbGVtZW50LnByb3RvdHlwZSxcbn0pO1xuIl19