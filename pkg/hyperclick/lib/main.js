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

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeProvider = consumeProvider;
exports.observeTextEditor = observeTextEditor;

var _atom = require('atom');

var _types = require('./types');

Object.defineProperty(exports, 'HyperclickProvider', {
  enumerable: true,
  get: function get() {
    return _types.HyperclickProvider;
  }
});
Object.defineProperty(exports, 'HyperclickSuggestion', {
  enumerable: true,
  get: function get() {
    return _types.HyperclickSuggestion;
  }
});

var hyperclick = null;

function activate() {
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
}

function deactivate() {
  if (hyperclick != null) {
    hyperclick.dispose();
    hyperclick = null;
  }
}

function consumeProvider(provider) {
  if (hyperclick != null) {
    hyperclick.consumeProvider(provider);
    return new _atom.Disposable(function () {
      if (hyperclick != null) {
        hyperclick.removeProvider(provider);
      }
    });
  }
}

/**
 * A TextEditor whose creation is announced via atom.workspace.observeTextEditors() will be
 * observed by default by hyperclick. However, if a TextEditor is created via some other means,
 * (such as a building block for a piece of UI), then it must be observed explicitly.
 */

function observeTextEditor() {
  return function (textEditor) {
    if (hyperclick != null) {
      hyperclick.observeTextEditor(textEditor);
    }
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBb0J5QixNQUFNOztxQkFIeEIsU0FBUzs7Ozs7a0JBRmQsa0JBQWtCOzs7Ozs7a0JBQ2xCLG9CQUFvQjs7OztBQUd0QixJQUFJLFVBQTJCLEdBQUcsSUFBSSxDQUFDOztBQUdoQyxTQUFTLFFBQVEsR0FBRztBQUN6QixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDM0MsWUFBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7Ozs7O0FBSzlCLE1BQUk7bUJBQ2dDLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQzs7UUFBbEUsdUJBQXVCLFlBQXZCLHVCQUF1Qjs7QUFDOUIsMkJBQXVCLEVBQUUsQ0FBQztHQUMzQixDQUFDLE9BQU8sQ0FBQyxFQUFFOztHQUVYO0NBQ0Y7O0FBRU0sU0FBUyxVQUFVLEdBQUc7QUFDM0IsTUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGNBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixjQUFVLEdBQUcsSUFBSSxDQUFDO0dBQ25CO0NBQ0Y7O0FBRU0sU0FBUyxlQUFlLENBQzdCLFFBQXdELEVBQzNDO0FBQ2IsTUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGNBQVUsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckMsV0FBTyxxQkFBZSxZQUFNO0FBQzFCLFVBQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixrQkFBVSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUNyQztLQUNGLENBQUMsQ0FBQztHQUNKO0NBQ0Y7Ozs7Ozs7O0FBT00sU0FBUyxpQkFBaUIsR0FBMEM7QUFDekUsU0FBTyxVQUFDLFVBQVUsRUFBc0I7QUFDdEMsUUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGdCQUFVLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDMUM7R0FDRixDQUFDO0NBQ0giLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIeXBlcmNsaWNrUHJvdmlkZXJ9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUgSHlwZXJjbGlja1R5cGUgZnJvbSAnLi9IeXBlcmNsaWNrJztcblxuZXhwb3J0IHR5cGUge1xuICBIeXBlcmNsaWNrUHJvdmlkZXIsXG4gIEh5cGVyY2xpY2tTdWdnZXN0aW9uLFxufSBmcm9tICcuL3R5cGVzJztcblxubGV0IGh5cGVyY2xpY2s6ID9IeXBlcmNsaWNrVHlwZSA9IG51bGw7XG5pbXBvcnQge0Rpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XG4gIGNvbnN0IEh5cGVyY2xpY2sgPSByZXF1aXJlKCcuL0h5cGVyY2xpY2snKTtcbiAgaHlwZXJjbGljayA9IG5ldyBIeXBlcmNsaWNrKCk7XG5cbiAgLy8gRkItb25seTogb3ZlcnJpZGUgdGhlIHN5bWJvbHMtdmlldyBcIkdvIFRvIERlY2xhcmF0aW9uXCIgY29udGV4dCBtZW51IGl0ZW1cbiAgLy8gd2l0aCB0aGUgSHlwZXJjbGljayBcImNvbmZpcm0tY3Vyc29yXCIgY29tbWFuZC5cbiAgLy8gVE9ETyhoYW5zb253KTogUmVtb3ZlIHdoZW4gc3ltYm9scy12aWV3IGhhcyBhIHByb3BlciBBUEkuXG4gIHRyeSB7XG4gICAgY29uc3Qge292ZXJyaWRlR29Ub0RlY2xhcmF0aW9ufSA9IHJlcXVpcmUoJy4vZmIvb3ZlcnJpZGVHb1RvRGVjbGFyYXRpb24nKTtcbiAgICBvdmVycmlkZUdvVG9EZWNsYXJhdGlvbigpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSWdub3JlLlxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xuICBpZiAoaHlwZXJjbGljayAhPSBudWxsKSB7XG4gICAgaHlwZXJjbGljay5kaXNwb3NlKCk7XG4gICAgaHlwZXJjbGljayA9IG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVQcm92aWRlcihcbiAgcHJvdmlkZXI6IEh5cGVyY2xpY2tQcm92aWRlciB8IEFycmF5PEh5cGVyY2xpY2tQcm92aWRlcj4sXG4pOiA/RGlzcG9zYWJsZSB7XG4gIGlmIChoeXBlcmNsaWNrICE9IG51bGwpIHtcbiAgICBoeXBlcmNsaWNrLmNvbnN1bWVQcm92aWRlcihwcm92aWRlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGlmIChoeXBlcmNsaWNrICE9IG51bGwpIHtcbiAgICAgICAgaHlwZXJjbGljay5yZW1vdmVQcm92aWRlcihwcm92aWRlcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIFRleHRFZGl0b3Igd2hvc2UgY3JlYXRpb24gaXMgYW5ub3VuY2VkIHZpYSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoKSB3aWxsIGJlXG4gKiBvYnNlcnZlZCBieSBkZWZhdWx0IGJ5IGh5cGVyY2xpY2suIEhvd2V2ZXIsIGlmIGEgVGV4dEVkaXRvciBpcyBjcmVhdGVkIHZpYSBzb21lIG90aGVyIG1lYW5zLFxuICogKHN1Y2ggYXMgYSBidWlsZGluZyBibG9jayBmb3IgYSBwaWVjZSBvZiBVSSksIHRoZW4gaXQgbXVzdCBiZSBvYnNlcnZlZCBleHBsaWNpdGx5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gb2JzZXJ2ZVRleHRFZGl0b3IoKTogKHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcikgPT4gdm9pZCB7XG4gIHJldHVybiAodGV4dEVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKSA9PiB7XG4gICAgaWYgKGh5cGVyY2xpY2sgIT0gbnVsbCkge1xuICAgICAgaHlwZXJjbGljay5vYnNlcnZlVGV4dEVkaXRvcih0ZXh0RWRpdG9yKTtcbiAgICB9XG4gIH07XG59XG4iXX0=