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

var NuclideMutableListSelector = (function (_React$Component) {
  _inherits(NuclideMutableListSelector, _React$Component);

  function NuclideMutableListSelector(props) {
    _classCallCheck(this, NuclideMutableListSelector);

    _get(Object.getPrototypeOf(NuclideMutableListSelector.prototype), 'constructor', this).call(this, props);
    this._boundOnDeleteButtonClicked = this._onDeleteButtonClicked.bind(this);
  }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVNdXRhYmxlTGlzdFNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2VBV2dCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFBbEMsS0FBSyxZQUFMLEtBQUs7O0FBdUJaLElBQU0sMkJBQTJCLEdBQUcsc0JBQXNCLENBQUM7QUFDM0QsSUFBTSx3QkFBd0IsR0FBRyw0QkFBNEIsQ0FBQztBQUM5RCxJQUFNLCtCQUErQixHQUFHLGtDQUFrQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFpQnRELDBCQUEwQjtZQUExQiwwQkFBMEI7O0FBS2xDLFdBTFEsMEJBQTBCLENBS2pDLEtBQVksRUFBRTswQkFMUCwwQkFBMEI7O0FBTTNDLCtCQU5pQiwwQkFBMEIsNkNBTXJDLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQywyQkFBMkIsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzNFOztlQVJrQiwwQkFBMEI7O1dBVXZCLGtDQUFHO0FBQ3ZCLFVBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0tBQy9EOzs7V0FFYSx3QkFBQyxNQUFjLEVBQUU7QUFDN0IsVUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDbEM7OztXQUVLLGtCQUFrQjs7O0FBQ3RCLFVBQUksWUFBWSxZQUFBLENBQUM7QUFDakIsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQzdDLFlBQUksT0FBTyxHQUFHLFdBQVcsQ0FBQztBQUMxQixZQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssTUFBSyxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7QUFDM0MsaUJBQU8sSUFBSSxXQUFXLENBQUM7QUFDdkIsc0JBQVksR0FBRyxJQUFJLENBQUM7U0FDckI7QUFDRCxlQUNFOzs7QUFDRSxlQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUUsQUFBQztBQUNiLHFCQUFTLEVBQUUsT0FBTyxBQUFDO0FBQ25CLG1CQUFPLEVBQUUsTUFBSyxjQUFjLENBQUMsSUFBSSxRQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsQUFBQztVQUNoRCxJQUFJLENBQUMsWUFBWTtTQUNmLENBQ0w7T0FDSCxDQUFDLENBQUM7Ozs7QUFJSCxVQUFJLGlCQUFpQixZQUFBLENBQUM7QUFDdEIsVUFBSSxZQUFZLElBQUksSUFBSSxFQUFFO0FBQ3hCLHlCQUFpQixHQUFHLHdCQUF3QixDQUFDO09BQzlDLE1BQU0sSUFBSSxZQUFZLENBQUMsU0FBUyxLQUFLLEtBQUssRUFBRTtBQUMzQyx5QkFBaUIsR0FBRywrQkFBK0IsQ0FBQztPQUNyRCxNQUFNO0FBQ0wseUJBQWlCLEdBQUcsMkJBQTJCLENBQUM7T0FDakQ7O0FBRUQsYUFDRTs7O1FBQ0U7O1lBQUssU0FBUyxFQUFDLG1CQUFtQjtVQUNoQzs7Y0FBSSxTQUFTLEVBQUMsWUFBWTtZQUN2QixTQUFTO1dBQ1A7U0FDRDtRQUNOOztZQUFLLFNBQVMsRUFBQyxZQUFZO1VBQ3pCOztjQUFLLFNBQVMsRUFBQyxXQUFXO1lBQ3hCOzs7QUFDRSx5QkFBUyxFQUFDLEtBQUs7QUFDZix3QkFBUSxFQUFFLFlBQVksSUFBSSxJQUFJLElBQUksWUFBWSxDQUFDLFNBQVMsS0FBSyxLQUFLLEFBQUM7QUFDbkUsdUJBQU8sRUFBRSxJQUFJLENBQUMsMkJBQTJCLEFBQUM7QUFDMUMscUJBQUssRUFBRSxpQkFBaUIsQUFBQzs7YUFFbEI7WUFDVDs7O0FBQ0UseUJBQVMsRUFBQyxLQUFLO0FBQ2YsdUJBQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixBQUFDO0FBQ3ZDLHFCQUFLLEVBQUMsaUJBQWlCOzthQUVoQjtXQUNMO1NBQ0Y7T0FDRixDQUNOO0tBQ0g7OztTQXpFa0IsMEJBQTBCO0dBQVMsS0FBSyxDQUFDLFNBQVM7O3FCQUFsRCwwQkFBMEIiLCJmaWxlIjoiTnVjbGlkZU11dGFibGVMaXN0U2VsZWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxudHlwZSBOdWNsaWRlTGlzdFNlbGVjdG9ySXRlbSA9IHtcbiAgZGVsZXRhYmxlPzogYm9vbGVhbjtcbiAgZGlzcGxheVRpdGxlOiBzdHJpbmc7XG4gIGlkOiBzdHJpbmc7XG59O1xuXG50eXBlIFByb3BzID0ge1xuICBpdGVtczogQXJyYXk8TnVjbGlkZUxpc3RTZWxlY3Rvckl0ZW0+O1xuICAvLyBJZiBudWxsLCBubyBpdGVtIGlzIGluaXRpYWxseSBzZWxlY3RlZC5cbiAgaWRPZlNlbGVjdGVkSXRlbTogP3N0cmluZztcbiAgb25JdGVtQ2xpY2tlZDogKGlkT2ZDbGlja2VkSXRlbTogc3RyaW5nKSA9PiBtaXhlZDtcbiAgLy8gRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgXCIrXCIgYnV0dG9uIG9uIHRoZSBsaXN0IGlzIGNsaWNrZWQuXG4gIC8vIFRoZSB1c2VyJ3MgaW50ZW50IGlzIHRvIGNyZWF0ZSBhIG5ldyBpdGVtIGZvciB0aGUgbGlzdC5cbiAgb25BZGRCdXR0b25DbGlja2VkOiAoKSA9PiBtaXhlZDtcbiAgLy8gRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgXCItXCIgYnV0dG9uIG9uIHRoZSBsaXN0IGlzIGNsaWNrZWQuXG4gIC8vIFRoZSB1c2VyJ3MgaW50ZW50IGlzIHRvIGRlbGV0ZSB0aGUgY3VycmVudGx5LXNlbGVjdGVkIGl0ZW0uXG4gIC8vIElmIHRoZSBgaWRPZkN1cnJlbnRseVNlbGVjdGVkSXRlbWAgaXMgbnVsbCwgdGhpcyBtZWFucyB0aGVyZSBpc1xuICAvLyBubyBpdGVtIHNlbGVjdGVkLlxuICBvbkRlbGV0ZUJ1dHRvbkNsaWNrZWQ6IChpZE9mQ3VycmVudGx5U2VsZWN0ZWRJdGVtOiA/c3RyaW5nKSA9PiBtaXhlZDtcbn07XG5cbmNvbnN0IERFTEVURV9CVVRUT05fVElUTEVfREVGQVVMVCA9ICdEZWxldGUgc2VsZWN0ZWQgaXRlbSc7XG5jb25zdCBERUxFVEVfQlVUVE9OX1RJVExFX05PTkUgPSAnTm8gaXRlbSBzZWxlY3RlZCB0byBkZWxldGUnO1xuY29uc3QgREVMRVRFX0JVVFRPTl9USVRMRV9VTkRFTEVUQUJMRSA9ICdTZWxlY3RlZCBpdGVtIGNhbiBub3QgYmUgZGVsZXRlZCc7XG5cbi8qKlxuICogQSBnZW5lcmljIGNvbXBvbmVudCB0aGF0IGRpc3BsYXlzIHNlbGVjdGFibGUgbGlzdCBpdGVtcywgYW5kIG9mZmVyc1xuICogdGhlIGFiaWxpdHkgdG8gYWRkIGFuZCByZW1vdmUgaXRlbXMuIEl0IGxvb2tzIHJvdWdobHkgbGlrZSB0aGUgZm9sbG93aW5nOlxuICpcbiAqICAgLSAtIC0gLSAtXG4gKiAgfCBJdGVtIDEgIHxcbiAqICB8LS0tLS0tLS0tfFxuICogIHwgSXRlbSAyICB8XG4gKiAgfC0tLS0tLS0tLXxcbiAqICB8ICAgICAgICAgfFxuICogIHwgICAgICAgICB8XG4gKiAgfC0tLS0tLS0tLXxcbiAqICB8ICsgIHwgIC0gfFxuICogICAtLS0tLS0tLS1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTnVjbGlkZU11dGFibGVMaXN0U2VsZWN0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHMsIHZvaWQ+IHtcbiAgcHJvcHM6IFByb3BzO1xuXG4gIF9ib3VuZE9uRGVsZXRlQnV0dG9uQ2xpY2tlZDogbWl4ZWQ7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX2JvdW5kT25EZWxldGVCdXR0b25DbGlja2VkID0gdGhpcy5fb25EZWxldGVCdXR0b25DbGlja2VkLmJpbmQodGhpcyk7XG4gIH1cblxuICBfb25EZWxldGVCdXR0b25DbGlja2VkKCkge1xuICAgIHRoaXMucHJvcHMub25EZWxldGVCdXR0b25DbGlja2VkKHRoaXMucHJvcHMuaWRPZlNlbGVjdGVkSXRlbSk7XG4gIH1cblxuICBfb25JdGVtQ2xpY2tlZChpdGVtSWQ6IHN0cmluZykge1xuICAgIHRoaXMucHJvcHMub25JdGVtQ2xpY2tlZChpdGVtSWQpO1xuICB9XG5cbiAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIGxldCBzZWxlY3RlZEl0ZW07XG4gICAgY29uc3QgbGlzdEl0ZW1zID0gdGhpcy5wcm9wcy5pdGVtcy5tYXAoaXRlbSA9PiB7XG4gICAgICBsZXQgY2xhc3NlcyA9ICdsaXN0LWl0ZW0nO1xuICAgICAgaWYgKGl0ZW0uaWQgPT09IHRoaXMucHJvcHMuaWRPZlNlbGVjdGVkSXRlbSkge1xuICAgICAgICBjbGFzc2VzICs9ICcgc2VsZWN0ZWQnO1xuICAgICAgICBzZWxlY3RlZEl0ZW0gPSBpdGVtO1xuICAgICAgfVxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGxpXG4gICAgICAgICAga2V5PXtpdGVtLmlkfVxuICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlc31cbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkl0ZW1DbGlja2VkLmJpbmQodGhpcywgaXRlbS5pZCl9PlxuICAgICAgICAgIHtpdGVtLmRpc3BsYXlUaXRsZX1cbiAgICAgICAgPC9saT5cbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICAvLyBFeHBsYWluIHdoeSB0aGUgZGVsZXRlIGJ1dHRvbiBpcyBkaXNhYmxlZCBpZiB0aGUgY3VycmVudCBzZWxlY3Rpb24sIG9yIGxhY2sgdGhlcmVvZiwgaXNcbiAgICAvLyB1bmRlbGV0YWJsZS5cbiAgICBsZXQgZGVsZXRlQnV0dG9uVGl0bGU7XG4gICAgaWYgKHNlbGVjdGVkSXRlbSA9PSBudWxsKSB7XG4gICAgICBkZWxldGVCdXR0b25UaXRsZSA9IERFTEVURV9CVVRUT05fVElUTEVfTk9ORTtcbiAgICB9IGVsc2UgaWYgKHNlbGVjdGVkSXRlbS5kZWxldGFibGUgPT09IGZhbHNlKSB7XG4gICAgICBkZWxldGVCdXR0b25UaXRsZSA9IERFTEVURV9CVVRUT05fVElUTEVfVU5ERUxFVEFCTEU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZUJ1dHRvblRpdGxlID0gREVMRVRFX0JVVFRPTl9USVRMRV9ERUZBVUxUO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJsb2NrIHNlbGVjdC1saXN0XCI+XG4gICAgICAgICAgPG9sIGNsYXNzTmFtZT1cImxpc3QtZ3JvdXBcIj5cbiAgICAgICAgICAgIHtsaXN0SXRlbXN9XG4gICAgICAgICAgPC9vbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1yaWdodFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwXCI+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0blwiXG4gICAgICAgICAgICAgIGRpc2FibGVkPXtzZWxlY3RlZEl0ZW0gPT0gbnVsbCB8fCBzZWxlY3RlZEl0ZW0uZGVsZXRhYmxlID09PSBmYWxzZX1cbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fYm91bmRPbkRlbGV0ZUJ1dHRvbkNsaWNrZWR9XG4gICAgICAgICAgICAgIHRpdGxlPXtkZWxldGVCdXR0b25UaXRsZX0+XG4gICAgICAgICAgICAgIC1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG5cIlxuICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQWRkQnV0dG9uQ2xpY2tlZH1cbiAgICAgICAgICAgICAgdGl0bGU9XCJDcmVhdGUgbmV3IGl0ZW1cIj5cbiAgICAgICAgICAgICAgK1xuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuIl19