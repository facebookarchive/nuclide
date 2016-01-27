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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3RWxlbWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O29CQWFzQixNQUFNOztBQUU1QixJQUFNLHNCQUFzQixHQUFHLGFBQWEsQ0FBQzs7SUFFdkMsZUFBZTtZQUFmLGVBQWU7O1dBQWYsZUFBZTswQkFBZixlQUFlOzsrQkFBZixlQUFlOzs7ZUFBZixlQUFlOztXQUtULG9CQUFDLFNBQXdCLEVBQUUsR0FBVyxFQUFlO0FBQzdELFVBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLFVBQUksQ0FBQyxRQUFRLEdBQUcsbUJBQWEsQ0FBQztBQUM5QixhQUFPLElBQUksQ0FBQztLQUNiOzs7Ozs7O1dBS08sb0JBQVc7QUFDakIsYUFBTyxXQUFXLENBQUM7S0FDcEI7Ozs7Ozs7O1dBTUssa0JBQVc7QUFDZixhQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDbEI7Ozs7Ozs7V0FLRyxnQkFBUztBQUNYLFVBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDbEM7Ozs7Ozs7O1dBTU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNuQzs7O1dBRVEscUJBQVk7QUFDbkIsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBRVcsc0JBQUMsUUFBb0IsRUFBbUI7QUFDbEQsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUMzRDs7O1NBaERHLGVBQWU7R0FBUyxXQUFXOztBQW9EekMsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsRUFBRTtBQUMvRSxXQUFTLEVBQUUsZUFBZSxDQUFDLFNBQVM7Q0FDckMsQ0FBQyxDQUFDIiwiZmlsZSI6IkRpZmZWaWV3RWxlbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIERpZmZWaWV3TW9kZWwgZnJvbSAnLi9EaWZmVmlld01vZGVsJztcblxuaW1wb3J0IHtFbWl0dGVyfSBmcm9tICdhdG9tJztcblxuY29uc3QgRElEX0RFU1RST1lfRVZFTlRfTkFNRSA9ICdkaWQtZGVzdHJveSc7XG5cbmNsYXNzIERpZmZWaWV3RWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgX3VyaTogc3RyaW5nO1xuICBfZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xuICBfZW1pdHRlcjogYXRvbSRFbWl0dGVyO1xuXG4gIGluaXRpYWxpemUoZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsLCB1cmk6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgICB0aGlzLl9kaWZmTW9kZWwgPSBkaWZmTW9kZWw7XG4gICAgdGhpcy5fdXJpID0gdXJpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgdGFiIHRpdGxlIGZvciB0aGUgb3BlbmVkIGRpZmYgdmlldyB0YWIgaXRlbS5cbiAgICovXG4gIGdldFRpdGxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdEaWZmIFZpZXcnO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgdGFiIFVSSSBmb3IgdGhlIG9wZW5lZCBkaWZmIHZpZXcgdGFiIGl0ZW0uXG4gICAqIFRoaXMgZ3VhcmFudGVlcyBvbmx5IG9uZSBkaWZmIHZpZXcgd2lsbCBiZSBvcGVuZWQgcGVyIFVSSS5cbiAgICovXG4gIGdldFVSSSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl91cmk7XG4gIH1cblxuICAvKipcbiAgICogU2F2ZXMgdGhlIGVkaXRlZCBmaWxlIGluIHRoZSBlZGl0YWJsZSByaWdodCB0ZXh0IGVkaXRvci5cbiAgICovXG4gIHNhdmUoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlmZk1vZGVsLnNhdmVBY3RpdmVGaWxlKCk7XG4gIH1cblxuICAvKipcbiAgICogRW1pdHMgYSBkZXN0cm95IGV2ZW50IHRoYXQncyB1c2VkIHRvIHVubW91bnQgdGhlIGF0dGFjaGVkIFJlYWN0IGNvbXBvbmVudFxuICAgKiBhbmQgaW52YWxpZGF0ZSB0aGUgY2FjaGVkIHZpZXcgaW5zdGFuY2Ugb2YgdGhlIERpZmYgVmlldy5cbiAgICovXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdkaWQtZGVzdHJveScpO1xuICB9XG5cbiAgc2VyaWFsaXplKCk6ID9PYmplY3Qge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgb25EaWREZXN0cm95KGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihESURfREVTVFJPWV9FVkVOVF9OQU1FLCBjYWxsYmFjayk7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpZmZWaWV3RWxlbWVudCA9IGRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudCgnbnVjbGlkZS1kaWZmLXZpZXcnLCB7XG4gIHByb3RvdHlwZTogRGlmZlZpZXdFbGVtZW50LnByb3RvdHlwZSxcbn0pO1xuIl19