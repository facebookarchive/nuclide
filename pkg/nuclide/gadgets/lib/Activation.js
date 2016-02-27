var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

var _Commands = require('./Commands');

var _Commands2 = _interopRequireDefault(_Commands);

var _GadgetsService = require('./GadgetsService');

var _GadgetsService2 = _interopRequireDefault(_GadgetsService);

var _createStateStream = require('./createStateStream');

var _createStateStream2 = _interopRequireDefault(_createStateStream);

var _getInitialState = require('./getInitialState');

var _getInitialState2 = _interopRequireDefault(_getInitialState);

var _commons = require('../../commons');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _rxDom = require('rx-dom');

var _syncAtomCommands = require('./syncAtomCommands');

var _syncAtomCommands2 = _interopRequireDefault(_syncAtomCommands);

var _trackActions = require('./trackActions');

var _trackActions2 = _interopRequireDefault(_trackActions);

var observableFromSubscribeFunction = _commons.event.observableFromSubscribeFunction;

var Activation = (function () {
  function Activation(initialState) {
    var _this = this;

    _classCallCheck(this, Activation);

    initialState = (0, _getInitialState2['default'])();
    var action$ = new _rx2['default'].Subject();
    var state$ = (0, _createStateStream2['default'])(action$, initialState);
    var commands = this.commands = new _Commands2['default'](action$, function () {
      return state$.getValue();
    });

    var getGadgets = function getGadgets(state) {
      return state.get('gadgets');
    };
    var gadget$ = state$.map(getGadgets).distinctUntilChanged();

    this._disposables = new _atom.CompositeDisposable(action$,

    // Re-render all pane items when (1) new items are added, (2) new gadgets are registered and
    // (3) the active pane item changes.
    observableFromSubscribeFunction(atom.workspace.observePaneItems.bind(atom.workspace)).merge(observableFromSubscribeFunction(atom.workspace.onDidChangeActivePaneItem.bind(atom.workspace))).merge(gadget$).throttle(100).forEach(function () {
      return _this.commands.renderPaneItems();
    }),

    // Clean up when pane items are destroyed.
    observableFromSubscribeFunction(atom.workspace.onDidDestroyPaneItem.bind(atom.workspace)).forEach(function (_ref) {
      var item = _ref.item;
      return _this.commands.cleanUpDestroyedPaneItem(item);
    }),

    // Keep the atom commands up to date with the registered gadgets.
    (0, _syncAtomCommands2['default'])(gadget$, commands),

    // Collect some analytics about gadget actions.
    (0, _trackActions2['default'])(action$),

    // Update the expanded Flex scale whenever the user starts dragging a handle. Use the capture
    // phase since resize handles stop propagation of the event during the bubbling phase.
    _rxDom.DOM.fromEvent(document, 'mousedown', true).filter(function (event) {
      return event.target.nodeName.toLowerCase() === 'atom-pane-resize-handle';
    })
    // Get the models that represent the containers being resized:
    .flatMap(function (event) {
      var handleElement = event.target;
      return [handleElement.previousElementSibling && handleElement.previousElementSibling.model, handleElement.nextElementSibling && handleElement.nextElementSibling.model].filter(function (paneItemContainer) {
        return paneItemContainer !== null;
      });
    })
    // Make sure these are actually pane item containers:
    .filter(function (paneItemContainer) {
      return 'getItems' in paneItemContainer && 'getFlexScale' in paneItemContainer;
    }).forEach(function (paneItemContainer) {
      return _this.commands.updateExpandedFlexScale(paneItemContainer);
    }));
  }

  _createClass(Activation, [{
    key: 'deactivate',
    value: function deactivate() {
      this.commands.deactivate();
      this._disposables.dispose();
    }
  }, {
    key: 'provideGadgetsService',
    value: function provideGadgetsService() {
      return new _GadgetsService2['default'](this.commands);
    }
  }]);

  return Activation;
})();

module.exports = Activation;
//# sourceMappingURL=data:application/json;base64,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QUM7S0FDbkYsQ0FBQyxDQUNELE9BQU8sQ0FBQyxVQUFBLGlCQUFpQjthQUFJLE1BQUssUUFBUSxDQUFDLHVCQUF1QixDQUFDLGlCQUFpQixDQUFDO0tBQUEsQ0FBQyxDQUMxRixDQUFDO0dBQ0g7O2VBeERHLFVBQVU7O1dBMERKLHNCQUFHO0FBQ1gsVUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUMzQixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFb0IsaUNBQW1CO0FBQ3RDLGFBQU8sZ0NBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUMxQzs7O1NBakVHLFVBQVU7OztBQXFFaEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMiLCJmaWxlIjoiQWN0aXZhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgQ29tbWFuZHMgZnJvbSAnLi9Db21tYW5kcyc7XG5pbXBvcnQgR2FkZ2V0c1NlcnZpY2UgZnJvbSAnLi9HYWRnZXRzU2VydmljZSc7XG5pbXBvcnQgY3JlYXRlU3RhdGVTdHJlYW0gZnJvbSAnLi9jcmVhdGVTdGF0ZVN0cmVhbSc7XG5pbXBvcnQgZ2V0SW5pdGlhbFN0YXRlIGZyb20gJy4vZ2V0SW5pdGlhbFN0YXRlJztcbmltcG9ydCB7ZXZlbnQgYXMgY29tbW9uc0V2ZW50fSBmcm9tICcuLi8uLi9jb21tb25zJztcbmNvbnN0IHtvYnNlcnZhYmxlRnJvbVN1YnNjcmliZUZ1bmN0aW9ufSA9IGNvbW1vbnNFdmVudDtcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5pbXBvcnQge0RPTSBhcyBSeERvbX0gZnJvbSAncngtZG9tJztcbmltcG9ydCBzeW5jQXRvbUNvbW1hbmRzIGZyb20gJy4vc3luY0F0b21Db21tYW5kcyc7XG5pbXBvcnQgdHJhY2tBY3Rpb25zIGZyb20gJy4vdHJhY2tBY3Rpb25zJztcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgY29tbWFuZHM6IENvbW1hbmRzO1xuXG4gIGNvbnN0cnVjdG9yKGluaXRpYWxTdGF0ZTogP09iamVjdCkge1xuICAgIGluaXRpYWxTdGF0ZSA9IGdldEluaXRpYWxTdGF0ZSgpO1xuICAgIGNvbnN0IGFjdGlvbiQgPSBuZXcgUnguU3ViamVjdCgpO1xuICAgIGNvbnN0IHN0YXRlJCA9IGNyZWF0ZVN0YXRlU3RyZWFtKGFjdGlvbiQsIGluaXRpYWxTdGF0ZSk7XG4gICAgY29uc3QgY29tbWFuZHMgPSB0aGlzLmNvbW1hbmRzID0gbmV3IENvbW1hbmRzKGFjdGlvbiQsICgpID0+IHN0YXRlJC5nZXRWYWx1ZSgpKTtcblxuICAgIGNvbnN0IGdldEdhZGdldHMgPSBzdGF0ZSA9PiBzdGF0ZS5nZXQoJ2dhZGdldHMnKTtcbiAgICBjb25zdCBnYWRnZXQkID0gc3RhdGUkLm1hcChnZXRHYWRnZXRzKS5kaXN0aW5jdFVudGlsQ2hhbmdlZCgpO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIGFjdGlvbiQsXG5cbiAgICAgIC8vIFJlLXJlbmRlciBhbGwgcGFuZSBpdGVtcyB3aGVuICgxKSBuZXcgaXRlbXMgYXJlIGFkZGVkLCAoMikgbmV3IGdhZGdldHMgYXJlIHJlZ2lzdGVyZWQgYW5kXG4gICAgICAvLyAoMykgdGhlIGFjdGl2ZSBwYW5lIGl0ZW0gY2hhbmdlcy5cbiAgICAgIG9ic2VydmFibGVGcm9tU3Vic2NyaWJlRnVuY3Rpb24oYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVBhbmVJdGVtcy5iaW5kKGF0b20ud29ya3NwYWNlKSlcbiAgICAgICAgLm1lcmdlKFxuICAgICAgICAgIG9ic2VydmFibGVGcm9tU3Vic2NyaWJlRnVuY3Rpb24oXG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtLmJpbmQoYXRvbS53b3Jrc3BhY2UpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICAgIC5tZXJnZShnYWRnZXQkKVxuICAgICAgICAudGhyb3R0bGUoMTAwKVxuICAgICAgICAuZm9yRWFjaCgoKSA9PiB0aGlzLmNvbW1hbmRzLnJlbmRlclBhbmVJdGVtcygpKSxcblxuICAgICAgLy8gQ2xlYW4gdXAgd2hlbiBwYW5lIGl0ZW1zIGFyZSBkZXN0cm95ZWQuXG4gICAgICBvYnNlcnZhYmxlRnJvbVN1YnNjcmliZUZ1bmN0aW9uKGF0b20ud29ya3NwYWNlLm9uRGlkRGVzdHJveVBhbmVJdGVtLmJpbmQoYXRvbS53b3Jrc3BhY2UpKVxuICAgICAgICAuZm9yRWFjaCgoe2l0ZW19KSA9PiB0aGlzLmNvbW1hbmRzLmNsZWFuVXBEZXN0cm95ZWRQYW5lSXRlbShpdGVtKSksXG5cbiAgICAgIC8vIEtlZXAgdGhlIGF0b20gY29tbWFuZHMgdXAgdG8gZGF0ZSB3aXRoIHRoZSByZWdpc3RlcmVkIGdhZGdldHMuXG4gICAgICBzeW5jQXRvbUNvbW1hbmRzKGdhZGdldCQsIGNvbW1hbmRzKSxcblxuICAgICAgLy8gQ29sbGVjdCBzb21lIGFuYWx5dGljcyBhYm91dCBnYWRnZXQgYWN0aW9ucy5cbiAgICAgIHRyYWNrQWN0aW9ucyhhY3Rpb24kKSxcblxuICAgICAgLy8gVXBkYXRlIHRoZSBleHBhbmRlZCBGbGV4IHNjYWxlIHdoZW5ldmVyIHRoZSB1c2VyIHN0YXJ0cyBkcmFnZ2luZyBhIGhhbmRsZS4gVXNlIHRoZSBjYXB0dXJlXG4gICAgICAvLyBwaGFzZSBzaW5jZSByZXNpemUgaGFuZGxlcyBzdG9wIHByb3BhZ2F0aW9uIG9mIHRoZSBldmVudCBkdXJpbmcgdGhlIGJ1YmJsaW5nIHBoYXNlLlxuICAgICAgUnhEb20uZnJvbUV2ZW50KGRvY3VtZW50LCAnbW91c2Vkb3duJywgdHJ1ZSlcbiAgICAgICAgLmZpbHRlcihldmVudCA9PiBldmVudC50YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2F0b20tcGFuZS1yZXNpemUtaGFuZGxlJylcbiAgICAgICAgLy8gR2V0IHRoZSBtb2RlbHMgdGhhdCByZXByZXNlbnQgdGhlIGNvbnRhaW5lcnMgYmVpbmcgcmVzaXplZDpcbiAgICAgICAgLmZsYXRNYXAoZXZlbnQgPT4ge1xuICAgICAgICAgIGNvbnN0IGhhbmRsZUVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGhhbmRsZUVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZyAmJiBoYW5kbGVFbGVtZW50LnByZXZpb3VzRWxlbWVudFNpYmxpbmcubW9kZWwsXG4gICAgICAgICAgICBoYW5kbGVFbGVtZW50Lm5leHRFbGVtZW50U2libGluZyAmJiBoYW5kbGVFbGVtZW50Lm5leHRFbGVtZW50U2libGluZy5tb2RlbCxcbiAgICAgICAgICBdLmZpbHRlcihwYW5lSXRlbUNvbnRhaW5lciA9PiBwYW5lSXRlbUNvbnRhaW5lciAhPT0gbnVsbCk7XG4gICAgICAgIH0pXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGVzZSBhcmUgYWN0dWFsbHkgcGFuZSBpdGVtIGNvbnRhaW5lcnM6XG4gICAgICAgIC5maWx0ZXIocGFuZUl0ZW1Db250YWluZXIgPT4ge1xuICAgICAgICAgIHJldHVybiAoJ2dldEl0ZW1zJyBpbiBwYW5lSXRlbUNvbnRhaW5lcikgJiYgKCdnZXRGbGV4U2NhbGUnIGluIHBhbmVJdGVtQ29udGFpbmVyKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmZvckVhY2gocGFuZUl0ZW1Db250YWluZXIgPT4gdGhpcy5jb21tYW5kcy51cGRhdGVFeHBhbmRlZEZsZXhTY2FsZShwYW5lSXRlbUNvbnRhaW5lcikpLFxuICAgICk7XG4gIH1cblxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMuY29tbWFuZHMuZGVhY3RpdmF0ZSgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHByb3ZpZGVHYWRnZXRzU2VydmljZSgpOiBHYWRnZXRzU2VydmljZSB7XG4gICAgcmV0dXJuIG5ldyBHYWRnZXRzU2VydmljZSh0aGlzLmNvbW1hbmRzKTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aXZhdGlvbjtcbiJdfQ==