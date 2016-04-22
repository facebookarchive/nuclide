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

var _reactForAtom = require('react-for-atom');

var _Button = require('./Button');

var _ButtonGroup = require('./ButtonGroup');

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
        return _reactForAtom.React.createElement(
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

      return _reactForAtom.React.createElement(
        'div',
        null,
        _reactForAtom.React.createElement(
          'div',
          { className: 'block select-list' },
          _reactForAtom.React.createElement(
            'ol',
            { className: 'list-group' },
            listItems
          )
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'text-right' },
          _reactForAtom.React.createElement(
            _ButtonGroup.ButtonGroup,
            null,
            _reactForAtom.React.createElement(
              _Button.Button,
              {
                disabled: selectedItem == null || selectedItem.deletable === false,
                onClick: this._boundOnDeleteButtonClicked,
                title: deleteButtonTitle },
              '-'
            ),
            _reactForAtom.React.createElement(
              _Button.Button,
              {
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
})(_reactForAtom.React.Component);

exports.MutableListSelector = MutableListSelector;

// If null, no item is initially selected.

// Function that is called when the "+" button on the list is clicked.
// The user's intent is to create a new item for the list.

// Function that is called when the "-" button on the list is clicked.
// The user's intent is to delete the currently-selected item.
// If the `idOfCurrentlySelectedItem` is null, this means there is
// no item selected.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk11dGFibGVMaXN0U2VsZWN0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBV29CLGdCQUFnQjs7c0JBQ2YsVUFBVTs7MkJBQ0wsZUFBZTs7QUF1QnpDLElBQU0sMkJBQTJCLEdBQUcsc0JBQXNCLENBQUM7QUFDM0QsSUFBTSx3QkFBd0IsR0FBRyw0QkFBNEIsQ0FBQztBQUM5RCxJQUFNLCtCQUErQixHQUFHLGlDQUFpQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFpQjdELG1CQUFtQjtZQUFuQixtQkFBbUI7O0FBS25CLFdBTEEsbUJBQW1CLENBS2xCLEtBQVksRUFBRTswQkFMZixtQkFBbUI7O0FBTTVCLCtCQU5TLG1CQUFtQiw2Q0FNdEIsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLDJCQUEyQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDM0U7O2VBUlUsbUJBQW1COztXQVVSLGtDQUFHO0FBQ3ZCLFVBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0tBQy9EOzs7V0FFYSx3QkFBQyxNQUFjLEVBQUU7QUFDN0IsVUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDbEM7OztXQUVLLGtCQUFtQjs7O0FBQ3ZCLFVBQUksWUFBWSxZQUFBLENBQUM7QUFDakIsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQzdDLFlBQUksT0FBTyxHQUFHLFdBQVcsQ0FBQztBQUMxQixZQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssTUFBSyxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7QUFDM0MsaUJBQU8sSUFBSSxXQUFXLENBQUM7QUFDdkIsc0JBQVksR0FBRyxJQUFJLENBQUM7U0FDckI7QUFDRCxlQUNFOzs7QUFDRSxlQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUUsQUFBQztBQUNiLHFCQUFTLEVBQUUsT0FBTyxBQUFDO0FBQ25CLG1CQUFPLEVBQUUsTUFBSyxjQUFjLENBQUMsSUFBSSxRQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsQUFBQztVQUNoRCxJQUFJLENBQUMsWUFBWTtTQUNmLENBQ0w7T0FDSCxDQUFDLENBQUM7Ozs7QUFJSCxVQUFJLGlCQUFpQixZQUFBLENBQUM7QUFDdEIsVUFBSSxZQUFZLElBQUksSUFBSSxFQUFFO0FBQ3hCLHlCQUFpQixHQUFHLHdCQUF3QixDQUFDO09BQzlDLE1BQU0sSUFBSSxZQUFZLENBQUMsU0FBUyxLQUFLLEtBQUssRUFBRTtBQUMzQyx5QkFBaUIsR0FBRywrQkFBK0IsQ0FBQztPQUNyRCxNQUFNO0FBQ0wseUJBQWlCLEdBQUcsMkJBQTJCLENBQUM7T0FDakQ7O0FBRUQsYUFDRTs7O1FBQ0U7O1lBQUssU0FBUyxFQUFDLG1CQUFtQjtVQUNoQzs7Y0FBSSxTQUFTLEVBQUMsWUFBWTtZQUN2QixTQUFTO1dBQ1A7U0FDRDtRQUNOOztZQUFLLFNBQVMsRUFBQyxZQUFZO1VBQ3pCOzs7WUFDQTs7O0FBQ0ksd0JBQVEsRUFBRSxZQUFZLElBQUksSUFBSSxJQUFJLFlBQVksQ0FBQyxTQUFTLEtBQUssS0FBSyxBQUFDO0FBQ25FLHVCQUFPLEVBQUUsSUFBSSxDQUFDLDJCQUEyQixBQUFDO0FBQzFDLHFCQUFLLEVBQUUsaUJBQWlCLEFBQUM7O2FBRWxCO1lBQ1Q7OztBQUNFLHVCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQUFBQztBQUN2QyxxQkFBSyxFQUFDLGlCQUFpQjs7YUFFaEI7V0FDRztTQUNWO09BQ0YsQ0FDTjtLQUNIOzs7U0F2RVUsbUJBQW1CO0dBQVMsb0JBQU0sU0FBUyIsImZpbGUiOiJNdXRhYmxlTGlzdFNlbGVjdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtCdXR0b259IGZyb20gJy4vQnV0dG9uJztcbmltcG9ydCB7QnV0dG9uR3JvdXB9IGZyb20gJy4vQnV0dG9uR3JvdXAnO1xuXG50eXBlIE51Y2xpZGVMaXN0U2VsZWN0b3JJdGVtID0ge1xuICBkZWxldGFibGU/OiBib29sZWFuO1xuICBkaXNwbGF5VGl0bGU6IHN0cmluZztcbiAgaWQ6IHN0cmluZztcbn07XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGl0ZW1zOiBBcnJheTxOdWNsaWRlTGlzdFNlbGVjdG9ySXRlbT47XG4gIC8vIElmIG51bGwsIG5vIGl0ZW0gaXMgaW5pdGlhbGx5IHNlbGVjdGVkLlxuICBpZE9mU2VsZWN0ZWRJdGVtOiA/c3RyaW5nO1xuICBvbkl0ZW1DbGlja2VkOiAoaWRPZkNsaWNrZWRJdGVtOiBzdHJpbmcpID0+IG1peGVkO1xuICAvLyBGdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBcIitcIiBidXR0b24gb24gdGhlIGxpc3QgaXMgY2xpY2tlZC5cbiAgLy8gVGhlIHVzZXIncyBpbnRlbnQgaXMgdG8gY3JlYXRlIGEgbmV3IGl0ZW0gZm9yIHRoZSBsaXN0LlxuICBvbkFkZEJ1dHRvbkNsaWNrZWQ6ICgpID0+IG1peGVkO1xuICAvLyBGdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBcIi1cIiBidXR0b24gb24gdGhlIGxpc3QgaXMgY2xpY2tlZC5cbiAgLy8gVGhlIHVzZXIncyBpbnRlbnQgaXMgdG8gZGVsZXRlIHRoZSBjdXJyZW50bHktc2VsZWN0ZWQgaXRlbS5cbiAgLy8gSWYgdGhlIGBpZE9mQ3VycmVudGx5U2VsZWN0ZWRJdGVtYCBpcyBudWxsLCB0aGlzIG1lYW5zIHRoZXJlIGlzXG4gIC8vIG5vIGl0ZW0gc2VsZWN0ZWQuXG4gIG9uRGVsZXRlQnV0dG9uQ2xpY2tlZDogKGlkT2ZDdXJyZW50bHlTZWxlY3RlZEl0ZW06ID9zdHJpbmcpID0+IG1peGVkO1xufTtcblxuY29uc3QgREVMRVRFX0JVVFRPTl9USVRMRV9ERUZBVUxUID0gJ0RlbGV0ZSBzZWxlY3RlZCBpdGVtJztcbmNvbnN0IERFTEVURV9CVVRUT05fVElUTEVfTk9ORSA9ICdObyBpdGVtIHNlbGVjdGVkIHRvIGRlbGV0ZSc7XG5jb25zdCBERUxFVEVfQlVUVE9OX1RJVExFX1VOREVMRVRBQkxFID0gJ1NlbGVjdGVkIGl0ZW0gY2Fubm90IGJlIGRlbGV0ZWQnO1xuXG4vKipcbiAqIEEgZ2VuZXJpYyBjb21wb25lbnQgdGhhdCBkaXNwbGF5cyBzZWxlY3RhYmxlIGxpc3QgaXRlbXMsIGFuZCBvZmZlcnNcbiAqIHRoZSBhYmlsaXR5IHRvIGFkZCBhbmQgcmVtb3ZlIGl0ZW1zLiBJdCBsb29rcyByb3VnaGx5IGxpa2UgdGhlIGZvbGxvd2luZzpcbiAqXG4gKiAgIC0gLSAtIC0gLVxuICogIHwgSXRlbSAxICB8XG4gKiAgfC0tLS0tLS0tLXxcbiAqICB8IEl0ZW0gMiAgfFxuICogIHwtLS0tLS0tLS18XG4gKiAgfCAgICAgICAgIHxcbiAqICB8ICAgICAgICAgfFxuICogIHwtLS0tLS0tLS18XG4gKiAgfCArICB8ICAtIHxcbiAqICAgLS0tLS0tLS0tXG4gKi9cbmV4cG9ydCBjbGFzcyBNdXRhYmxlTGlzdFNlbGVjdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHZvaWQsIFByb3BzLCB2b2lkPiB7XG4gIHByb3BzOiBQcm9wcztcblxuICBfYm91bmRPbkRlbGV0ZUJ1dHRvbkNsaWNrZWQ6IG1peGVkO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9ib3VuZE9uRGVsZXRlQnV0dG9uQ2xpY2tlZCA9IHRoaXMuX29uRGVsZXRlQnV0dG9uQ2xpY2tlZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgX29uRGVsZXRlQnV0dG9uQ2xpY2tlZCgpIHtcbiAgICB0aGlzLnByb3BzLm9uRGVsZXRlQnV0dG9uQ2xpY2tlZCh0aGlzLnByb3BzLmlkT2ZTZWxlY3RlZEl0ZW0pO1xuICB9XG5cbiAgX29uSXRlbUNsaWNrZWQoaXRlbUlkOiBzdHJpbmcpIHtcbiAgICB0aGlzLnByb3BzLm9uSXRlbUNsaWNrZWQoaXRlbUlkKTtcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3QuRWxlbWVudCB7XG4gICAgbGV0IHNlbGVjdGVkSXRlbTtcbiAgICBjb25zdCBsaXN0SXRlbXMgPSB0aGlzLnByb3BzLml0ZW1zLm1hcChpdGVtID0+IHtcbiAgICAgIGxldCBjbGFzc2VzID0gJ2xpc3QtaXRlbSc7XG4gICAgICBpZiAoaXRlbS5pZCA9PT0gdGhpcy5wcm9wcy5pZE9mU2VsZWN0ZWRJdGVtKSB7XG4gICAgICAgIGNsYXNzZXMgKz0gJyBzZWxlY3RlZCc7XG4gICAgICAgIHNlbGVjdGVkSXRlbSA9IGl0ZW07XG4gICAgICB9XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGlcbiAgICAgICAgICBrZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzfVxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uSXRlbUNsaWNrZWQuYmluZCh0aGlzLCBpdGVtLmlkKX0+XG4gICAgICAgICAge2l0ZW0uZGlzcGxheVRpdGxlfVxuICAgICAgICA8L2xpPlxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIC8vIEV4cGxhaW4gd2h5IHRoZSBkZWxldGUgYnV0dG9uIGlzIGRpc2FibGVkIGlmIHRoZSBjdXJyZW50IHNlbGVjdGlvbiwgb3IgbGFjayB0aGVyZW9mLCBpc1xuICAgIC8vIHVuZGVsZXRhYmxlLlxuICAgIGxldCBkZWxldGVCdXR0b25UaXRsZTtcbiAgICBpZiAoc2VsZWN0ZWRJdGVtID09IG51bGwpIHtcbiAgICAgIGRlbGV0ZUJ1dHRvblRpdGxlID0gREVMRVRFX0JVVFRPTl9USVRMRV9OT05FO1xuICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRJdGVtLmRlbGV0YWJsZSA9PT0gZmFsc2UpIHtcbiAgICAgIGRlbGV0ZUJ1dHRvblRpdGxlID0gREVMRVRFX0JVVFRPTl9USVRMRV9VTkRFTEVUQUJMRTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlQnV0dG9uVGl0bGUgPSBERUxFVEVfQlVUVE9OX1RJVExFX0RFRkFVTFQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmxvY2sgc2VsZWN0LWxpc3RcIj5cbiAgICAgICAgICA8b2wgY2xhc3NOYW1lPVwibGlzdC1ncm91cFwiPlxuICAgICAgICAgICAge2xpc3RJdGVtc31cbiAgICAgICAgICA8L29sPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXJpZ2h0XCI+XG4gICAgICAgICAgPEJ1dHRvbkdyb3VwPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e3NlbGVjdGVkSXRlbSA9PSBudWxsIHx8IHNlbGVjdGVkSXRlbS5kZWxldGFibGUgPT09IGZhbHNlfVxuICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9ib3VuZE9uRGVsZXRlQnV0dG9uQ2xpY2tlZH1cbiAgICAgICAgICAgICAgdGl0bGU9e2RlbGV0ZUJ1dHRvblRpdGxlfT5cbiAgICAgICAgICAgICAgLVxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25BZGRCdXR0b25DbGlja2VkfVxuICAgICAgICAgICAgICB0aXRsZT1cIkNyZWF0ZSBuZXcgaXRlbVwiPlxuICAgICAgICAgICAgICArXG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8L0J1dHRvbkdyb3VwPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cbiJdfQ==