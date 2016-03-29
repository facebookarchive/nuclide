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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;
exports.serialize = serialize;
exports.consumeOutlineProvider = consumeOutlineProvider;
exports.consumeToolBar = consumeToolBar;
exports.getHomeFragments = getHomeFragments;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _OutlineViewPanel = require('./OutlineViewPanel');

var _ProviderRegistry = require('./ProviderRegistry');

var _createOutlines = require('./createOutlines');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

/**
 * Includes additional information that is useful to the UI, but redundant or nonsensical for
 * providers to include in their responses.
 */

var DEFAULT_WIDTH = 300; // px

function makeDefaultState() {
  return {
    width: DEFAULT_WIDTH,
    visible: false
  };
}

var Activation = (function () {
  function Activation() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? makeDefaultState() : arguments[0];

    _classCallCheck(this, Activation);

    this._disposables = new _atom.CompositeDisposable();

    this._providers = new _ProviderRegistry.ProviderRegistry();

    var panel = this._panel = new _OutlineViewPanel.OutlineViewPanelState((0, _createOutlines.createOutlines)(this._providers), state.width, state.visible);
    this._disposables.add(panel);

    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-outline-view:toggle', panel.toggle.bind(panel)));
    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-outline-view:show', panel.show.bind(panel)));
    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-outline-view:hide', panel.hide.bind(panel)));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        visible: this._panel.isVisible(),
        width: this._panel.getWidth()
      };
    }
  }, {
    key: 'consumeOutlineProvider',
    value: function consumeOutlineProvider(provider) {
      var _this = this;

      this._providers.addProvider(provider);
      return new _atom.Disposable(function () {
        return _this._providers.removeProvider(provider);
      });
    }
  }, {
    key: 'consumeToolBar',
    value: function consumeToolBar(getToolBar) {
      var toolBar = getToolBar('nuclide-outline-view');
      toolBar.addButton({
        icon: 'list-unordered',
        callback: 'nuclide-outline-view:toggle',
        tooltip: 'Toggle Outline View',
        priority: 350 });
      // Between diff view and test runner
      this._disposables.add(new _atom.Disposable(function () {
        toolBar.removeItems();
      }));
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function serialize() {
  if (activation != null) {
    return activation.serialize();
  }
}

function consumeOutlineProvider(provider) {
  (0, _assert2['default'])(activation != null);
  return activation.consumeOutlineProvider(provider);
}

function consumeToolBar(getToolBar) {
  (0, _assert2['default'])(activation != null);
  activation.consumeToolBar(getToolBar);
}

function getHomeFragments() {
  return {
    feature: {
      title: 'Outline View',
      icon: 'list-unordered',
      description: 'Displays major components of the current file (classes, methods, etc.)',
      command: 'nuclide-outline-view:show'
    },
    priority: 2.5 };
}

// The initial state at startup.

// The thing that currently has focus is not a text editor.

// Indicates that no provider is registered for the given grammar.

// Human-readable name for the grammar.

// Indicates that a provider is registered but that it did not return an outline.

/**
 * Use a TextEditor instead of a path so that:
 * - If there are multiple editors for a file, we always jump to outline item
 *   locations in the correct editor.
 * - Jumping to outline item locations works for new, unsaved files.
 */

// If there are multiple providers for a given grammar, the one with the highest priority will be
// used.
// Between diff view and test runner
//# sourceMappingURL=data:application/json;base64,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QyxLQUFvQixFQUFFO0FBQzdDLE1BQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixjQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDcEM7Q0FDRjs7QUFFTSxTQUFTLFVBQVUsR0FBRztBQUMzQixNQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsY0FBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLGNBQVUsR0FBRyxJQUFJLENBQUM7R0FDbkI7Q0FDRjs7QUFFTSxTQUFTLFNBQVMsR0FBc0I7QUFDN0MsTUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLFdBQU8sVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO0dBQy9CO0NBQ0Y7O0FBRU0sU0FBUyxzQkFBc0IsQ0FBQyxRQUF5QixFQUFlO0FBQzdFLDJCQUFVLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUM5QixTQUFPLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUNwRDs7QUFFTSxTQUFTLGNBQWMsQ0FBQyxVQUFxQyxFQUFRO0FBQzFFLDJCQUFVLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUM5QixZQUFVLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0NBQ3ZDOztBQUVNLFNBQVMsZ0JBQWdCLEdBQWtCO0FBQ2hELFNBQU87QUFDTCxXQUFPLEVBQUU7QUFDUCxXQUFLLEVBQUUsY0FBYztBQUNyQixVQUFJLEVBQUUsZ0JBQWdCO0FBQ3RCLGlCQUFXLEVBQUUsd0VBQXdFO0FBQ3JGLGFBQU8sRUFBRSwyQkFBMkI7S0FDckM7QUFDRCxZQUFRLEVBQUUsR0FBRyxFQUNkLENBQUM7Q0FDSCIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hvbWVGcmFnbWVudHN9IGZyb20gJy4uLy4uL251Y2xpZGUtaG9tZS1pbnRlcmZhY2VzJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcblxuaW1wb3J0IHtPdXRsaW5lVmlld1BhbmVsU3RhdGV9IGZyb20gJy4vT3V0bGluZVZpZXdQYW5lbCc7XG5pbXBvcnQge1Byb3ZpZGVyUmVnaXN0cnl9IGZyb20gJy4vUHJvdmlkZXJSZWdpc3RyeSc7XG5pbXBvcnQge2NyZWF0ZU91dGxpbmVzfSBmcm9tICcuL2NyZWF0ZU91dGxpbmVzJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQgdHlwZSB7VG9rZW5pemVkVGV4dH0gZnJvbSAnLi4vLi4vbnVjbGlkZS10b2tlbml6ZWQtdGV4dCc7XG5cbmV4cG9ydCB0eXBlIE91dGxpbmVUcmVlID0ge1xuICB0b2tlbml6ZWRUZXh0OiBUb2tlbml6ZWRUZXh0O1xuICBzdGFydFBvc2l0aW9uOiBhdG9tJFBvaW50O1xuICBlbmRQb3NpdGlvbj86IGF0b20kUG9pbnQ7XG4gIGNoaWxkcmVuOiBBcnJheTxPdXRsaW5lVHJlZT47XG59O1xuXG5leHBvcnQgdHlwZSBPdXRsaW5lID0ge1xuICBvdXRsaW5lVHJlZXM6IEFycmF5PE91dGxpbmVUcmVlPjtcbn1cblxuZXhwb3J0IHR5cGUgT3V0bGluZVRyZWVGb3JVaSA9IHtcbiAgdG9rZW5pemVkVGV4dDogVG9rZW5pemVkVGV4dDtcbiAgc3RhcnRQb3NpdGlvbjogYXRvbSRQb2ludDtcbiAgZW5kUG9zaXRpb24/OiBhdG9tJFBvaW50O1xuICBjaGlsZHJlbjogQXJyYXk8T3V0bGluZVRyZWVGb3JVaT47XG4gIGhpZ2hsaWdodGVkOiBib29sZWFuO1xufVxuXG4vKipcbiAqIEluY2x1ZGVzIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gdGhhdCBpcyB1c2VmdWwgdG8gdGhlIFVJLCBidXQgcmVkdW5kYW50IG9yIG5vbnNlbnNpY2FsIGZvclxuICogcHJvdmlkZXJzIHRvIGluY2x1ZGUgaW4gdGhlaXIgcmVzcG9uc2VzLlxuICovXG5leHBvcnQgdHlwZSBPdXRsaW5lRm9yVWkgPSB7XG4gIC8vIFRoZSBpbml0aWFsIHN0YXRlIGF0IHN0YXJ0dXAuXG4gIGtpbmQ6ICdlbXB0eSc7XG59IHwge1xuICAvLyBUaGUgdGhpbmcgdGhhdCBjdXJyZW50bHkgaGFzIGZvY3VzIGlzIG5vdCBhIHRleHQgZWRpdG9yLlxuICBraW5kOiAnbm90LXRleHQtZWRpdG9yJztcbn0gfCB7XG4gIC8vIEluZGljYXRlcyB0aGF0IG5vIHByb3ZpZGVyIGlzIHJlZ2lzdGVyZWQgZm9yIHRoZSBnaXZlbiBncmFtbWFyLlxuICBraW5kOiAnbm8tcHJvdmlkZXInO1xuICAvLyBIdW1hbi1yZWFkYWJsZSBuYW1lIGZvciB0aGUgZ3JhbW1hci5cbiAgZ3JhbW1hcjogc3RyaW5nO1xufSB8IHtcbiAgLy8gSW5kaWNhdGVzIHRoYXQgYSBwcm92aWRlciBpcyByZWdpc3RlcmVkIGJ1dCB0aGF0IGl0IGRpZCBub3QgcmV0dXJuIGFuIG91dGxpbmUuXG4gIGtpbmQ6ICdwcm92aWRlci1uby1vdXRsaW5lJztcbn0gfCB7XG4gIGtpbmQ6ICdvdXRsaW5lJztcbiAgb3V0bGluZVRyZWVzOiBBcnJheTxPdXRsaW5lVHJlZUZvclVpPjtcbiAgLyoqXG4gICAqIFVzZSBhIFRleHRFZGl0b3IgaW5zdGVhZCBvZiBhIHBhdGggc28gdGhhdDpcbiAgICogLSBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgZWRpdG9ycyBmb3IgYSBmaWxlLCB3ZSBhbHdheXMganVtcCB0byBvdXRsaW5lIGl0ZW1cbiAgICogICBsb2NhdGlvbnMgaW4gdGhlIGNvcnJlY3QgZWRpdG9yLlxuICAgKiAtIEp1bXBpbmcgdG8gb3V0bGluZSBpdGVtIGxvY2F0aW9ucyB3b3JrcyBmb3IgbmV3LCB1bnNhdmVkIGZpbGVzLlxuICAgKi9cbiAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3I7XG59XG5cbmV4cG9ydCB0eXBlIE91dGxpbmVQcm92aWRlciA9IHtcbiAgbmFtZTogc3RyaW5nO1xuICAvLyBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgcHJvdmlkZXJzIGZvciBhIGdpdmVuIGdyYW1tYXIsIHRoZSBvbmUgd2l0aCB0aGUgaGlnaGVzdCBwcmlvcml0eSB3aWxsIGJlXG4gIC8vIHVzZWQuXG4gIHByaW9yaXR5OiBudW1iZXI7XG4gIGdyYW1tYXJTY29wZXM6IEFycmF5PHN0cmluZz47XG4gIGdldE91dGxpbmU6IChlZGl0b3I6IFRleHRFZGl0b3IpID0+IFByb21pc2U8P091dGxpbmU+O1xufTtcblxudHlwZSBPdXRsaW5lVmlld1N0YXRlID0ge1xuICB3aWR0aDogbnVtYmVyO1xuICB2aXNpYmxlOiBib29sZWFuO1xufTtcblxuY29uc3QgREVGQVVMVF9XSURUSCA9IDMwMDsgLy8gcHhcblxuZnVuY3Rpb24gbWFrZURlZmF1bHRTdGF0ZSgpOiBPdXRsaW5lVmlld1N0YXRlIHtcbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogREVGQVVMVF9XSURUSCxcbiAgICB2aXNpYmxlOiBmYWxzZSxcbiAgfTtcbn1cblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBfcHJvdmlkZXJzOiBQcm92aWRlclJlZ2lzdHJ5PE91dGxpbmVQcm92aWRlcj47XG5cbiAgX3BhbmVsOiBPdXRsaW5lVmlld1BhbmVsU3RhdGU7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU/OiBPdXRsaW5lVmlld1N0YXRlID0gbWFrZURlZmF1bHRTdGF0ZSgpKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgdGhpcy5fcHJvdmlkZXJzID0gbmV3IFByb3ZpZGVyUmVnaXN0cnkoKTtcblxuICAgIGNvbnN0IHBhbmVsID0gdGhpcy5fcGFuZWwgPSBuZXcgT3V0bGluZVZpZXdQYW5lbFN0YXRlKFxuICAgICAgY3JlYXRlT3V0bGluZXModGhpcy5fcHJvdmlkZXJzKSxcbiAgICAgIHN0YXRlLndpZHRoLFxuICAgICAgc3RhdGUudmlzaWJsZVxuICAgICk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHBhbmVsKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgICAnbnVjbGlkZS1vdXRsaW5lLXZpZXc6dG9nZ2xlJyxcbiAgICAgICAgcGFuZWwudG9nZ2xlLmJpbmQocGFuZWwpLFxuICAgICAgKVxuICAgICk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAgICdudWNsaWRlLW91dGxpbmUtdmlldzpzaG93JyxcbiAgICAgICAgcGFuZWwuc2hvdy5iaW5kKHBhbmVsKSxcbiAgICAgIClcbiAgICApO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgICAnbnVjbGlkZS1vdXRsaW5lLXZpZXc6aGlkZScsXG4gICAgICAgIHBhbmVsLmhpZGUuYmluZChwYW5lbCksXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IE91dGxpbmVWaWV3U3RhdGUge1xuICAgIHJldHVybiB7XG4gICAgICB2aXNpYmxlOiB0aGlzLl9wYW5lbC5pc1Zpc2libGUoKSxcbiAgICAgIHdpZHRoOiB0aGlzLl9wYW5lbC5nZXRXaWR0aCgpLFxuICAgIH07XG4gIH1cblxuICBjb25zdW1lT3V0bGluZVByb3ZpZGVyKHByb3ZpZGVyOiBPdXRsaW5lUHJvdmlkZXIpOiBJRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5fcHJvdmlkZXJzLmFkZFByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4gdGhpcy5fcHJvdmlkZXJzLnJlbW92ZVByb3ZpZGVyKHByb3ZpZGVyKSk7XG4gIH1cblxuICBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gICAgY29uc3QgdG9vbEJhciA9IGdldFRvb2xCYXIoJ251Y2xpZGUtb3V0bGluZS12aWV3Jyk7XG4gICAgdG9vbEJhci5hZGRCdXR0b24oe1xuICAgICAgaWNvbjogJ2xpc3QtdW5vcmRlcmVkJyxcbiAgICAgIGNhbGxiYWNrOiAnbnVjbGlkZS1vdXRsaW5lLXZpZXc6dG9nZ2xlJyxcbiAgICAgIHRvb2x0aXA6ICdUb2dnbGUgT3V0bGluZSBWaWV3JyxcbiAgICAgIHByaW9yaXR5OiAzNTAsIC8vIEJldHdlZW4gZGlmZiB2aWV3IGFuZCB0ZXN0IHJ1bm5lclxuICAgIH0pO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICB0b29sQmFyLnJlbW92ZUl0ZW1zKCk7XG4gICAgfSkpO1xuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uOiA/QWN0aXZhdGlvbiA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogT2JqZWN0IHwgdm9pZCkge1xuICBpZiAoYWN0aXZhdGlvbiA9PSBudWxsKSB7XG4gICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKHN0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgaWYgKGFjdGl2YXRpb24gIT0gbnVsbCkge1xuICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgIGFjdGl2YXRpb24gPSBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemUoKTogP091dGxpbmVWaWV3U3RhdGUge1xuICBpZiAoYWN0aXZhdGlvbiAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGFjdGl2YXRpb24uc2VyaWFsaXplKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVPdXRsaW5lUHJvdmlkZXIocHJvdmlkZXI6IE91dGxpbmVQcm92aWRlcik6IElEaXNwb3NhYmxlIHtcbiAgaW52YXJpYW50KGFjdGl2YXRpb24gIT0gbnVsbCk7XG4gIHJldHVybiBhY3RpdmF0aW9uLmNvbnN1bWVPdXRsaW5lUHJvdmlkZXIocHJvdmlkZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZVRvb2xCYXIoZ2V0VG9vbEJhcjogKGdyb3VwOiBzdHJpbmcpID0+IE9iamVjdCk6IHZvaWQge1xuICBpbnZhcmlhbnQoYWN0aXZhdGlvbiAhPSBudWxsKTtcbiAgYWN0aXZhdGlvbi5jb25zdW1lVG9vbEJhcihnZXRUb29sQmFyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEhvbWVGcmFnbWVudHMoKTogSG9tZUZyYWdtZW50cyB7XG4gIHJldHVybiB7XG4gICAgZmVhdHVyZToge1xuICAgICAgdGl0bGU6ICdPdXRsaW5lIFZpZXcnLFxuICAgICAgaWNvbjogJ2xpc3QtdW5vcmRlcmVkJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRGlzcGxheXMgbWFqb3IgY29tcG9uZW50cyBvZiB0aGUgY3VycmVudCBmaWxlIChjbGFzc2VzLCBtZXRob2RzLCBldGMuKScsXG4gICAgICBjb21tYW5kOiAnbnVjbGlkZS1vdXRsaW5lLXZpZXc6c2hvdycsXG4gICAgfSxcbiAgICBwcmlvcml0eTogMi41LCAvLyBCZXR3ZWVuIGRpZmYgdmlldyBhbmQgdGVzdCBydW5uZXJcbiAgfTtcbn1cbiJdfQ==