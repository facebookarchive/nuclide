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

exports['default'] = findPaneAndItem;

/**
 * Finds the first item that matches the predicate in the workspace and its parent. It's necessary
 * to get them both in one function because items don't have links back to their parent.
 */

function findPaneAndItem(predicate) {
  for (var _pane of atom.workspace.getPanes()) {
    for (var _item of _pane.getItems()) {
      if (predicate(_item, _pane)) {
        return { item: _item, pane: _pane };
      }
    }
  }
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbmRQYW5lQW5kSXRlbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7cUJBc0J3QixlQUFlOzs7Ozs7O0FBQXhCLFNBQVMsZUFBZSxDQUFDLFNBQW9CLEVBQWdCO0FBQzFFLE9BQUssSUFBTSxLQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtBQUM1QyxTQUFLLElBQU0sS0FBSSxJQUFJLEtBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRTtBQUNsQyxVQUFJLFNBQVMsQ0FBQyxLQUFJLEVBQUUsS0FBSSxDQUFDLEVBQUU7QUFDekIsZUFBTyxFQUFDLElBQUksRUFBSixLQUFJLEVBQUUsSUFBSSxFQUFKLEtBQUksRUFBQyxDQUFDO09BQ3JCO0tBQ0Y7R0FDRjtDQUNGIiwiZmlsZSI6ImZpbmRQYW5lQW5kSXRlbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnR5cGUgSXRlbUFuZFBhbmUgPSB7XG4gIGl0ZW06IE9iamVjdDtcbiAgcGFuZTogT2JqZWN0O1xufTtcblxudHlwZSBQcmVkaWNhdGUgPSAoaXRlbTogT2JqZWN0LCBwYW5lOiBPYmplY3QpID0+IGJvb2xlYW47XG5cbi8qKlxuICogRmluZHMgdGhlIGZpcnN0IGl0ZW0gdGhhdCBtYXRjaGVzIHRoZSBwcmVkaWNhdGUgaW4gdGhlIHdvcmtzcGFjZSBhbmQgaXRzIHBhcmVudC4gSXQncyBuZWNlc3NhcnlcbiAqIHRvIGdldCB0aGVtIGJvdGggaW4gb25lIGZ1bmN0aW9uIGJlY2F1c2UgaXRlbXMgZG9uJ3QgaGF2ZSBsaW5rcyBiYWNrIHRvIHRoZWlyIHBhcmVudC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmluZFBhbmVBbmRJdGVtKHByZWRpY2F0ZTogUHJlZGljYXRlKTogP0l0ZW1BbmRQYW5lIHtcbiAgZm9yIChjb25zdCBwYW5lIG9mIGF0b20ud29ya3NwYWNlLmdldFBhbmVzKCkpIHtcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgcGFuZS5nZXRJdGVtcygpKSB7XG4gICAgICBpZiAocHJlZGljYXRlKGl0ZW0sIHBhbmUpKSB7XG4gICAgICAgIHJldHVybiB7aXRlbSwgcGFuZX07XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=