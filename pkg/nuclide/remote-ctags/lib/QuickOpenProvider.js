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

  getComponentForItem: function getComponentForItem(uncastedItem) {
    var item = uncastedItem;
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
//# sourceMappingURL=data:application/json;base64,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LE1BQU0seURBQWUsU0FBUyxDQUFDLENBQUM7O0FBRTdDLFFBQUk7QUFDRixVQUFNLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFO0FBQzVDLHVCQUFlLEVBQUUsSUFBSTtBQUNyQixvQkFBWSxFQUFFLElBQUk7QUFDbEIsYUFBSyxFQUFFLGFBQWE7T0FDckIsQ0FBQyxDQUFDOztBQUVILGFBQU8sTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FDN0IsTUFBTSxDQUFDLFVBQUEsR0FBRztlQUFJLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7T0FBQSxDQUFDLENBQ3pELEdBQUcsbUJBQUMsV0FBTSxHQUFHLEVBQUk7QUFDaEIsWUFBTSxJQUFJLEdBQUcsTUFBTSxnQ0FBb0IsR0FBRyxDQUFDLENBQUM7QUFDNUMsNEJBQ0ssR0FBRztBQUNOLGNBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtBQUNkLGFBQUcsRUFBSCxHQUFHO0FBQ0gsY0FBSSxFQUFKLElBQUk7V0FDSjtPQUNILEVBQUMsQ0FBQyxDQUFDO0tBQ1AsU0FBUztBQUNSLGFBQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNuQjtHQUNGLENBQUE7O0NBRUYsQUFBVyxDQUFDIiwiZmlsZSI6IlF1aWNrT3BlblByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBGaWxlUmVzdWx0LFxuICBQcm92aWRlcixcbiAgUHJvdmlkZXJUeXBlLFxufSBmcm9tICcuLi8uLi9xdWljay1vcGVuLWludGVyZmFjZXMnO1xuXG5pbXBvcnQgdHlwZSB7Q3RhZ3NSZXN1bHQsIEN0YWdzU2VydmljZX0gZnJvbSAnLi4vLi4vcmVtb3RlLWN0YWdzLWJhc2UnO1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge2dldEhhY2tTZXJ2aWNlfSBmcm9tICcuLi8uLi9oYWNrLXN5bWJvbC1wcm92aWRlci9saWIvZ2V0SGFja1NlcnZpY2UnO1xuaW1wb3J0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5pbXBvcnQge2pvaW4sIHJlbGF0aXZlfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB7Q1RBR1NfS0lORF9JQ09OUywgQ1RBR1NfS0lORF9OQU1FUywgZ2V0TGluZU51bWJlckZvclRhZ30gZnJvbSAnLi91dGlscyc7XG5cbi8vIGN0YWdzIGRvZXNuJ3QgaGF2ZSBhIHRydWUgbGltaXQgQVBJLCBzbyBoYXZpbmcgdG9vIG1hbnkgcmVzdWx0cyBzbG93cyBkb3duIE51Y2xpZGUuXG5jb25zdCBNSU5fUVVFUllfTEVOR1RIID0gMjtcbmNvbnN0IFJFU1VMVFNfTElNSVQgPSAxMDtcbmNvbnN0IERFRkFVTFRfSUNPTiA9ICdpY29uLXNxdWlycmVsJztcblxudHlwZSBSZXN1bHQgPSBGaWxlUmVzdWx0ICYgQ3RhZ3NSZXN1bHQgJiB7ZGlyOiBzdHJpbmd9O1xuXG5hc3luYyBmdW5jdGlvbiBnZXRDdGFnc1NlcnZpY2UoXG4gIGRpcmVjdG9yeTogYXRvbSREaXJlY3RvcnksXG4pOiBQcm9taXNlPD9DdGFnc1NlcnZpY2U+IHtcbiAgLy8gVGhlIHRhZ3MgcGFja2FnZSBsb29rcyBpbiB0aGUgZGlyZWN0b3J5LCBzbyBnaXZlIGl0IGEgc2FtcGxlIGZpbGUuXG4gIGNvbnN0IHBhdGggPSBqb2luKGRpcmVjdG9yeS5nZXRQYXRoKCksICdmaWxlJyk7XG4gIGNvbnN0IHNlcnZpY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdDdGFnc1NlcnZpY2UnLCBwYXRoKTtcbiAgaWYgKHNlcnZpY2UgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBhd2FpdCBzZXJ2aWNlLmdldEN0YWdzU2VydmljZShwYXRoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoe1xuXG4gIGdldFByb3ZpZGVyVHlwZSgpOiBQcm92aWRlclR5cGUge1xuICAgIHJldHVybiAnRElSRUNUT1JZJztcbiAgfSxcblxuICBnZXROYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdDdGFnc1N5bWJvbFByb3ZpZGVyJztcbiAgfSxcblxuICBpc1JlbmRlcmFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgZ2V0VGFiVGl0bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ0N0YWdzJztcbiAgfSxcblxuICBhc3luYyBpc0VsaWdpYmxlRm9yRGlyZWN0b3J5KGRpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBzdmMgPSBhd2FpdCBnZXRDdGFnc1NlcnZpY2UoZGlyZWN0b3J5KTtcbiAgICBpZiAoc3ZjICE9IG51bGwpIHtcbiAgICAgIHN2Yy5kaXNwb3NlKCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIGdldENvbXBvbmVudEZvckl0ZW0odW5jYXN0ZWRJdGVtOiBGaWxlUmVzdWx0KTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBpdGVtID0gKCh1bmNhc3RlZEl0ZW06IGFueSk6IFJlc3VsdCk7XG4gICAgY29uc3QgcGF0aCA9IHJlbGF0aXZlKGl0ZW0uZGlyLCBpdGVtLnBhdGgpO1xuICAgIGxldCBraW5kLCBpY29uO1xuICAgIGlmIChpdGVtLmtpbmQgIT0gbnVsbCkge1xuICAgICAga2luZCA9IENUQUdTX0tJTkRfTkFNRVNbaXRlbS5raW5kXTtcbiAgICAgIGljb24gPSBDVEFHU19LSU5EX0lDT05TW2l0ZW0ua2luZF07XG4gICAgfVxuICAgIGljb24gPSBpY29uIHx8IERFRkFVTFRfSUNPTjtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiB0aXRsZT17a2luZH0+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGZpbGUgaWNvbiAke2ljb259YH0+PGNvZGU+e2l0ZW0ubmFtZX08L2NvZGU+PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJvbW5pc2VhcmNoLXN5bWJvbC1yZXN1bHQtZmlsZW5hbWVcIj57cGF0aH08L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9LFxuXG4gIGFzeW5jIGV4ZWN1dGVRdWVyeShxdWVyeTogc3RyaW5nLCBkaXJlY3Rvcnk/OiBhdG9tJERpcmVjdG9yeSk6IFByb21pc2U8QXJyYXk8RmlsZVJlc3VsdD4+IHtcbiAgICBpZiAoZGlyZWN0b3J5ID09IG51bGwgfHwgcXVlcnkubGVuZ3RoIDwgTUlOX1FVRVJZX0xFTkdUSCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IGRpciA9IGRpcmVjdG9yeS5nZXRQYXRoKCk7XG4gICAgY29uc3Qgc2VydmljZSA9IGF3YWl0IGdldEN0YWdzU2VydmljZShkaXJlY3RvcnkpO1xuICAgIGlmIChzZXJ2aWNlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICAvLyBIQUNLOiBDdGFncyByZXN1bHRzIHR5cGljYWxseSBqdXN0IGR1cGxpY2F0ZSBIYWNrIHJlc3VsdHMgd2hlbiB0aGV5J3JlIHByZXNlbnQuXG4gICAgLy8gRmlsdGVyIG91dCByZXN1bHRzIGZyb20gUEhQIGZpbGVzIHdoZW4gdGhlIEhhY2sgc2VydmljZSBpcyBhdmFpbGFibGUuXG4gICAgLy8gVE9ETyhoYW5zb253KTogUmVtb3ZlIHRoaXMgd2hlbiBxdWljay1vcGVuIGhhcyBwcm9wZXIgcmFua2luZy9kZS1kdXBsaWNhdGlvbi5cbiAgICBjb25zdCBoYWNrID0gYXdhaXQgZ2V0SGFja1NlcnZpY2UoZGlyZWN0b3J5KTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgc2VydmljZS5maW5kVGFncyhxdWVyeSwge1xuICAgICAgICBjYXNlSW5zZW5zaXRpdmU6IHRydWUsXG4gICAgICAgIHBhcnRpYWxNYXRjaDogdHJ1ZSxcbiAgICAgICAgbGltaXQ6IFJFU1VMVFNfTElNSVQsXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKHJlc3VsdHNcbiAgICAgICAgLmZpbHRlcih0YWcgPT4gaGFjayA9PSBudWxsIHx8ICF0YWcuZmlsZS5lbmRzV2l0aCgnLnBocCcpKVxuICAgICAgICAubWFwKGFzeW5jIHRhZyA9PiB7XG4gICAgICAgICAgY29uc3QgbGluZSA9IGF3YWl0IGdldExpbmVOdW1iZXJGb3JUYWcodGFnKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4udGFnLFxuICAgICAgICAgICAgcGF0aDogdGFnLmZpbGUsXG4gICAgICAgICAgICBkaXIsXG4gICAgICAgICAgICBsaW5lLFxuICAgICAgICAgIH07XG4gICAgICAgIH0pKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2VydmljZS5kaXNwb3NlKCk7XG4gICAgfVxuICB9LFxuXG59OiBQcm92aWRlcik7XG4iXX0=