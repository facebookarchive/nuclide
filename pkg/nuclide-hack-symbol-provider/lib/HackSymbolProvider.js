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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _getHackService = require('./getHackService');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _reactForAtom = require('react-for-atom');

var ICONS = {
  'interface': 'icon-puzzle',
  'function': 'icon-zap',
  'method': 'icon-zap',
  'typedef': 'icon-tag',
  'class': 'icon-code',
  'abstract class': 'icon-code',
  'constant': 'icon-quote',
  'trait': 'icon-checklist',
  'enum': 'icon-file-binary',
  'default': 'no-icon',
  'unknown': 'icon-squirrel'
};

function bestIconForItem(item) {
  if (!item.additionalInfo) {
    return ICONS['default'];
  }
  // Look for exact match.
  if (ICONS[item.additionalInfo]) {
    return ICONS[item.additionalInfo];
  }
  // Look for presence match, e.g. in 'static method in FooBarClass'.
  for (var keyword in ICONS) {
    if (item.additionalInfo.indexOf(keyword) !== -1) {
      return ICONS[keyword];
    }
  }
  return ICONS.unknown;
}

var HackSymbolProvider = {

  getName: function getName() {
    return 'HackSymbolProvider';
  },

  getProviderType: function getProviderType() {
    return 'DIRECTORY';
  },

  isRenderable: function isRenderable() {
    return true;
  },

  getAction: function getAction() {
    return 'nuclide-hack-symbol-provider:toggle-provider';
  },

  getPromptText: function getPromptText() {
    return 'Search Hack symbols. Available prefixes: @function %constant #class';
  },

  getTabTitle: function getTabTitle() {
    return 'Hack Symbols';
  },

  isEligibleForDirectory: _asyncToGenerator(function* (directory) {
    var service = yield (0, _getHackService.getHackService)(directory);
    return service != null;
  }),

  executeQuery: _asyncToGenerator(function* (query, directory) {
    if (query.length === 0 || directory == null) {
      return [];
    }

    var service = yield (0, _getHackService.getHackService)(directory);
    if (service == null) {
      return [];
    }

    var directoryPath = directory.getPath();
    var results = yield service.queryHack(directoryPath, query);
    return results;
  }),

  getComponentForItem: function getComponentForItem(uncastedItem) {
    var item = uncastedItem;
    var filePath = item.path;
    var filename = _path2['default'].basename(filePath);
    var name = item.name || '';

    var icon = bestIconForItem(item);
    var symbolClasses = 'file icon ' + icon;
    return _reactForAtom.React.createElement(
      'div',
      { title: item.additionalInfo || '' },
      _reactForAtom.React.createElement(
        'span',
        { className: symbolClasses },
        _reactForAtom.React.createElement(
          'code',
          null,
          name
        )
      ),
      _reactForAtom.React.createElement(
        'span',
        { className: 'omnisearch-symbol-result-filename' },
        filename
      )
    );
  }
};
exports.HackSymbolProvider = HackSymbolProvider;
//# sourceMappingURL=data:application/json;base64,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O0FBQ3pDLFFBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDOztBQUU3QixRQUFNLElBQUksR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkMsUUFBTSxhQUFhLGtCQUFnQixJQUFJLEFBQUUsQ0FBQztBQUMxQyxXQUNFOztRQUFLLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxJQUFJLEVBQUUsQUFBQztNQUNwQzs7VUFBTSxTQUFTLEVBQUUsYUFBYSxBQUFDO1FBQUM7OztVQUFPLElBQUk7U0FBUTtPQUFPO01BQzFEOztVQUFNLFNBQVMsRUFBQyxtQ0FBbUM7UUFBRSxRQUFRO09BQVE7S0FDakUsQ0FDTjtHQUNIO0NBQ0YsQ0FBQyIsImZpbGUiOiJIYWNrU3ltYm9sUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVSZXN1bHQsXG4gIFByb3ZpZGVyLFxuICBQcm92aWRlclR5cGUsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtcXVpY2stb3Blbi1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtIYWNrU2VhcmNoUG9zaXRpb259IGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay1iYXNlL2xpYi9IYWNrU2VydmljZSc7XG5cbmltcG9ydCB7Z2V0SGFja1NlcnZpY2V9IGZyb20gJy4vZ2V0SGFja1NlcnZpY2UnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmNvbnN0IElDT05TID0ge1xuICAnaW50ZXJmYWNlJzogJ2ljb24tcHV6emxlJyxcbiAgJ2Z1bmN0aW9uJzogJ2ljb24temFwJyxcbiAgJ21ldGhvZCc6ICdpY29uLXphcCcsXG4gICd0eXBlZGVmJzogJ2ljb24tdGFnJyxcbiAgJ2NsYXNzJzogJ2ljb24tY29kZScsXG4gICdhYnN0cmFjdCBjbGFzcyc6ICdpY29uLWNvZGUnLFxuICAnY29uc3RhbnQnOiAnaWNvbi1xdW90ZScsXG4gICd0cmFpdCc6ICdpY29uLWNoZWNrbGlzdCcsXG4gICdlbnVtJzogJ2ljb24tZmlsZS1iaW5hcnknLFxuICAnZGVmYXVsdCc6ICduby1pY29uJyxcbiAgJ3Vua25vd24nOiAnaWNvbi1zcXVpcnJlbCcsXG59O1xuXG5mdW5jdGlvbiBiZXN0SWNvbkZvckl0ZW0oaXRlbTogSGFja1NlYXJjaFBvc2l0aW9uKTogc3RyaW5nIHtcbiAgaWYgKCFpdGVtLmFkZGl0aW9uYWxJbmZvKSB7XG4gICAgcmV0dXJuIElDT05TLmRlZmF1bHQ7XG4gIH1cbiAgLy8gTG9vayBmb3IgZXhhY3QgbWF0Y2guXG4gIGlmIChJQ09OU1tpdGVtLmFkZGl0aW9uYWxJbmZvXSkge1xuICAgIHJldHVybiBJQ09OU1tpdGVtLmFkZGl0aW9uYWxJbmZvXTtcbiAgfVxuICAvLyBMb29rIGZvciBwcmVzZW5jZSBtYXRjaCwgZS5nLiBpbiAnc3RhdGljIG1ldGhvZCBpbiBGb29CYXJDbGFzcycuXG4gIGZvciAoY29uc3Qga2V5d29yZCBpbiBJQ09OUykge1xuICAgIGlmIChpdGVtLmFkZGl0aW9uYWxJbmZvLmluZGV4T2Yoa2V5d29yZCkgIT09IC0xKSB7XG4gICAgICByZXR1cm4gSUNPTlNba2V5d29yZF07XG4gICAgfVxuICB9XG4gIHJldHVybiBJQ09OUy51bmtub3duO1xufVxuXG5leHBvcnQgY29uc3QgSGFja1N5bWJvbFByb3ZpZGVyOiBQcm92aWRlciA9IHtcblxuICBnZXROYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdIYWNrU3ltYm9sUHJvdmlkZXInO1xuICB9LFxuXG4gIGdldFByb3ZpZGVyVHlwZSgpOiBQcm92aWRlclR5cGUge1xuICAgIHJldHVybiAnRElSRUNUT1JZJztcbiAgfSxcblxuICBpc1JlbmRlcmFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgZ2V0QWN0aW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdudWNsaWRlLWhhY2stc3ltYm9sLXByb3ZpZGVyOnRvZ2dsZS1wcm92aWRlcic7XG4gIH0sXG5cbiAgZ2V0UHJvbXB0VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnU2VhcmNoIEhhY2sgc3ltYm9scy4gQXZhaWxhYmxlIHByZWZpeGVzOiBAZnVuY3Rpb24gJWNvbnN0YW50ICNjbGFzcyc7XG4gIH0sXG5cbiAgZ2V0VGFiVGl0bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ0hhY2sgU3ltYm9scyc7XG4gIH0sXG5cbiAgYXN5bmMgaXNFbGlnaWJsZUZvckRpcmVjdG9yeShkaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3Qgc2VydmljZSA9IGF3YWl0IGdldEhhY2tTZXJ2aWNlKGRpcmVjdG9yeSk7XG4gICAgcmV0dXJuIHNlcnZpY2UgIT0gbnVsbDtcbiAgfSxcblxuICBhc3luYyBleGVjdXRlUXVlcnkoXG4gICAgcXVlcnk6IHN0cmluZyxcbiAgICBkaXJlY3Rvcnk/OiBhdG9tJERpcmVjdG9yeVxuICApOiBQcm9taXNlPEFycmF5PEZpbGVSZXN1bHQ+PiB7XG4gICAgaWYgKHF1ZXJ5Lmxlbmd0aCA9PT0gMCB8fCBkaXJlY3RvcnkgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IHNlcnZpY2UgPSBhd2FpdCBnZXRIYWNrU2VydmljZShkaXJlY3RvcnkpO1xuICAgIGlmIChzZXJ2aWNlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBkaXJlY3RvcnlQYXRoID0gZGlyZWN0b3J5LmdldFBhdGgoKTtcbiAgICBjb25zdCByZXN1bHRzOiBBcnJheTxIYWNrU2VhcmNoUG9zaXRpb24+ID0gYXdhaXQgc2VydmljZS5xdWVyeUhhY2soZGlyZWN0b3J5UGF0aCwgcXVlcnkpO1xuICAgIHJldHVybiAoKHJlc3VsdHM6IGFueSk6IEFycmF5PEZpbGVSZXN1bHQ+KTtcbiAgfSxcblxuICBnZXRDb21wb25lbnRGb3JJdGVtKHVuY2FzdGVkSXRlbTogRmlsZVJlc3VsdCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIGNvbnN0IGl0ZW0gPSAoKHVuY2FzdGVkSXRlbTogYW55KTogSGFja1NlYXJjaFBvc2l0aW9uKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGl0ZW0ucGF0aDtcbiAgICBjb25zdCBmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgpO1xuICAgIGNvbnN0IG5hbWUgPSBpdGVtLm5hbWUgfHwgJyc7XG5cbiAgICBjb25zdCBpY29uID0gYmVzdEljb25Gb3JJdGVtKGl0ZW0pO1xuICAgIGNvbnN0IHN5bWJvbENsYXNzZXMgPSBgZmlsZSBpY29uICR7aWNvbn1gO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IHRpdGxlPXtpdGVtLmFkZGl0aW9uYWxJbmZvIHx8ICcnfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtzeW1ib2xDbGFzc2VzfT48Y29kZT57bmFtZX08L2NvZGU+PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJvbW5pc2VhcmNoLXN5bWJvbC1yZXN1bHQtZmlsZW5hbWVcIj57ZmlsZW5hbWV9PC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfSxcbn07XG4iXX0=