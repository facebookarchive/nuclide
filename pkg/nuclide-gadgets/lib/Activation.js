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

var _nuclideCommons = require('../../nuclide-commons');

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

var _syncAtomCommands = require('./syncAtomCommands');

var _syncAtomCommands2 = _interopRequireDefault(_syncAtomCommands);

var _trackActions = require('./trackActions');

var _trackActions2 = _interopRequireDefault(_trackActions);

var observableFromSubscribeFunction = _nuclideCommons.event.observableFromSubscribeFunction;

var Activation = (function () {
  function Activation(initialState) {
    var _this = this;

    _classCallCheck(this, Activation);

    initialState = (0, _getInitialState2['default'])();
    var action$ = new _reactivexRxjs2['default'].Subject();
    var state$ = (0, _createStateStream2['default'])(action$, initialState);
    var commands = this.commands = new _Commands2['default'](action$, function () {
      return state$.getValue();
    });

    var getGadgets = function getGadgets(state) {
      return state.get('gadgets');
    };
    var gadget$ = state$.map(getGadgets).distinctUntilChanged();

    this._disposables = new _atom.CompositeDisposable(new _nuclideCommons.DisposableSubscription(action$),

    // Re-render all pane items when (1) new items are added, (2) new gadgets are registered and
    // (3) the active pane item changes.
    new _nuclideCommons.DisposableSubscription(observableFromSubscribeFunction(atom.workspace.observePaneItems.bind(atom.workspace)).merge(observableFromSubscribeFunction(atom.workspace.onDidChangeActivePaneItem.bind(atom.workspace))).merge(gadget$).sampleTime(100).subscribe(function () {
      return _this.commands.renderPaneItems();
    })),

    // Clean up when pane items are destroyed.
    new _nuclideCommons.DisposableSubscription(observableFromSubscribeFunction(atom.workspace.onDidDestroyPaneItem.bind(atom.workspace)).subscribe(function (_ref) {
      var item = _ref.item;
      return _this.commands.cleanUpDestroyedPaneItem(item);
    })),

    // Keep the atom commands up to date with the registered gadgets.
    new _nuclideCommons.DisposableSubscription((0, _syncAtomCommands2['default'])(gadget$, commands)),

    // Collect some analytics about gadget actions.
    (0, _trackActions2['default'])(action$),

    // Update the expanded Flex scale whenever the user starts dragging a handle. Use the capture
    // phase since resize handles stop propagation of the event during the bubbling phase.
    new _nuclideCommons.DisposableSubscription(_reactivexRxjs2['default'].Observable.fromEventPattern(function (handler) {
      document.addEventListener('mousedown', handler, true);
    }, function (handler) {
      document.removeEventListener('mousedown', handler, true);
    }).filter(function (event) {
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
    }).subscribe(function (paneItemContainer) {
      return _this.commands.updateExpandedFlexScale(paneItemContainer);
    })));
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
//# sourceMappingURL=data:application/json;base64,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SSxhQUFhLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUMzRSxDQUFDLE1BQU0sQ0FBQyxVQUFBLGlCQUFpQjtlQUFJLGlCQUFpQixLQUFLLElBQUk7T0FBQSxDQUFDLENBQUM7S0FDM0QsQ0FBQzs7S0FFRCxNQUFNLENBQUMsVUFBQSxpQkFBaUIsRUFBSTtBQUMzQixhQUFPLEFBQUMsVUFBVSxJQUFJLGlCQUFpQixJQUFNLGNBQWMsSUFBSSxpQkFBaUIsQUFBQyxDQUFDO0tBQ25GLENBQUMsQ0FDRCxTQUFTLENBQUMsVUFBQSxpQkFBaUI7YUFBSSxNQUFLLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxpQkFBaUIsQ0FBQztLQUFBLENBQUMsQ0FDNUYsQ0FDRixDQUFDO0dBQ0g7O2VBakVHLFVBQVU7O1dBbUVKLHNCQUFHO0FBQ1gsVUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUMzQixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFb0IsaUNBQW1CO0FBQ3RDLGFBQU8sZ0NBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUMxQzs7O1NBMUVHLFVBQVU7OztBQThFaEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMiLCJmaWxlIjoiQWN0aXZhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtBY3Rpb259IGZyb20gJy4uL3R5cGVzL0FjdGlvbic7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgQ29tbWFuZHMgZnJvbSAnLi9Db21tYW5kcyc7XG5pbXBvcnQgR2FkZ2V0c1NlcnZpY2UgZnJvbSAnLi9HYWRnZXRzU2VydmljZSc7XG5pbXBvcnQgY3JlYXRlU3RhdGVTdHJlYW0gZnJvbSAnLi9jcmVhdGVTdGF0ZVN0cmVhbSc7XG5pbXBvcnQgZ2V0SW5pdGlhbFN0YXRlIGZyb20gJy4vZ2V0SW5pdGlhbFN0YXRlJztcbmltcG9ydCB7RGlzcG9zYWJsZVN1YnNjcmlwdGlvbiwgZXZlbnQgYXMgY29tbW9uc0V2ZW50fSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuY29uc3Qge29ic2VydmFibGVGcm9tU3Vic2NyaWJlRnVuY3Rpb259ID0gY29tbW9uc0V2ZW50O1xuaW1wb3J0IFJ4IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5pbXBvcnQgc3luY0F0b21Db21tYW5kcyBmcm9tICcuL3N5bmNBdG9tQ29tbWFuZHMnO1xuaW1wb3J0IHRyYWNrQWN0aW9ucyBmcm9tICcuL3RyYWNrQWN0aW9ucyc7XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIGNvbW1hbmRzOiBDb21tYW5kcztcblxuICBjb25zdHJ1Y3Rvcihpbml0aWFsU3RhdGU6ID9PYmplY3QpIHtcbiAgICBpbml0aWFsU3RhdGUgPSBnZXRJbml0aWFsU3RhdGUoKTtcbiAgICBjb25zdCBhY3Rpb24kOiBSeC5TdWJqZWN0PEFjdGlvbj4gPSBuZXcgUnguU3ViamVjdCgpO1xuICAgIGNvbnN0IHN0YXRlJCA9IGNyZWF0ZVN0YXRlU3RyZWFtKGFjdGlvbiQsIGluaXRpYWxTdGF0ZSk7XG4gICAgY29uc3QgY29tbWFuZHMgPSB0aGlzLmNvbW1hbmRzID0gbmV3IENvbW1hbmRzKGFjdGlvbiQsICgpID0+IHN0YXRlJC5nZXRWYWx1ZSgpKTtcblxuICAgIGNvbnN0IGdldEdhZGdldHMgPSBzdGF0ZSA9PiBzdGF0ZS5nZXQoJ2dhZGdldHMnKTtcbiAgICBjb25zdCBnYWRnZXQkID0gc3RhdGUkLm1hcChnZXRHYWRnZXRzKS5kaXN0aW5jdFVudGlsQ2hhbmdlZCgpO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIG5ldyBEaXNwb3NhYmxlU3Vic2NyaXB0aW9uKGFjdGlvbiQpLFxuXG4gICAgICAvLyBSZS1yZW5kZXIgYWxsIHBhbmUgaXRlbXMgd2hlbiAoMSkgbmV3IGl0ZW1zIGFyZSBhZGRlZCwgKDIpIG5ldyBnYWRnZXRzIGFyZSByZWdpc3RlcmVkIGFuZFxuICAgICAgLy8gKDMpIHRoZSBhY3RpdmUgcGFuZSBpdGVtIGNoYW5nZXMuXG4gICAgICBuZXcgRGlzcG9zYWJsZVN1YnNjcmlwdGlvbihcbiAgICAgICAgb2JzZXJ2YWJsZUZyb21TdWJzY3JpYmVGdW5jdGlvbihhdG9tLndvcmtzcGFjZS5vYnNlcnZlUGFuZUl0ZW1zLmJpbmQoYXRvbS53b3Jrc3BhY2UpKVxuICAgICAgICAgIC5tZXJnZShcbiAgICAgICAgICAgIG9ic2VydmFibGVGcm9tU3Vic2NyaWJlRnVuY3Rpb24oXG4gICAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0uYmluZChhdG9tLndvcmtzcGFjZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgICAgLm1lcmdlKGdhZGdldCQpXG4gICAgICAgICAgLnNhbXBsZVRpbWUoMTAwKVxuICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5jb21tYW5kcy5yZW5kZXJQYW5lSXRlbXMoKSlcbiAgICAgICksXG5cbiAgICAgIC8vIENsZWFuIHVwIHdoZW4gcGFuZSBpdGVtcyBhcmUgZGVzdHJveWVkLlxuICAgICAgbmV3IERpc3Bvc2FibGVTdWJzY3JpcHRpb24oXG4gICAgICAgIG9ic2VydmFibGVGcm9tU3Vic2NyaWJlRnVuY3Rpb24oYXRvbS53b3Jrc3BhY2Uub25EaWREZXN0cm95UGFuZUl0ZW0uYmluZChhdG9tLndvcmtzcGFjZSkpXG4gICAgICAgICAgLnN1YnNjcmliZSgoe2l0ZW19KSA9PiB0aGlzLmNvbW1hbmRzLmNsZWFuVXBEZXN0cm95ZWRQYW5lSXRlbShpdGVtKSlcbiAgICAgICksXG5cbiAgICAgIC8vIEtlZXAgdGhlIGF0b20gY29tbWFuZHMgdXAgdG8gZGF0ZSB3aXRoIHRoZSByZWdpc3RlcmVkIGdhZGdldHMuXG4gICAgICBuZXcgRGlzcG9zYWJsZVN1YnNjcmlwdGlvbihzeW5jQXRvbUNvbW1hbmRzKGdhZGdldCQsIGNvbW1hbmRzKSksXG5cbiAgICAgIC8vIENvbGxlY3Qgc29tZSBhbmFseXRpY3MgYWJvdXQgZ2FkZ2V0IGFjdGlvbnMuXG4gICAgICB0cmFja0FjdGlvbnMoYWN0aW9uJCksXG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgZXhwYW5kZWQgRmxleCBzY2FsZSB3aGVuZXZlciB0aGUgdXNlciBzdGFydHMgZHJhZ2dpbmcgYSBoYW5kbGUuIFVzZSB0aGUgY2FwdHVyZVxuICAgICAgLy8gcGhhc2Ugc2luY2UgcmVzaXplIGhhbmRsZXMgc3RvcCBwcm9wYWdhdGlvbiBvZiB0aGUgZXZlbnQgZHVyaW5nIHRoZSBidWJibGluZyBwaGFzZS5cbiAgICAgIG5ldyBEaXNwb3NhYmxlU3Vic2NyaXB0aW9uKFxuICAgICAgICBSeC5PYnNlcnZhYmxlLmZyb21FdmVudFBhdHRlcm4oXG4gICAgICAgICAgaGFuZGxlciA9PiB7IGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGhhbmRsZXIsIHRydWUpOyB9LFxuICAgICAgICAgIGhhbmRsZXIgPT4geyBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBoYW5kbGVyLCB0cnVlKTsgfSxcbiAgICAgICAgKVxuICAgICAgICAgIC5maWx0ZXIoZXZlbnQgPT4gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdhdG9tLXBhbmUtcmVzaXplLWhhbmRsZScpXG4gICAgICAgICAgLy8gR2V0IHRoZSBtb2RlbHMgdGhhdCByZXByZXNlbnQgdGhlIGNvbnRhaW5lcnMgYmVpbmcgcmVzaXplZDpcbiAgICAgICAgICAuZmxhdE1hcChldmVudCA9PiB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVFbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgaGFuZGxlRWxlbWVudC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nICYmIGhhbmRsZUVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZy5tb2RlbCxcbiAgICAgICAgICAgICAgaGFuZGxlRWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmcgJiYgaGFuZGxlRWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmcubW9kZWwsXG4gICAgICAgICAgICBdLmZpbHRlcihwYW5lSXRlbUNvbnRhaW5lciA9PiBwYW5lSXRlbUNvbnRhaW5lciAhPT0gbnVsbCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlc2UgYXJlIGFjdHVhbGx5IHBhbmUgaXRlbSBjb250YWluZXJzOlxuICAgICAgICAgIC5maWx0ZXIocGFuZUl0ZW1Db250YWluZXIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICgnZ2V0SXRlbXMnIGluIHBhbmVJdGVtQ29udGFpbmVyKSAmJiAoJ2dldEZsZXhTY2FsZScgaW4gcGFuZUl0ZW1Db250YWluZXIpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnN1YnNjcmliZShwYW5lSXRlbUNvbnRhaW5lciA9PiB0aGlzLmNvbW1hbmRzLnVwZGF0ZUV4cGFuZGVkRmxleFNjYWxlKHBhbmVJdGVtQ29udGFpbmVyKSlcbiAgICAgICksXG4gICAgKTtcbiAgfVxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5jb21tYW5kcy5kZWFjdGl2YXRlKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgcHJvdmlkZUdhZGdldHNTZXJ2aWNlKCk6IEdhZGdldHNTZXJ2aWNlIHtcbiAgICByZXR1cm4gbmV3IEdhZGdldHNTZXJ2aWNlKHRoaXMuY29tbWFuZHMpO1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBY3RpdmF0aW9uO1xuIl19