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

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

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
      return (0, _nuclideRemoteUri.basename)(filePath);
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
//# sourceMappingURL=data:application/json;base64,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RUFBRSxDQUFDLHNCQUFzQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzNEOzs7U0F6RkcsZUFBZTtHQUFTLFdBQVc7O0FBNkZ6QyxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLG1CQUFtQixFQUFFO0FBQy9FLFdBQVMsRUFBRSxlQUFlLENBQUMsU0FBUztDQUNyQyxDQUFDLENBQUMiLCJmaWxlIjoiRGlmZlZpZXdFbGVtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbCBmcm9tICcuL0RpZmZWaWV3TW9kZWwnO1xuXG5pbXBvcnQge0VtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtiYXNlbmFtZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxuY29uc3QgRElEX0RFU1RST1lfRVZFTlRfTkFNRSA9ICdkaWQtZGVzdHJveSc7XG5jb25zdCBDSEFOR0VfVElUTEVfRVZFTlRfTkFNRSA9ICdkaWQtY2hhbmdlLXRpdGxlJztcblxuY2xhc3MgRGlmZlZpZXdFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBfdXJpOiBzdHJpbmc7XG4gIF9kaWZmTW9kZWw6IERpZmZWaWV3TW9kZWw7XG4gIF9lbWl0dGVyOiBhdG9tJEVtaXR0ZXI7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGluaXRpYWxpemUoZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsLCB1cmk6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgICB0aGlzLl9kaWZmTW9kZWwgPSBkaWZmTW9kZWw7XG4gICAgdGhpcy5fdXJpID0gdXJpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgbGV0IGZpbGVOYW1lID0gdGhpcy5fZ2V0QWN0aXZlRmlsZU5hbWUoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZCh0aGlzLl9kaWZmTW9kZWwub25BY3RpdmVGaWxlVXBkYXRlcygoKSA9PiB7XG4gICAgICBjb25zdCBuZXdGaWxlTmFtZSA9IHRoaXMuX2dldEFjdGl2ZUZpbGVOYW1lKCk7XG4gICAgICBpZiAobmV3RmlsZU5hbWUgIT09IGZpbGVOYW1lKSB7XG4gICAgICAgIGZpbGVOYW1lID0gbmV3RmlsZU5hbWU7XG4gICAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfVElUTEVfRVZFTlRfTkFNRSwgdGhpcy5nZXRUaXRsZSgpKTtcbiAgICAgIH1cbiAgICB9KSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5fZW1pdHRlcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfZ2V0QWN0aXZlRmlsZU5hbWUoKTogP3N0cmluZyB7XG4gICAgY29uc3Qge2ZpbGVQYXRofSA9IHRoaXMuX2RpZmZNb2RlbC5nZXRBY3RpdmVGaWxlU3RhdGUoKTtcbiAgICBpZiAoZmlsZVBhdGggPT0gbnVsbCB8fCBmaWxlUGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gYmFzZW5hbWUoZmlsZVBhdGgpO1xuICB9XG5cbiAgZ2V0SWNvbk5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ2dpdC1icmFuY2gnO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgdGFiIHRpdGxlIGZvciB0aGUgb3BlbmVkIGRpZmYgdmlldyB0YWIgaXRlbS5cbiAgICovXG4gIGdldFRpdGxlKCk6IHN0cmluZyB7XG4gICAgY29uc3QgZmlsZU5hbWUgPSB0aGlzLl9nZXRBY3RpdmVGaWxlTmFtZSgpO1xuICAgIHJldHVybiAnRGlmZiBWaWV3JyArIChmaWxlTmFtZSA9PSBudWxsID8gJycgOiBgIDogJHtmaWxlTmFtZX1gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIHRpdGxlIGFzIHRoZSBhY3RpdmUgZmlsZSBjaGFuZ2VzLlxuICAgKi9cbiAgb25EaWRDaGFuZ2VUaXRsZShjYWxsYmFjazogKHRpdGxlOiBzdHJpbmcpID0+IG1peGVkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLXRpdGxlJywgY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgdGFiIFVSSSBmb3IgdGhlIG9wZW5lZCBkaWZmIHZpZXcgdGFiIGl0ZW0uXG4gICAqIFRoaXMgZ3VhcmFudGVlcyBvbmx5IG9uZSBkaWZmIHZpZXcgd2lsbCBiZSBvcGVuZWQgcGVyIFVSSS5cbiAgICovXG4gIGdldFVSSSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl91cmk7XG4gIH1cblxuICAvKipcbiAgICogU2F2ZXMgdGhlIGVkaXRlZCBmaWxlIGluIHRoZSBlZGl0YWJsZSByaWdodCB0ZXh0IGVkaXRvci5cbiAgICovXG4gIHNhdmUoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlmZk1vZGVsLnNhdmVBY3RpdmVGaWxlKCk7XG4gIH1cblxuICBvbkRpZENoYW5nZU1vZGlmaWVkKGNhbGxiYWNrOiAoKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZGlmZk1vZGVsLm9uRGlkQWN0aXZlQnVmZmVyQ2hhbmdlTW9kaWZpZWQoY2FsbGJhY2spO1xuICB9XG5cbiAgaXNNb2RpZmllZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlmZk1vZGVsLmlzQWN0aXZlQnVmZmVyTW9kaWZpZWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0cyBhIGRlc3Ryb3kgZXZlbnQgdGhhdCdzIHVzZWQgdG8gdW5tb3VudCB0aGUgYXR0YWNoZWQgUmVhY3QgY29tcG9uZW50XG4gICAqIGFuZCBpbnZhbGlkYXRlIHRoZSBjYWNoZWQgdmlldyBpbnN0YW5jZSBvZiB0aGUgRGlmZiBWaWV3LlxuICAgKi9cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1kZXN0cm95Jyk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogP09iamVjdCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBvbkRpZERlc3Ryb3koY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oRElEX0RFU1RST1lfRVZFTlRfTkFNRSwgY2FsbGJhY2spO1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmVmlld0VsZW1lbnQgPSBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQoJ251Y2xpZGUtZGlmZi12aWV3Jywge1xuICBwcm90b3R5cGU6IERpZmZWaWV3RWxlbWVudC5wcm90b3R5cGUsXG59KTtcbiJdfQ==