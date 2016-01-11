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

module.exports = {
  activate: function activate() {
    // Make it a const for Flow
    var local = jumpToRelatedFile = new _JumpToRelatedFile2['default'](new _RelatedFileFinder2['default']());

    atom.workspace.observeTextEditors(function (textEditor) {
      local.enableInTextEditor(textEditor);
    });
  },

  deactivate: function deactivate() {
    if (jumpToRelatedFile) {
      jumpToRelatedFile.dispose();
      jumpToRelatedFile = null;
    }
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztpQ0FXOEIscUJBQXFCOzs7O2lDQUNyQixxQkFBcUI7Ozs7QUFFbkQsSUFBSSxpQkFBcUMsR0FBRyxJQUFJLENBQUM7O0FBRWpELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixVQUFRLEVBQUEsb0JBQUc7O0FBRVQsUUFBTSxLQUFLLEdBQUcsaUJBQWlCLEdBQUcsbUNBQXNCLG9DQUF1QixDQUFDLENBQUM7O0FBRWpGLFFBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsVUFBQSxVQUFVLEVBQUk7QUFDOUMsV0FBSyxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ3RDLENBQUMsQ0FBQztHQUNKOztBQUVELFlBQVUsRUFBQSxzQkFBRztBQUNYLFFBQUksaUJBQWlCLEVBQUU7QUFDckIsdUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDNUIsdUJBQWlCLEdBQUcsSUFBSSxDQUFDO0tBQzFCO0dBQ0Y7Q0FDRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgSnVtcFRvUmVsYXRlZEZpbGUgZnJvbSAnLi9KdW1wVG9SZWxhdGVkRmlsZSc7XG5pbXBvcnQgUmVsYXRlZEZpbGVGaW5kZXIgZnJvbSAnLi9SZWxhdGVkRmlsZUZpbmRlcic7XG5cbmxldCBqdW1wVG9SZWxhdGVkRmlsZTogP0p1bXBUb1JlbGF0ZWRGaWxlID0gbnVsbDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGl2YXRlKCkge1xuICAgIC8vIE1ha2UgaXQgYSBjb25zdCBmb3IgRmxvd1xuICAgIGNvbnN0IGxvY2FsID0ganVtcFRvUmVsYXRlZEZpbGUgPSBuZXcgSnVtcFRvUmVsYXRlZEZpbGUobmV3IFJlbGF0ZWRGaWxlRmluZGVyKCkpO1xuXG4gICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKHRleHRFZGl0b3IgPT4ge1xuICAgICAgbG9jYWwuZW5hYmxlSW5UZXh0RWRpdG9yKHRleHRFZGl0b3IpO1xuICAgIH0pO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgaWYgKGp1bXBUb1JlbGF0ZWRGaWxlKSB7XG4gICAgICBqdW1wVG9SZWxhdGVkRmlsZS5kaXNwb3NlKCk7XG4gICAgICBqdW1wVG9SZWxhdGVkRmlsZSA9IG51bGw7XG4gICAgfVxuICB9LFxufTtcbiJdfQ==