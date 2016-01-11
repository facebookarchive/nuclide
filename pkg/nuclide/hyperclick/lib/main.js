

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var hyperclick = null;

module.exports = {
  activate: function activate() {
    var Hyperclick = require('./Hyperclick');
    hyperclick = new Hyperclick();
  },

  deactivate: function deactivate() {
    if (hyperclick != null) {
      hyperclick.dispose();
      hyperclick = null;
    }
  },

  consumeProvider: function consumeProvider(provider) {
    if (typeof provider.providerName !== 'string') {
      throw new Error('Missing "providerName" property for hyperclick provider.');
    }
    if (hyperclick != null) {
      hyperclick.consumeProvider(provider);
      return new _atom.Disposable(function () {
        if (hyperclick != null) {
          hyperclick.removeProvider(provider);
        }
      });
    }
  },

  /**
   * A TextEditor whose creation is announced via atom.workspace.observeTextEditors() will be
   * observed by default by hyperclick. However, if a TextEditor is created via some other means,
   * (such as a building block for a piece of UI), then it must be observed explicitly.
   */
  observeTextEditor: function observeTextEditor() {
    return function (textEditor) {
      if (hyperclick != null) {
        hyperclick.observeTextEditor(textEditor);
      }
    };
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFleUIsTUFBTTs7QUFEL0IsSUFBSSxVQUEyQixHQUFHLElBQUksQ0FBQzs7QUFHdkMsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLFVBQVEsRUFBQSxvQkFBRztBQUNULFFBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUMzQyxjQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztHQUMvQjs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsZ0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixnQkFBVSxHQUFHLElBQUksQ0FBQztLQUNuQjtHQUNGOztBQUVELGlCQUFlLEVBQUEseUJBQUMsUUFBd0QsRUFBZTtBQUNyRixRQUFJLE9BQU8sUUFBUSxDQUFDLFlBQVksS0FBSyxRQUFRLEVBQUU7QUFDN0MsWUFBTSxJQUFJLEtBQUssQ0FBQywwREFBMEQsQ0FBQyxDQUFDO0tBQzdFO0FBQ0QsUUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGdCQUFVLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JDLGFBQU8scUJBQWUsWUFBTTtBQUMxQixZQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsb0JBQVUsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDckM7T0FDRixDQUFDLENBQUM7S0FDSjtHQUNGOzs7Ozs7O0FBT0QsbUJBQWlCLEVBQUEsNkJBQTBDO0FBQ3pELFdBQU8sVUFBQyxVQUFVLEVBQXNCO0FBQ3RDLFVBQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixrQkFBVSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQzFDO0tBQ0YsQ0FBQztHQUNIO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0h5cGVyY2xpY2tQcm92aWRlcn0gZnJvbSAnLi4vLi4vaHlwZXJjbGljay1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIEh5cGVyY2xpY2tUeXBlIGZyb20gJy4vSHlwZXJjbGljayc7XG5cbmxldCBoeXBlcmNsaWNrOiA/SHlwZXJjbGlja1R5cGUgPSBudWxsO1xuaW1wb3J0IHtEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGl2YXRlKCkge1xuICAgIGNvbnN0IEh5cGVyY2xpY2sgPSByZXF1aXJlKCcuL0h5cGVyY2xpY2snKTtcbiAgICBoeXBlcmNsaWNrID0gbmV3IEh5cGVyY2xpY2soKTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIGlmIChoeXBlcmNsaWNrICE9IG51bGwpIHtcbiAgICAgIGh5cGVyY2xpY2suZGlzcG9zZSgpO1xuICAgICAgaHlwZXJjbGljayA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gIGNvbnN1bWVQcm92aWRlcihwcm92aWRlcjogSHlwZXJjbGlja1Byb3ZpZGVyIHwgQXJyYXk8SHlwZXJjbGlja1Byb3ZpZGVyPik6ID9EaXNwb3NhYmxlIHtcbiAgICBpZiAodHlwZW9mIHByb3ZpZGVyLnByb3ZpZGVyTmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBcInByb3ZpZGVyTmFtZVwiIHByb3BlcnR5IGZvciBoeXBlcmNsaWNrIHByb3ZpZGVyLicpO1xuICAgIH1cbiAgICBpZiAoaHlwZXJjbGljayAhPSBudWxsKSB7XG4gICAgICBoeXBlcmNsaWNrLmNvbnN1bWVQcm92aWRlcihwcm92aWRlcik7XG4gICAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICBpZiAoaHlwZXJjbGljayAhPSBudWxsKSB7XG4gICAgICAgICAgaHlwZXJjbGljay5yZW1vdmVQcm92aWRlcihwcm92aWRlcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQSBUZXh0RWRpdG9yIHdob3NlIGNyZWF0aW9uIGlzIGFubm91bmNlZCB2aWEgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKCkgd2lsbCBiZVxuICAgKiBvYnNlcnZlZCBieSBkZWZhdWx0IGJ5IGh5cGVyY2xpY2suIEhvd2V2ZXIsIGlmIGEgVGV4dEVkaXRvciBpcyBjcmVhdGVkIHZpYSBzb21lIG90aGVyIG1lYW5zLFxuICAgKiAoc3VjaCBhcyBhIGJ1aWxkaW5nIGJsb2NrIGZvciBhIHBpZWNlIG9mIFVJKSwgdGhlbiBpdCBtdXN0IGJlIG9ic2VydmVkIGV4cGxpY2l0bHkuXG4gICAqL1xuICBvYnNlcnZlVGV4dEVkaXRvcigpOiAodGV4dEVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKSA9PiB2b2lkIHtcbiAgICByZXR1cm4gKHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcikgPT4ge1xuICAgICAgaWYgKGh5cGVyY2xpY2sgIT0gbnVsbCkge1xuICAgICAgICBoeXBlcmNsaWNrLm9ic2VydmVUZXh0RWRpdG9yKHRleHRFZGl0b3IpO1xuICAgICAgfVxuICAgIH07XG4gIH0sXG59O1xuIl19