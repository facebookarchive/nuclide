Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = destroyPaneItemWithTitle;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function destroyPaneItemWithTitle(title) {
  for (var item of atom.workspace.getPaneItems()) {
    if (item.getTitle() === title) {
      var pane = atom.workspace.paneForItem(item);
      pane.destroyItem(item);
      return;
    }
  }
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRlc3Ryb3ktcGFuZS1pdGVtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztxQkFXd0Isd0JBQXdCOzs7Ozs7Ozs7O0FBQWpDLFNBQVMsd0JBQXdCLENBQUMsS0FBYSxFQUFFO0FBQzlELE9BQUssSUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsRUFBRTtBQUNoRCxRQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxLQUFLLEVBQUU7QUFDN0IsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUMsVUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2QixhQUFPO0tBQ1I7R0FDRjtDQUNGIiwiZmlsZSI6ImRlc3Ryb3ktcGFuZS1pdGVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVzdHJveVBhbmVJdGVtV2l0aFRpdGxlKHRpdGxlOiBzdHJpbmcpIHtcbiAgZm9yIChjb25zdCBpdGVtIG9mIGF0b20ud29ya3NwYWNlLmdldFBhbmVJdGVtcygpKSB7XG4gICAgaWYgKGl0ZW0uZ2V0VGl0bGUoKSA9PT0gdGl0bGUpIHtcbiAgICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShpdGVtKTtcbiAgICAgIHBhbmUuZGVzdHJveUl0ZW0oaXRlbSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG59XG4iXX0=