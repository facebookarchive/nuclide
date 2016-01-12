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

var _getHackSearchService = require('./getHackSearchService');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

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
    var service = yield (0, _getHackSearchService.getHackSearchService)(directory);
    return service != null;
  }),

  executeQuery: _asyncToGenerator(function* (query, directory) {
    if (query.length === 0 || directory == null) {
      return [];
    }

    var service = yield (0, _getHackSearchService.getHackSearchService)(directory);
    if (service == null) {
      return [];
    }

    var directoryPath = directory.getPath();
    return yield service.queryHack(directoryPath, query);
  }),

  getComponentForItem: function getComponentForItem(item) {
    var filePath = item.path;
    var filename = _path2['default'].basename(filePath);
    var name = item.name || '';

    var icon = bestIconForItem(item);
    var symbolClasses = 'file icon ' + icon;
    return _reactForAtom2['default'].createElement(
      'div',
      { title: item.additionalInfo || '' },
      _reactForAtom2['default'].createElement(
        'span',
        { className: symbolClasses },
        _reactForAtom2['default'].createElement(
          'code',
          null,
          name
        )
      ),
      _reactForAtom2['default'].createElement(
        'span',
        { className: 'omnisearch-symbol-result-filename' },
        filename
      )
    );
  }
};
exports.HackSymbolProvider = HackSymbolProvider;
//# sourceMappingURL=data:application/json;base64,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QUFJLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25DLFFBQU0sYUFBYSxrQkFBZ0IsSUFBSSxBQUFFLENBQUM7QUFDMUMsV0FDRTs7UUFBSyxLQUFLLEVBQUUsSUFBSSxDQUFDLGNBQWMsSUFBSSxFQUFFLEFBQUM7TUFDcEM7O1VBQU0sU0FBUyxFQUFFLGFBQWEsQUFBQztRQUFDOzs7VUFBTyxJQUFJO1NBQVE7T0FBTztNQUMxRDs7VUFBTSxTQUFTLEVBQUMsbUNBQW1DO1FBQUUsUUFBUTtPQUFRO0tBQ2pFLENBQ047R0FDSDtDQUNGLENBQUMiLCJmaWxlIjoiSGFja1N5bWJvbFByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBGaWxlUmVzdWx0LFxuICBQcm92aWRlcixcbiAgUHJvdmlkZXJUeXBlLFxufSBmcm9tICcuLi8uLi9xdWljay1vcGVuLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUge0hhY2tTZWFyY2hQb3NpdGlvbn0gZnJvbSAnLi4vLi4vaGFjay1iYXNlL2xpYi90eXBlcyc7XG5cbmltcG9ydCB7Z2V0SGFja1NlYXJjaFNlcnZpY2V9IGZyb20gJy4vZ2V0SGFja1NlYXJjaFNlcnZpY2UnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5leHBvcnQgdHlwZSBIYWNrRmlsZVJlc3VsdCA9IEZpbGVSZXN1bHQgJiBIYWNrU2VhcmNoUG9zaXRpb247XG5cbmNvbnN0IElDT05TID0ge1xuICAnaW50ZXJmYWNlJzogJ2ljb24tcHV6emxlJyxcbiAgJ2Z1bmN0aW9uJzogJ2ljb24temFwJyxcbiAgJ21ldGhvZCc6ICdpY29uLXphcCcsXG4gICd0eXBlZGVmJzogJ2ljb24tdGFnJyxcbiAgJ2NsYXNzJzogJ2ljb24tY29kZScsXG4gICdhYnN0cmFjdCBjbGFzcyc6ICdpY29uLWNvZGUnLFxuICAnY29uc3RhbnQnOiAnaWNvbi1xdW90ZScsXG4gICd0cmFpdCc6ICdpY29uLWNoZWNrbGlzdCcsXG4gICdlbnVtJzogJ2ljb24tZmlsZS1iaW5hcnknLFxuICAnZGVmYXVsdCc6ICduby1pY29uJyxcbiAgJ3Vua25vd24nOiAnaWNvbi1zcXVpcnJlbCcsXG59O1xuXG5mdW5jdGlvbiBiZXN0SWNvbkZvckl0ZW0oaXRlbTogSGFja0ZpbGVSZXN1bHQpOiBzdHJpbmcge1xuICBpZiAoIWl0ZW0uYWRkaXRpb25hbEluZm8pIHtcbiAgICByZXR1cm4gSUNPTlMuZGVmYXVsdDtcbiAgfVxuICAvLyBMb29rIGZvciBleGFjdCBtYXRjaC5cbiAgaWYgKElDT05TW2l0ZW0uYWRkaXRpb25hbEluZm9dKSB7XG4gICAgcmV0dXJuIElDT05TW2l0ZW0uYWRkaXRpb25hbEluZm9dO1xuICB9XG4gIC8vIExvb2sgZm9yIHByZXNlbmNlIG1hdGNoLCBlLmcuIGluICdzdGF0aWMgbWV0aG9kIGluIEZvb0JhckNsYXNzJy5cbiAgZm9yIChjb25zdCBrZXl3b3JkIGluIElDT05TKSB7XG4gICAgaWYgKGl0ZW0uYWRkaXRpb25hbEluZm8uaW5kZXhPZihrZXl3b3JkKSAhPT0gLTEpIHtcbiAgICAgIHJldHVybiBJQ09OU1trZXl3b3JkXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIElDT05TLnVua25vd247XG59XG5cbmV4cG9ydCBjb25zdCBIYWNrU3ltYm9sUHJvdmlkZXI6IFByb3ZpZGVyPEhhY2tGaWxlUmVzdWx0PiA9IHtcblxuICBnZXROYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdIYWNrU3ltYm9sUHJvdmlkZXInO1xuICB9LFxuXG4gIGdldFByb3ZpZGVyVHlwZSgpOiBQcm92aWRlclR5cGUge1xuICAgIHJldHVybiAnRElSRUNUT1JZJztcbiAgfSxcblxuICBpc1JlbmRlcmFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgZ2V0QWN0aW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdudWNsaWRlLWhhY2stc3ltYm9sLXByb3ZpZGVyOnRvZ2dsZS1wcm92aWRlcic7XG4gIH0sXG5cbiAgZ2V0UHJvbXB0VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnU2VhcmNoIEhhY2sgc3ltYm9scy4gQXZhaWxhYmxlIHByZWZpeGVzOiBAZnVuY3Rpb24gJWNvbnN0YW50ICNjbGFzcyc7XG4gIH0sXG5cbiAgZ2V0VGFiVGl0bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ0hhY2sgU3ltYm9scyc7XG4gIH0sXG5cbiAgYXN5bmMgaXNFbGlnaWJsZUZvckRpcmVjdG9yeShkaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3Qgc2VydmljZSA9IGF3YWl0IGdldEhhY2tTZWFyY2hTZXJ2aWNlKGRpcmVjdG9yeSk7XG4gICAgcmV0dXJuIHNlcnZpY2UgIT0gbnVsbDtcbiAgfSxcblxuICBhc3luYyBleGVjdXRlUXVlcnkoXG4gICAgcXVlcnk6IHN0cmluZyxcbiAgICBkaXJlY3Rvcnk/OiBhdG9tJERpcmVjdG9yeVxuICApOiBQcm9taXNlPEFycmF5PEhhY2tGaWxlUmVzdWx0Pj4ge1xuICAgIGlmIChxdWVyeS5sZW5ndGggPT09IDAgfHwgZGlyZWN0b3J5ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBzZXJ2aWNlID0gYXdhaXQgZ2V0SGFja1NlYXJjaFNlcnZpY2UoZGlyZWN0b3J5KTtcbiAgICBpZiAoc2VydmljZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3QgZGlyZWN0b3J5UGF0aCA9IGRpcmVjdG9yeS5nZXRQYXRoKCk7XG4gICAgcmV0dXJuIChhd2FpdCBzZXJ2aWNlLnF1ZXJ5SGFjayhkaXJlY3RvcnlQYXRoLCBxdWVyeSk6IEFycmF5PEhhY2tGaWxlUmVzdWx0Pik7XG4gIH0sXG5cbiAgZ2V0Q29tcG9uZW50Rm9ySXRlbShpdGVtOiBIYWNrRmlsZVJlc3VsdCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgZmlsZVBhdGggPSBpdGVtLnBhdGg7XG4gICAgY29uc3QgZmlsZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKTtcbiAgICBjb25zdCBuYW1lID0gaXRlbS5uYW1lIHx8ICcnO1xuXG4gICAgY29uc3QgaWNvbiA9IGJlc3RJY29uRm9ySXRlbShpdGVtKTtcbiAgICBjb25zdCBzeW1ib2xDbGFzc2VzID0gYGZpbGUgaWNvbiAke2ljb259YDtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiB0aXRsZT17aXRlbS5hZGRpdGlvbmFsSW5mbyB8fCAnJ30+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT17c3ltYm9sQ2xhc3Nlc30+PGNvZGU+e25hbWV9PC9jb2RlPjwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwib21uaXNlYXJjaC1zeW1ib2wtcmVzdWx0LWZpbGVuYW1lXCI+e2ZpbGVuYW1lfTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG59O1xuIl19