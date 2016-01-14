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
    this.state = {
      idOfSelectedItem: props.idOfInitiallySelectedItem
    };
    this._boundOnDeleteButtonClicked = this._onDeleteButtonClicked.bind(this);
  }

  /* eslint-enable react/prop-types */

  _createClass(NuclideMutableListSelector, [{
    key: '_onDeleteButtonClicked',
    value: function _onDeleteButtonClicked() {
      this.props.onDeleteButtonClicked(this.state.idOfSelectedItem);
    }
  }, {
    key: '_onItemClicked',
    value: function _onItemClicked(itemId) {
      this.setState({ idOfSelectedItem: itemId });
      this.props.onItemClicked(itemId);
    }
  }, {
    key: 'render',
    value: function render() {
      var listItems = [];
      for (var item of this.props.items) {
        item;
        var classes = 'nuclide-mutable-list-selector list-item';
        if (item.id === this.state.idOfSelectedItem) {
          classes += ' selected';
        }
        listItems.push(React.createElement(
          'li',
          {
            key: item.id,
            className: classes,
            onClick: this._onItemClicked.bind(this, item.id) },
          React.createElement(
            'span',
            null,
            item.displayTitle
          )
        ));
      }

      return React.createElement(
        'div',
        { className: 'nuclide-mutable-list-selector' },
        React.createElement(
          'ul',
          { className: 'nuclide-mutable-list-selector list-group' },
          listItems
        ),
        React.createElement(
          'div',
          { className: 'nuclide-mutable-list-selector btn-group' },
          React.createElement(
            'button',
            {
              className: 'nuclide-mutable-list-selector btn',
              onClick: this.props.onAddButtonClicked },
            '+'
          ),
          React.createElement(
            'button',
            {
              className: 'nuclide-mutable-list-selector btn',
              onClick: this._boundOnDeleteButtonClicked },
            '-'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVNdXRhYmxlTGlzdFNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBV0EsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUEwQ25CLDBCQUEwQjtZQUExQiwwQkFBMEI7O0FBSWxDLFdBSlEsMEJBQTBCLENBSWpDLEtBQVksRUFBRTswQkFKUCwwQkFBMEI7O0FBSzNDLCtCQUxpQiwwQkFBMEIsNkNBS3JDLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxzQkFBZ0IsRUFBRSxLQUFLLENBQUMseUJBQXlCO0tBQ2xELENBQUM7QUFDRixRQUFJLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUMzRTs7OztlQVZrQiwwQkFBMEI7O1dBWXZCLGtDQUFHO0FBQ3ZCLFVBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0tBQy9EOzs7V0FFYSx3QkFBQyxNQUFjLEVBQUU7QUFDN0IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLGdCQUFnQixFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7QUFDMUMsVUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDbEM7OztXQUVLLGtCQUFrQjtBQUN0QixVQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDckIsV0FBSyxJQUFNLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRTtBQUNuQyxBQUFDLFlBQUksQ0FBNEI7QUFDakMsWUFBSSxPQUFPLEdBQUcseUNBQXlDLENBQUM7QUFDeEQsWUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7QUFDM0MsaUJBQU8sSUFBSSxXQUFXLENBQUM7U0FDeEI7QUFDRCxpQkFBUyxDQUFDLElBQUksQ0FDWjs7O0FBQ0UsZUFBRyxFQUFFLElBQUksQ0FBQyxFQUFFLEFBQUM7QUFDYixxQkFBUyxFQUFFLE9BQU8sQUFBQztBQUNuQixtQkFBTyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEFBQUM7VUFDakQ7OztZQUNHLElBQUksQ0FBQyxZQUFZO1dBQ2I7U0FDSixDQUNOLENBQUM7T0FDSDs7QUFFRCxhQUNFOztVQUFLLFNBQVMsRUFBQywrQkFBK0I7UUFDNUM7O1lBQUksU0FBUyxFQUFDLDBDQUEwQztVQUNyRCxTQUFTO1NBQ1A7UUFDTDs7WUFBSyxTQUFTLEVBQUMseUNBQXlDO1VBQ3REOzs7QUFDRSx1QkFBUyxFQUFDLG1DQUFtQztBQUM3QyxxQkFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEFBQUM7O1dBRWhDO1VBQ1Q7OztBQUNFLHVCQUFTLEVBQUMsbUNBQW1DO0FBQzdDLHFCQUFPLEVBQUUsSUFBSSxDQUFDLDJCQUEyQixBQUFDOztXQUVuQztTQUNMO09BQ0YsQ0FDTjtLQUNIOzs7U0E1RGtCLDBCQUEwQjtHQUNuQyxLQUFLLENBQUMsU0FBUzs7cUJBRE4sMEJBQTBCIiwiZmlsZSI6Ik51Y2xpZGVNdXRhYmxlTGlzdFNlbGVjdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG50eXBlIE51Y2xpZGVMaXN0U2VsZWN0b3JJdGVtID0ge1xuICBpZDogc3RyaW5nO1xuICBkaXNwbGF5VGl0bGU6IHN0cmluZztcbn07XG5cbnR5cGUgRGVmYXVsdFByb3BzID0ge307XG50eXBlIFByb3BzID0ge1xuICBpdGVtczogQXJyYXk8e2lkOiBzdHJpbmc7IGRpc3BsYXlUaXRsZTogc3RyaW5nO30+O1xuICAvLyBJZiBudWxsLCBubyBpdGVtIGlzIGluaXRpYWxseSBzZWxlY3RlZC5cbiAgaWRPZkluaXRpYWxseVNlbGVjdGVkSXRlbTogP3N0cmluZztcbiAgb25JdGVtQ2xpY2tlZDogKGlkT2ZDbGlja2VkSXRlbTogc3RyaW5nKSA9PiBtaXhlZDtcbiAgLy8gRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgXCIrXCIgYnV0dG9uIG9uIHRoZSBsaXN0IGlzIGNsaWNrZWQuXG4gIC8vIFRoZSB1c2VyJ3MgaW50ZW50IGlzIHRvIGNyZWF0ZSBhIG5ldyBpdGVtIGZvciB0aGUgbGlzdC5cbiAgb25BZGRCdXR0b25DbGlja2VkOiAoKSA9PiBtaXhlZDtcbiAgLy8gRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgXCItXCIgYnV0dG9uIG9uIHRoZSBsaXN0IGlzIGNsaWNrZWQuXG4gIC8vIFRoZSB1c2VyJ3MgaW50ZW50IGlzIHRvIGRlbGV0ZSB0aGUgY3VycmVudGx5LXNlbGVjdGVkIGl0ZW0uXG4gIC8vIElmIHRoZSBgaWRPZkN1cnJlbnRseVNlbGVjdGVkSXRlbWAgaXMgbnVsbCwgdGhpcyBtZWFucyB0aGVyZSBpc1xuICAvLyBubyBpdGVtIHNlbGVjdGVkLlxuICBvbkRlbGV0ZUJ1dHRvbkNsaWNrZWQ6IChpZE9mQ3VycmVudGx5U2VsZWN0ZWRJdGVtOiA/c3RyaW5nKSA9PiBtaXhlZDtcbn07XG50eXBlIFN0YXRlID0ge1xuICBpZE9mU2VsZWN0ZWRJdGVtOiA/c3RyaW5nO1xufTtcblxuLyoqXG4gKiBBIGdlbmVyaWMgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgc2VsZWN0YWJsZSBsaXN0IGl0ZW1zLCBhbmQgb2ZmZXJzXG4gKiB0aGUgYWJpbGl0eSB0byBhZGQgYW5kIHJlbW92ZSBpdGVtcy4gSXQgbG9va3Mgcm91Z2hseSBsaWtlIHRoZSBmb2xsb3dpbmc6XG4gKlxuICogICAtIC0gLSAtIC1cbiAqICB8IEl0ZW0gMSAgfFxuICogIHwtLS0tLS0tLS18XG4gKiAgfCBJdGVtIDIgIHxcbiAqICB8LS0tLS0tLS0tfFxuICogIHwgICAgICAgICB8XG4gKiAgfCAgICAgICAgIHxcbiAqICB8LS0tLS0tLS0tfFxuICogIHwgKyAgfCAgLSB8XG4gKiAgIC0tLS0tLS0tLVxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOdWNsaWRlTXV0YWJsZUxpc3RTZWxlY3RvclxuICAgIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PERlZmF1bHRQcm9wcywgUHJvcHMsIFN0YXRlPiB7XG4gIF9ib3VuZE9uRGVsZXRlQnV0dG9uQ2xpY2tlZDogbWl4ZWQ7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBpZE9mU2VsZWN0ZWRJdGVtOiBwcm9wcy5pZE9mSW5pdGlhbGx5U2VsZWN0ZWRJdGVtLFxuICAgIH07XG4gICAgdGhpcy5fYm91bmRPbkRlbGV0ZUJ1dHRvbkNsaWNrZWQgPSB0aGlzLl9vbkRlbGV0ZUJ1dHRvbkNsaWNrZWQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIF9vbkRlbGV0ZUJ1dHRvbkNsaWNrZWQoKSB7XG4gICAgdGhpcy5wcm9wcy5vbkRlbGV0ZUJ1dHRvbkNsaWNrZWQodGhpcy5zdGF0ZS5pZE9mU2VsZWN0ZWRJdGVtKTtcbiAgfVxuXG4gIF9vbkl0ZW1DbGlja2VkKGl0ZW1JZDogc3RyaW5nKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7aWRPZlNlbGVjdGVkSXRlbTogaXRlbUlkfSk7XG4gICAgdGhpcy5wcm9wcy5vbkl0ZW1DbGlja2VkKGl0ZW1JZCk7XG4gIH1cblxuICByZW5kZXIoKTogP1JlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgbGlzdEl0ZW1zID0gW107XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHRoaXMucHJvcHMuaXRlbXMpIHtcbiAgICAgIChpdGVtIDogTnVjbGlkZUxpc3RTZWxlY3Rvckl0ZW0pO1xuICAgICAgbGV0IGNsYXNzZXMgPSAnbnVjbGlkZS1tdXRhYmxlLWxpc3Qtc2VsZWN0b3IgbGlzdC1pdGVtJztcbiAgICAgIGlmIChpdGVtLmlkID09PSB0aGlzLnN0YXRlLmlkT2ZTZWxlY3RlZEl0ZW0pIHtcbiAgICAgICAgY2xhc3NlcyArPSAnIHNlbGVjdGVkJztcbiAgICAgIH1cbiAgICAgIGxpc3RJdGVtcy5wdXNoKFxuICAgICAgICA8bGlcbiAgICAgICAgICBrZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzfVxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uSXRlbUNsaWNrZWQuYmluZCh0aGlzLCBpdGVtLmlkKX0+XG4gICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICB7aXRlbS5kaXNwbGF5VGl0bGV9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L2xpPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLW11dGFibGUtbGlzdC1zZWxlY3RvclwiPlxuICAgICAgICA8dWwgY2xhc3NOYW1lPVwibnVjbGlkZS1tdXRhYmxlLWxpc3Qtc2VsZWN0b3IgbGlzdC1ncm91cFwiPlxuICAgICAgICAgIHtsaXN0SXRlbXN9XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1tdXRhYmxlLWxpc3Qtc2VsZWN0b3IgYnRuLWdyb3VwXCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibnVjbGlkZS1tdXRhYmxlLWxpc3Qtc2VsZWN0b3IgYnRuXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25BZGRCdXR0b25DbGlja2VkfT5cbiAgICAgICAgICAgICtcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLW11dGFibGUtbGlzdC1zZWxlY3RvciBidG5cIlxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5fYm91bmRPbkRlbGV0ZUJ1dHRvbkNsaWNrZWR9PlxuICAgICAgICAgICAgLVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cbi8qIGVzbGludC1lbmFibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuIl19