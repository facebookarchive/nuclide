var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var getCtagsService = _asyncToGenerator(function* (directory) {
  // The tags package looks in the directory, so give it a sample file.
  var path = (0, _remoteUri.join)(directory.getPath(), 'file');
  var service = (0, _remoteConnection.getServiceByNuclideUri)('CtagsService', path);
  if (service == null) {
    return null;
  }
  return yield service.getCtagsService(path);
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

var _hackSymbolProviderLibGetHackSearchService = require('../../hack-symbol-provider/lib/getHackSearchService');

var _remoteConnection = require('../../remote-connection');

var _remoteUri = require('../../remote-uri');

var _utils = require('./utils');

// ctags doesn't have a true limit API, so having too many results slows down Nuclide.
var MIN_QUERY_LENGTH = 2;
var RESULTS_LIMIT = 10;
var DEFAULT_ICON = 'icon-squirrel';

module.exports = {

  getProviderType: function getProviderType() {
    return 'DIRECTORY';
  },

  getName: function getName() {
    return 'CtagsSymbolProvider';
  },

  isRenderable: function isRenderable() {
    return true;
  },

  getTabTitle: function getTabTitle() {
    return 'Ctags';
  },

  isEligibleForDirectory: _asyncToGenerator(function* (directory) {
    // HACK: Ctags results typically just duplicate Hack results when they're present.
    // Disable this when a Hack service is present.
    // TODO(hansonw): Remove this when quick-open has proper ranking/de-duplication.
    var hack = yield (0, _hackSymbolProviderLibGetHackSearchService.getHackSearchService)(directory);
    if (hack != null) {
      return false;
    }
    var svc = yield getCtagsService(directory);
    return svc != null;
  }),

  getComponentForItem: function getComponentForItem(item) {
    var path = (0, _remoteUri.relative)(item.dir, item.path);
    var kind = undefined,
        icon = undefined;
    if (item.kind != null) {
      kind = _utils.CTAGS_KIND_NAMES[item.kind];
      icon = _utils.CTAGS_KIND_ICONS[item.kind];
    }
    icon = icon || DEFAULT_ICON;
    return _reactForAtom2['default'].createElement(
      'div',
      { title: kind },
      _reactForAtom2['default'].createElement(
        'span',
        { className: 'file icon ' + icon },
        _reactForAtom2['default'].createElement(
          'code',
          null,
          item.name
        )
      ),
      _reactForAtom2['default'].createElement(
        'span',
        { className: 'omnisearch-symbol-result-filename' },
        path
      )
    );
  },

  executeQuery: _asyncToGenerator(function* (query, directory) {
    if (directory == null || query.length < MIN_QUERY_LENGTH) {
      return [];
    }

    var dir = directory.getPath();
    var service = yield getCtagsService(directory);
    if (service == null) {
      return [];
    }

    try {
      var results = yield service.findTags(query, {
        caseInsensitive: true,
        partialMatch: true,
        limit: RESULTS_LIMIT
      });

      return yield Promise.all(results.map(_asyncToGenerator(function* (tag) {
        var line = yield (0, _utils.getLineNumberForTag)(tag);
        return _extends({}, tag, {
          path: tag.file,
          dir: dir,
          line: line
        });
      })));
    } finally {
      service.dispose();
    }
  })

};
//# sourceMappingURL=data:application/json;base64,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QU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFO0FBQzVDLHVCQUFlLEVBQUUsSUFBSTtBQUNyQixvQkFBWSxFQUFFLElBQUk7QUFDbEIsYUFBSyxFQUFFLGFBQWE7T0FDckIsQ0FBQyxDQUFDOztBQUVILGFBQU8sTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLG1CQUFDLFdBQU0sR0FBRyxFQUFJO0FBQ2hELFlBQU0sSUFBSSxHQUFHLE1BQU0sZ0NBQW9CLEdBQUcsQ0FBQyxDQUFDO0FBQzVDLDRCQUNLLEdBQUc7QUFDTixjQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7QUFDZCxhQUFHLEVBQUgsR0FBRztBQUNILGNBQUksRUFBSixJQUFJO1dBQ0o7T0FDSCxFQUFDLENBQUMsQ0FBQztLQUNMLFNBQVM7QUFDUixhQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDbkI7R0FDRixDQUFBOztDQUVGLEFBQW1CLENBQUMiLCJmaWxlIjoiUXVpY2tPcGVuUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVSZXN1bHQsXG4gIFByb3ZpZGVyLFxuICBQcm92aWRlclR5cGUsXG59IGZyb20gJy4uLy4uL3F1aWNrLW9wZW4taW50ZXJmYWNlcyc7XG5cbmltcG9ydCB0eXBlIHtDdGFnc1Jlc3VsdCwgQ3RhZ3NTZXJ2aWNlfSBmcm9tICcuLi8uLi9yZW1vdGUtY3RhZ3MtYmFzZSc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge2dldEhhY2tTZWFyY2hTZXJ2aWNlfSBmcm9tICcuLi8uLi9oYWNrLXN5bWJvbC1wcm92aWRlci9saWIvZ2V0SGFja1NlYXJjaFNlcnZpY2UnO1xuaW1wb3J0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5pbXBvcnQge2pvaW4sIHJlbGF0aXZlfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB7Q1RBR1NfS0lORF9JQ09OUywgQ1RBR1NfS0lORF9OQU1FUywgZ2V0TGluZU51bWJlckZvclRhZ30gZnJvbSAnLi91dGlscyc7XG5cbi8vIGN0YWdzIGRvZXNuJ3QgaGF2ZSBhIHRydWUgbGltaXQgQVBJLCBzbyBoYXZpbmcgdG9vIG1hbnkgcmVzdWx0cyBzbG93cyBkb3duIE51Y2xpZGUuXG5jb25zdCBNSU5fUVVFUllfTEVOR1RIID0gMjtcbmNvbnN0IFJFU1VMVFNfTElNSVQgPSAxMDtcbmNvbnN0IERFRkFVTFRfSUNPTiA9ICdpY29uLXNxdWlycmVsJztcblxudHlwZSBSZXN1bHQgPSBGaWxlUmVzdWx0ICYgQ3RhZ3NSZXN1bHQgJiB7ZGlyOiBzdHJpbmd9O1xuXG5hc3luYyBmdW5jdGlvbiBnZXRDdGFnc1NlcnZpY2UoXG4gIGRpcmVjdG9yeTogYXRvbSREaXJlY3RvcnksXG4pOiBQcm9taXNlPD9DdGFnc1NlcnZpY2U+IHtcbiAgLy8gVGhlIHRhZ3MgcGFja2FnZSBsb29rcyBpbiB0aGUgZGlyZWN0b3J5LCBzbyBnaXZlIGl0IGEgc2FtcGxlIGZpbGUuXG4gIGNvbnN0IHBhdGggPSBqb2luKGRpcmVjdG9yeS5nZXRQYXRoKCksICdmaWxlJyk7XG4gIGNvbnN0IHNlcnZpY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdDdGFnc1NlcnZpY2UnLCBwYXRoKTtcbiAgaWYgKHNlcnZpY2UgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBhd2FpdCBzZXJ2aWNlLmdldEN0YWdzU2VydmljZShwYXRoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoe1xuXG4gIGdldFByb3ZpZGVyVHlwZSgpOiBQcm92aWRlclR5cGUge1xuICAgIHJldHVybiAnRElSRUNUT1JZJztcbiAgfSxcblxuICBnZXROYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdDdGFnc1N5bWJvbFByb3ZpZGVyJztcbiAgfSxcblxuICBpc1JlbmRlcmFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgZ2V0VGFiVGl0bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ0N0YWdzJztcbiAgfSxcblxuICBhc3luYyBpc0VsaWdpYmxlRm9yRGlyZWN0b3J5KGRpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAvLyBIQUNLOiBDdGFncyByZXN1bHRzIHR5cGljYWxseSBqdXN0IGR1cGxpY2F0ZSBIYWNrIHJlc3VsdHMgd2hlbiB0aGV5J3JlIHByZXNlbnQuXG4gICAgLy8gRGlzYWJsZSB0aGlzIHdoZW4gYSBIYWNrIHNlcnZpY2UgaXMgcHJlc2VudC5cbiAgICAvLyBUT0RPKGhhbnNvbncpOiBSZW1vdmUgdGhpcyB3aGVuIHF1aWNrLW9wZW4gaGFzIHByb3BlciByYW5raW5nL2RlLWR1cGxpY2F0aW9uLlxuICAgIGNvbnN0IGhhY2sgPSBhd2FpdCBnZXRIYWNrU2VhcmNoU2VydmljZShkaXJlY3RvcnkpO1xuICAgIGlmIChoYWNrICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3Qgc3ZjID0gYXdhaXQgZ2V0Q3RhZ3NTZXJ2aWNlKGRpcmVjdG9yeSk7XG4gICAgcmV0dXJuIHN2YyAhPSBudWxsO1xuICB9LFxuXG4gIGdldENvbXBvbmVudEZvckl0ZW0oaXRlbTogUmVzdWx0KTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBwYXRoID0gcmVsYXRpdmUoaXRlbS5kaXIsIGl0ZW0ucGF0aCk7XG4gICAgbGV0IGtpbmQsIGljb247XG4gICAgaWYgKGl0ZW0ua2luZCAhPSBudWxsKSB7XG4gICAgICBraW5kID0gQ1RBR1NfS0lORF9OQU1FU1tpdGVtLmtpbmRdO1xuICAgICAgaWNvbiA9IENUQUdTX0tJTkRfSUNPTlNbaXRlbS5raW5kXTtcbiAgICB9XG4gICAgaWNvbiA9IGljb24gfHwgREVGQVVMVF9JQ09OO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IHRpdGxlPXtraW5kfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZmlsZSBpY29uICR7aWNvbn1gfT48Y29kZT57aXRlbS5uYW1lfTwvY29kZT48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm9tbmlzZWFyY2gtc3ltYm9sLXJlc3VsdC1maWxlbmFtZVwiPntwYXRofTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG5cbiAgYXN5bmMgZXhlY3V0ZVF1ZXJ5KHF1ZXJ5OiBzdHJpbmcsIGRpcmVjdG9yeT86IGF0b20kRGlyZWN0b3J5KTogUHJvbWlzZTxBcnJheTxSZXN1bHQ+PiB7XG4gICAgaWYgKGRpcmVjdG9yeSA9PSBudWxsIHx8IHF1ZXJ5Lmxlbmd0aCA8IE1JTl9RVUVSWV9MRU5HVEgpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBkaXIgPSBkaXJlY3RvcnkuZ2V0UGF0aCgpO1xuICAgIGNvbnN0IHNlcnZpY2UgPSBhd2FpdCBnZXRDdGFnc1NlcnZpY2UoZGlyZWN0b3J5KTtcbiAgICBpZiAoc2VydmljZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBzZXJ2aWNlLmZpbmRUYWdzKHF1ZXJ5LCB7XG4gICAgICAgIGNhc2VJbnNlbnNpdGl2ZTogdHJ1ZSxcbiAgICAgICAgcGFydGlhbE1hdGNoOiB0cnVlLFxuICAgICAgICBsaW1pdDogUkVTVUxUU19MSU1JVCxcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwocmVzdWx0cy5tYXAoYXN5bmMgdGFnID0+IHtcbiAgICAgICAgY29uc3QgbGluZSA9IGF3YWl0IGdldExpbmVOdW1iZXJGb3JUYWcodGFnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi50YWcsXG4gICAgICAgICAgcGF0aDogdGFnLmZpbGUsXG4gICAgICAgICAgZGlyLFxuICAgICAgICAgIGxpbmUsXG4gICAgICAgIH07XG4gICAgICB9KSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNlcnZpY2UuZGlzcG9zZSgpO1xuICAgIH1cbiAgfSxcblxufTogUHJvdmlkZXI8UmVzdWx0Pik7XG4iXX0=