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

  getComponentForItem: function getComponentForItem(item) {
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
//# sourceMappingURL=data:application/json;base64,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SUFBSSxFQUFFLENBQUM7O0FBRTdCLFFBQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuQyxRQUFNLGFBQWEsa0JBQWdCLElBQUksQUFBRSxDQUFDO0FBQzFDLFdBQ0U7O1FBQUssS0FBSyxFQUFFLElBQUksQ0FBQyxjQUFjLElBQUksRUFBRSxBQUFDO01BQ3BDOztVQUFNLFNBQVMsRUFBRSxhQUFhLEFBQUM7UUFBQzs7O1VBQU8sSUFBSTtTQUFRO09BQU87TUFDMUQ7O1VBQU0sU0FBUyxFQUFDLG1DQUFtQztRQUFFLFFBQVE7T0FBUTtLQUNqRSxDQUNOO0dBQ0g7Q0FDRixDQUFDIiwiZmlsZSI6IkhhY2tTeW1ib2xQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRmlsZVJlc3VsdCxcbiAgUHJvdmlkZXIsXG4gIFByb3ZpZGVyVHlwZSxcbn0gZnJvbSAnLi4vLi4vcXVpY2stb3Blbi1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtIYWNrU2VhcmNoUG9zaXRpb259IGZyb20gJy4uLy4uL2hhY2stYmFzZS9saWIvSGFja1NlcnZpY2UnO1xuXG5pbXBvcnQge2dldEhhY2tTZXJ2aWNlfSBmcm9tICcuL2dldEhhY2tTZXJ2aWNlJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5leHBvcnQgdHlwZSBIYWNrRmlsZVJlc3VsdCA9IEZpbGVSZXN1bHQgJiBIYWNrU2VhcmNoUG9zaXRpb247XG5cbmNvbnN0IElDT05TID0ge1xuICAnaW50ZXJmYWNlJzogJ2ljb24tcHV6emxlJyxcbiAgJ2Z1bmN0aW9uJzogJ2ljb24temFwJyxcbiAgJ21ldGhvZCc6ICdpY29uLXphcCcsXG4gICd0eXBlZGVmJzogJ2ljb24tdGFnJyxcbiAgJ2NsYXNzJzogJ2ljb24tY29kZScsXG4gICdhYnN0cmFjdCBjbGFzcyc6ICdpY29uLWNvZGUnLFxuICAnY29uc3RhbnQnOiAnaWNvbi1xdW90ZScsXG4gICd0cmFpdCc6ICdpY29uLWNoZWNrbGlzdCcsXG4gICdlbnVtJzogJ2ljb24tZmlsZS1iaW5hcnknLFxuICAnZGVmYXVsdCc6ICduby1pY29uJyxcbiAgJ3Vua25vd24nOiAnaWNvbi1zcXVpcnJlbCcsXG59O1xuXG5mdW5jdGlvbiBiZXN0SWNvbkZvckl0ZW0oaXRlbTogSGFja0ZpbGVSZXN1bHQpOiBzdHJpbmcge1xuICBpZiAoIWl0ZW0uYWRkaXRpb25hbEluZm8pIHtcbiAgICByZXR1cm4gSUNPTlMuZGVmYXVsdDtcbiAgfVxuICAvLyBMb29rIGZvciBleGFjdCBtYXRjaC5cbiAgaWYgKElDT05TW2l0ZW0uYWRkaXRpb25hbEluZm9dKSB7XG4gICAgcmV0dXJuIElDT05TW2l0ZW0uYWRkaXRpb25hbEluZm9dO1xuICB9XG4gIC8vIExvb2sgZm9yIHByZXNlbmNlIG1hdGNoLCBlLmcuIGluICdzdGF0aWMgbWV0aG9kIGluIEZvb0JhckNsYXNzJy5cbiAgZm9yIChjb25zdCBrZXl3b3JkIGluIElDT05TKSB7XG4gICAgaWYgKGl0ZW0uYWRkaXRpb25hbEluZm8uaW5kZXhPZihrZXl3b3JkKSAhPT0gLTEpIHtcbiAgICAgIHJldHVybiBJQ09OU1trZXl3b3JkXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIElDT05TLnVua25vd247XG59XG5cbmV4cG9ydCBjb25zdCBIYWNrU3ltYm9sUHJvdmlkZXI6IFByb3ZpZGVyPEhhY2tGaWxlUmVzdWx0PiA9IHtcblxuICBnZXROYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdIYWNrU3ltYm9sUHJvdmlkZXInO1xuICB9LFxuXG4gIGdldFByb3ZpZGVyVHlwZSgpOiBQcm92aWRlclR5cGUge1xuICAgIHJldHVybiAnRElSRUNUT1JZJztcbiAgfSxcblxuICBpc1JlbmRlcmFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgZ2V0QWN0aW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdudWNsaWRlLWhhY2stc3ltYm9sLXByb3ZpZGVyOnRvZ2dsZS1wcm92aWRlcic7XG4gIH0sXG5cbiAgZ2V0UHJvbXB0VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnU2VhcmNoIEhhY2sgc3ltYm9scy4gQXZhaWxhYmxlIHByZWZpeGVzOiBAZnVuY3Rpb24gJWNvbnN0YW50ICNjbGFzcyc7XG4gIH0sXG5cbiAgZ2V0VGFiVGl0bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ0hhY2sgU3ltYm9scyc7XG4gIH0sXG5cbiAgYXN5bmMgaXNFbGlnaWJsZUZvckRpcmVjdG9yeShkaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3Qgc2VydmljZSA9IGF3YWl0IGdldEhhY2tTZXJ2aWNlKGRpcmVjdG9yeSk7XG4gICAgcmV0dXJuIHNlcnZpY2UgIT0gbnVsbDtcbiAgfSxcblxuICBhc3luYyBleGVjdXRlUXVlcnkoXG4gICAgcXVlcnk6IHN0cmluZyxcbiAgICBkaXJlY3Rvcnk/OiBhdG9tJERpcmVjdG9yeVxuICApOiBQcm9taXNlPEFycmF5PEhhY2tGaWxlUmVzdWx0Pj4ge1xuICAgIGlmIChxdWVyeS5sZW5ndGggPT09IDAgfHwgZGlyZWN0b3J5ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBzZXJ2aWNlID0gYXdhaXQgZ2V0SGFja1NlcnZpY2UoZGlyZWN0b3J5KTtcbiAgICBpZiAoc2VydmljZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3QgZGlyZWN0b3J5UGF0aCA9IGRpcmVjdG9yeS5nZXRQYXRoKCk7XG4gICAgY29uc3QgcmVzdWx0czogQXJyYXk8SGFja1NlYXJjaFBvc2l0aW9uPiA9IGF3YWl0IHNlcnZpY2UucXVlcnlIYWNrKGRpcmVjdG9yeVBhdGgsIHF1ZXJ5KTtcbiAgICByZXR1cm4gKChyZXN1bHRzOiBhbnkpOiBBcnJheTxIYWNrRmlsZVJlc3VsdD4pO1xuICB9LFxuXG4gIGdldENvbXBvbmVudEZvckl0ZW0oaXRlbTogSGFja0ZpbGVSZXN1bHQpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gaXRlbS5wYXRoO1xuICAgIGNvbnN0IGZpbGVuYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlUGF0aCk7XG4gICAgY29uc3QgbmFtZSA9IGl0ZW0ubmFtZSB8fCAnJztcblxuICAgIGNvbnN0IGljb24gPSBiZXN0SWNvbkZvckl0ZW0oaXRlbSk7XG4gICAgY29uc3Qgc3ltYm9sQ2xhc3NlcyA9IGBmaWxlIGljb24gJHtpY29ufWA7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgdGl0bGU9e2l0ZW0uYWRkaXRpb25hbEluZm8gfHwgJyd9PlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3N5bWJvbENsYXNzZXN9Pjxjb2RlPntuYW1lfTwvY29kZT48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm9tbmlzZWFyY2gtc3ltYm9sLXJlc3VsdC1maWxlbmFtZVwiPntmaWxlbmFtZX08L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9LFxufTtcbiJdfQ==