

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// It's impactful to memoize our requires here since these commons are so often used.
var requireCache = {};
function requireFromCache(id) {
  if (!requireCache.hasOwnProperty(id)) {
    // $FlowIgnore
    requireCache[id] = require(id);
  }
  return requireCache[id];
}

module.exports = Object.defineProperties({}, {
  projects: {
    get: function get() {
      return requireFromCache('./projects');
    },
    configurable: true,
    enumerable: true
  },
  atomEventDebounce: {
    get: function get() {
      return requireFromCache('./atom-event-debounce');
    },
    configurable: true,
    enumerable: true
  },
  browser: {
    get: function get() {
      return requireFromCache('./browser');
    },
    configurable: true,
    enumerable: true
  },
  createScriptBufferedProcessWithEnv: {
    get: function get() {
      return requireFromCache('./script-buffered-process').createScriptBufferedProcessWithEnv;
    },
    configurable: true,
    enumerable: true
  },
  createPaneContainer: {
    get: function get() {
      return requireFromCache('./create-pane-container');
    },
    configurable: true,
    enumerable: true
  },
  createTextEditor: {
    get: function get() {
      return requireFromCache('./text-editor').createTextEditor;
    },
    configurable: true,
    enumerable: true
  },
  editorForPath: {
    get: function get() {
      return requireFromCache('./text-editor').editorForPath;
    },
    configurable: true,
    enumerable: true
  },
  destroyPaneItemWithTitle: {
    get: function get() {
      return requireFromCache('./destroy-pane-item');
    },
    configurable: true,
    enumerable: true
  },
  fileTypeClass: {
    get: function get() {
      return requireFromCache('./file-type-class');
    },
    configurable: true,
    enumerable: true
  },
  goToLocation: {
    get: function get() {
      return requireFromCache('./go-to-location');
    },
    configurable: true,
    enumerable: true
  },
  getPathToWorkspaceState: {
    get: function get() {
      return requireFromCache('./workspace').getPathToWorkspaceState;
    },
    configurable: true,
    enumerable: true
  },
  isTextEditor: {
    get: function get() {
      return requireFromCache('./text-editor').isTextEditor;
    },
    configurable: true,
    enumerable: true
  },
  closeTabForBuffer: {
    get: function get() {
      return requireFromCache('./close-tab-buffer');
    },
    configurable: true,
    enumerable: true
  },
  extractWordAtPosition: {
    get: function get() {
      return requireFromCache('./extract-word-at-position');
    },
    configurable: true,
    enumerable: true
  },
  mouseListenerForTextEditor: {
    get: function get() {
      return requireFromCache('./mouse-listener-for-text-editor');
    },
    configurable: true,
    enumerable: true
  },
  observeLanguageTextEditors: {
    get: function get() {
      return requireFromCache('./observe-language-text-editors');
    },
    configurable: true,
    enumerable: true
  },
  observeGrammarForTextEditors: {
    get: function get() {
      return requireFromCache('./observe-grammar-for-text-editors');
    },
    configurable: true,
    enumerable: true
  },
  registerGrammarForFileExtension: {
    get: function get() {
      return requireFromCache('./register-grammar-for-file-extension');
    },
    configurable: true,
    enumerable: true
  },
  withLoadingNotification: {
    get: function get() {
      return requireFromCache('./with-loading-notification');
    },
    configurable: true,
    enumerable: true
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFZQSxJQUFNLFlBQWlDLEdBQUcsRUFBRSxDQUFDO0FBQzdDLFNBQVMsZ0JBQWdCLENBQUMsRUFBVSxFQUFPO0FBQ3pDLE1BQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxFQUFFOztBQUVwQyxnQkFBWSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztHQUNoQztBQUNELFNBQU8sWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3pCOztBQUVELE1BQU0sQ0FBQyxPQUFPLDJCQUFHLEVBNEVoQjtBQTNFSyxVQUFRO1NBQUEsZUFBRztBQUNiLGFBQU8sZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDdkM7Ozs7QUFFRyxtQkFBaUI7U0FBQSxlQUFHO0FBQ3RCLGFBQU8sZ0JBQWdCLENBQUMsdUJBQXVCLENBQUMsQ0FBQztLQUNsRDs7OztBQUVHLFNBQU87U0FBQSxlQUFHO0FBQ1osYUFBTyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUN0Qzs7OztBQUVHLG9DQUFrQztTQUFBLGVBQUc7QUFDdkMsYUFBTyxnQkFBZ0IsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLGtDQUFrQyxDQUFDO0tBQ3pGOzs7O0FBRUcscUJBQW1CO1NBQUEsZUFBRztBQUN4QixhQUFPLGdCQUFnQixDQUFDLHlCQUF5QixDQUFDLENBQUM7S0FDcEQ7Ozs7QUFFRyxrQkFBZ0I7U0FBQSxlQUFHO0FBQ3JCLGFBQU8sZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUMsZ0JBQWdCLENBQUM7S0FDM0Q7Ozs7QUFFRyxlQUFhO1NBQUEsZUFBRztBQUNsQixhQUFPLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDLGFBQWEsQ0FBQztLQUN4RDs7OztBQUVHLDBCQUF3QjtTQUFBLGVBQUc7QUFDN0IsYUFBTyxnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0tBQ2hEOzs7O0FBRUcsZUFBYTtTQUFBLGVBQUc7QUFDbEIsYUFBTyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0tBQzlDOzs7O0FBRUcsY0FBWTtTQUFBLGVBQUc7QUFDakIsYUFBTyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0tBQzdDOzs7O0FBRUcseUJBQXVCO1NBQUEsZUFBRztBQUM1QixhQUFPLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDLHVCQUF1QixDQUFDO0tBQ2hFOzs7O0FBRUcsY0FBWTtTQUFBLGVBQUc7QUFDakIsYUFBTyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsQ0FBQyxZQUFZLENBQUM7S0FDdkQ7Ozs7QUFFRyxtQkFBaUI7U0FBQSxlQUFHO0FBQ3RCLGFBQU8sZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztLQUMvQzs7OztBQUVHLHVCQUFxQjtTQUFBLGVBQUc7QUFDMUIsYUFBTyxnQkFBZ0IsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0tBQ3ZEOzs7O0FBRUcsNEJBQTBCO1NBQUEsZUFBRztBQUMvQixhQUFPLGdCQUFnQixDQUFDLGtDQUFrQyxDQUFDLENBQUM7S0FDN0Q7Ozs7QUFFRyw0QkFBMEI7U0FBQSxlQUFHO0FBQy9CLGFBQU8sZ0JBQWdCLENBQUMsaUNBQWlDLENBQUMsQ0FBQztLQUM1RDs7OztBQUVHLDhCQUE0QjtTQUFBLGVBQUc7QUFDakMsYUFBTyxnQkFBZ0IsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO0tBQy9EOzs7O0FBRUcsaUNBQStCO1NBQUEsZUFBRztBQUNwQyxhQUFPLGdCQUFnQixDQUFDLHVDQUF1QyxDQUFDLENBQUM7S0FDbEU7Ozs7QUFFRyx5QkFBdUI7U0FBQSxlQUFHO0FBQzVCLGFBQU8sZ0JBQWdCLENBQUMsNkJBQTZCLENBQUMsQ0FBQztLQUN4RDs7OztFQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8vIEl0J3MgaW1wYWN0ZnVsIHRvIG1lbW9pemUgb3VyIHJlcXVpcmVzIGhlcmUgc2luY2UgdGhlc2UgY29tbW9ucyBhcmUgc28gb2Z0ZW4gdXNlZC5cbmNvbnN0IHJlcXVpcmVDYWNoZToge1tpZDogc3RyaW5nXTogYW55fSA9IHt9O1xuZnVuY3Rpb24gcmVxdWlyZUZyb21DYWNoZShpZDogc3RyaW5nKTogYW55IHtcbiAgaWYgKCFyZXF1aXJlQ2FjaGUuaGFzT3duUHJvcGVydHkoaWQpKSB7XG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICByZXF1aXJlQ2FjaGVbaWRdID0gcmVxdWlyZShpZCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVpcmVDYWNoZVtpZF07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXQgcHJvamVjdHMoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvamVjdHMnKTtcbiAgfSxcblxuICBnZXQgYXRvbUV2ZW50RGVib3VuY2UoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vYXRvbS1ldmVudC1kZWJvdW5jZScpO1xuICB9LFxuXG4gIGdldCBicm93c2VyKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2Jyb3dzZXInKTtcbiAgfSxcblxuICBnZXQgY3JlYXRlU2NyaXB0QnVmZmVyZWRQcm9jZXNzV2l0aEVudigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9zY3JpcHQtYnVmZmVyZWQtcHJvY2VzcycpLmNyZWF0ZVNjcmlwdEJ1ZmZlcmVkUHJvY2Vzc1dpdGhFbnY7XG4gIH0sXG5cbiAgZ2V0IGNyZWF0ZVBhbmVDb250YWluZXIoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vY3JlYXRlLXBhbmUtY29udGFpbmVyJyk7XG4gIH0sXG5cbiAgZ2V0IGNyZWF0ZVRleHRFZGl0b3IoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vdGV4dC1lZGl0b3InKS5jcmVhdGVUZXh0RWRpdG9yO1xuICB9LFxuXG4gIGdldCBlZGl0b3JGb3JQYXRoKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3RleHQtZWRpdG9yJykuZWRpdG9yRm9yUGF0aDtcbiAgfSxcblxuICBnZXQgZGVzdHJveVBhbmVJdGVtV2l0aFRpdGxlKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2Rlc3Ryb3ktcGFuZS1pdGVtJyk7XG4gIH0sXG5cbiAgZ2V0IGZpbGVUeXBlQ2xhc3MoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vZmlsZS10eXBlLWNsYXNzJyk7XG4gIH0sXG5cbiAgZ2V0IGdvVG9Mb2NhdGlvbigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9nby10by1sb2NhdGlvbicpO1xuICB9LFxuXG4gIGdldCBnZXRQYXRoVG9Xb3Jrc3BhY2VTdGF0ZSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi93b3Jrc3BhY2UnKS5nZXRQYXRoVG9Xb3Jrc3BhY2VTdGF0ZTtcbiAgfSxcblxuICBnZXQgaXNUZXh0RWRpdG9yKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3RleHQtZWRpdG9yJykuaXNUZXh0RWRpdG9yO1xuICB9LFxuXG4gIGdldCBjbG9zZVRhYkZvckJ1ZmZlcigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9jbG9zZS10YWItYnVmZmVyJyk7XG4gIH0sXG5cbiAgZ2V0IGV4dHJhY3RXb3JkQXRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9leHRyYWN0LXdvcmQtYXQtcG9zaXRpb24nKTtcbiAgfSxcblxuICBnZXQgbW91c2VMaXN0ZW5lckZvclRleHRFZGl0b3IoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vbW91c2UtbGlzdGVuZXItZm9yLXRleHQtZWRpdG9yJyk7XG4gIH0sXG5cbiAgZ2V0IG9ic2VydmVMYW5ndWFnZVRleHRFZGl0b3JzKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL29ic2VydmUtbGFuZ3VhZ2UtdGV4dC1lZGl0b3JzJyk7XG4gIH0sXG5cbiAgZ2V0IG9ic2VydmVHcmFtbWFyRm9yVGV4dEVkaXRvcnMoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vb2JzZXJ2ZS1ncmFtbWFyLWZvci10ZXh0LWVkaXRvcnMnKTtcbiAgfSxcblxuICBnZXQgcmVnaXN0ZXJHcmFtbWFyRm9yRmlsZUV4dGVuc2lvbigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9yZWdpc3Rlci1ncmFtbWFyLWZvci1maWxlLWV4dGVuc2lvbicpO1xuICB9LFxuXG4gIGdldCB3aXRoTG9hZGluZ05vdGlmaWNhdGlvbigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi93aXRoLWxvYWRpbmctbm90aWZpY2F0aW9uJyk7XG4gIH0sXG59O1xuIl19