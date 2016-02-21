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
var DELETE_BUTTON_TITLE_UNDELETABLE = 'Selected item can not be deleted';

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
/* eslint-disable react/prop-types */

var NuclideMutableListSelector = (function (_React$Component) {
  _inherits(NuclideMutableListSelector, _React$Component);

  function NuclideMutableListSelector(props) {
    _classCallCheck(this, NuclideMutableListSelector);

    _get(Object.getPrototypeOf(NuclideMutableListSelector.prototype), 'constructor', this).call(this, props);
    this._boundOnDeleteButtonClicked = this._onDeleteButtonClicked.bind(this);
  }

  /* eslint-enable react/prop-types */

  _createClass(NuclideMutableListSelector, [{
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

  return NuclideMutableListSelector;
})(React.Component);

exports['default'] = NuclideMutableListSelector;
module.exports = exports['default'];

// If null, no item is initially selected.

// Function that is called when the "+" button on the list is clicked.
// The user's intent is to create a new item for the list.

// Function that is called when the "-" button on the list is clicked.
// The user's intent is to delete the currently-selected item.
// If the `idOfCurrentlySelectedItem` is null, this means there is
// no item selected.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVNdXRhYmxlTGlzdFNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2VBV2dCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFBbEMsS0FBSyxZQUFMLEtBQUs7O0FBdUJaLElBQU0sMkJBQTJCLEdBQUcsc0JBQXNCLENBQUM7QUFDM0QsSUFBTSx3QkFBd0IsR0FBRyw0QkFBNEIsQ0FBQztBQUM5RCxJQUFNLCtCQUErQixHQUFHLGtDQUFrQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBa0J0RCwwQkFBMEI7WUFBMUIsMEJBQTBCOztBQUdsQyxXQUhRLDBCQUEwQixDQUdqQyxLQUFZLEVBQUU7MEJBSFAsMEJBQTBCOztBQUkzQywrQkFKaUIsMEJBQTBCLDZDQUlyQyxLQUFLLEVBQUU7QUFDYixRQUFJLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUMzRTs7OztlQU5rQiwwQkFBMEI7O1dBUXZCLGtDQUFHO0FBQ3ZCLFVBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0tBQy9EOzs7V0FFYSx3QkFBQyxNQUFjLEVBQUU7QUFDN0IsVUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDbEM7OztXQUVLLGtCQUFrQjs7O0FBQ3RCLFVBQUksWUFBWSxZQUFBLENBQUM7QUFDakIsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQzdDLFlBQUksT0FBTyxHQUFHLFdBQVcsQ0FBQztBQUMxQixZQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssTUFBSyxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7QUFDM0MsaUJBQU8sSUFBSSxXQUFXLENBQUM7QUFDdkIsc0JBQVksR0FBRyxJQUFJLENBQUM7U0FDckI7QUFDRCxlQUNFOzs7QUFDRSxlQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUUsQUFBQztBQUNiLHFCQUFTLEVBQUUsT0FBTyxBQUFDO0FBQ25CLG1CQUFPLEVBQUUsTUFBSyxjQUFjLENBQUMsSUFBSSxRQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsQUFBQztVQUNoRCxJQUFJLENBQUMsWUFBWTtTQUNmLENBQ0w7T0FDSCxDQUFDLENBQUM7Ozs7QUFJSCxVQUFJLGlCQUFpQixZQUFBLENBQUM7QUFDdEIsVUFBSSxZQUFZLElBQUksSUFBSSxFQUFFO0FBQ3hCLHlCQUFpQixHQUFHLHdCQUF3QixDQUFDO09BQzlDLE1BQU0sSUFBSSxZQUFZLENBQUMsU0FBUyxLQUFLLEtBQUssRUFBRTtBQUMzQyx5QkFBaUIsR0FBRywrQkFBK0IsQ0FBQztPQUNyRCxNQUFNO0FBQ0wseUJBQWlCLEdBQUcsMkJBQTJCLENBQUM7T0FDakQ7O0FBRUQsYUFDRTs7O1FBQ0U7O1lBQUssU0FBUyxFQUFDLG1CQUFtQjtVQUNoQzs7Y0FBSSxTQUFTLEVBQUMsWUFBWTtZQUN2QixTQUFTO1dBQ1A7U0FDRDtRQUNOOztZQUFLLFNBQVMsRUFBQyxZQUFZO1VBQ3pCOztjQUFLLFNBQVMsRUFBQyxXQUFXO1lBQ3hCOzs7QUFDRSx5QkFBUyxFQUFDLEtBQUs7QUFDZix3QkFBUSxFQUFFLFlBQVksSUFBSSxJQUFJLElBQUksWUFBWSxDQUFDLFNBQVMsS0FBSyxLQUFLLEFBQUM7QUFDbkUsdUJBQU8sRUFBRSxJQUFJLENBQUMsMkJBQTJCLEFBQUM7QUFDMUMscUJBQUssRUFBRSxpQkFBaUIsQUFBQzs7YUFFbEI7WUFDVDs7O0FBQ0UseUJBQVMsRUFBQyxLQUFLO0FBQ2YsdUJBQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixBQUFDO0FBQ3ZDLHFCQUFLLEVBQUMsaUJBQWlCOzthQUVoQjtXQUNMO1NBQ0Y7T0FDRixDQUNOO0tBQ0g7OztTQXZFa0IsMEJBQTBCO0dBQVMsS0FBSyxDQUFDLFNBQVM7O3FCQUFsRCwwQkFBMEIiLCJmaWxlIjoiTnVjbGlkZU11dGFibGVMaXN0U2VsZWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxudHlwZSBOdWNsaWRlTGlzdFNlbGVjdG9ySXRlbSA9IHtcbiAgZGVsZXRhYmxlPzogYm9vbGVhbjtcbiAgZGlzcGxheVRpdGxlOiBzdHJpbmc7XG4gIGlkOiBzdHJpbmc7XG59O1xuXG50eXBlIFByb3BzID0ge1xuICBpdGVtczogQXJyYXk8TnVjbGlkZUxpc3RTZWxlY3Rvckl0ZW0+O1xuICAvLyBJZiBudWxsLCBubyBpdGVtIGlzIGluaXRpYWxseSBzZWxlY3RlZC5cbiAgaWRPZlNlbGVjdGVkSXRlbTogP3N0cmluZztcbiAgb25JdGVtQ2xpY2tlZDogKGlkT2ZDbGlja2VkSXRlbTogc3RyaW5nKSA9PiBtaXhlZDtcbiAgLy8gRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgXCIrXCIgYnV0dG9uIG9uIHRoZSBsaXN0IGlzIGNsaWNrZWQuXG4gIC8vIFRoZSB1c2VyJ3MgaW50ZW50IGlzIHRvIGNyZWF0ZSBhIG5ldyBpdGVtIGZvciB0aGUgbGlzdC5cbiAgb25BZGRCdXR0b25DbGlja2VkOiAoKSA9PiBtaXhlZDtcbiAgLy8gRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgXCItXCIgYnV0dG9uIG9uIHRoZSBsaXN0IGlzIGNsaWNrZWQuXG4gIC8vIFRoZSB1c2VyJ3MgaW50ZW50IGlzIHRvIGRlbGV0ZSB0aGUgY3VycmVudGx5LXNlbGVjdGVkIGl0ZW0uXG4gIC8vIElmIHRoZSBgaWRPZkN1cnJlbnRseVNlbGVjdGVkSXRlbWAgaXMgbnVsbCwgdGhpcyBtZWFucyB0aGVyZSBpc1xuICAvLyBubyBpdGVtIHNlbGVjdGVkLlxuICBvbkRlbGV0ZUJ1dHRvbkNsaWNrZWQ6IChpZE9mQ3VycmVudGx5U2VsZWN0ZWRJdGVtOiA/c3RyaW5nKSA9PiBtaXhlZDtcbn07XG5cbmNvbnN0IERFTEVURV9CVVRUT05fVElUTEVfREVGQVVMVCA9ICdEZWxldGUgc2VsZWN0ZWQgaXRlbSc7XG5jb25zdCBERUxFVEVfQlVUVE9OX1RJVExFX05PTkUgPSAnTm8gaXRlbSBzZWxlY3RlZCB0byBkZWxldGUnO1xuY29uc3QgREVMRVRFX0JVVFRPTl9USVRMRV9VTkRFTEVUQUJMRSA9ICdTZWxlY3RlZCBpdGVtIGNhbiBub3QgYmUgZGVsZXRlZCc7XG5cbi8qKlxuICogQSBnZW5lcmljIGNvbXBvbmVudCB0aGF0IGRpc3BsYXlzIHNlbGVjdGFibGUgbGlzdCBpdGVtcywgYW5kIG9mZmVyc1xuICogdGhlIGFiaWxpdHkgdG8gYWRkIGFuZCByZW1vdmUgaXRlbXMuIEl0IGxvb2tzIHJvdWdobHkgbGlrZSB0aGUgZm9sbG93aW5nOlxuICpcbiAqICAgLSAtIC0gLSAtXG4gKiAgfCBJdGVtIDEgIHxcbiAqICB8LS0tLS0tLS0tfFxuICogIHwgSXRlbSAyICB8XG4gKiAgfC0tLS0tLS0tLXxcbiAqICB8ICAgICAgICAgfFxuICogIHwgICAgICAgICB8XG4gKiAgfC0tLS0tLS0tLXxcbiAqICB8ICsgIHwgIC0gfFxuICogICAtLS0tLS0tLS1cbiAqL1xuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTnVjbGlkZU11dGFibGVMaXN0U2VsZWN0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHMsIHZvaWQ+IHtcbiAgX2JvdW5kT25EZWxldGVCdXR0b25DbGlja2VkOiBtaXhlZDtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fYm91bmRPbkRlbGV0ZUJ1dHRvbkNsaWNrZWQgPSB0aGlzLl9vbkRlbGV0ZUJ1dHRvbkNsaWNrZWQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIF9vbkRlbGV0ZUJ1dHRvbkNsaWNrZWQoKSB7XG4gICAgdGhpcy5wcm9wcy5vbkRlbGV0ZUJ1dHRvbkNsaWNrZWQodGhpcy5wcm9wcy5pZE9mU2VsZWN0ZWRJdGVtKTtcbiAgfVxuXG4gIF9vbkl0ZW1DbGlja2VkKGl0ZW1JZDogc3RyaW5nKSB7XG4gICAgdGhpcy5wcm9wcy5vbkl0ZW1DbGlja2VkKGl0ZW1JZCk7XG4gIH1cblxuICByZW5kZXIoKTogP1JlYWN0RWxlbWVudCB7XG4gICAgbGV0IHNlbGVjdGVkSXRlbTtcbiAgICBjb25zdCBsaXN0SXRlbXMgPSB0aGlzLnByb3BzLml0ZW1zLm1hcChpdGVtID0+IHtcbiAgICAgIGxldCBjbGFzc2VzID0gJ2xpc3QtaXRlbSc7XG4gICAgICBpZiAoaXRlbS5pZCA9PT0gdGhpcy5wcm9wcy5pZE9mU2VsZWN0ZWRJdGVtKSB7XG4gICAgICAgIGNsYXNzZXMgKz0gJyBzZWxlY3RlZCc7XG4gICAgICAgIHNlbGVjdGVkSXRlbSA9IGl0ZW07XG4gICAgICB9XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGlcbiAgICAgICAgICBrZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzfVxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uSXRlbUNsaWNrZWQuYmluZCh0aGlzLCBpdGVtLmlkKX0+XG4gICAgICAgICAge2l0ZW0uZGlzcGxheVRpdGxlfVxuICAgICAgICA8L2xpPlxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIC8vIEV4cGxhaW4gd2h5IHRoZSBkZWxldGUgYnV0dG9uIGlzIGRpc2FibGVkIGlmIHRoZSBjdXJyZW50IHNlbGVjdGlvbiwgb3IgbGFjayB0aGVyZW9mLCBpc1xuICAgIC8vIHVuZGVsZXRhYmxlLlxuICAgIGxldCBkZWxldGVCdXR0b25UaXRsZTtcbiAgICBpZiAoc2VsZWN0ZWRJdGVtID09IG51bGwpIHtcbiAgICAgIGRlbGV0ZUJ1dHRvblRpdGxlID0gREVMRVRFX0JVVFRPTl9USVRMRV9OT05FO1xuICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRJdGVtLmRlbGV0YWJsZSA9PT0gZmFsc2UpIHtcbiAgICAgIGRlbGV0ZUJ1dHRvblRpdGxlID0gREVMRVRFX0JVVFRPTl9USVRMRV9VTkRFTEVUQUJMRTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlQnV0dG9uVGl0bGUgPSBERUxFVEVfQlVUVE9OX1RJVExFX0RFRkFVTFQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmxvY2sgc2VsZWN0LWxpc3RcIj5cbiAgICAgICAgICA8b2wgY2xhc3NOYW1lPVwibGlzdC1ncm91cFwiPlxuICAgICAgICAgICAge2xpc3RJdGVtc31cbiAgICAgICAgICA8L29sPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXJpZ2h0XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXBcIj5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuXCJcbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e3NlbGVjdGVkSXRlbSA9PSBudWxsIHx8IHNlbGVjdGVkSXRlbS5kZWxldGFibGUgPT09IGZhbHNlfVxuICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9ib3VuZE9uRGVsZXRlQnV0dG9uQ2xpY2tlZH1cbiAgICAgICAgICAgICAgdGl0bGU9e2RlbGV0ZUJ1dHRvblRpdGxlfT5cbiAgICAgICAgICAgICAgLVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0blwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25BZGRCdXR0b25DbGlja2VkfVxuICAgICAgICAgICAgICB0aXRsZT1cIkNyZWF0ZSBuZXcgaXRlbVwiPlxuICAgICAgICAgICAgICArXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG4vKiBlc2xpbnQtZW5hYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbiJdfQ==