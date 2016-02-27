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

var _remoteUri = require('../../remote-uri');

var DID_DESTROY_EVENT_NAME = 'did-destroy';
var CHANGE_TITLE_EVENT_NAME = 'did-change-title';

var DiffViewElement = (function (_HTMLElement) {
  _inherits(DiffViewElement, _HTMLElement);

  function DiffViewElement() {
    _classCallCheck(this, DiffViewElement);

    _get(Object.getPrototypeOf(DiffViewElement.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DiffViewElement, [{
    key: 'initialize',
    value: function initialize(diffModel, uri) {
      var _this = this;

      this._diffModel = diffModel;
      this._uri = uri;
      this._emitter = new _atom.Emitter();
      this._subscriptions = new _atom.CompositeDisposable();

      var fileName = this._getActiveFileName();
      this._subscriptions.add(this._diffModel.onActiveFileUpdates(function () {
        var newFileName = _this._getActiveFileName();
        if (newFileName !== fileName) {
          fileName = newFileName;
          _this._emitter.emit(CHANGE_TITLE_EVENT_NAME, _this.getTitle());
        }
      }));
      this._subscriptions.add(this._emitter);
      return this;
    }
  }, {
    key: '_getActiveFileName',
    value: function _getActiveFileName() {
      var _diffModel$getActiveFileState = this._diffModel.getActiveFileState();

      var filePath = _diffModel$getActiveFileState.filePath;

      if (filePath == null || filePath.length === 0) {
        return null;
      }
      return (0, _remoteUri.basename)(filePath);
    }
  }, {
    key: 'getIconName',
    value: function getIconName() {
      return 'git-branch';
    }

    /**
     * Return the tab title for the opened diff view tab item.
     */
  }, {
    key: 'getTitle',
    value: function getTitle() {
      var fileName = this._getActiveFileName();
      return 'Diff View' + (fileName == null ? '' : ' : ' + fileName);
    }

    /**
     * Change the title as the active file changes.
     */
  }, {
    key: 'onDidChangeTitle',
    value: function onDidChangeTitle(callback) {
      return this._emitter.on('did-change-title', callback);
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
  }, {
    key: 'onDidChangeModified',
    value: function onDidChangeModified(callback) {
      return this._diffModel.onDidActiveBufferChangeModified(callback);
    }
  }, {
    key: 'isModified',
    value: function isModified() {
      return this._diffModel.isActiveBufferModified();
    }

    /**
     * Emits a destroy event that's used to unmount the attached React component
     * and invalidate the cached view instance of the Diff View.
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this._emitter.emit('did-destroy');
      this._subscriptions.dispose();
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
//# sourceMappingURL=data:application/json;base64,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RUFBRSxDQUFDLHNCQUFzQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzNEOzs7U0F6RkcsZUFBZTtHQUFTLFdBQVc7O0FBNkZ6QyxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLG1CQUFtQixFQUFFO0FBQy9FLFdBQVMsRUFBRSxlQUFlLENBQUMsU0FBUztDQUNyQyxDQUFDLENBQUMiLCJmaWxlIjoiRGlmZlZpZXdFbGVtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbCBmcm9tICcuL0RpZmZWaWV3TW9kZWwnO1xuXG5pbXBvcnQge0VtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtiYXNlbmFtZX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmNvbnN0IERJRF9ERVNUUk9ZX0VWRU5UX05BTUUgPSAnZGlkLWRlc3Ryb3knO1xuY29uc3QgQ0hBTkdFX1RJVExFX0VWRU5UX05BTUUgPSAnZGlkLWNoYW5nZS10aXRsZSc7XG5cbmNsYXNzIERpZmZWaWV3RWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgX3VyaTogc3RyaW5nO1xuICBfZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xuICBfZW1pdHRlcjogYXRvbSRFbWl0dGVyO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBpbml0aWFsaXplKGRpZmZNb2RlbDogRGlmZlZpZXdNb2RlbCwgdXJpOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB7XG4gICAgdGhpcy5fZGlmZk1vZGVsID0gZGlmZk1vZGVsO1xuICAgIHRoaXMuX3VyaSA9IHVyaTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIGxldCBmaWxlTmFtZSA9IHRoaXMuX2dldEFjdGl2ZUZpbGVOYW1lKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5fZGlmZk1vZGVsLm9uQWN0aXZlRmlsZVVwZGF0ZXMoKCkgPT4ge1xuICAgICAgY29uc3QgbmV3RmlsZU5hbWUgPSB0aGlzLl9nZXRBY3RpdmVGaWxlTmFtZSgpO1xuICAgICAgaWYgKG5ld0ZpbGVOYW1lICE9PSBmaWxlTmFtZSkge1xuICAgICAgICBmaWxlTmFtZSA9IG5ld0ZpbGVOYW1lO1xuICAgICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX1RJVExFX0VWRU5UX05BTUUsIHRoaXMuZ2V0VGl0bGUoKSk7XG4gICAgICB9XG4gICAgfSkpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKHRoaXMuX2VtaXR0ZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2dldEFjdGl2ZUZpbGVOYW1lKCk6ID9zdHJpbmcge1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9kaWZmTW9kZWwuZ2V0QWN0aXZlRmlsZVN0YXRlKCk7XG4gICAgaWYgKGZpbGVQYXRoID09IG51bGwgfHwgZmlsZVBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGJhc2VuYW1lKGZpbGVQYXRoKTtcbiAgfVxuXG4gIGdldEljb25OYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdnaXQtYnJhbmNoJztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIHRhYiB0aXRsZSBmb3IgdGhlIG9wZW5lZCBkaWZmIHZpZXcgdGFiIGl0ZW0uXG4gICAqL1xuICBnZXRUaXRsZSgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGZpbGVOYW1lID0gdGhpcy5fZ2V0QWN0aXZlRmlsZU5hbWUoKTtcbiAgICByZXR1cm4gJ0RpZmYgVmlldycgKyAoZmlsZU5hbWUgPT0gbnVsbCA/ICcnIDogYCA6ICR7ZmlsZU5hbWV9YCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlIHRoZSB0aXRsZSBhcyB0aGUgYWN0aXZlIGZpbGUgY2hhbmdlcy5cbiAgICovXG4gIG9uRGlkQ2hhbmdlVGl0bGUoY2FsbGJhY2s6ICh0aXRsZTogc3RyaW5nKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignZGlkLWNoYW5nZS10aXRsZScsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIHRhYiBVUkkgZm9yIHRoZSBvcGVuZWQgZGlmZiB2aWV3IHRhYiBpdGVtLlxuICAgKiBUaGlzIGd1YXJhbnRlZXMgb25seSBvbmUgZGlmZiB2aWV3IHdpbGwgYmUgb3BlbmVkIHBlciBVUkkuXG4gICAqL1xuICBnZXRVUkkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fdXJpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhdmVzIHRoZSBlZGl0ZWQgZmlsZSBpbiB0aGUgZWRpdGFibGUgcmlnaHQgdGV4dCBlZGl0b3IuXG4gICAqL1xuICBzYXZlKCk6IHZvaWQge1xuICAgIHRoaXMuX2RpZmZNb2RlbC5zYXZlQWN0aXZlRmlsZSgpO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VNb2RpZmllZChjYWxsYmFjazogKCkgPT4gbWl4ZWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2RpZmZNb2RlbC5vbkRpZEFjdGl2ZUJ1ZmZlckNoYW5nZU1vZGlmaWVkKGNhbGxiYWNrKTtcbiAgfVxuXG4gIGlzTW9kaWZpZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2RpZmZNb2RlbC5pc0FjdGl2ZUJ1ZmZlck1vZGlmaWVkKCk7XG4gIH1cblxuICAvKipcbiAgICogRW1pdHMgYSBkZXN0cm95IGV2ZW50IHRoYXQncyB1c2VkIHRvIHVubW91bnQgdGhlIGF0dGFjaGVkIFJlYWN0IGNvbXBvbmVudFxuICAgKiBhbmQgaW52YWxpZGF0ZSB0aGUgY2FjaGVkIHZpZXcgaW5zdGFuY2Ugb2YgdGhlIERpZmYgVmlldy5cbiAgICovXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdkaWQtZGVzdHJveScpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgc2VyaWFsaXplKCk6ID9PYmplY3Qge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgb25EaWREZXN0cm95KGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKERJRF9ERVNUUk9ZX0VWRU5UX05BTUUsIGNhbGxiYWNrKTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZlZpZXdFbGVtZW50ID0gZG9jdW1lbnQucmVnaXN0ZXJFbGVtZW50KCdudWNsaWRlLWRpZmYtdmlldycsIHtcbiAgcHJvdG90eXBlOiBEaWZmVmlld0VsZW1lbnQucHJvdG90eXBlLFxufSk7XG4iXX0=