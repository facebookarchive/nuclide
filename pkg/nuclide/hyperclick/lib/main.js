

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

    // FB-only: override the symbols-view "Go To Declaration" context menu item
    // with the Hyperclick "confirm-cursor" command.
    // TODO(hansonw): Remove when symbols-view has a proper API.
    try {
      var _require = require('./fb/overrideGoToDeclaration');

      var overrideGoToDeclaration = _require.overrideGoToDeclaration;

      overrideGoToDeclaration();
    } catch (e) {
      // Ignore.
    }
  },

  deactivate: function deactivate() {
    if (hyperclick != null) {
      hyperclick.dispose();
      hyperclick = null;
    }
  },

  consumeProvider: function consumeProvider(provider) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFleUIsTUFBTTs7QUFEL0IsSUFBSSxVQUEyQixHQUFHLElBQUksQ0FBQzs7QUFHdkMsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLFVBQVEsRUFBQSxvQkFBRztBQUNULFFBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUMzQyxjQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQzs7Ozs7QUFLOUIsUUFBSTtxQkFDZ0MsT0FBTyxDQUFDLDhCQUE4QixDQUFDOztVQUFsRSx1QkFBdUIsWUFBdkIsdUJBQXVCOztBQUM5Qiw2QkFBdUIsRUFBRSxDQUFDO0tBQzNCLENBQUMsT0FBTyxDQUFDLEVBQUU7O0tBRVg7R0FDRjs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsZ0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixnQkFBVSxHQUFHLElBQUksQ0FBQztLQUNuQjtHQUNGOztBQUVELGlCQUFlLEVBQUEseUJBQUMsUUFBd0QsRUFBZTtBQUNyRixRQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsZ0JBQVUsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckMsYUFBTyxxQkFBZSxZQUFNO0FBQzFCLFlBQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixvQkFBVSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNyQztPQUNGLENBQUMsQ0FBQztLQUNKO0dBQ0Y7Ozs7Ozs7QUFPRCxtQkFBaUIsRUFBQSw2QkFBMEM7QUFDekQsV0FBTyxVQUFDLFVBQVUsRUFBc0I7QUFDdEMsVUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGtCQUFVLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDMUM7S0FDRixDQUFDO0dBQ0g7Q0FDRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SHlwZXJjbGlja1Byb3ZpZGVyfSBmcm9tICcuLi8uLi9oeXBlcmNsaWNrLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUgSHlwZXJjbGlja1R5cGUgZnJvbSAnLi9IeXBlcmNsaWNrJztcblxubGV0IGh5cGVyY2xpY2s6ID9IeXBlcmNsaWNrVHlwZSA9IG51bGw7XG5pbXBvcnQge0Rpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWN0aXZhdGUoKSB7XG4gICAgY29uc3QgSHlwZXJjbGljayA9IHJlcXVpcmUoJy4vSHlwZXJjbGljaycpO1xuICAgIGh5cGVyY2xpY2sgPSBuZXcgSHlwZXJjbGljaygpO1xuXG4gICAgLy8gRkItb25seTogb3ZlcnJpZGUgdGhlIHN5bWJvbHMtdmlldyBcIkdvIFRvIERlY2xhcmF0aW9uXCIgY29udGV4dCBtZW51IGl0ZW1cbiAgICAvLyB3aXRoIHRoZSBIeXBlcmNsaWNrIFwiY29uZmlybS1jdXJzb3JcIiBjb21tYW5kLlxuICAgIC8vIFRPRE8oaGFuc29udyk6IFJlbW92ZSB3aGVuIHN5bWJvbHMtdmlldyBoYXMgYSBwcm9wZXIgQVBJLlxuICAgIHRyeSB7XG4gICAgICBjb25zdCB7b3ZlcnJpZGVHb1RvRGVjbGFyYXRpb259ID0gcmVxdWlyZSgnLi9mYi9vdmVycmlkZUdvVG9EZWNsYXJhdGlvbicpO1xuICAgICAgb3ZlcnJpZGVHb1RvRGVjbGFyYXRpb24oKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBJZ25vcmUuXG4gICAgfVxuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgaWYgKGh5cGVyY2xpY2sgIT0gbnVsbCkge1xuICAgICAgaHlwZXJjbGljay5kaXNwb3NlKCk7XG4gICAgICBoeXBlcmNsaWNrID0gbnVsbDtcbiAgICB9XG4gIH0sXG5cbiAgY29uc3VtZVByb3ZpZGVyKHByb3ZpZGVyOiBIeXBlcmNsaWNrUHJvdmlkZXIgfCBBcnJheTxIeXBlcmNsaWNrUHJvdmlkZXI+KTogP0Rpc3Bvc2FibGUge1xuICAgIGlmIChoeXBlcmNsaWNrICE9IG51bGwpIHtcbiAgICAgIGh5cGVyY2xpY2suY29uc3VtZVByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgIGlmIChoeXBlcmNsaWNrICE9IG51bGwpIHtcbiAgICAgICAgICBoeXBlcmNsaWNrLnJlbW92ZVByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBBIFRleHRFZGl0b3Igd2hvc2UgY3JlYXRpb24gaXMgYW5ub3VuY2VkIHZpYSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoKSB3aWxsIGJlXG4gICAqIG9ic2VydmVkIGJ5IGRlZmF1bHQgYnkgaHlwZXJjbGljay4gSG93ZXZlciwgaWYgYSBUZXh0RWRpdG9yIGlzIGNyZWF0ZWQgdmlhIHNvbWUgb3RoZXIgbWVhbnMsXG4gICAqIChzdWNoIGFzIGEgYnVpbGRpbmcgYmxvY2sgZm9yIGEgcGllY2Ugb2YgVUkpLCB0aGVuIGl0IG11c3QgYmUgb2JzZXJ2ZWQgZXhwbGljaXRseS5cbiAgICovXG4gIG9ic2VydmVUZXh0RWRpdG9yKCk6ICh0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpID0+IHZvaWQge1xuICAgIHJldHVybiAodGV4dEVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKSA9PiB7XG4gICAgICBpZiAoaHlwZXJjbGljayAhPSBudWxsKSB7XG4gICAgICAgIGh5cGVyY2xpY2sub2JzZXJ2ZVRleHRFZGl0b3IodGV4dEVkaXRvcik7XG4gICAgICB9XG4gICAgfTtcbiAgfSxcbn07XG4iXX0=