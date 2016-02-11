

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
  }
});
//# sourceMappingURL=data:application/json;base64,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Ozs7O0FBRUcseUJBQXVCO1NBQUEsZUFBRztBQUM1QixhQUFPLGdCQUFnQixDQUFDLDZCQUE2QixDQUFDLENBQUM7S0FDeEQ7Ozs7RUFDRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vLyBJdCdzIGltcGFjdGZ1bCB0byBtZW1vaXplIG91ciByZXF1aXJlcyBoZXJlIHNpbmNlIHRoZXNlIGNvbW1vbnMgYXJlIHNvIG9mdGVuIHVzZWQuXG5jb25zdCByZXF1aXJlQ2FjaGU6IHtbaWQ6IHN0cmluZ106IGFueX0gPSB7fTtcbmZ1bmN0aW9uIHJlcXVpcmVGcm9tQ2FjaGUoaWQ6IHN0cmluZyk6IGFueSB7XG4gIGlmICghcmVxdWlyZUNhY2hlLmhhc093blByb3BlcnR5KGlkKSkge1xuICAgIC8vICRGbG93SWdub3JlXG4gICAgcmVxdWlyZUNhY2hlW2lkXSA9IHJlcXVpcmUoaWQpO1xuICB9XG4gIHJldHVybiByZXF1aXJlQ2FjaGVbaWRdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0IHByb2plY3RzKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3Byb2plY3RzJyk7XG4gIH0sXG5cbiAgZ2V0IGF0b21FdmVudERlYm91bmNlKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2F0b20tZXZlbnQtZGVib3VuY2UnKTtcbiAgfSxcblxuICBnZXQgYnJvd3NlcigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9icm93c2VyJyk7XG4gIH0sXG5cbiAgZ2V0IGNyZWF0ZVNjcmlwdEJ1ZmZlcmVkUHJvY2Vzc1dpdGhFbnYoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vc2NyaXB0LWJ1ZmZlcmVkLXByb2Nlc3MnKS5jcmVhdGVTY3JpcHRCdWZmZXJlZFByb2Nlc3NXaXRoRW52O1xuICB9LFxuXG4gIGdldCBjcmVhdGVQYW5lQ29udGFpbmVyKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2NyZWF0ZS1wYW5lLWNvbnRhaW5lcicpO1xuICB9LFxuXG4gIGdldCBjcmVhdGVUZXh0RWRpdG9yKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3RleHQtZWRpdG9yJykuY3JlYXRlVGV4dEVkaXRvcjtcbiAgfSxcblxuICBnZXQgZXhpc3RpbmdFZGl0b3JGb3JVcmkoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vdGV4dC1lZGl0b3InKS5leGlzdGluZ0VkaXRvckZvclVyaTtcbiAgfSxcblxuICBnZXQgZXhpc3RpbmdCdWZmZXJGb3JVcmkoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vdGV4dC1lZGl0b3InKS5leGlzdGluZ0J1ZmZlckZvclVyaTtcbiAgfSxcblxuICBnZXQgYnVmZmVyRm9yVXJpKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3RleHQtZWRpdG9yJykuYnVmZmVyRm9yVXJpO1xuICB9LFxuXG4gIGdldCBsb2FkQnVmZmVyRm9yVXJpKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3RleHQtZWRpdG9yJykubG9hZEJ1ZmZlckZvclVyaTtcbiAgfSxcblxuICBnZXQgZGVzdHJveVBhbmVJdGVtV2l0aFRpdGxlKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL2Rlc3Ryb3ktcGFuZS1pdGVtJyk7XG4gIH0sXG5cbiAgZ2V0IGZpbGVUeXBlQ2xhc3MoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vZmlsZS10eXBlLWNsYXNzJyk7XG4gIH0sXG5cbiAgZ2V0IGdvVG9Mb2NhdGlvbigpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9nby10by1sb2NhdGlvbicpO1xuICB9LFxuXG4gIGdldCBnZXRQYXRoVG9Xb3Jrc3BhY2VTdGF0ZSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi93b3Jrc3BhY2UnKS5nZXRQYXRoVG9Xb3Jrc3BhY2VTdGF0ZTtcbiAgfSxcblxuICBnZXQgaXNUZXh0RWRpdG9yKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL3RleHQtZWRpdG9yJykuaXNUZXh0RWRpdG9yO1xuICB9LFxuXG4gIGdldCBleHRyYWN0V29yZEF0UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vZXh0cmFjdC13b3JkLWF0LXBvc2l0aW9uJyk7XG4gIH0sXG5cbiAgZ2V0IG1vdXNlTGlzdGVuZXJGb3JUZXh0RWRpdG9yKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL21vdXNlLWxpc3RlbmVyLWZvci10ZXh0LWVkaXRvcicpO1xuICB9LFxuXG4gIGdldCBvYnNlcnZlTGFuZ3VhZ2VUZXh0RWRpdG9ycygpIHtcbiAgICByZXR1cm4gcmVxdWlyZUZyb21DYWNoZSgnLi9vYnNlcnZlLWxhbmd1YWdlLXRleHQtZWRpdG9ycycpO1xuICB9LFxuXG4gIGdldCBvYnNlcnZlR3JhbW1hckZvclRleHRFZGl0b3JzKCkge1xuICAgIHJldHVybiByZXF1aXJlRnJvbUNhY2hlKCcuL29ic2VydmUtZ3JhbW1hci1mb3ItdGV4dC1lZGl0b3JzJyk7XG4gIH0sXG5cbiAgZ2V0IHJlZ2lzdGVyR3JhbW1hckZvckZpbGVFeHRlbnNpb24oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vcmVnaXN0ZXItZ3JhbW1hci1mb3ItZmlsZS1leHRlbnNpb24nKTtcbiAgfSxcblxuICBnZXQgd2l0aExvYWRpbmdOb3RpZmljYXRpb24oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVGcm9tQ2FjaGUoJy4vd2l0aC1sb2FkaW5nLW5vdGlmaWNhdGlvbicpO1xuICB9LFxufTtcbiJdfQ==