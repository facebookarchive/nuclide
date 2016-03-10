Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.addTooltip = addTooltip;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

/**
* Adds a self-disposing Atom's tooltip to a react element.
*
* Typical usage:
* <div ref={addTooltip({title: 'My awesome tooltip', delay: 100, placement: 'top'})} />
* or, if the ref needs to be preserved:
* <div ref={c => {
*   addTooltip({title: 'My awesome tooltip', delay: 100, placement: 'top'})(c);
*   this._myDiv = c;
* }} />
*/

function addTooltip(options) {
  var prevRefDisposable = undefined;

  return function (elementRef) {
    if (prevRefDisposable != null) {
      prevRefDisposable.dispose();
      prevRefDisposable = null;
    }

    if (elementRef != null) {
      var node = _reactForAtom.ReactDOM.findDOMNode(elementRef);

      prevRefDisposable = atom.tooltips.add(node, _extends({
        keyBindingTarget: node
      }, options));
    }
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRvb2x0aXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFXOEIsZ0JBQWdCOzs7Ozs7Ozs7Ozs7OztBQWN2QyxTQUFTLFVBQVUsQ0FBQyxPQUFnQyxFQUF1QztBQUNoRyxNQUFJLGlCQUFpQixZQUFBLENBQUM7O0FBRXRCLFNBQU8sVUFBQSxVQUFVLEVBQUk7QUFDbkIsUUFBSSxpQkFBaUIsSUFBSSxJQUFJLEVBQUU7QUFDN0IsdUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDNUIsdUJBQWlCLEdBQUcsSUFBSSxDQUFDO0tBQzFCOztBQUVELFFBQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixVQUFNLElBQUksR0FBRyx1QkFBUyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRTlDLHVCQUFpQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNuQyxJQUFJO0FBRUYsd0JBQWdCLEVBQUUsSUFBSTtTQUNuQixPQUFPLEVBRWIsQ0FBQztLQUNIO0dBQ0YsQ0FBQztDQUNIIiwiZmlsZSI6InRvb2x0aXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlYWN0LCBSZWFjdERPTX0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5cbi8qKlxuKiBBZGRzIGEgc2VsZi1kaXNwb3NpbmcgQXRvbSdzIHRvb2x0aXAgdG8gYSByZWFjdCBlbGVtZW50LlxuKlxuKiBUeXBpY2FsIHVzYWdlOlxuKiA8ZGl2IHJlZj17YWRkVG9vbHRpcCh7dGl0bGU6ICdNeSBhd2Vzb21lIHRvb2x0aXAnLCBkZWxheTogMTAwLCBwbGFjZW1lbnQ6ICd0b3AnfSl9IC8+XG4qIG9yLCBpZiB0aGUgcmVmIG5lZWRzIHRvIGJlIHByZXNlcnZlZDpcbiogPGRpdiByZWY9e2MgPT4ge1xuKiAgIGFkZFRvb2x0aXAoe3RpdGxlOiAnTXkgYXdlc29tZSB0b29sdGlwJywgZGVsYXk6IDEwMCwgcGxhY2VtZW50OiAndG9wJ30pKGMpO1xuKiAgIHRoaXMuX215RGl2ID0gYztcbiogfX0gLz5cbiovXG5leHBvcnQgZnVuY3Rpb24gYWRkVG9vbHRpcChvcHRpb25zOiBhdG9tJFRvb2x0aXBzQWRkT3B0aW9ucyk6IChlbGVtZW50UmVmOiBSZWFjdC5FbGVtZW50KSA9PiB2b2lkIHtcbiAgbGV0IHByZXZSZWZEaXNwb3NhYmxlO1xuXG4gIHJldHVybiBlbGVtZW50UmVmID0+IHtcbiAgICBpZiAocHJldlJlZkRpc3Bvc2FibGUgIT0gbnVsbCkge1xuICAgICAgcHJldlJlZkRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgcHJldlJlZkRpc3Bvc2FibGUgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChlbGVtZW50UmVmICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IG5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZShlbGVtZW50UmVmKTtcblxuICAgICAgcHJldlJlZkRpc3Bvc2FibGUgPSBhdG9tLnRvb2x0aXBzLmFkZChcbiAgICAgICAgbm9kZSxcbiAgICAgICAge1xuICAgICAgICAgIGtleUJpbmRpbmdUYXJnZXQ6IG5vZGUsXG4gICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gIH07XG59XG4iXX0=