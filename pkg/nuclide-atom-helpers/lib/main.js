

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
  existingEditorForUri: {
    get: function get() {
      return requireFromCache('./text-editor').existingEditorForUri;
    },
    configurable: true,
    enumerable: true
  },
  existingBufferForUri: {
    get: function get() {
      return requireFromCache('./text-editor').existingBufferForUri;
    },
    configurable: true,
    enumerable: true
  },
  bufferForUri: {
    get: function get() {
      return requireFromCache('./text-editor').bufferForUri;
    },
    configurable: true,
    enumerable: true
  },
  loadBufferForUri: {
    get: function get() {
      return requireFromCache('./text-editor').loadBufferForUri;
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
      return requireFromCache('./go-to-location').goToLocation;
    },
    configurable: true,
    enumerable: true
  },
  goToLocationInEditor: {
    get: function get() {
      return requireFromCache('./go-to-location').goToLocationInEditor;
    },
    configurable: true,
    enumerable: true
  },
  observeNavigatingEditors: {
    get: function get() {
      return requireFromCache('./go-to-location').observeNavigatingEditors;
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
  setPositionAndScroll: {
    get: function get() {
      return requireFromCache('./text-editor').setPositionAndScroll;
    },
    configurable: true,
    enumerable: true
  },
  getViewOfEditor: {
    get: function get() {
      return requireFromCache('./text-editor').getViewOfEditor;
    },
    configurable: true,
    enumerable: true
  },
  getScrollTop: {
    get: function get() {
      return requireFromCache('./text-editor').getScrollTop;
    },
    configurable: true,
    enumerable: true
  },
  getCursorPositions: {
    get: function get() {
      return requireFromCache('./text-editor').getCursorPositions;
    },
    configurable: true,
    enumerable: true
  },
  setScrollTop: {
    get: function get() {
      return requireFromCache('./text-editor').setScrollTop;
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
  },
  onWillDestroyTextBuffer: {
    get: function get() {
      return requireFromCache('./on-will-destroy-text-buffer');
    },
    configurable: true,
    enumerable: true
  },
  addTooltip: {
    get: function get() {
      return requireFromCache('./tooltip').addTooltip;
    },
    configurable: true,
    enumerable: true
  }
});
//# sourceMappingURL=data:application/json;base64,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QUFHO0FBQ2pCLGFBQU8sZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUMsWUFBWSxDQUFDO0tBQ3ZEOzs7O0FBRUcsdUJBQXFCO1NBQUEsZUFBRztBQUMxQixhQUFPLGdCQUFnQixDQUFDLDRCQUE0QixDQUFDLENBQUM7S0FDdkQ7Ozs7QUFFRyw0QkFBMEI7U0FBQSxlQUFHO0FBQy9CLGFBQU8sZ0JBQWdCLENBQUMsa0NBQWtDLENBQUMsQ0FBQztLQUM3RDs7OztBQUVHLDRCQUEwQjtTQUFBLGVBQUc7QUFDL0IsYUFBTyxnQkFBZ0IsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0tBQzVEOzs7O0FBRUcsOEJBQTRCO1NBQUEsZUFBRztBQUNqQyxhQUFPLGdCQUFnQixDQUFDLG9DQUFvQyxDQUFDLENBQUM7S0FDL0Q7Ozs7QUFFRyxpQ0FBK0I7U0FBQSxlQUFHO0FBQ3BDLGFBQU8sZ0JBQWdCLENBQUMsdUNBQXVDLENBQUMsQ0FBQztLQUNsRTs7OztBQUVHLHlCQUF1QjtTQUFBLGVBQUc7QUFDNUIsYUFBTyxnQkFBZ0IsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0tBQ3hEOzs7O0FBRUcseUJBQXVCO1NBQUEsZUFBa0U7QUFDM0YsYUFBTyxnQkFBZ0IsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0tBQzFEOzs7O0FBRUcsWUFBVTtTQUFBLGVBQUc7QUFDZixhQUFPLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLFVBQVUsQ0FBQztLQUNqRDs7OztFQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8vIEl0J3MgaW1wYWN0ZnVsIHRvIG1lbW9pemUgb3VyIHJlcXVpcmVzIGhlcmUgc2luY2UgdGhlc2UgY29tbW9ucyBhcmUgc28gb2Z0ZW4gdXNlZC5cbmNvbnN0IHJlcXVpcmVDYWNoZToge1tpZDogc3RyaW5nXTogYW55fSA9IHt9O1xuZnVuY3Rpb24gcmVxdWlyZUZyb21DYWNoZShpZDogc3RyaW5nKTogYW55IHtcbiAgaWYgKCFyZXF1aXJlQ2FjaGUuaGFzT3duUHJvcGVydHkoaWQpKSB7XG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICByZXF1aXJlQ2FjaGVbaWRdID0gcmVxdWlyZShpZCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVpcmVDYWNoZVtpZF07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXQgcHJvamVjdHMoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcHJvamVjdHMnKTtcbiAgfSxcblxuICBnZXQgYXRvbUV2ZW50RGVib3VuY2UoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vYXRvbS1ldmVudC1kZWJvdW5jZScpO1xuICB9LFxuXG4gIGdldCBicm93c2VyKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2Jyb3dzZXInKTtcbiAgfSxcblxuICBnZXQgY3JlYXRlU2NyaXB0QnVmZmVyZWRQcm9jZXNzV2l0aEVudigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9zY3JpcHQtYnVmZmVyZWQtcHJvY2VzcycpLmNyZWF0ZVNjcmlwdEJ1ZmZlcmVkUHJvY2Vzc1dpdGhFbnY7XG4gIH0sXG5cbiAgZ2V0IGNyZWF0ZVBhbmVDb250YWluZXIoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vY3JlYXRlLXBhbmUtY29udGFpbmVyJyk7XG4gIH0sXG5cbiAgZ2V0IGV4aXN0aW5nRWRpdG9yRm9yVXJpKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3RleHQtZWRpdG9yJykuZXhpc3RpbmdFZGl0b3JGb3JVcmk7XG4gIH0sXG5cbiAgZ2V0IGV4aXN0aW5nQnVmZmVyRm9yVXJpKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3RleHQtZWRpdG9yJykuZXhpc3RpbmdCdWZmZXJGb3JVcmk7XG4gIH0sXG5cbiAgZ2V0IGJ1ZmZlckZvclVyaSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi90ZXh0LWVkaXRvcicpLmJ1ZmZlckZvclVyaTtcbiAgfSxcblxuICBnZXQgbG9hZEJ1ZmZlckZvclVyaSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi90ZXh0LWVkaXRvcicpLmxvYWRCdWZmZXJGb3JVcmk7XG4gIH0sXG5cbiAgZ2V0IGRlc3Ryb3lQYW5lSXRlbVdpdGhUaXRsZSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9kZXN0cm95LXBhbmUtaXRlbScpO1xuICB9LFxuXG4gIGdldCBmaWxlVHlwZUNsYXNzKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2ZpbGUtdHlwZS1jbGFzcycpO1xuICB9LFxuXG4gIGdldCBnb1RvTG9jYXRpb24oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vZ28tdG8tbG9jYXRpb24nKS5nb1RvTG9jYXRpb247XG4gIH0sXG5cbiAgZ2V0IGdvVG9Mb2NhdGlvbkluRWRpdG9yKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2dvLXRvLWxvY2F0aW9uJykuZ29Ub0xvY2F0aW9uSW5FZGl0b3I7XG4gIH0sXG5cbiAgZ2V0IG9ic2VydmVOYXZpZ2F0aW5nRWRpdG9ycygpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9nby10by1sb2NhdGlvbicpLm9ic2VydmVOYXZpZ2F0aW5nRWRpdG9ycztcbiAgfSxcblxuICBnZXQgZ2V0UGF0aFRvV29ya3NwYWNlU3RhdGUoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vd29ya3NwYWNlJykuZ2V0UGF0aFRvV29ya3NwYWNlU3RhdGU7XG4gIH0sXG5cbiAgZ2V0IHNldFBvc2l0aW9uQW5kU2Nyb2xsKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3RleHQtZWRpdG9yJykuc2V0UG9zaXRpb25BbmRTY3JvbGw7XG4gIH0sXG5cbiAgZ2V0IGdldFZpZXdPZkVkaXRvcigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi90ZXh0LWVkaXRvcicpLmdldFZpZXdPZkVkaXRvcjtcbiAgfSxcblxuICBnZXQgZ2V0U2Nyb2xsVG9wKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3RleHQtZWRpdG9yJykuZ2V0U2Nyb2xsVG9wO1xuICB9LFxuXG4gIGdldCBnZXRDdXJzb3JQb3NpdGlvbnMoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vdGV4dC1lZGl0b3InKS5nZXRDdXJzb3JQb3NpdGlvbnM7XG4gIH0sXG5cbiAgZ2V0IHNldFNjcm9sbFRvcCgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi90ZXh0LWVkaXRvcicpLnNldFNjcm9sbFRvcDtcbiAgfSxcblxuICBnZXQgZXh0cmFjdFdvcmRBdFBvc2l0aW9uKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2V4dHJhY3Qtd29yZC1hdC1wb3NpdGlvbicpO1xuICB9LFxuXG4gIGdldCBtb3VzZUxpc3RlbmVyRm9yVGV4dEVkaXRvcigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9tb3VzZS1saXN0ZW5lci1mb3ItdGV4dC1lZGl0b3InKTtcbiAgfSxcblxuICBnZXQgb2JzZXJ2ZUxhbmd1YWdlVGV4dEVkaXRvcnMoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vb2JzZXJ2ZS1sYW5ndWFnZS10ZXh0LWVkaXRvcnMnKTtcbiAgfSxcblxuICBnZXQgb2JzZXJ2ZUdyYW1tYXJGb3JUZXh0RWRpdG9ycygpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9vYnNlcnZlLWdyYW1tYXItZm9yLXRleHQtZWRpdG9ycycpO1xuICB9LFxuXG4gIGdldCByZWdpc3RlckdyYW1tYXJGb3JGaWxlRXh0ZW5zaW9uKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3JlZ2lzdGVyLWdyYW1tYXItZm9yLWZpbGUtZXh0ZW5zaW9uJyk7XG4gIH0sXG5cbiAgZ2V0IHdpdGhMb2FkaW5nTm90aWZpY2F0aW9uKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3dpdGgtbG9hZGluZy1ub3RpZmljYXRpb24nKTtcbiAgfSxcblxuICBnZXQgb25XaWxsRGVzdHJveVRleHRCdWZmZXIoKTogKGNhbGxiYWNrOiAoYnVmZmVyOiBhdG9tJFRleHRCdWZmZXIpID0+IG1peGVkKSA9PiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vb24td2lsbC1kZXN0cm95LXRleHQtYnVmZmVyJyk7XG4gIH0sXG5cbiAgZ2V0IGFkZFRvb2x0aXAoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vdG9vbHRpcCcpLmFkZFRvb2x0aXA7XG4gIH0sXG59O1xuIl19