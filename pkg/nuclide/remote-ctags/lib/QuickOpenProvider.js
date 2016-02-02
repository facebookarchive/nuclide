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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

var _hackSymbolProviderLibGetHackService = require('../../hack-symbol-provider/lib/getHackService');

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
    var svc = yield getCtagsService(directory);
    if (svc != null) {
      svc.dispose();
      return true;
    }
    return false;
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
    return _reactForAtom.React.createElement(
      'div',
      { title: kind },
      _reactForAtom.React.createElement(
        'span',
        { className: 'file icon ' + icon },
        _reactForAtom.React.createElement(
          'code',
          null,
          item.name
        )
      ),
      _reactForAtom.React.createElement(
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

    // HACK: Ctags results typically just duplicate Hack results when they're present.
    // Filter out results from PHP files when the Hack service is available.
    // TODO(hansonw): Remove this when quick-open has proper ranking/de-duplication.
    var hack = yield (0, _hackSymbolProviderLibGetHackService.getHackService)(directory);

    try {
      var results = yield service.findTags(query, {
        caseInsensitive: true,
        partialMatch: true,
        limit: RESULTS_LIMIT
      });

      return yield Promise.all(results.filter(function (tag) {
        return hack == null || !tag.file.endsWith('.php');
      }).map(_asyncToGenerator(function* (tag) {
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
//# sourceMappingURL=data:application/json;base64,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STtBQUNGLFVBQU0sT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUU7QUFDNUMsdUJBQWUsRUFBRSxJQUFJO0FBQ3JCLG9CQUFZLEVBQUUsSUFBSTtBQUNsQixhQUFLLEVBQUUsYUFBYTtPQUNyQixDQUFDLENBQUM7O0FBRUgsYUFBTyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUM3QixNQUFNLENBQUMsVUFBQSxHQUFHO2VBQUksSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztPQUFBLENBQUMsQ0FDekQsR0FBRyxtQkFBQyxXQUFNLEdBQUcsRUFBSTtBQUNoQixZQUFNLElBQUksR0FBRyxNQUFNLGdDQUFvQixHQUFHLENBQUMsQ0FBQztBQUM1Qyw0QkFDSyxHQUFHO0FBQ04sY0FBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO0FBQ2QsYUFBRyxFQUFILEdBQUc7QUFDSCxjQUFJLEVBQUosSUFBSTtXQUNKO09BQ0gsRUFBQyxDQUFDLENBQUM7S0FDUCxTQUFTO0FBQ1IsYUFBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ25CO0dBQ0YsQ0FBQTs7Q0FFRixBQUFtQixDQUFDIiwiZmlsZSI6IlF1aWNrT3BlblByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBGaWxlUmVzdWx0LFxuICBQcm92aWRlcixcbiAgUHJvdmlkZXJUeXBlLFxufSBmcm9tICcuLi8uLi9xdWljay1vcGVuLWludGVyZmFjZXMnO1xuXG5pbXBvcnQgdHlwZSB7Q3RhZ3NSZXN1bHQsIEN0YWdzU2VydmljZX0gZnJvbSAnLi4vLi4vcmVtb3RlLWN0YWdzLWJhc2UnO1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge2dldEhhY2tTZXJ2aWNlfSBmcm9tICcuLi8uLi9oYWNrLXN5bWJvbC1wcm92aWRlci9saWIvZ2V0SGFja1NlcnZpY2UnO1xuaW1wb3J0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5pbXBvcnQge2pvaW4sIHJlbGF0aXZlfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB7Q1RBR1NfS0lORF9JQ09OUywgQ1RBR1NfS0lORF9OQU1FUywgZ2V0TGluZU51bWJlckZvclRhZ30gZnJvbSAnLi91dGlscyc7XG5cbi8vIGN0YWdzIGRvZXNuJ3QgaGF2ZSBhIHRydWUgbGltaXQgQVBJLCBzbyBoYXZpbmcgdG9vIG1hbnkgcmVzdWx0cyBzbG93cyBkb3duIE51Y2xpZGUuXG5jb25zdCBNSU5fUVVFUllfTEVOR1RIID0gMjtcbmNvbnN0IFJFU1VMVFNfTElNSVQgPSAxMDtcbmNvbnN0IERFRkFVTFRfSUNPTiA9ICdpY29uLXNxdWlycmVsJztcblxudHlwZSBSZXN1bHQgPSBGaWxlUmVzdWx0ICYgQ3RhZ3NSZXN1bHQgJiB7ZGlyOiBzdHJpbmd9O1xuXG5hc3luYyBmdW5jdGlvbiBnZXRDdGFnc1NlcnZpY2UoXG4gIGRpcmVjdG9yeTogYXRvbSREaXJlY3RvcnksXG4pOiBQcm9taXNlPD9DdGFnc1NlcnZpY2U+IHtcbiAgLy8gVGhlIHRhZ3MgcGFja2FnZSBsb29rcyBpbiB0aGUgZGlyZWN0b3J5LCBzbyBnaXZlIGl0IGEgc2FtcGxlIGZpbGUuXG4gIGNvbnN0IHBhdGggPSBqb2luKGRpcmVjdG9yeS5nZXRQYXRoKCksICdmaWxlJyk7XG4gIGNvbnN0IHNlcnZpY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdDdGFnc1NlcnZpY2UnLCBwYXRoKTtcbiAgaWYgKHNlcnZpY2UgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBhd2FpdCBzZXJ2aWNlLmdldEN0YWdzU2VydmljZShwYXRoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoe1xuXG4gIGdldFByb3ZpZGVyVHlwZSgpOiBQcm92aWRlclR5cGUge1xuICAgIHJldHVybiAnRElSRUNUT1JZJztcbiAgfSxcblxuICBnZXROYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdDdGFnc1N5bWJvbFByb3ZpZGVyJztcbiAgfSxcblxuICBpc1JlbmRlcmFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgZ2V0VGFiVGl0bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ0N0YWdzJztcbiAgfSxcblxuICBhc3luYyBpc0VsaWdpYmxlRm9yRGlyZWN0b3J5KGRpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBzdmMgPSBhd2FpdCBnZXRDdGFnc1NlcnZpY2UoZGlyZWN0b3J5KTtcbiAgICBpZiAoc3ZjICE9IG51bGwpIHtcbiAgICAgIHN2Yy5kaXNwb3NlKCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIGdldENvbXBvbmVudEZvckl0ZW0oaXRlbTogUmVzdWx0KTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBwYXRoID0gcmVsYXRpdmUoaXRlbS5kaXIsIGl0ZW0ucGF0aCk7XG4gICAgbGV0IGtpbmQsIGljb247XG4gICAgaWYgKGl0ZW0ua2luZCAhPSBudWxsKSB7XG4gICAgICBraW5kID0gQ1RBR1NfS0lORF9OQU1FU1tpdGVtLmtpbmRdO1xuICAgICAgaWNvbiA9IENUQUdTX0tJTkRfSUNPTlNbaXRlbS5raW5kXTtcbiAgICB9XG4gICAgaWNvbiA9IGljb24gfHwgREVGQVVMVF9JQ09OO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IHRpdGxlPXtraW5kfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZmlsZSBpY29uICR7aWNvbn1gfT48Y29kZT57aXRlbS5uYW1lfTwvY29kZT48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm9tbmlzZWFyY2gtc3ltYm9sLXJlc3VsdC1maWxlbmFtZVwiPntwYXRofTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG5cbiAgYXN5bmMgZXhlY3V0ZVF1ZXJ5KHF1ZXJ5OiBzdHJpbmcsIGRpcmVjdG9yeT86IGF0b20kRGlyZWN0b3J5KTogUHJvbWlzZTxBcnJheTxSZXN1bHQ+PiB7XG4gICAgaWYgKGRpcmVjdG9yeSA9PSBudWxsIHx8IHF1ZXJ5Lmxlbmd0aCA8IE1JTl9RVUVSWV9MRU5HVEgpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBkaXIgPSBkaXJlY3RvcnkuZ2V0UGF0aCgpO1xuICAgIGNvbnN0IHNlcnZpY2UgPSBhd2FpdCBnZXRDdGFnc1NlcnZpY2UoZGlyZWN0b3J5KTtcbiAgICBpZiAoc2VydmljZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLy8gSEFDSzogQ3RhZ3MgcmVzdWx0cyB0eXBpY2FsbHkganVzdCBkdXBsaWNhdGUgSGFjayByZXN1bHRzIHdoZW4gdGhleSdyZSBwcmVzZW50LlxuICAgIC8vIEZpbHRlciBvdXQgcmVzdWx0cyBmcm9tIFBIUCBmaWxlcyB3aGVuIHRoZSBIYWNrIHNlcnZpY2UgaXMgYXZhaWxhYmxlLlxuICAgIC8vIFRPRE8oaGFuc29udyk6IFJlbW92ZSB0aGlzIHdoZW4gcXVpY2stb3BlbiBoYXMgcHJvcGVyIHJhbmtpbmcvZGUtZHVwbGljYXRpb24uXG4gICAgY29uc3QgaGFjayA9IGF3YWl0IGdldEhhY2tTZXJ2aWNlKGRpcmVjdG9yeSk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHNlcnZpY2UuZmluZFRhZ3MocXVlcnksIHtcbiAgICAgICAgY2FzZUluc2Vuc2l0aXZlOiB0cnVlLFxuICAgICAgICBwYXJ0aWFsTWF0Y2g6IHRydWUsXG4gICAgICAgIGxpbWl0OiBSRVNVTFRTX0xJTUlULFxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChyZXN1bHRzXG4gICAgICAgIC5maWx0ZXIodGFnID0+IGhhY2sgPT0gbnVsbCB8fCAhdGFnLmZpbGUuZW5kc1dpdGgoJy5waHAnKSlcbiAgICAgICAgLm1hcChhc3luYyB0YWcgPT4ge1xuICAgICAgICAgIGNvbnN0IGxpbmUgPSBhd2FpdCBnZXRMaW5lTnVtYmVyRm9yVGFnKHRhZyk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLnRhZyxcbiAgICAgICAgICAgIHBhdGg6IHRhZy5maWxlLFxuICAgICAgICAgICAgZGlyLFxuICAgICAgICAgICAgbGluZSxcbiAgICAgICAgICB9O1xuICAgICAgICB9KSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNlcnZpY2UuZGlzcG9zZSgpO1xuICAgIH1cbiAgfSxcblxufTogUHJvdmlkZXI8UmVzdWx0Pik7XG4iXX0=