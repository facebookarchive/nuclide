Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('react-for-atom');

var React = _require.React;

var DELETE_BUTTON_TITLE_DEFAULT = 'Delete selected item';
var DELETE_BUTTON_TITLE_NONE = 'No item selected to delete';
var DELETE_BUTTON_TITLE_UNDELETABLE = 'Selected item cannot be deleted';

/**
 * A generic component that displays selectable list items, and offers
 * the ability to add and remove items. It looks roughly like the following:
 *
 *   - - - - -
 *  | Item 1  |
 *  |---------|
 *  | Item 2  |
 *  |---------|
 *  |         |
 *  |         |
 *  |---------|
 *  | +  |  - |
 *   ---------
 */

var MutableListSelector = (function (_React$Component) {
  _inherits(MutableListSelector, _React$Component);

  function MutableListSelector(props) {
    _classCallCheck(this, MutableListSelector);

    _get(Object.getPrototypeOf(MutableListSelector.prototype), 'constructor', this).call(this, props);
    this._boundOnDeleteButtonClicked = this._onDeleteButtonClicked.bind(this);
  }

  _createClass(MutableListSelector, [{
    key: '_onDeleteButtonClicked',
    value: function _onDeleteButtonClicked() {
      this.props.onDeleteButtonClicked(this.props.idOfSelectedItem);
    }
  }, {
    key: '_onItemClicked',
    value: function _onItemClicked(itemId) {
      this.props.onItemClicked(itemId);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var selectedItem = undefined;
      var listItems = this.props.items.map(function (item) {
        var classes = 'list-item';
        if (item.id === _this.props.idOfSelectedItem) {
          classes += ' selected';
          selectedItem = item;
        }
        return React.createElement(
          'li',
          {
            key: item.id,
            className: classes,
            onClick: _this._onItemClicked.bind(_this, item.id) },
          item.displayTitle
        );
      });

      // Explain why the delete button is disabled if the current selection, or lack thereof, is
      // undeletable.
      var deleteButtonTitle = undefined;
      if (selectedItem == null) {
        deleteButtonTitle = DELETE_BUTTON_TITLE_NONE;
      } else if (selectedItem.deletable === false) {
        deleteButtonTitle = DELETE_BUTTON_TITLE_UNDELETABLE;
      } else {
        deleteButtonTitle = DELETE_BUTTON_TITLE_DEFAULT;
      }

      return React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { className: 'block select-list' },
          React.createElement(
            'ol',
            { className: 'list-group' },
            listItems
          )
        ),
        React.createElement(
          'div',
          { className: 'text-right' },
          React.createElement(
            'div',
            { className: 'btn-group' },
            React.createElement(
              'button',
              {
                className: 'btn',
                disabled: selectedItem == null || selectedItem.deletable === false,
                onClick: this._boundOnDeleteButtonClicked,
                title: deleteButtonTitle },
              '-'
            ),
            React.createElement(
              'button',
              {
                className: 'btn',
                onClick: this.props.onAddButtonClicked,
                title: 'Create new item' },
              '+'
            )
          )
        )
      );
    }
  }]);

  return MutableListSelector;
})(React.Component);

exports.MutableListSelector = MutableListSelector;

// If null, no item is initially selected.

// Function that is called when the "+" button on the list is clicked.
// The user's intent is to create a new item for the list.

// Function that is called when the "-" button on the list is clicked.
// The user's intent is to delete the currently-selected item.
// If the `idOfCurrentlySelectedItem` is null, this means there is
// no item selected.
//# sourceMappingURL=data:application/json;base64,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dGFibGVMaXN0U2VsZWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxudHlwZSBOdWNsaWRlTGlzdFNlbGVjdG9ySXRlbSA9IHtcbiAgZGVsZXRhYmxlPzogYm9vbGVhbjtcbiAgZGlzcGxheVRpdGxlOiBzdHJpbmc7XG4gIGlkOiBzdHJpbmc7XG59O1xuXG50eXBlIFByb3BzID0ge1xuICBpdGVtczogQXJyYXk8TnVjbGlkZUxpc3RTZWxlY3Rvckl0ZW0+O1xuICAvLyBJZiBudWxsLCBubyBpdGVtIGlzIGluaXRpYWxseSBzZWxlY3RlZC5cbiAgaWRPZlNlbGVjdGVkSXRlbTogP3N0cmluZztcbiAgb25JdGVtQ2xpY2tlZDogKGlkT2ZDbGlja2VkSXRlbTogc3RyaW5nKSA9PiBtaXhlZDtcbiAgLy8gRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgXCIrXCIgYnV0dG9uIG9uIHRoZSBsaXN0IGlzIGNsaWNrZWQuXG4gIC8vIFRoZSB1c2VyJ3MgaW50ZW50IGlzIHRvIGNyZWF0ZSBhIG5ldyBpdGVtIGZvciB0aGUgbGlzdC5cbiAgb25BZGRCdXR0b25DbGlja2VkOiAoKSA9PiBtaXhlZDtcbiAgLy8gRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgXCItXCIgYnV0dG9uIG9uIHRoZSBsaXN0IGlzIGNsaWNrZWQuXG4gIC8vIFRoZSB1c2VyJ3MgaW50ZW50IGlzIHRvIGRlbGV0ZSB0aGUgY3VycmVudGx5LXNlbGVjdGVkIGl0ZW0uXG4gIC8vIElmIHRoZSBgaWRPZkN1cnJlbnRseVNlbGVjdGVkSXRlbWAgaXMgbnVsbCwgdGhpcyBtZWFucyB0aGVyZSBpc1xuICAvLyBubyBpdGVtIHNlbGVjdGVkLlxuICBvbkRlbGV0ZUJ1dHRvbkNsaWNrZWQ6IChpZE9mQ3VycmVudGx5U2VsZWN0ZWRJdGVtOiA/c3RyaW5nKSA9PiBtaXhlZDtcbn07XG5cbmNvbnN0IERFTEVURV9CVVRUT05fVElUTEVfREVGQVVMVCA9ICdEZWxldGUgc2VsZWN0ZWQgaXRlbSc7XG5jb25zdCBERUxFVEVfQlVUVE9OX1RJVExFX05PTkUgPSAnTm8gaXRlbSBzZWxlY3RlZCB0byBkZWxldGUnO1xuY29uc3QgREVMRVRFX0JVVFRPTl9USVRMRV9VTkRFTEVUQUJMRSA9ICdTZWxlY3RlZCBpdGVtIGNhbm5vdCBiZSBkZWxldGVkJztcblxuLyoqXG4gKiBBIGdlbmVyaWMgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgc2VsZWN0YWJsZSBsaXN0IGl0ZW1zLCBhbmQgb2ZmZXJzXG4gKiB0aGUgYWJpbGl0eSB0byBhZGQgYW5kIHJlbW92ZSBpdGVtcy4gSXQgbG9va3Mgcm91Z2hseSBsaWtlIHRoZSBmb2xsb3dpbmc6XG4gKlxuICogICAtIC0gLSAtIC1cbiAqICB8IEl0ZW0gMSAgfFxuICogIHwtLS0tLS0tLS18XG4gKiAgfCBJdGVtIDIgIHxcbiAqICB8LS0tLS0tLS0tfFxuICogIHwgICAgICAgICB8XG4gKiAgfCAgICAgICAgIHxcbiAqICB8LS0tLS0tLS0tfFxuICogIHwgKyAgfCAgLSB8XG4gKiAgIC0tLS0tLS0tLVxuICovXG5leHBvcnQgY2xhc3MgTXV0YWJsZUxpc3RTZWxlY3RvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx2b2lkLCBQcm9wcywgdm9pZD4ge1xuICBwcm9wczogUHJvcHM7XG5cbiAgX2JvdW5kT25EZWxldGVCdXR0b25DbGlja2VkOiBtaXhlZDtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fYm91bmRPbkRlbGV0ZUJ1dHRvbkNsaWNrZWQgPSB0aGlzLl9vbkRlbGV0ZUJ1dHRvbkNsaWNrZWQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIF9vbkRlbGV0ZUJ1dHRvbkNsaWNrZWQoKSB7XG4gICAgdGhpcy5wcm9wcy5vbkRlbGV0ZUJ1dHRvbkNsaWNrZWQodGhpcy5wcm9wcy5pZE9mU2VsZWN0ZWRJdGVtKTtcbiAgfVxuXG4gIF9vbkl0ZW1DbGlja2VkKGl0ZW1JZDogc3RyaW5nKSB7XG4gICAgdGhpcy5wcm9wcy5vbkl0ZW1DbGlja2VkKGl0ZW1JZCk7XG4gIH1cblxuICByZW5kZXIoKTogP1JlYWN0RWxlbWVudCB7XG4gICAgbGV0IHNlbGVjdGVkSXRlbTtcbiAgICBjb25zdCBsaXN0SXRlbXMgPSB0aGlzLnByb3BzLml0ZW1zLm1hcChpdGVtID0+IHtcbiAgICAgIGxldCBjbGFzc2VzID0gJ2xpc3QtaXRlbSc7XG4gICAgICBpZiAoaXRlbS5pZCA9PT0gdGhpcy5wcm9wcy5pZE9mU2VsZWN0ZWRJdGVtKSB7XG4gICAgICAgIGNsYXNzZXMgKz0gJyBzZWxlY3RlZCc7XG4gICAgICAgIHNlbGVjdGVkSXRlbSA9IGl0ZW07XG4gICAgICB9XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGlcbiAgICAgICAgICBrZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzfVxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uSXRlbUNsaWNrZWQuYmluZCh0aGlzLCBpdGVtLmlkKX0+XG4gICAgICAgICAge2l0ZW0uZGlzcGxheVRpdGxlfVxuICAgICAgICA8L2xpPlxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIC8vIEV4cGxhaW4gd2h5IHRoZSBkZWxldGUgYnV0dG9uIGlzIGRpc2FibGVkIGlmIHRoZSBjdXJyZW50IHNlbGVjdGlvbiwgb3IgbGFjayB0aGVyZW9mLCBpc1xuICAgIC8vIHVuZGVsZXRhYmxlLlxuICAgIGxldCBkZWxldGVCdXR0b25UaXRsZTtcbiAgICBpZiAoc2VsZWN0ZWRJdGVtID09IG51bGwpIHtcbiAgICAgIGRlbGV0ZUJ1dHRvblRpdGxlID0gREVMRVRFX0JVVFRPTl9USVRMRV9OT05FO1xuICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRJdGVtLmRlbGV0YWJsZSA9PT0gZmFsc2UpIHtcbiAgICAgIGRlbGV0ZUJ1dHRvblRpdGxlID0gREVMRVRFX0JVVFRPTl9USVRMRV9VTkRFTEVUQUJMRTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlQnV0dG9uVGl0bGUgPSBERUxFVEVfQlVUVE9OX1RJVExFX0RFRkFVTFQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmxvY2sgc2VsZWN0LWxpc3RcIj5cbiAgICAgICAgICA8b2wgY2xhc3NOYW1lPVwibGlzdC1ncm91cFwiPlxuICAgICAgICAgICAge2xpc3RJdGVtc31cbiAgICAgICAgICA8L29sPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXJpZ2h0XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXBcIj5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuXCJcbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e3NlbGVjdGVkSXRlbSA9PSBudWxsIHx8IHNlbGVjdGVkSXRlbS5kZWxldGFibGUgPT09IGZhbHNlfVxuICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9ib3VuZE9uRGVsZXRlQnV0dG9uQ2xpY2tlZH1cbiAgICAgICAgICAgICAgdGl0bGU9e2RlbGV0ZUJ1dHRvblRpdGxlfT5cbiAgICAgICAgICAgICAgLVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0blwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25BZGRCdXR0b25DbGlja2VkfVxuICAgICAgICAgICAgICB0aXRsZT1cIkNyZWF0ZSBuZXcgaXRlbVwiPlxuICAgICAgICAgICAgICArXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG4iXX0=