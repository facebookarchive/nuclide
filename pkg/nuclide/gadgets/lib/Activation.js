var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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
//# sourceMappingURL=data:application/json;base64,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QUFDO0tBQ25GLENBQUMsQ0FDRCxPQUFPLENBQUMsVUFBQSxpQkFBaUI7YUFBSSxNQUFLLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxpQkFBaUIsQ0FBQztLQUFBLENBQUMsQ0FDMUYsQ0FBQztHQUNIOztlQXhERyxVQUFVOztXQTBESixzQkFBRztBQUNYLFVBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDM0IsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1dBRW9CLGlDQUFtQjtBQUN0QyxhQUFPLGdDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDMUM7OztTQWpFRyxVQUFVOzs7QUFxRWhCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDIiwiZmlsZSI6IkFjdGl2YXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QWN0aW9ufSBmcm9tICcuLi90eXBlcy9BY3Rpb24nO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IENvbW1hbmRzIGZyb20gJy4vQ29tbWFuZHMnO1xuaW1wb3J0IEdhZGdldHNTZXJ2aWNlIGZyb20gJy4vR2FkZ2V0c1NlcnZpY2UnO1xuaW1wb3J0IGNyZWF0ZVN0YXRlU3RyZWFtIGZyb20gJy4vY3JlYXRlU3RhdGVTdHJlYW0nO1xuaW1wb3J0IGdldEluaXRpYWxTdGF0ZSBmcm9tICcuL2dldEluaXRpYWxTdGF0ZSc7XG5pbXBvcnQge2V2ZW50IGFzIGNvbW1vbnNFdmVudH0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5jb25zdCB7b2JzZXJ2YWJsZUZyb21TdWJzY3JpYmVGdW5jdGlvbn0gPSBjb21tb25zRXZlbnQ7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuaW1wb3J0IHtET00gYXMgUnhEb219IGZyb20gJ3J4LWRvbSc7XG5pbXBvcnQgc3luY0F0b21Db21tYW5kcyBmcm9tICcuL3N5bmNBdG9tQ29tbWFuZHMnO1xuaW1wb3J0IHRyYWNrQWN0aW9ucyBmcm9tICcuL3RyYWNrQWN0aW9ucyc7XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIGNvbW1hbmRzOiBDb21tYW5kcztcblxuICBjb25zdHJ1Y3Rvcihpbml0aWFsU3RhdGU6ID9PYmplY3QpIHtcbiAgICBpbml0aWFsU3RhdGUgPSBnZXRJbml0aWFsU3RhdGUoKTtcbiAgICBjb25zdCBhY3Rpb24kOiBSeC5TdWJqZWN0PEFjdGlvbj4gPSBuZXcgUnguU3ViamVjdCgpO1xuICAgIGNvbnN0IHN0YXRlJCA9IGNyZWF0ZVN0YXRlU3RyZWFtKGFjdGlvbiQsIGluaXRpYWxTdGF0ZSk7XG4gICAgY29uc3QgY29tbWFuZHMgPSB0aGlzLmNvbW1hbmRzID0gbmV3IENvbW1hbmRzKGFjdGlvbiQsICgpID0+IHN0YXRlJC5nZXRWYWx1ZSgpKTtcblxuICAgIGNvbnN0IGdldEdhZGdldHMgPSBzdGF0ZSA9PiBzdGF0ZS5nZXQoJ2dhZGdldHMnKTtcbiAgICBjb25zdCBnYWRnZXQkID0gc3RhdGUkLm1hcChnZXRHYWRnZXRzKS5kaXN0aW5jdFVudGlsQ2hhbmdlZCgpO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIGFjdGlvbiQsXG5cbiAgICAgIC8vIFJlLXJlbmRlciBhbGwgcGFuZSBpdGVtcyB3aGVuICgxKSBuZXcgaXRlbXMgYXJlIGFkZGVkLCAoMikgbmV3IGdhZGdldHMgYXJlIHJlZ2lzdGVyZWQgYW5kXG4gICAgICAvLyAoMykgdGhlIGFjdGl2ZSBwYW5lIGl0ZW0gY2hhbmdlcy5cbiAgICAgIG9ic2VydmFibGVGcm9tU3Vic2NyaWJlRnVuY3Rpb24oYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVBhbmVJdGVtcy5iaW5kKGF0b20ud29ya3NwYWNlKSlcbiAgICAgICAgLm1lcmdlKFxuICAgICAgICAgIG9ic2VydmFibGVGcm9tU3Vic2NyaWJlRnVuY3Rpb24oXG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtLmJpbmQoYXRvbS53b3Jrc3BhY2UpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICAgIC5tZXJnZShnYWRnZXQkKVxuICAgICAgICAudGhyb3R0bGUoMTAwKVxuICAgICAgICAuZm9yRWFjaCgoKSA9PiB0aGlzLmNvbW1hbmRzLnJlbmRlclBhbmVJdGVtcygpKSxcblxuICAgICAgLy8gQ2xlYW4gdXAgd2hlbiBwYW5lIGl0ZW1zIGFyZSBkZXN0cm95ZWQuXG4gICAgICBvYnNlcnZhYmxlRnJvbVN1YnNjcmliZUZ1bmN0aW9uKGF0b20ud29ya3NwYWNlLm9uRGlkRGVzdHJveVBhbmVJdGVtLmJpbmQoYXRvbS53b3Jrc3BhY2UpKVxuICAgICAgICAuZm9yRWFjaCgoe2l0ZW19KSA9PiB0aGlzLmNvbW1hbmRzLmNsZWFuVXBEZXN0cm95ZWRQYW5lSXRlbShpdGVtKSksXG5cbiAgICAgIC8vIEtlZXAgdGhlIGF0b20gY29tbWFuZHMgdXAgdG8gZGF0ZSB3aXRoIHRoZSByZWdpc3RlcmVkIGdhZGdldHMuXG4gICAgICBzeW5jQXRvbUNvbW1hbmRzKGdhZGdldCQsIGNvbW1hbmRzKSxcblxuICAgICAgLy8gQ29sbGVjdCBzb21lIGFuYWx5dGljcyBhYm91dCBnYWRnZXQgYWN0aW9ucy5cbiAgICAgIHRyYWNrQWN0aW9ucyhhY3Rpb24kKSxcblxuICAgICAgLy8gVXBkYXRlIHRoZSBleHBhbmRlZCBGbGV4IHNjYWxlIHdoZW5ldmVyIHRoZSB1c2VyIHN0YXJ0cyBkcmFnZ2luZyBhIGhhbmRsZS4gVXNlIHRoZSBjYXB0dXJlXG4gICAgICAvLyBwaGFzZSBzaW5jZSByZXNpemUgaGFuZGxlcyBzdG9wIHByb3BhZ2F0aW9uIG9mIHRoZSBldmVudCBkdXJpbmcgdGhlIGJ1YmJsaW5nIHBoYXNlLlxuICAgICAgUnhEb20uZnJvbUV2ZW50KGRvY3VtZW50LCAnbW91c2Vkb3duJywgdHJ1ZSlcbiAgICAgICAgLmZpbHRlcihldmVudCA9PiBldmVudC50YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2F0b20tcGFuZS1yZXNpemUtaGFuZGxlJylcbiAgICAgICAgLy8gR2V0IHRoZSBtb2RlbHMgdGhhdCByZXByZXNlbnQgdGhlIGNvbnRhaW5lcnMgYmVpbmcgcmVzaXplZDpcbiAgICAgICAgLmZsYXRNYXAoZXZlbnQgPT4ge1xuICAgICAgICAgIGNvbnN0IGhhbmRsZUVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGhhbmRsZUVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZyAmJiBoYW5kbGVFbGVtZW50LnByZXZpb3VzRWxlbWVudFNpYmxpbmcubW9kZWwsXG4gICAgICAgICAgICBoYW5kbGVFbGVtZW50Lm5leHRFbGVtZW50U2libGluZyAmJiBoYW5kbGVFbGVtZW50Lm5leHRFbGVtZW50U2libGluZy5tb2RlbCxcbiAgICAgICAgICBdLmZpbHRlcihwYW5lSXRlbUNvbnRhaW5lciA9PiBwYW5lSXRlbUNvbnRhaW5lciAhPT0gbnVsbCk7XG4gICAgICAgIH0pXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGVzZSBhcmUgYWN0dWFsbHkgcGFuZSBpdGVtIGNvbnRhaW5lcnM6XG4gICAgICAgIC5maWx0ZXIocGFuZUl0ZW1Db250YWluZXIgPT4ge1xuICAgICAgICAgIHJldHVybiAoJ2dldEl0ZW1zJyBpbiBwYW5lSXRlbUNvbnRhaW5lcikgJiYgKCdnZXRGbGV4U2NhbGUnIGluIHBhbmVJdGVtQ29udGFpbmVyKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmZvckVhY2gocGFuZUl0ZW1Db250YWluZXIgPT4gdGhpcy5jb21tYW5kcy51cGRhdGVFeHBhbmRlZEZsZXhTY2FsZShwYW5lSXRlbUNvbnRhaW5lcikpLFxuICAgICk7XG4gIH1cblxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMuY29tbWFuZHMuZGVhY3RpdmF0ZSgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHByb3ZpZGVHYWRnZXRzU2VydmljZSgpOiBHYWRnZXRzU2VydmljZSB7XG4gICAgcmV0dXJuIG5ldyBHYWRnZXRzU2VydmljZSh0aGlzLmNvbW1hbmRzKTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aXZhdGlvbjtcbiJdfQ==