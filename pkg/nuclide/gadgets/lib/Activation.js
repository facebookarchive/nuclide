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

var _observableFromSubscribeFunction = require('./observableFromSubscribeFunction');

var _observableFromSubscribeFunction2 = _interopRequireDefault(_observableFromSubscribeFunction);

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _rxDom = require('rx-dom');

var _syncAtomCommands = require('./syncAtomCommands');

var _syncAtomCommands2 = _interopRequireDefault(_syncAtomCommands);

var _trackActions = require('./trackActions');

var _trackActions2 = _interopRequireDefault(_trackActions);

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
    (0, _observableFromSubscribeFunction2['default'])(atom.workspace.observePaneItems.bind(atom.workspace)).merge((0, _observableFromSubscribeFunction2['default'])(atom.workspace.onDidChangeActivePaneItem.bind(atom.workspace))).merge(gadget$).throttle(100).forEach(function () {
      return _this.commands.renderPaneItems();
    }),

    // Clean up when pane items are destroyed.
    (0, _observableFromSubscribeFunction2['default'])(atom.workspace.onDidDestroyPaneItem.bind(atom.workspace)).forEach(function (_ref) {
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
//# sourceMappingURL=data:application/json;base64,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LEFBQUMsVUFBVSxJQUFJLGlCQUFpQixJQUFNLGNBQWMsSUFBSSxpQkFBaUIsQUFBQyxDQUFDO0tBQ25GLENBQUMsQ0FDRCxPQUFPLENBQUMsVUFBQSxpQkFBaUI7YUFBSSxNQUFLLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxpQkFBaUIsQ0FBQztLQUFBLENBQUMsQ0FDMUYsQ0FBQztHQUNIOztlQTNERyxVQUFVOztXQTZESixzQkFBRztBQUNYLFVBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDM0IsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1dBRW9CLGlDQUFtQjtBQUN0QyxhQUFPLGdDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDMUM7OztTQXBFRyxVQUFVOzs7QUF3RWhCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDIiwiZmlsZSI6IkFjdGl2YXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IENvbW1hbmRzIGZyb20gJy4vQ29tbWFuZHMnO1xuaW1wb3J0IEdhZGdldHNTZXJ2aWNlIGZyb20gJy4vR2FkZ2V0c1NlcnZpY2UnO1xuaW1wb3J0IGNyZWF0ZVN0YXRlU3RyZWFtIGZyb20gJy4vY3JlYXRlU3RhdGVTdHJlYW0nO1xuaW1wb3J0IGdldEluaXRpYWxTdGF0ZSBmcm9tICcuL2dldEluaXRpYWxTdGF0ZSc7XG5pbXBvcnQgb2JzZXJ2YWJsZUZyb21TdWJzY3JpYmVGdW5jdGlvbiBmcm9tICcuL29ic2VydmFibGVGcm9tU3Vic2NyaWJlRnVuY3Rpb24nO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcbmltcG9ydCB7RE9NIGFzIFJ4RG9tfSBmcm9tICdyeC1kb20nO1xuaW1wb3J0IHN5bmNBdG9tQ29tbWFuZHMgZnJvbSAnLi9zeW5jQXRvbUNvbW1hbmRzJztcbmltcG9ydCB0cmFja0FjdGlvbnMgZnJvbSAnLi90cmFja0FjdGlvbnMnO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBjb21tYW5kczogQ29tbWFuZHM7XG5cbiAgY29uc3RydWN0b3IoaW5pdGlhbFN0YXRlOiA/T2JqZWN0KSB7XG4gICAgaW5pdGlhbFN0YXRlID0gZ2V0SW5pdGlhbFN0YXRlKCk7XG4gICAgY29uc3QgYWN0aW9uJCA9IG5ldyBSeC5TdWJqZWN0KCk7XG4gICAgY29uc3Qgc3RhdGUkID0gY3JlYXRlU3RhdGVTdHJlYW0oYWN0aW9uJCwgaW5pdGlhbFN0YXRlKTtcbiAgICBjb25zdCBjb21tYW5kcyA9IHRoaXMuY29tbWFuZHMgPSBuZXcgQ29tbWFuZHMoYWN0aW9uJCwgKCkgPT4gc3RhdGUkLmdldFZhbHVlKCkpO1xuXG4gICAgY29uc3QgZ2V0R2FkZ2V0cyA9IHN0YXRlID0+IHN0YXRlLmdldCgnZ2FkZ2V0cycpO1xuICAgIGNvbnN0IGdhZGdldCQgPSBzdGF0ZSQubWFwKGdldEdhZGdldHMpLmRpc3RpbmN0VW50aWxDaGFuZ2VkKCk7XG5cbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgYWN0aW9uJCxcblxuICAgICAgLy8gSGFuZGxlIGFsbCBnYWRnZXQgVVJMc1xuICAgICAgYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKHVyaSA9PiBjb21tYW5kcy5vcGVuVXJpKHVyaSkpLFxuXG4gICAgICAvLyBSZS1yZW5kZXIgYWxsIHBhbmUgaXRlbXMgd2hlbiAoMSkgbmV3IGl0ZW1zIGFyZSBhZGRlZCwgKDIpIG5ldyBnYWRnZXRzIGFyZSByZWdpc3RlcmVkIGFuZFxuICAgICAgLy8gKDMpIHRoZSBhY3RpdmUgcGFuZSBpdGVtIGNoYW5nZXMuXG4gICAgICBvYnNlcnZhYmxlRnJvbVN1YnNjcmliZUZ1bmN0aW9uKGF0b20ud29ya3NwYWNlLm9ic2VydmVQYW5lSXRlbXMuYmluZChhdG9tLndvcmtzcGFjZSkpXG4gICAgICAgIC5tZXJnZShcbiAgICAgICAgICBvYnNlcnZhYmxlRnJvbVN1YnNjcmliZUZ1bmN0aW9uKFxuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbS5iaW5kKGF0b20ud29ya3NwYWNlKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICAubWVyZ2UoZ2FkZ2V0JClcbiAgICAgICAgLnRocm90dGxlKDEwMClcbiAgICAgICAgLmZvckVhY2goKCkgPT4gdGhpcy5jb21tYW5kcy5yZW5kZXJQYW5lSXRlbXMoKSksXG5cbiAgICAgIC8vIENsZWFuIHVwIHdoZW4gcGFuZSBpdGVtcyBhcmUgZGVzdHJveWVkLlxuICAgICAgb2JzZXJ2YWJsZUZyb21TdWJzY3JpYmVGdW5jdGlvbihhdG9tLndvcmtzcGFjZS5vbkRpZERlc3Ryb3lQYW5lSXRlbS5iaW5kKGF0b20ud29ya3NwYWNlKSlcbiAgICAgICAgLmZvckVhY2goKHtpdGVtfSkgPT4gdGhpcy5jb21tYW5kcy5jbGVhblVwRGVzdHJveWVkUGFuZUl0ZW0oaXRlbSkpLFxuXG4gICAgICAvLyBLZWVwIHRoZSBhdG9tIGNvbW1hbmRzIHVwIHRvIGRhdGUgd2l0aCB0aGUgcmVnaXN0ZXJlZCBnYWRnZXRzLlxuICAgICAgc3luY0F0b21Db21tYW5kcyhnYWRnZXQkLCBjb21tYW5kcyksXG5cbiAgICAgIC8vIENvbGxlY3Qgc29tZSBhbmFseXRpY3MgYWJvdXQgZ2FkZ2V0IGFjdGlvbnMuXG4gICAgICB0cmFja0FjdGlvbnMoYWN0aW9uJCksXG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgZXhwYW5kZWQgRmxleCBzY2FsZSB3aGVuZXZlciB0aGUgdXNlciBzdGFydHMgZHJhZ2dpbmcgYSBoYW5kbGUuIFVzZSB0aGUgY2FwdHVyZVxuICAgICAgLy8gcGhhc2Ugc2luY2UgcmVzaXplIGhhbmRsZXMgc3RvcCBwcm9wYWdhdGlvbiBvZiB0aGUgZXZlbnQgZHVyaW5nIHRoZSBidWJibGluZyBwaGFzZS5cbiAgICAgIFJ4RG9tLmZyb21FdmVudChkb2N1bWVudCwgJ21vdXNlZG93bicsIHRydWUpXG4gICAgICAgIC5maWx0ZXIoZXZlbnQgPT4gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdhdG9tLXBhbmUtcmVzaXplLWhhbmRsZScpXG4gICAgICAgIC8vIEdldCB0aGUgbW9kZWxzIHRoYXQgcmVwcmVzZW50IHRoZSBjb250YWluZXJzIGJlaW5nIHJlc2l6ZWQ6XG4gICAgICAgIC5mbGF0TWFwKGV2ZW50ID0+IHtcbiAgICAgICAgICBjb25zdCBoYW5kbGVFbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBoYW5kbGVFbGVtZW50LnByZXZpb3VzRWxlbWVudFNpYmxpbmcgJiYgaGFuZGxlRWxlbWVudC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLm1vZGVsLFxuICAgICAgICAgICAgaGFuZGxlRWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmcgJiYgaGFuZGxlRWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmcubW9kZWwsXG4gICAgICAgICAgXS5maWx0ZXIocGFuZUl0ZW1Db250YWluZXIgPT4gcGFuZUl0ZW1Db250YWluZXIgIT09IG51bGwpO1xuICAgICAgICB9KVxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhlc2UgYXJlIGFjdHVhbGx5IHBhbmUgaXRlbSBjb250YWluZXJzOlxuICAgICAgICAuZmlsdGVyKHBhbmVJdGVtQ29udGFpbmVyID0+IHtcbiAgICAgICAgICByZXR1cm4gKCdnZXRJdGVtcycgaW4gcGFuZUl0ZW1Db250YWluZXIpICYmICgnZ2V0RmxleFNjYWxlJyBpbiBwYW5lSXRlbUNvbnRhaW5lcik7XG4gICAgICAgIH0pXG4gICAgICAgIC5mb3JFYWNoKHBhbmVJdGVtQ29udGFpbmVyID0+IHRoaXMuY29tbWFuZHMudXBkYXRlRXhwYW5kZWRGbGV4U2NhbGUocGFuZUl0ZW1Db250YWluZXIpKSxcbiAgICApO1xuICB9XG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmNvbW1hbmRzLmRlYWN0aXZhdGUoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBwcm92aWRlR2FkZ2V0c1NlcnZpY2UoKTogR2FkZ2V0c1NlcnZpY2Uge1xuICAgIHJldHVybiBuZXcgR2FkZ2V0c1NlcnZpY2UodGhpcy5jb21tYW5kcyk7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGl2YXRpb247XG4iXX0=