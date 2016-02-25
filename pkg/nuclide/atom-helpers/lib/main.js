

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
  addTooltip: {
    get: function get() {
      return requireFromCache('./tooltip').addTooltip;
    },
    configurable: true,
    enumerable: true
  }
});
//# sourceMappingURL=data:application/json;base64,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Ozs7O0FBRUcseUJBQXVCO1NBQUEsZUFBRztBQUM1QixhQUFPLGdCQUFnQixDQUFDLDZCQUE2QixDQUFDLENBQUM7S0FDeEQ7Ozs7QUFFRyxZQUFVO1NBQUEsZUFBRztBQUNmLGFBQU8sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUMsVUFBVSxDQUFDO0tBQ2pEOzs7O0VBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLy8gSXQncyBpbXBhY3RmdWwgdG8gbWVtb2l6ZSBvdXIgcmVxdWlyZXMgaGVyZSBzaW5jZSB0aGVzZSBjb21tb25zIGFyZSBzbyBvZnRlbiB1c2VkLlxuY29uc3QgcmVxdWlyZUNhY2hlOiB7W2lkOiBzdHJpbmddOiBhbnl9ID0ge307XG5mdW5jdGlvbiByZXF1aXJlRnJvbUNhY2hlKGlkOiBzdHJpbmcpOiBhbnkge1xuICBpZiAoIXJlcXVpcmVDYWNoZS5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIHJlcXVpcmVDYWNoZVtpZF0gPSByZXF1aXJlKGlkKTtcbiAgfVxuICByZXR1cm4gcmVxdWlyZUNhY2hlW2lkXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldCBwcm9qZWN0cygpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9wcm9qZWN0cycpO1xuICB9LFxuXG4gIGdldCBhdG9tRXZlbnREZWJvdW5jZSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9hdG9tLWV2ZW50LWRlYm91bmNlJyk7XG4gIH0sXG5cbiAgZ2V0IGJyb3dzZXIoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vYnJvd3NlcicpO1xuICB9LFxuXG4gIGdldCBjcmVhdGVTY3JpcHRCdWZmZXJlZFByb2Nlc3NXaXRoRW52KCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3NjcmlwdC1idWZmZXJlZC1wcm9jZXNzJykuY3JlYXRlU2NyaXB0QnVmZmVyZWRQcm9jZXNzV2l0aEVudjtcbiAgfSxcblxuICBnZXQgY3JlYXRlUGFuZUNvbnRhaW5lcigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9jcmVhdGUtcGFuZS1jb250YWluZXInKTtcbiAgfSxcblxuICBnZXQgY3JlYXRlVGV4dEVkaXRvcigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi90ZXh0LWVkaXRvcicpLmNyZWF0ZVRleHRFZGl0b3I7XG4gIH0sXG5cbiAgZ2V0IGV4aXN0aW5nRWRpdG9yRm9yVXJpKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3RleHQtZWRpdG9yJykuZXhpc3RpbmdFZGl0b3JGb3JVcmk7XG4gIH0sXG5cbiAgZ2V0IGV4aXN0aW5nQnVmZmVyRm9yVXJpKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3RleHQtZWRpdG9yJykuZXhpc3RpbmdCdWZmZXJGb3JVcmk7XG4gIH0sXG5cbiAgZ2V0IGJ1ZmZlckZvclVyaSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi90ZXh0LWVkaXRvcicpLmJ1ZmZlckZvclVyaTtcbiAgfSxcblxuICBnZXQgbG9hZEJ1ZmZlckZvclVyaSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi90ZXh0LWVkaXRvcicpLmxvYWRCdWZmZXJGb3JVcmk7XG4gIH0sXG5cbiAgZ2V0IGRlc3Ryb3lQYW5lSXRlbVdpdGhUaXRsZSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9kZXN0cm95LXBhbmUtaXRlbScpO1xuICB9LFxuXG4gIGdldCBmaWxlVHlwZUNsYXNzKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2ZpbGUtdHlwZS1jbGFzcycpO1xuICB9LFxuXG4gIGdldCBnb1RvTG9jYXRpb24oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vZ28tdG8tbG9jYXRpb24nKTtcbiAgfSxcblxuICBnZXQgZ2V0UGF0aFRvV29ya3NwYWNlU3RhdGUoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vd29ya3NwYWNlJykuZ2V0UGF0aFRvV29ya3NwYWNlU3RhdGU7XG4gIH0sXG5cbiAgZ2V0IGlzVGV4dEVkaXRvcigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi90ZXh0LWVkaXRvcicpLmlzVGV4dEVkaXRvcjtcbiAgfSxcblxuICBnZXQgZXh0cmFjdFdvcmRBdFBvc2l0aW9uKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2V4dHJhY3Qtd29yZC1hdC1wb3NpdGlvbicpO1xuICB9LFxuXG4gIGdldCBtb3VzZUxpc3RlbmVyRm9yVGV4dEVkaXRvcigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9tb3VzZS1saXN0ZW5lci1mb3ItdGV4dC1lZGl0b3InKTtcbiAgfSxcblxuICBnZXQgb2JzZXJ2ZUxhbmd1YWdlVGV4dEVkaXRvcnMoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vb2JzZXJ2ZS1sYW5ndWFnZS10ZXh0LWVkaXRvcnMnKTtcbiAgfSxcblxuICBnZXQgb2JzZXJ2ZUdyYW1tYXJGb3JUZXh0RWRpdG9ycygpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9vYnNlcnZlLWdyYW1tYXItZm9yLXRleHQtZWRpdG9ycycpO1xuICB9LFxuXG4gIGdldCByZWdpc3RlckdyYW1tYXJGb3JGaWxlRXh0ZW5zaW9uKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3JlZ2lzdGVyLWdyYW1tYXItZm9yLWZpbGUtZXh0ZW5zaW9uJyk7XG4gIH0sXG5cbiAgZ2V0IHdpdGhMb2FkaW5nTm90aWZpY2F0aW9uKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3dpdGgtbG9hZGluZy1ub3RpZmljYXRpb24nKTtcbiAgfSxcblxuICBnZXQgYWRkVG9vbHRpcCgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi90b29sdGlwJykuYWRkVG9vbHRpcDtcbiAgfSxcbn07XG4iXX0=