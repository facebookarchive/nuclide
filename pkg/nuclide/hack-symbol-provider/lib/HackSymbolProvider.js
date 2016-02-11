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
//# sourceMappingURL=data:application/json;base64,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O0FBQ3pDLFFBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDOztBQUU3QixRQUFNLElBQUksR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkMsUUFBTSxhQUFhLGtCQUFnQixJQUFJLEFBQUUsQ0FBQztBQUMxQyxXQUNFOztRQUFLLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxJQUFJLEVBQUUsQUFBQztNQUNwQzs7VUFBTSxTQUFTLEVBQUUsYUFBYSxBQUFDO1FBQUM7OztVQUFPLElBQUk7U0FBUTtPQUFPO01BQzFEOztVQUFNLFNBQVMsRUFBQyxtQ0FBbUM7UUFBRSxRQUFRO09BQVE7S0FDakUsQ0FDTjtHQUNIO0NBQ0YsQ0FBQyIsImZpbGUiOiJIYWNrU3ltYm9sUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVSZXN1bHQsXG4gIFByb3ZpZGVyLFxuICBQcm92aWRlclR5cGUsXG59IGZyb20gJy4uLy4uL3F1aWNrLW9wZW4taW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7SGFja1NlYXJjaFBvc2l0aW9ufSBmcm9tICcuLi8uLi9oYWNrLWJhc2UvbGliL0hhY2tTZXJ2aWNlJztcblxuaW1wb3J0IHtnZXRIYWNrU2VydmljZX0gZnJvbSAnLi9nZXRIYWNrU2VydmljZSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxuY29uc3QgSUNPTlMgPSB7XG4gICdpbnRlcmZhY2UnOiAnaWNvbi1wdXp6bGUnLFxuICAnZnVuY3Rpb24nOiAnaWNvbi16YXAnLFxuICAnbWV0aG9kJzogJ2ljb24temFwJyxcbiAgJ3R5cGVkZWYnOiAnaWNvbi10YWcnLFxuICAnY2xhc3MnOiAnaWNvbi1jb2RlJyxcbiAgJ2Fic3RyYWN0IGNsYXNzJzogJ2ljb24tY29kZScsXG4gICdjb25zdGFudCc6ICdpY29uLXF1b3RlJyxcbiAgJ3RyYWl0JzogJ2ljb24tY2hlY2tsaXN0JyxcbiAgJ2VudW0nOiAnaWNvbi1maWxlLWJpbmFyeScsXG4gICdkZWZhdWx0JzogJ25vLWljb24nLFxuICAndW5rbm93bic6ICdpY29uLXNxdWlycmVsJyxcbn07XG5cbmZ1bmN0aW9uIGJlc3RJY29uRm9ySXRlbShpdGVtOiBIYWNrU2VhcmNoUG9zaXRpb24pOiBzdHJpbmcge1xuICBpZiAoIWl0ZW0uYWRkaXRpb25hbEluZm8pIHtcbiAgICByZXR1cm4gSUNPTlMuZGVmYXVsdDtcbiAgfVxuICAvLyBMb29rIGZvciBleGFjdCBtYXRjaC5cbiAgaWYgKElDT05TW2l0ZW0uYWRkaXRpb25hbEluZm9dKSB7XG4gICAgcmV0dXJuIElDT05TW2l0ZW0uYWRkaXRpb25hbEluZm9dO1xuICB9XG4gIC8vIExvb2sgZm9yIHByZXNlbmNlIG1hdGNoLCBlLmcuIGluICdzdGF0aWMgbWV0aG9kIGluIEZvb0JhckNsYXNzJy5cbiAgZm9yIChjb25zdCBrZXl3b3JkIGluIElDT05TKSB7XG4gICAgaWYgKGl0ZW0uYWRkaXRpb25hbEluZm8uaW5kZXhPZihrZXl3b3JkKSAhPT0gLTEpIHtcbiAgICAgIHJldHVybiBJQ09OU1trZXl3b3JkXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIElDT05TLnVua25vd247XG59XG5cbmV4cG9ydCBjb25zdCBIYWNrU3ltYm9sUHJvdmlkZXI6IFByb3ZpZGVyID0ge1xuXG4gIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ0hhY2tTeW1ib2xQcm92aWRlcic7XG4gIH0sXG5cbiAgZ2V0UHJvdmlkZXJUeXBlKCk6IFByb3ZpZGVyVHlwZSB7XG4gICAgcmV0dXJuICdESVJFQ1RPUlknO1xuICB9LFxuXG4gIGlzUmVuZGVyYWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICBnZXRBY3Rpb24oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ251Y2xpZGUtaGFjay1zeW1ib2wtcHJvdmlkZXI6dG9nZ2xlLXByb3ZpZGVyJztcbiAgfSxcblxuICBnZXRQcm9tcHRUZXh0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdTZWFyY2ggSGFjayBzeW1ib2xzLiBBdmFpbGFibGUgcHJlZml4ZXM6IEBmdW5jdGlvbiAlY29uc3RhbnQgI2NsYXNzJztcbiAgfSxcblxuICBnZXRUYWJUaXRsZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnSGFjayBTeW1ib2xzJztcbiAgfSxcblxuICBhc3luYyBpc0VsaWdpYmxlRm9yRGlyZWN0b3J5KGRpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBzZXJ2aWNlID0gYXdhaXQgZ2V0SGFja1NlcnZpY2UoZGlyZWN0b3J5KTtcbiAgICByZXR1cm4gc2VydmljZSAhPSBudWxsO1xuICB9LFxuXG4gIGFzeW5jIGV4ZWN1dGVRdWVyeShcbiAgICBxdWVyeTogc3RyaW5nLFxuICAgIGRpcmVjdG9yeT86IGF0b20kRGlyZWN0b3J5XG4gICk6IFByb21pc2U8QXJyYXk8RmlsZVJlc3VsdD4+IHtcbiAgICBpZiAocXVlcnkubGVuZ3RoID09PSAwIHx8IGRpcmVjdG9yeSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3Qgc2VydmljZSA9IGF3YWl0IGdldEhhY2tTZXJ2aWNlKGRpcmVjdG9yeSk7XG4gICAgaWYgKHNlcnZpY2UgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IGRpcmVjdG9yeVBhdGggPSBkaXJlY3RvcnkuZ2V0UGF0aCgpO1xuICAgIGNvbnN0IHJlc3VsdHM6IEFycmF5PEhhY2tTZWFyY2hQb3NpdGlvbj4gPSBhd2FpdCBzZXJ2aWNlLnF1ZXJ5SGFjayhkaXJlY3RvcnlQYXRoLCBxdWVyeSk7XG4gICAgcmV0dXJuICgocmVzdWx0czogYW55KTogQXJyYXk8RmlsZVJlc3VsdD4pO1xuICB9LFxuXG4gIGdldENvbXBvbmVudEZvckl0ZW0odW5jYXN0ZWRJdGVtOiBGaWxlUmVzdWx0KTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBpdGVtID0gKCh1bmNhc3RlZEl0ZW06IGFueSk6IEhhY2tTZWFyY2hQb3NpdGlvbik7XG4gICAgY29uc3QgZmlsZVBhdGggPSBpdGVtLnBhdGg7XG4gICAgY29uc3QgZmlsZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKTtcbiAgICBjb25zdCBuYW1lID0gaXRlbS5uYW1lIHx8ICcnO1xuXG4gICAgY29uc3QgaWNvbiA9IGJlc3RJY29uRm9ySXRlbShpdGVtKTtcbiAgICBjb25zdCBzeW1ib2xDbGFzc2VzID0gYGZpbGUgaWNvbiAke2ljb259YDtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiB0aXRsZT17aXRlbS5hZGRpdGlvbmFsSW5mbyB8fCAnJ30+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT17c3ltYm9sQ2xhc3Nlc30+PGNvZGU+e25hbWV9PC9jb2RlPjwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwib21uaXNlYXJjaC1zeW1ib2wtcmVzdWx0LWZpbGVuYW1lXCI+e2ZpbGVuYW1lfTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG59O1xuIl19