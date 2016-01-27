var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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
      _reactForAtom.React.render(_reactForAtom.React.createElement(SuggestionList, { suggestionList: this._model }), this);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      _reactForAtom.React.unmountComponentAtNode(this);
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
      _reactForAtom.React.findDOMNode(this.refs['scroller']).addEventListener('mousewheel', stopPropagation);
      this._subscriptions.add(new _atom.Disposable(function () {
        _reactForAtom.React.findDOMNode(_this.refs['scroller']).removeEventListener('mousewheel', stopPropagation);
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
      var listNode = _reactForAtom.React.findDOMNode(this.refs['selectionList']);
      var selectedNode = listNode.getElementsByClassName('selected')[0];
      selectedNode.scrollIntoViewIfNeeded(false);
    }
  }]);

  return SuggestionList;
})(_reactForAtom.React.Component);

module.exports = SuggestionListElement = document.registerElement('hyperclick-suggestion-list', { prototype: SuggestionListElement.prototype });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlN1Z2dlc3Rpb25MaXN0RWxlbWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBYThDLE1BQU07OzRCQUNoQyxnQkFBZ0I7O3NCQUNkLFFBQVE7Ozs7Ozs7OztJQU14QixxQkFBcUI7WUFBckIscUJBQXFCOztXQUFyQixxQkFBcUI7MEJBQXJCLHFCQUFxQjs7K0JBQXJCLHFCQUFxQjs7O2VBQXJCLHFCQUFxQjs7V0FHZixvQkFBQyxLQUF5QixFQUFFO0FBQ3BDLFVBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVlLDRCQUFHO0FBQ2pCLDBCQUFNLE1BQU0sQ0FBQyxrQ0FBQyxjQUFjLElBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxNQUFNLEFBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3JFOzs7V0FFTSxtQkFBRztBQUNSLDBCQUFNLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25DLFVBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNuQixZQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUNuQztLQUNGOzs7U0FqQkcscUJBQXFCO0dBQVMsV0FBVzs7OztJQTZCekMsY0FBYztZQUFkLGNBQWM7O0FBU1AsV0FUUCxjQUFjLENBU04sS0FBWSxFQUFFOzBCQVR0QixjQUFjOztBQVVoQiwrQkFWRSxjQUFjLDZDQVVWLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxtQkFBYSxFQUFFLENBQUM7S0FDakIsQ0FBQztBQUNGLFFBQUksQ0FBQyxjQUFjLEdBQUcsK0JBQXlCLENBQUM7QUFDaEQsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUMvQzs7ZUFoQkcsY0FBYzs7V0FrQkEsOEJBQUc7VUFDWixjQUFjLEdB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QyxDQUFDO0FBQ2xDLFVBQUksS0FBSyxFQUFFO0FBQ1QsYUFBSyxDQUFDLHdCQUF3QixFQUFFLENBQUM7T0FDbEM7S0FDRjs7O1dBRW9CLGlDQUFHO0FBQ3RCLFVBQU0sUUFBUSxHQUFHLG9CQUFNLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7QUFDL0QsVUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BFLGtCQUFZLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDNUM7OztTQTNKRyxjQUFjO0dBQVMsb0JBQU0sU0FBUzs7QUE4SjVDLE1BQU0sQ0FBQyxPQUFPLEdBQUcscUJBQXFCLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRSxFQUFDLFNBQVMsRUFBRSxxQkFBcUIsQ0FBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6IlN1Z2dlc3Rpb25MaXN0RWxlbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIFN1Z2dlc3Rpb25MaXN0VHlwZSBmcm9tICcuL1N1Z2dlc3Rpb25MaXN0JztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuLyoqXG4gKiBXZSBuZWVkIHRvIGNyZWF0ZSB0aGlzIGN1c3RvbSBIVE1MIGVsZW1lbnQgc28gd2UgY2FuIGhvb2sgaW50byB0aGUgdmlld1xuICogcmVnaXN0cnkuIFRoZSBvdmVybGF5IGRlY29yYXRpb24gb25seSB3b3JrcyB0aHJvdWdoIHRoZSB2aWV3IHJlZ2lzdHJ5LlxuICovXG5jbGFzcyBTdWdnZXN0aW9uTGlzdEVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIF9tb2RlbDogU3VnZ2VzdGlvbkxpc3RUeXBlO1xuXG4gIGluaXRpYWxpemUobW9kZWw6IFN1Z2dlc3Rpb25MaXN0VHlwZSkge1xuICAgIHRoaXMuX21vZGVsID0gbW9kZWw7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhdHRhY2hlZENhbGxiYWNrKCkge1xuICAgIFJlYWN0LnJlbmRlcig8U3VnZ2VzdGlvbkxpc3Qgc3VnZ2VzdGlvbkxpc3Q9e3RoaXMuX21vZGVsfSAvPiwgdGhpcyk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcyk7XG4gICAgaWYgKHRoaXMucGFyZW50Tm9kZSkge1xuICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgIH1cbiAgfVxufVxuXG50eXBlIFByb3BzID0ge1xuICBzdWdnZXN0aW9uTGlzdDogU3VnZ2VzdGlvbkxpc3RUeXBlO1xufTtcblxudHlwZSBTdGF0ZSA9IHtcbiAgc2VsZWN0ZWRJbmRleDogbnVtYmVyO1xufTtcblxuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuY2xhc3MgU3VnZ2VzdGlvbkxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG4gIHN0YXRlOiBTdGF0ZTtcblxuICBfdGV4dEVkaXRvcjogP2F0b20kVGV4dEVkaXRvcjtcblxuICBfc3Vic2NyaXB0aW9uczogYXRvbSRDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfYm91bmRDb25maXJtOiAoKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgc2VsZWN0ZWRJbmRleDogMCxcbiAgICB9O1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2JvdW5kQ29uZmlybSA9IHRoaXMuX2NvbmZpcm0uYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICBjb25zdCB7c3VnZ2VzdGlvbkxpc3R9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBzdWdnZXN0aW9uID0gc3VnZ2VzdGlvbkxpc3QuZ2V0U3VnZ2VzdGlvbigpO1xuICAgIGludmFyaWFudChzdWdnZXN0aW9uKTtcbiAgICB0aGlzLl9pdGVtcyA9IHN1Z2dlc3Rpb24uY2FsbGJhY2s7XG4gICAgdGhpcy5fdGV4dEVkaXRvciA9IHN1Z2dlc3Rpb25MaXN0LmdldFRleHRFZGl0b3IoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IHRleHRFZGl0b3IgPSB0aGlzLl90ZXh0RWRpdG9yO1xuICAgIGludmFyaWFudCh0ZXh0RWRpdG9yKTtcbiAgICBjb25zdCB0ZXh0RWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0Vmlldyh0ZXh0RWRpdG9yKTtcbiAgICBjb25zdCBib3VuZENsb3NlID0gdGhpcy5fY2xvc2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgICAgYXRvbS5jb21tYW5kcy5hZGQodGV4dEVkaXRvclZpZXcsIHtcbiAgICAgICAgICAnY29yZTptb3ZlLXVwJzogdGhpcy5fbW92ZVNlbGVjdGlvblVwLmJpbmQodGhpcyksXG4gICAgICAgICAgJ2NvcmU6bW92ZS1kb3duJzogdGhpcy5fbW92ZVNlbGVjdGlvbkRvd24uYmluZCh0aGlzKSxcbiAgICAgICAgICAnY29yZTptb3ZlLXRvLXRvcCc6IHRoaXMuX21vdmVTZWxlY3Rpb25Ub1RvcC5iaW5kKHRoaXMpLFxuICAgICAgICAgICdjb3JlOm1vdmUtdG8tYm90dG9tJzogdGhpcy5fbW92ZVNlbGVjdGlvblRvQm90dG9tLmJpbmQodGhpcyksXG4gICAgICAgICAgJ2NvcmU6Y2FuY2VsJzogYm91bmRDbG9zZSxcbiAgICAgICAgICAnZWRpdG9yOm5ld2xpbmUnOiB0aGlzLl9ib3VuZENvbmZpcm0sXG4gICAgICAgIH0pKTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKHRleHRFZGl0b3Iub25EaWRDaGFuZ2UoYm91bmRDbG9zZSkpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKHRleHRFZGl0b3Iub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbihib3VuZENsb3NlKSk7XG5cbiAgICAvLyBQcmV2ZW50IHNjcm9sbGluZyB0aGUgZWRpdG9yIHdoZW4gc2Nyb2xsaW5nIHRoZSBzdWdnZXN0aW9uIGxpc3QuXG4gICAgY29uc3Qgc3RvcFByb3BhZ2F0aW9uID0gKGV2ZW50KSA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ3Njcm9sbGVyJ10pLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCBzdG9wUHJvcGFnYXRpb24pO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1snc2Nyb2xsZXInXSkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIHN0b3BQcm9wYWdhdGlvbik7XG4gICAgfSkpO1xuXG4gICAgY29uc3Qga2V5ZG93biA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgIC8vIElmIHRoZSB1c2VyIHByZXNzZXMgdGhlIGVudGVyIGtleSwgY29uZmlybSB0aGUgc2VsZWN0aW9uLlxuICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB0aGlzLl9jb25maXJtKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICB0ZXh0RWRpdG9yVmlldy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywga2V5ZG93bik7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGV4dEVkaXRvclZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGtleWRvd24pO1xuICAgIH0pKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBpdGVtQ29tcG9uZW50cyA9IHRoaXMuX2l0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgIGxldCBjbGFzc05hbWUgPSAnaHlwZXJjbGljay1yZXN1bHQtaXRlbSc7XG4gICAgICBpZiAoaW5kZXggPT09IHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCkge1xuICAgICAgICBjbGFzc05hbWUgKz0gJyBzZWxlY3RlZCc7XG4gICAgICB9XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGkgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgICAgICAgICBrZXk9e2luZGV4fVxuICAgICAgICAgICAgb25Nb3VzZURvd249e3RoaXMuX2JvdW5kQ29uZmlybX1cbiAgICAgICAgICAgIG9uTW91c2VFbnRlcj17dGhpcy5fc2V0U2VsZWN0ZWRJbmRleC5iaW5kKHRoaXMsIGluZGV4KX0+XG4gICAgICAgICAgICB7aXRlbS50aXRsZX1cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInJpZ2h0LWxhYmVsXCI+e2l0ZW0ucmlnaHRMYWJlbH08L3NwYW4+XG4gICAgICAgIDwvbGk+XG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwicG9wb3Zlci1saXN0IHNlbGVjdC1saXN0IGh5cGVyY2xpY2stc3VnZ2VzdGlvbi1saXN0LXNjcm9sbGVyXCIgcmVmPVwic2Nyb2xsZXJcIj5cbiAgICAgICAgPG9sIGNsYXNzTmFtZT1cImxpc3QtZ3JvdXBcIiByZWY9XCJzZWxlY3Rpb25MaXN0XCI+XG4gICAgICAgICAge2l0ZW1Db21wb25lbnRzfVxuICAgICAgICA8L29sPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IG1peGVkLCBwcmV2U3RhdGU6IG1peGVkKSB7XG4gICAgaWYgKHByZXZTdGF0ZS5zZWxlY3RlZEluZGV4ICE9PSB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXgpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVNjcm9sbFBvc2l0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICBfY29uZmlybSgpIHtcbiAgICB0aGlzLl9pdGVtc1t0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXhdLmNhbGxiYWNrKCk7XG4gICAgdGhpcy5fY2xvc2UoKTtcbiAgfVxuXG4gIF9jbG9zZSgpIHtcbiAgICB0aGlzLnByb3BzLnN1Z2dlc3Rpb25MaXN0LmhpZGUoKTtcbiAgfVxuXG4gIF9zZXRTZWxlY3RlZEluZGV4KGluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGVkSW5kZXg6IGluZGV4LFxuICAgIH0pO1xuICB9XG5cbiAgX21vdmVTZWxlY3Rpb25Eb3duKGV2ZW50KSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCA8IHRoaXMuX2l0ZW1zLmxlbmd0aCAtIDEpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkSW5kZXg6IHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCArIDF9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbW92ZVNlbGVjdGlvblRvVG9wKCk7XG4gICAgfVxuICAgIGlmIChldmVudCkge1xuICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgX21vdmVTZWxlY3Rpb25VcChldmVudCkge1xuICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXggPiAwKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEluZGV4OiB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXggLSAxfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX21vdmVTZWxlY3Rpb25Ub0JvdHRvbSgpO1xuICAgIH1cbiAgICBpZiAoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIF9tb3ZlU2VsZWN0aW9uVG9Cb3R0b20oZXZlbnQpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEluZGV4OiBNYXRoLm1heCh0aGlzLl9pdGVtcy5sZW5ndGggLSAxLCAwKX0pO1xuICAgIGlmIChldmVudCkge1xuICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgX21vdmVTZWxlY3Rpb25Ub1RvcChldmVudCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkSW5kZXg6IDB9KTtcbiAgICBpZiAoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVTY3JvbGxQb3NpdGlvbigpIHtcbiAgICBjb25zdCBsaXN0Tm9kZSA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1snc2VsZWN0aW9uTGlzdCddKTtcbiAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSBsaXN0Tm9kZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzZWxlY3RlZCcpWzBdO1xuICAgIHNlbGVjdGVkTm9kZS5zY3JvbGxJbnRvVmlld0lmTmVlZGVkKGZhbHNlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN1Z2dlc3Rpb25MaXN0RWxlbWVudCA9IGRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudCgnaHlwZXJjbGljay1zdWdnZXN0aW9uLWxpc3QnLCB7cHJvdG90eXBlOiBTdWdnZXN0aW9uTGlzdEVsZW1lbnQucHJvdG90eXBlfSk7XG4iXX0=