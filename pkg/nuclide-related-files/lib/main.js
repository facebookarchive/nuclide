Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _JumpToRelatedFile = require('./JumpToRelatedFile');

var _JumpToRelatedFile2 = _interopRequireDefault(_JumpToRelatedFile);

var _RelatedFileFinder = require('./RelatedFileFinder');

var _RelatedFileFinder2 = _interopRequireDefault(_RelatedFileFinder);

var jumpToRelatedFile = null;

function activate() {
  // Make it a const for Flow
  var local = jumpToRelatedFile = new _JumpToRelatedFile2['default'](new _RelatedFileFinder2['default']());

  atom.workspace.observeTextEditors(function (textEditor) {
    local.enableInTextEditor(textEditor);
  });
}

function deactivate() {
  if (jumpToRelatedFile) {
    jumpToRelatedFile.dispose();
    jumpToRelatedFile = null;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztpQ0FXOEIscUJBQXFCOzs7O2lDQUNyQixxQkFBcUI7Ozs7QUFFbkQsSUFBSSxpQkFBcUMsR0FBRyxJQUFJLENBQUM7O0FBRTFDLFNBQVMsUUFBUSxHQUFHOztBQUV6QixNQUFNLEtBQUssR0FBRyxpQkFBaUIsR0FBRyxtQ0FBc0Isb0NBQXVCLENBQUMsQ0FBQzs7QUFFakYsTUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFBLFVBQVUsRUFBSTtBQUM5QyxTQUFLLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUM7R0FDdEMsQ0FBQyxDQUFDO0NBQ0o7O0FBRU0sU0FBUyxVQUFVLEdBQUc7QUFDM0IsTUFBSSxpQkFBaUIsRUFBRTtBQUNyQixxQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM1QixxQkFBaUIsR0FBRyxJQUFJLENBQUM7R0FDMUI7Q0FDRiIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IEp1bXBUb1JlbGF0ZWRGaWxlIGZyb20gJy4vSnVtcFRvUmVsYXRlZEZpbGUnO1xuaW1wb3J0IFJlbGF0ZWRGaWxlRmluZGVyIGZyb20gJy4vUmVsYXRlZEZpbGVGaW5kZXInO1xuXG5sZXQganVtcFRvUmVsYXRlZEZpbGU6ID9KdW1wVG9SZWxhdGVkRmlsZSA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcbiAgLy8gTWFrZSBpdCBhIGNvbnN0IGZvciBGbG93XG4gIGNvbnN0IGxvY2FsID0ganVtcFRvUmVsYXRlZEZpbGUgPSBuZXcgSnVtcFRvUmVsYXRlZEZpbGUobmV3IFJlbGF0ZWRGaWxlRmluZGVyKCkpO1xuXG4gIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyh0ZXh0RWRpdG9yID0+IHtcbiAgICBsb2NhbC5lbmFibGVJblRleHRFZGl0b3IodGV4dEVkaXRvcik7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgaWYgKGp1bXBUb1JlbGF0ZWRGaWxlKSB7XG4gICAganVtcFRvUmVsYXRlZEZpbGUuZGlzcG9zZSgpO1xuICAgIGp1bXBUb1JlbGF0ZWRGaWxlID0gbnVsbDtcbiAgfVxufVxuIl19