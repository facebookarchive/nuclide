Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// This module contains some utilities for dealing with "container" (pane or pane axis) visibility.

exports.isHidden = isHidden;
exports.hide = hide;
exports.show = show;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ExpandedFlexScale = require('./ExpandedFlexScale');

var ExpandedFlexScale = _interopRequireWildcard(_ExpandedFlexScale);

function isHidden(container) {
  // TODO: Leave a little wiggle room here? Hard to know a good number for flex scale.
  return container.getFlexScale() === 0;
}

function hide(container) {
  if (isHidden(container)) {
    return;
  }

  var currentFlexScale = container.getFlexScale();
  container.setFlexScale(0);

  // Store the original flex scale so we can restore to it later.
  ExpandedFlexScale.set(container, currentFlexScale);
}

function show(container) {
  if (!isHidden(container)) {
    return;
  }
  var expandedFlexScale = ExpandedFlexScale.get(container);
  container.setFlexScale(expandedFlexScale);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbnRhaW5lclZpc2liaWxpdHkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7aUNBZW1DLHFCQUFxQjs7SUFBNUMsaUJBQWlCOztBQUV0QixTQUFTLFFBQVEsQ0FBQyxTQUE0QixFQUFXOztBQUU5RCxTQUFPLFNBQVMsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7Q0FDdkM7O0FBRU0sU0FBUyxJQUFJLENBQUMsU0FBNEIsRUFBUTtBQUN2RCxNQUFJLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUN2QixXQUFPO0dBQ1I7O0FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDbEQsV0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O0FBRzFCLG1CQUFpQixDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztDQUNwRDs7QUFFTSxTQUFTLElBQUksQ0FBQyxTQUE0QixFQUFRO0FBQ3ZELE1BQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDeEIsV0FBTztHQUNSO0FBQ0QsTUFBTSxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDM0QsV0FBUyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0NBQzNDIiwiZmlsZSI6IkNvbnRhaW5lclZpc2liaWxpdHkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vLyBUaGlzIG1vZHVsZSBjb250YWlucyBzb21lIHV0aWxpdGllcyBmb3IgZGVhbGluZyB3aXRoIFwiY29udGFpbmVyXCIgKHBhbmUgb3IgcGFuZSBheGlzKSB2aXNpYmlsaXR5LlxuXG5pbXBvcnQgdHlwZSB7UGFuZUl0ZW1Db250YWluZXJ9IGZyb20gJy4uL3R5cGVzL1BhbmVJdGVtQ29udGFpbmVyJztcblxuaW1wb3J0ICogYXMgRXhwYW5kZWRGbGV4U2NhbGUgZnJvbSAnLi9FeHBhbmRlZEZsZXhTY2FsZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0hpZGRlbihjb250YWluZXI6IFBhbmVJdGVtQ29udGFpbmVyKTogYm9vbGVhbiB7XG4gIC8vIFRPRE86IExlYXZlIGEgbGl0dGxlIHdpZ2dsZSByb29tIGhlcmU/IEhhcmQgdG8ga25vdyBhIGdvb2QgbnVtYmVyIGZvciBmbGV4IHNjYWxlLlxuICByZXR1cm4gY29udGFpbmVyLmdldEZsZXhTY2FsZSgpID09PSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGlkZShjb250YWluZXI6IFBhbmVJdGVtQ29udGFpbmVyKTogdm9pZCB7XG4gIGlmIChpc0hpZGRlbihjb250YWluZXIpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgY3VycmVudEZsZXhTY2FsZSA9IGNvbnRhaW5lci5nZXRGbGV4U2NhbGUoKTtcbiAgY29udGFpbmVyLnNldEZsZXhTY2FsZSgwKTtcblxuICAvLyBTdG9yZSB0aGUgb3JpZ2luYWwgZmxleCBzY2FsZSBzbyB3ZSBjYW4gcmVzdG9yZSB0byBpdCBsYXRlci5cbiAgRXhwYW5kZWRGbGV4U2NhbGUuc2V0KGNvbnRhaW5lciwgY3VycmVudEZsZXhTY2FsZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93KGNvbnRhaW5lcjogUGFuZUl0ZW1Db250YWluZXIpOiB2b2lkIHtcbiAgaWYgKCFpc0hpZGRlbihjb250YWluZXIpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGV4cGFuZGVkRmxleFNjYWxlID0gRXhwYW5kZWRGbGV4U2NhbGUuZ2V0KGNvbnRhaW5lcik7XG4gIGNvbnRhaW5lci5zZXRGbGV4U2NhbGUoZXhwYW5kZWRGbGV4U2NhbGUpO1xufVxuIl19