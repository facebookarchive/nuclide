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

    // Handle all gadget URLs
    atom.workspace.addOpener(function (uri) {
      return commands.openUri(uri);
    }),

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
//# sourceMappingURL=data:application/json;base64,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QUVELE1BQU0sQ0FBQyxVQUFBLGlCQUFpQixFQUFJO0FBQzNCLGFBQU8sQUFBQyxVQUFVLElBQUksaUJBQWlCLElBQU0sY0FBYyxJQUFJLGlCQUFpQixBQUFDLENBQUM7S0FDbkYsQ0FBQyxDQUNELE9BQU8sQ0FBQyxVQUFBLGlCQUFpQjthQUFJLE1BQUssUUFBUSxDQUFDLHVCQUF1QixDQUFDLGlCQUFpQixDQUFDO0tBQUEsQ0FBQyxDQUMxRixDQUFDO0dBQ0g7O2VBM0RHLFVBQVU7O1dBNkRKLHNCQUFHO0FBQ1gsVUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUMzQixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFb0IsaUNBQW1CO0FBQ3RDLGFBQU8sZ0NBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUMxQzs7O1NBcEVHLFVBQVU7OztBQXdFaEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMiLCJmaWxlIjoiQWN0aXZhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgQ29tbWFuZHMgZnJvbSAnLi9Db21tYW5kcyc7XG5pbXBvcnQgR2FkZ2V0c1NlcnZpY2UgZnJvbSAnLi9HYWRnZXRzU2VydmljZSc7XG5pbXBvcnQgY3JlYXRlU3RhdGVTdHJlYW0gZnJvbSAnLi9jcmVhdGVTdGF0ZVN0cmVhbSc7XG5pbXBvcnQgZ2V0SW5pdGlhbFN0YXRlIGZyb20gJy4vZ2V0SW5pdGlhbFN0YXRlJztcbmltcG9ydCB7ZXZlbnQgYXMgY29tbW9uc0V2ZW50fSBmcm9tICcuLi8uLi9jb21tb25zJztcbmNvbnN0IHtvYnNlcnZhYmxlRnJvbVN1YnNjcmliZUZ1bmN0aW9ufSA9IGNvbW1vbnNFdmVudDtcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5pbXBvcnQge0RPTSBhcyBSeERvbX0gZnJvbSAncngtZG9tJztcbmltcG9ydCBzeW5jQXRvbUNvbW1hbmRzIGZyb20gJy4vc3luY0F0b21Db21tYW5kcyc7XG5pbXBvcnQgdHJhY2tBY3Rpb25zIGZyb20gJy4vdHJhY2tBY3Rpb25zJztcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgY29tbWFuZHM6IENvbW1hbmRzO1xuXG4gIGNvbnN0cnVjdG9yKGluaXRpYWxTdGF0ZTogP09iamVjdCkge1xuICAgIGluaXRpYWxTdGF0ZSA9IGdldEluaXRpYWxTdGF0ZSgpO1xuICAgIGNvbnN0IGFjdGlvbiQgPSBuZXcgUnguU3ViamVjdCgpO1xuICAgIGNvbnN0IHN0YXRlJCA9IGNyZWF0ZVN0YXRlU3RyZWFtKGFjdGlvbiQsIGluaXRpYWxTdGF0ZSk7XG4gICAgY29uc3QgY29tbWFuZHMgPSB0aGlzLmNvbW1hbmRzID0gbmV3IENvbW1hbmRzKGFjdGlvbiQsICgpID0+IHN0YXRlJC5nZXRWYWx1ZSgpKTtcblxuICAgIGNvbnN0IGdldEdhZGdldHMgPSBzdGF0ZSA9PiBzdGF0ZS5nZXQoJ2dhZGdldHMnKTtcbiAgICBjb25zdCBnYWRnZXQkID0gc3RhdGUkLm1hcChnZXRHYWRnZXRzKS5kaXN0aW5jdFVudGlsQ2hhbmdlZCgpO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIGFjdGlvbiQsXG5cbiAgICAgIC8vIEhhbmRsZSBhbGwgZ2FkZ2V0IFVSTHNcbiAgICAgIGF0b20ud29ya3NwYWNlLmFkZE9wZW5lcih1cmkgPT4gY29tbWFuZHMub3BlblVyaSh1cmkpKSxcblxuICAgICAgLy8gUmUtcmVuZGVyIGFsbCBwYW5lIGl0ZW1zIHdoZW4gKDEpIG5ldyBpdGVtcyBhcmUgYWRkZWQsICgyKSBuZXcgZ2FkZ2V0cyBhcmUgcmVnaXN0ZXJlZCBhbmRcbiAgICAgIC8vICgzKSB0aGUgYWN0aXZlIHBhbmUgaXRlbSBjaGFuZ2VzLlxuICAgICAgb2JzZXJ2YWJsZUZyb21TdWJzY3JpYmVGdW5jdGlvbihhdG9tLndvcmtzcGFjZS5vYnNlcnZlUGFuZUl0ZW1zLmJpbmQoYXRvbS53b3Jrc3BhY2UpKVxuICAgICAgICAubWVyZ2UoXG4gICAgICAgICAgb2JzZXJ2YWJsZUZyb21TdWJzY3JpYmVGdW5jdGlvbihcbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0uYmluZChhdG9tLndvcmtzcGFjZSlcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICAgLm1lcmdlKGdhZGdldCQpXG4gICAgICAgIC50aHJvdHRsZSgxMDApXG4gICAgICAgIC5mb3JFYWNoKCgpID0+IHRoaXMuY29tbWFuZHMucmVuZGVyUGFuZUl0ZW1zKCkpLFxuXG4gICAgICAvLyBDbGVhbiB1cCB3aGVuIHBhbmUgaXRlbXMgYXJlIGRlc3Ryb3llZC5cbiAgICAgIG9ic2VydmFibGVGcm9tU3Vic2NyaWJlRnVuY3Rpb24oYXRvbS53b3Jrc3BhY2Uub25EaWREZXN0cm95UGFuZUl0ZW0uYmluZChhdG9tLndvcmtzcGFjZSkpXG4gICAgICAgIC5mb3JFYWNoKCh7aXRlbX0pID0+IHRoaXMuY29tbWFuZHMuY2xlYW5VcERlc3Ryb3llZFBhbmVJdGVtKGl0ZW0pKSxcblxuICAgICAgLy8gS2VlcCB0aGUgYXRvbSBjb21tYW5kcyB1cCB0byBkYXRlIHdpdGggdGhlIHJlZ2lzdGVyZWQgZ2FkZ2V0cy5cbiAgICAgIHN5bmNBdG9tQ29tbWFuZHMoZ2FkZ2V0JCwgY29tbWFuZHMpLFxuXG4gICAgICAvLyBDb2xsZWN0IHNvbWUgYW5hbHl0aWNzIGFib3V0IGdhZGdldCBhY3Rpb25zLlxuICAgICAgdHJhY2tBY3Rpb25zKGFjdGlvbiQpLFxuXG4gICAgICAvLyBVcGRhdGUgdGhlIGV4cGFuZGVkIEZsZXggc2NhbGUgd2hlbmV2ZXIgdGhlIHVzZXIgc3RhcnRzIGRyYWdnaW5nIGEgaGFuZGxlLiBVc2UgdGhlIGNhcHR1cmVcbiAgICAgIC8vIHBoYXNlIHNpbmNlIHJlc2l6ZSBoYW5kbGVzIHN0b3AgcHJvcGFnYXRpb24gb2YgdGhlIGV2ZW50IGR1cmluZyB0aGUgYnViYmxpbmcgcGhhc2UuXG4gICAgICBSeERvbS5mcm9tRXZlbnQoZG9jdW1lbnQsICdtb3VzZWRvd24nLCB0cnVlKVxuICAgICAgICAuZmlsdGVyKGV2ZW50ID0+IGV2ZW50LnRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnYXRvbS1wYW5lLXJlc2l6ZS1oYW5kbGUnKVxuICAgICAgICAvLyBHZXQgdGhlIG1vZGVscyB0aGF0IHJlcHJlc2VudCB0aGUgY29udGFpbmVycyBiZWluZyByZXNpemVkOlxuICAgICAgICAuZmxhdE1hcChldmVudCA9PiB7XG4gICAgICAgICAgY29uc3QgaGFuZGxlRWxlbWVudCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgaGFuZGxlRWxlbWVudC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nICYmIGhhbmRsZUVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZy5tb2RlbCxcbiAgICAgICAgICAgIGhhbmRsZUVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nICYmIGhhbmRsZUVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nLm1vZGVsLFxuICAgICAgICAgIF0uZmlsdGVyKHBhbmVJdGVtQ29udGFpbmVyID0+IHBhbmVJdGVtQ29udGFpbmVyICE9PSBudWxsKTtcbiAgICAgICAgfSlcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZXNlIGFyZSBhY3R1YWxseSBwYW5lIGl0ZW0gY29udGFpbmVyczpcbiAgICAgICAgLmZpbHRlcihwYW5lSXRlbUNvbnRhaW5lciA9PiB7XG4gICAgICAgICAgcmV0dXJuICgnZ2V0SXRlbXMnIGluIHBhbmVJdGVtQ29udGFpbmVyKSAmJiAoJ2dldEZsZXhTY2FsZScgaW4gcGFuZUl0ZW1Db250YWluZXIpO1xuICAgICAgICB9KVxuICAgICAgICAuZm9yRWFjaChwYW5lSXRlbUNvbnRhaW5lciA9PiB0aGlzLmNvbW1hbmRzLnVwZGF0ZUV4cGFuZGVkRmxleFNjYWxlKHBhbmVJdGVtQ29udGFpbmVyKSksXG4gICAgKTtcbiAgfVxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5jb21tYW5kcy5kZWFjdGl2YXRlKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgcHJvdmlkZUdhZGdldHNTZXJ2aWNlKCk6IEdhZGdldHNTZXJ2aWNlIHtcbiAgICByZXR1cm4gbmV3IEdhZGdldHNTZXJ2aWNlKHRoaXMuY29tbWFuZHMpO1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBY3RpdmF0aW9uO1xuIl19