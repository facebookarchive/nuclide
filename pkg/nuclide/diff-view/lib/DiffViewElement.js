var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require('atom');

var DID_DESTROY_EVENT_NAME = 'did-destroy';

var DiffViewElement = (function (_HTMLElement) {
  _inherits(DiffViewElement, _HTMLElement);

  function DiffViewElement() {
    _classCallCheck(this, DiffViewElement);

    _get(Object.getPrototypeOf(DiffViewElement.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DiffViewElement, [{
    key: 'initialize',
    value: function initialize(diffModel, uri) {
      this._diffModel = diffModel;
      this._uri = uri;
      this._emitter = new _atom.Emitter();
      return this;
    }

    /**
     * Return the tab title for the opened diff view tab item.
     */
  }, {
    key: 'getTitle',
    value: function getTitle() {
      return 'Diff View';
    }

    /**
     * Return the tab URI for the opened diff view tab item.
     * This guarantees only one diff view will be opened per URI.
     */
  }, {
    key: 'getURI',
    value: function getURI() {
      return this._uri;
    }

    /**
     * Saves the edited file in the editable right text editor.
     */
  }, {
    key: 'save',
    value: function save() {
      this._diffModel.saveActiveFile();
    }

    /**
     * Emits a destroy event that's used to unmount the attached React component
     * and invalidate the cached view instance of the Diff View.
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this._emitter.emit('did-destroy');
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return null;
    }
  }, {
    key: 'onDidDestroy',
    value: function onDidDestroy(callback) {
      return this._emitter.on(DID_DESTROY_EVENT_NAME, callback);
    }
  }]);

  return DiffViewElement;
})(HTMLElement);

module.exports = DiffViewElement = document.registerElement('nuclide-diff-view', {
  prototype: DiffViewElement.prototype
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3RWxlbWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O29CQWFzQixNQUFNOztBQUU1QixJQUFNLHNCQUFzQixHQUFHLGFBQWEsQ0FBQzs7SUFFdkMsZUFBZTtZQUFmLGVBQWU7O1dBQWYsZUFBZTswQkFBZixlQUFlOzsrQkFBZixlQUFlOzs7ZUFBZixlQUFlOztXQUtULG9CQUFDLFNBQXdCLEVBQUUsR0FBVyxFQUFlO0FBQzdELFVBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLFVBQUksQ0FBQyxRQUFRLEdBQUcsbUJBQWEsQ0FBQztBQUM5QixhQUFPLElBQUksQ0FBQztLQUNiOzs7Ozs7O1dBS08sb0JBQVc7QUFDakIsYUFBTyxXQUFXLENBQUM7S0FDcEI7Ozs7Ozs7O1dBTUssa0JBQVc7QUFDZixhQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDbEI7Ozs7Ozs7V0FLRyxnQkFBUztBQUNYLFVBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDbEM7Ozs7Ozs7O1dBTU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNuQzs7O1dBRVEscUJBQVk7QUFDbkIsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBRVcsc0JBQUMsUUFBb0IsRUFBZTtBQUM5QyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzNEOzs7U0FoREcsZUFBZTtHQUFTLFdBQVc7O0FBb0R6QyxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLG1CQUFtQixFQUFFO0FBQy9FLFdBQVMsRUFBRSxlQUFlLENBQUMsU0FBUztDQUNyQyxDQUFDLENBQUMiLCJmaWxlIjoiRGlmZlZpZXdFbGVtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbCBmcm9tICcuL0RpZmZWaWV3TW9kZWwnO1xuXG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuXG5jb25zdCBESURfREVTVFJPWV9FVkVOVF9OQU1FID0gJ2RpZC1kZXN0cm95JztcblxuY2xhc3MgRGlmZlZpZXdFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBfdXJpOiBzdHJpbmc7XG4gIF9kaWZmTW9kZWw6IERpZmZWaWV3TW9kZWw7XG4gIF9lbWl0dGVyOiBhdG9tJEVtaXR0ZXI7XG5cbiAgaW5pdGlhbGl6ZShkaWZmTW9kZWw6IERpZmZWaWV3TW9kZWwsIHVyaTogc3RyaW5nKTogSFRNTEVsZW1lbnQge1xuICAgIHRoaXMuX2RpZmZNb2RlbCA9IGRpZmZNb2RlbDtcbiAgICB0aGlzLl91cmkgPSB1cmk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSB0YWIgdGl0bGUgZm9yIHRoZSBvcGVuZWQgZGlmZiB2aWV3IHRhYiBpdGVtLlxuICAgKi9cbiAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ0RpZmYgVmlldyc7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSB0YWIgVVJJIGZvciB0aGUgb3BlbmVkIGRpZmYgdmlldyB0YWIgaXRlbS5cbiAgICogVGhpcyBndWFyYW50ZWVzIG9ubHkgb25lIGRpZmYgdmlldyB3aWxsIGJlIG9wZW5lZCBwZXIgVVJJLlxuICAgKi9cbiAgZ2V0VVJJKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3VyaTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlcyB0aGUgZWRpdGVkIGZpbGUgaW4gdGhlIGVkaXRhYmxlIHJpZ2h0IHRleHQgZWRpdG9yLlxuICAgKi9cbiAgc2F2ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaWZmTW9kZWwuc2F2ZUFjdGl2ZUZpbGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0cyBhIGRlc3Ryb3kgZXZlbnQgdGhhdCdzIHVzZWQgdG8gdW5tb3VudCB0aGUgYXR0YWNoZWQgUmVhY3QgY29tcG9uZW50XG4gICAqIGFuZCBpbnZhbGlkYXRlIHRoZSBjYWNoZWQgdmlldyBpbnN0YW5jZSBvZiB0aGUgRGlmZiBWaWV3LlxuICAgKi9cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1kZXN0cm95Jyk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogP09iamVjdCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBvbkRpZERlc3Ryb3koY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oRElEX0RFU1RST1lfRVZFTlRfTkFNRSwgY2FsbGJhY2spO1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmVmlld0VsZW1lbnQgPSBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQoJ251Y2xpZGUtZGlmZi12aWV3Jywge1xuICBwcm90b3R5cGU6IERpZmZWaWV3RWxlbWVudC5wcm90b3R5cGUsXG59KTtcbiJdfQ==