Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;
exports.serialize = serialize;
exports.consumeDistractionFreeModeProvider = consumeDistractionFreeModeProvider;
exports.consumeToolBar = consumeToolBar;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _DistractionFreeMode = require('./DistractionFreeMode');

var _BuiltinProviders = require('./BuiltinProviders');

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._disposables = new _atom.CompositeDisposable();
    this._tunnelVision = new _DistractionFreeMode.DistractionFreeMode(state);
    this._disposables.add(atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-distraction-free-mode:toggle', this._tunnelVision.toggleDistractionFreeMode.bind(this._tunnelVision)));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return this._tunnelVision.serialize();
    }
  }, {
    key: 'consumeDistractionFreeModeProvider',
    value: function consumeDistractionFreeModeProvider(provider) {
      return this._tunnelVision.consumeDistractionFreeModeProvider(provider);
    }
  }, {
    key: 'consumeToolBar',
    value: function consumeToolBar(getToolBar) {
      var toolBar = getToolBar('nuclide-distraction-free-mode');
      toolBar.addButton({
        icon: 'eye',
        callback: 'nuclide-distraction-free-mode:toggle',
        tooltip: 'Toggle distraction-free mode',
        priority: 600
      });
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
    for (var provider of (0, _BuiltinProviders.getBuiltinProviders)()) {
      activation.consumeDistractionFreeModeProvider(provider);
    }
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function serialize() {
  (0, _assert2['default'])(activation != null);
  return activation.serialize();
}

function consumeDistractionFreeModeProvider(provider) {
  (0, _assert2['default'])(activation != null);
  return activation.consumeDistractionFreeModeProvider(provider);
}

function consumeToolBar(getToolBar) {
  (0, _assert2['default'])(activation != null);
  activation.consumeToolBar(getToolBar);
}

// Should be the unique to all providers. Recommended to be the package name.

// Serialize the restore state via an array of provider names.
//# sourceMappingURL=data:application/json;base64,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QGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7RGlzdHJhY3Rpb25GcmVlTW9kZX0gZnJvbSAnLi9EaXN0cmFjdGlvbkZyZWVNb2RlJztcbmltcG9ydCB7Z2V0QnVpbHRpblByb3ZpZGVyc30gZnJvbSAnLi9CdWlsdGluUHJvdmlkZXJzJztcblxuZXhwb3J0IHR5cGUgRGlzdHJhY3Rpb25GcmVlTW9kZVByb3ZpZGVyID0ge1xuICAvLyBTaG91bGQgYmUgdGhlIHVuaXF1ZSB0byBhbGwgcHJvdmlkZXJzLiBSZWNvbW1lbmRlZCB0byBiZSB0aGUgcGFja2FnZSBuYW1lLlxuICBuYW1lOiBzdHJpbmc7XG4gIGlzVmlzaWJsZTogKCkgPT4gYm9vbGVhbjtcbiAgdG9nZ2xlOiAoKSA9PiB2b2lkO1xufTtcblxuZXhwb3J0IHR5cGUgRGlzdHJhY3Rpb25GcmVlTW9kZVN0YXRlID0ge1xuICAvLyBTZXJpYWxpemUgdGhlIHJlc3RvcmUgc3RhdGUgdmlhIGFuIGFycmF5IG9mIHByb3ZpZGVyIG5hbWVzLlxuICByZXN0b3JlU3RhdGU6ID9BcnJheTxzdHJpbmc+O1xufTtcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3R1bm5lbFZpc2lvbjogRGlzdHJhY3Rpb25GcmVlTW9kZTtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP0Rpc3RyYWN0aW9uRnJlZU1vZGVTdGF0ZSkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl90dW5uZWxWaXNpb24gPSBuZXcgRGlzdHJhY3Rpb25GcmVlTW9kZShzdGF0ZSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSxcbiAgICAgICdudWNsaWRlLWRpc3RyYWN0aW9uLWZyZWUtbW9kZTp0b2dnbGUnLFxuICAgICAgdGhpcy5fdHVubmVsVmlzaW9uLnRvZ2dsZURpc3RyYWN0aW9uRnJlZU1vZGUuYmluZCh0aGlzLl90dW5uZWxWaXNpb24pLFxuICAgICkpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogRGlzdHJhY3Rpb25GcmVlTW9kZVN0YXRlIHtcbiAgICByZXR1cm4gdGhpcy5fdHVubmVsVmlzaW9uLnNlcmlhbGl6ZSgpO1xuICB9XG5cbiAgY29uc3VtZURpc3RyYWN0aW9uRnJlZU1vZGVQcm92aWRlcihwcm92aWRlcjogRGlzdHJhY3Rpb25GcmVlTW9kZVByb3ZpZGVyKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl90dW5uZWxWaXNpb24uY29uc3VtZURpc3RyYWN0aW9uRnJlZU1vZGVQcm92aWRlcihwcm92aWRlcik7XG4gIH1cblxuICBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gICAgY29uc3QgdG9vbEJhciA9IGdldFRvb2xCYXIoJ251Y2xpZGUtZGlzdHJhY3Rpb24tZnJlZS1tb2RlJyk7XG4gICAgdG9vbEJhci5hZGRCdXR0b24oe1xuICAgICAgaWNvbjogJ2V5ZScsXG4gICAgICBjYWxsYmFjazogJ251Y2xpZGUtZGlzdHJhY3Rpb24tZnJlZS1tb2RlOnRvZ2dsZScsXG4gICAgICB0b29sdGlwOiAnVG9nZ2xlIGRpc3RyYWN0aW9uLWZyZWUgbW9kZScsXG4gICAgICBwcmlvcml0eTogNjAwLFxuICAgIH0pO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICB0b29sQmFyLnJlbW92ZUl0ZW1zKCk7XG4gICAgfSkpO1xuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uOiA/QWN0aXZhdGlvbiA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP0Rpc3RyYWN0aW9uRnJlZU1vZGVTdGF0ZSkge1xuICBpZiAoYWN0aXZhdGlvbiA9PSBudWxsKSB7XG4gICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKHN0YXRlKTtcbiAgICBmb3IgKGNvbnN0IHByb3ZpZGVyIG9mIGdldEJ1aWx0aW5Qcm92aWRlcnMoKSkge1xuICAgICAgYWN0aXZhdGlvbi5jb25zdW1lRGlzdHJhY3Rpb25GcmVlTW9kZVByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIGlmIChhY3RpdmF0aW9uICE9IG51bGwpIHtcbiAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplKCk6IERpc3RyYWN0aW9uRnJlZU1vZGVTdGF0ZSB7XG4gIGludmFyaWFudChhY3RpdmF0aW9uICE9IG51bGwpO1xuICByZXR1cm4gYWN0aXZhdGlvbi5zZXJpYWxpemUoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVEaXN0cmFjdGlvbkZyZWVNb2RlUHJvdmlkZXIoXG4gIHByb3ZpZGVyOiBEaXN0cmFjdGlvbkZyZWVNb2RlUHJvdmlkZXJcbik6IElEaXNwb3NhYmxlIHtcbiAgaW52YXJpYW50KGFjdGl2YXRpb24gIT0gbnVsbCk7XG4gIHJldHVybiBhY3RpdmF0aW9uLmNvbnN1bWVEaXN0cmFjdGlvbkZyZWVNb2RlUHJvdmlkZXIocHJvdmlkZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZVRvb2xCYXIoZ2V0VG9vbEJhcjogKGdyb3VwOiBzdHJpbmcpID0+IE9iamVjdCk6IHZvaWQge1xuICBpbnZhcmlhbnQoYWN0aXZhdGlvbiAhPSBudWxsKTtcbiAgYWN0aXZhdGlvbi5jb25zdW1lVG9vbEJhcihnZXRUb29sQmFyKTtcbn1cbiJdfQ==