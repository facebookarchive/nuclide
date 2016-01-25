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

var React = require('react-for-atom');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVNdXRhYmxlTGlzdFNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBV0EsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7O0FBdUJ4QyxJQUFNLDJCQUEyQixHQUFHLHNCQUFzQixDQUFDO0FBQzNELElBQU0sd0JBQXdCLEdBQUcsNEJBQTRCLENBQUM7QUFDOUQsSUFBTSwrQkFBK0IsR0FBRyxrQ0FBa0MsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWtCdEQsMEJBQTBCO1lBQTFCLDBCQUEwQjs7QUFHbEMsV0FIUSwwQkFBMEIsQ0FHakMsS0FBWSxFQUFFOzBCQUhQLDBCQUEwQjs7QUFJM0MsK0JBSmlCLDBCQUEwQiw2Q0FJckMsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLDJCQUEyQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDM0U7Ozs7ZUFOa0IsMEJBQTBCOztXQVF2QixrQ0FBRztBQUN2QixVQUFJLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUMvRDs7O1dBRWEsd0JBQUMsTUFBYyxFQUFFO0FBQzdCLFVBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ2xDOzs7V0FFSyxrQkFBa0I7OztBQUN0QixVQUFJLFlBQVksWUFBQSxDQUFDO0FBQ2pCLFVBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUksRUFBSTtBQUM3QyxZQUFJLE9BQU8sR0FBRyxXQUFXLENBQUM7QUFDMUIsWUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLE1BQUssS0FBSyxDQUFDLGdCQUFnQixFQUFFO0FBQzNDLGlCQUFPLElBQUksV0FBVyxDQUFDO0FBQ3ZCLHNCQUFZLEdBQUcsSUFBSSxDQUFDO1NBQ3JCO0FBQ0QsZUFDRTs7O0FBQ0UsZUFBRyxFQUFFLElBQUksQ0FBQyxFQUFFLEFBQUM7QUFDYixxQkFBUyxFQUFFLE9BQU8sQUFBQztBQUNuQixtQkFBTyxFQUFFLE1BQUssY0FBYyxDQUFDLElBQUksUUFBTyxJQUFJLENBQUMsRUFBRSxDQUFDLEFBQUM7VUFDaEQsSUFBSSxDQUFDLFlBQVk7U0FDZixDQUNMO09BQ0gsQ0FBQyxDQUFDOzs7O0FBSUgsVUFBSSxpQkFBaUIsWUFBQSxDQUFDO0FBQ3RCLFVBQUksWUFBWSxJQUFJLElBQUksRUFBRTtBQUN4Qix5QkFBaUIsR0FBRyx3QkFBd0IsQ0FBQztPQUM5QyxNQUFNLElBQUksWUFBWSxDQUFDLFNBQVMsS0FBSyxLQUFLLEVBQUU7QUFDM0MseUJBQWlCLEdBQUcsK0JBQStCLENBQUM7T0FDckQsTUFBTTtBQUNMLHlCQUFpQixHQUFHLDJCQUEyQixDQUFDO09BQ2pEOztBQUVELGFBQ0U7OztRQUNFOztZQUFLLFNBQVMsRUFBQyxtQkFBbUI7VUFDaEM7O2NBQUksU0FBUyxFQUFDLFlBQVk7WUFDdkIsU0FBUztXQUNQO1NBQ0Q7UUFDTjs7WUFBSyxTQUFTLEVBQUMsWUFBWTtVQUN6Qjs7Y0FBSyxTQUFTLEVBQUMsV0FBVztZQUN4Qjs7O0FBQ0UseUJBQVMsRUFBQyxLQUFLO0FBQ2Ysd0JBQVEsRUFBRSxZQUFZLElBQUksSUFBSSxJQUFJLFlBQVksQ0FBQyxTQUFTLEtBQUssS0FBSyxBQUFDO0FBQ25FLHVCQUFPLEVBQUUsSUFBSSxDQUFDLDJCQUEyQixBQUFDO0FBQzFDLHFCQUFLLEVBQUUsaUJBQWlCLEFBQUM7O2FBRWxCO1lBQ1Q7OztBQUNFLHlCQUFTLEVBQUMsS0FBSztBQUNmLHVCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQUFBQztBQUN2QyxxQkFBSyxFQUFDLGlCQUFpQjs7YUFFaEI7V0FDTDtTQUNGO09BQ0YsQ0FDTjtLQUNIOzs7U0F2RWtCLDBCQUEwQjtHQUFTLEtBQUssQ0FBQyxTQUFTOztxQkFBbEQsMEJBQTBCIiwiZmlsZSI6Ik51Y2xpZGVNdXRhYmxlTGlzdFNlbGVjdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG50eXBlIE51Y2xpZGVMaXN0U2VsZWN0b3JJdGVtID0ge1xuICBkZWxldGFibGU/OiBib29sZWFuO1xuICBkaXNwbGF5VGl0bGU6IHN0cmluZztcbiAgaWQ6IHN0cmluZztcbn07XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGl0ZW1zOiBBcnJheTxOdWNsaWRlTGlzdFNlbGVjdG9ySXRlbT47XG4gIC8vIElmIG51bGwsIG5vIGl0ZW0gaXMgaW5pdGlhbGx5IHNlbGVjdGVkLlxuICBpZE9mU2VsZWN0ZWRJdGVtOiA/c3RyaW5nO1xuICBvbkl0ZW1DbGlja2VkOiAoaWRPZkNsaWNrZWRJdGVtOiBzdHJpbmcpID0+IG1peGVkO1xuICAvLyBGdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBcIitcIiBidXR0b24gb24gdGhlIGxpc3QgaXMgY2xpY2tlZC5cbiAgLy8gVGhlIHVzZXIncyBpbnRlbnQgaXMgdG8gY3JlYXRlIGEgbmV3IGl0ZW0gZm9yIHRoZSBsaXN0LlxuICBvbkFkZEJ1dHRvbkNsaWNrZWQ6ICgpID0+IG1peGVkO1xuICAvLyBGdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBcIi1cIiBidXR0b24gb24gdGhlIGxpc3QgaXMgY2xpY2tlZC5cbiAgLy8gVGhlIHVzZXIncyBpbnRlbnQgaXMgdG8gZGVsZXRlIHRoZSBjdXJyZW50bHktc2VsZWN0ZWQgaXRlbS5cbiAgLy8gSWYgdGhlIGBpZE9mQ3VycmVudGx5U2VsZWN0ZWRJdGVtYCBpcyBudWxsLCB0aGlzIG1lYW5zIHRoZXJlIGlzXG4gIC8vIG5vIGl0ZW0gc2VsZWN0ZWQuXG4gIG9uRGVsZXRlQnV0dG9uQ2xpY2tlZDogKGlkT2ZDdXJyZW50bHlTZWxlY3RlZEl0ZW06ID9zdHJpbmcpID0+IG1peGVkO1xufTtcblxuY29uc3QgREVMRVRFX0JVVFRPTl9USVRMRV9ERUZBVUxUID0gJ0RlbGV0ZSBzZWxlY3RlZCBpdGVtJztcbmNvbnN0IERFTEVURV9CVVRUT05fVElUTEVfTk9ORSA9ICdObyBpdGVtIHNlbGVjdGVkIHRvIGRlbGV0ZSc7XG5jb25zdCBERUxFVEVfQlVUVE9OX1RJVExFX1VOREVMRVRBQkxFID0gJ1NlbGVjdGVkIGl0ZW0gY2FuIG5vdCBiZSBkZWxldGVkJztcblxuLyoqXG4gKiBBIGdlbmVyaWMgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgc2VsZWN0YWJsZSBsaXN0IGl0ZW1zLCBhbmQgb2ZmZXJzXG4gKiB0aGUgYWJpbGl0eSB0byBhZGQgYW5kIHJlbW92ZSBpdGVtcy4gSXQgbG9va3Mgcm91Z2hseSBsaWtlIHRoZSBmb2xsb3dpbmc6XG4gKlxuICogICAtIC0gLSAtIC1cbiAqICB8IEl0ZW0gMSAgfFxuICogIHwtLS0tLS0tLS18XG4gKiAgfCBJdGVtIDIgIHxcbiAqICB8LS0tLS0tLS0tfFxuICogIHwgICAgICAgICB8XG4gKiAgfCAgICAgICAgIHxcbiAqICB8LS0tLS0tLS0tfFxuICogIHwgKyAgfCAgLSB8XG4gKiAgIC0tLS0tLS0tLVxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOdWNsaWRlTXV0YWJsZUxpc3RTZWxlY3RvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx2b2lkLCBQcm9wcywgdm9pZD4ge1xuICBfYm91bmRPbkRlbGV0ZUJ1dHRvbkNsaWNrZWQ6IG1peGVkO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9ib3VuZE9uRGVsZXRlQnV0dG9uQ2xpY2tlZCA9IHRoaXMuX29uRGVsZXRlQnV0dG9uQ2xpY2tlZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgX29uRGVsZXRlQnV0dG9uQ2xpY2tlZCgpIHtcbiAgICB0aGlzLnByb3BzLm9uRGVsZXRlQnV0dG9uQ2xpY2tlZCh0aGlzLnByb3BzLmlkT2ZTZWxlY3RlZEl0ZW0pO1xuICB9XG5cbiAgX29uSXRlbUNsaWNrZWQoaXRlbUlkOiBzdHJpbmcpIHtcbiAgICB0aGlzLnByb3BzLm9uSXRlbUNsaWNrZWQoaXRlbUlkKTtcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICBsZXQgc2VsZWN0ZWRJdGVtO1xuICAgIGNvbnN0IGxpc3RJdGVtcyA9IHRoaXMucHJvcHMuaXRlbXMubWFwKGl0ZW0gPT4ge1xuICAgICAgbGV0IGNsYXNzZXMgPSAnbGlzdC1pdGVtJztcbiAgICAgIGlmIChpdGVtLmlkID09PSB0aGlzLnByb3BzLmlkT2ZTZWxlY3RlZEl0ZW0pIHtcbiAgICAgICAgY2xhc3NlcyArPSAnIHNlbGVjdGVkJztcbiAgICAgICAgc2VsZWN0ZWRJdGVtID0gaXRlbTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaVxuICAgICAgICAgIGtleT17aXRlbS5pZH1cbiAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXN9XG4gICAgICAgICAgb25DbGljaz17dGhpcy5fb25JdGVtQ2xpY2tlZC5iaW5kKHRoaXMsIGl0ZW0uaWQpfT5cbiAgICAgICAgICB7aXRlbS5kaXNwbGF5VGl0bGV9XG4gICAgICAgIDwvbGk+XG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgLy8gRXhwbGFpbiB3aHkgdGhlIGRlbGV0ZSBidXR0b24gaXMgZGlzYWJsZWQgaWYgdGhlIGN1cnJlbnQgc2VsZWN0aW9uLCBvciBsYWNrIHRoZXJlb2YsIGlzXG4gICAgLy8gdW5kZWxldGFibGUuXG4gICAgbGV0IGRlbGV0ZUJ1dHRvblRpdGxlO1xuICAgIGlmIChzZWxlY3RlZEl0ZW0gPT0gbnVsbCkge1xuICAgICAgZGVsZXRlQnV0dG9uVGl0bGUgPSBERUxFVEVfQlVUVE9OX1RJVExFX05PTkU7XG4gICAgfSBlbHNlIGlmIChzZWxlY3RlZEl0ZW0uZGVsZXRhYmxlID09PSBmYWxzZSkge1xuICAgICAgZGVsZXRlQnV0dG9uVGl0bGUgPSBERUxFVEVfQlVUVE9OX1RJVExFX1VOREVMRVRBQkxFO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGVCdXR0b25UaXRsZSA9IERFTEVURV9CVVRUT05fVElUTEVfREVGQVVMVDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJibG9jayBzZWxlY3QtbGlzdFwiPlxuICAgICAgICAgIDxvbCBjbGFzc05hbWU9XCJsaXN0LWdyb3VwXCI+XG4gICAgICAgICAgICB7bGlzdEl0ZW1zfVxuICAgICAgICAgIDwvb2w+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtcmlnaHRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ0bi1ncm91cFwiPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG5cIlxuICAgICAgICAgICAgICBkaXNhYmxlZD17c2VsZWN0ZWRJdGVtID09IG51bGwgfHwgc2VsZWN0ZWRJdGVtLmRlbGV0YWJsZSA9PT0gZmFsc2V9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2JvdW5kT25EZWxldGVCdXR0b25DbGlja2VkfVxuICAgICAgICAgICAgICB0aXRsZT17ZGVsZXRlQnV0dG9uVGl0bGV9PlxuICAgICAgICAgICAgICAtXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuXCJcbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkFkZEJ1dHRvbkNsaWNrZWR9XG4gICAgICAgICAgICAgIHRpdGxlPVwiQ3JlYXRlIG5ldyBpdGVtXCI+XG4gICAgICAgICAgICAgICtcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cbi8qIGVzbGludC1lbmFibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuIl19