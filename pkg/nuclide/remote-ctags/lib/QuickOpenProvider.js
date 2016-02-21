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

var _featureConfig = require('../../feature-config');

var _featureConfig2 = _interopRequireDefault(_featureConfig);

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
    var hack = undefined;
    if (_featureConfig2['default'].get('nuclide-remote-ctags.disableWithHack') !== false) {
      hack = yield (0, _hackSymbolProviderLibGetHackService.getHackService)(directory);
    }

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
//# sourceMappingURL=data:application/json;base64,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QUFLRCxRQUFJLElBQUksWUFBQSxDQUFDO0FBQ1QsUUFBSSwyQkFBYyxHQUFHLENBQUMsc0NBQXNDLENBQUMsS0FBSyxLQUFLLEVBQUU7QUFDdkUsVUFBSSxHQUFHLE1BQU0seURBQWUsU0FBUyxDQUFDLENBQUM7S0FDeEM7O0FBRUQsUUFBSTtBQUNGLFVBQU0sT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUU7QUFDNUMsdUJBQWUsRUFBRSxJQUFJO0FBQ3JCLG9CQUFZLEVBQUUsSUFBSTtBQUNsQixhQUFLLEVBQUUsYUFBYTtPQUNyQixDQUFDLENBQUM7O0FBRUgsYUFBTyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUM3QixNQUFNLENBQUMsVUFBQSxHQUFHO2VBQUksSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztPQUFBLENBQUMsQ0FDekQsR0FBRyxtQkFBQyxXQUFNLEdBQUcsRUFBSTtBQUNoQixZQUFNLElBQUksR0FBRyxNQUFNLGdDQUFvQixHQUFHLENBQUMsQ0FBQztBQUM1Qyw0QkFDSyxHQUFHO0FBQ04sY0FBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO0FBQ2QsYUFBRyxFQUFILEdBQUc7QUFDSCxjQUFJLEVBQUosSUFBSTtXQUNKO09BQ0gsRUFBQyxDQUFDLENBQUM7S0FDUCxTQUFTO0FBQ1IsYUFBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ25CO0dBQ0YsQ0FBQTs7Q0FFRixBQUFXLENBQUMiLCJmaWxlIjoiUXVpY2tPcGVuUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVSZXN1bHQsXG4gIFByb3ZpZGVyLFxuICBQcm92aWRlclR5cGUsXG59IGZyb20gJy4uLy4uL3F1aWNrLW9wZW4taW50ZXJmYWNlcyc7XG5cbmltcG9ydCB0eXBlIHtDdGFnc1Jlc3VsdCwgQ3RhZ3NTZXJ2aWNlfSBmcm9tICcuLi8uLi9yZW1vdGUtY3RhZ3MtYmFzZSc7XG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL2ZlYXR1cmUtY29uZmlnJztcbmltcG9ydCB7Z2V0SGFja1NlcnZpY2V9IGZyb20gJy4uLy4uL2hhY2stc3ltYm9sLXByb3ZpZGVyL2xpYi9nZXRIYWNrU2VydmljZSc7XG5pbXBvcnQge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uJztcbmltcG9ydCB7am9pbiwgcmVsYXRpdmV9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHtDVEFHU19LSU5EX0lDT05TLCBDVEFHU19LSU5EX05BTUVTLCBnZXRMaW5lTnVtYmVyRm9yVGFnfSBmcm9tICcuL3V0aWxzJztcblxuLy8gY3RhZ3MgZG9lc24ndCBoYXZlIGEgdHJ1ZSBsaW1pdCBBUEksIHNvIGhhdmluZyB0b28gbWFueSByZXN1bHRzIHNsb3dzIGRvd24gTnVjbGlkZS5cbmNvbnN0IE1JTl9RVUVSWV9MRU5HVEggPSAyO1xuY29uc3QgUkVTVUxUU19MSU1JVCA9IDEwO1xuY29uc3QgREVGQVVMVF9JQ09OID0gJ2ljb24tc3F1aXJyZWwnO1xuXG50eXBlIFJlc3VsdCA9IEZpbGVSZXN1bHQgJiBDdGFnc1Jlc3VsdCAmIHtkaXI6IHN0cmluZ307XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEN0YWdzU2VydmljZShcbiAgZGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeSxcbik6IFByb21pc2U8P0N0YWdzU2VydmljZT4ge1xuICAvLyBUaGUgdGFncyBwYWNrYWdlIGxvb2tzIGluIHRoZSBkaXJlY3RvcnksIHNvIGdpdmUgaXQgYSBzYW1wbGUgZmlsZS5cbiAgY29uc3QgcGF0aCA9IGpvaW4oZGlyZWN0b3J5LmdldFBhdGgoKSwgJ2ZpbGUnKTtcbiAgY29uc3Qgc2VydmljZSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0N0YWdzU2VydmljZScsIHBhdGgpO1xuICBpZiAoc2VydmljZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIGF3YWl0IHNlcnZpY2UuZ2V0Q3RhZ3NTZXJ2aWNlKHBhdGgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh7XG5cbiAgZ2V0UHJvdmlkZXJUeXBlKCk6IFByb3ZpZGVyVHlwZSB7XG4gICAgcmV0dXJuICdESVJFQ1RPUlknO1xuICB9LFxuXG4gIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ0N0YWdzU3ltYm9sUHJvdmlkZXInO1xuICB9LFxuXG4gIGlzUmVuZGVyYWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICBnZXRUYWJUaXRsZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnQ3RhZ3MnO1xuICB9LFxuXG4gIGFzeW5jIGlzRWxpZ2libGVGb3JEaXJlY3RvcnkoZGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHN2YyA9IGF3YWl0IGdldEN0YWdzU2VydmljZShkaXJlY3RvcnkpO1xuICAgIGlmIChzdmMgIT0gbnVsbCkge1xuICAgICAgc3ZjLmRpc3Bvc2UoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgZ2V0Q29tcG9uZW50Rm9ySXRlbSh1bmNhc3RlZEl0ZW06IEZpbGVSZXN1bHQpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGl0ZW0gPSAoKHVuY2FzdGVkSXRlbTogYW55KTogUmVzdWx0KTtcbiAgICBjb25zdCBwYXRoID0gcmVsYXRpdmUoaXRlbS5kaXIsIGl0ZW0ucGF0aCk7XG4gICAgbGV0IGtpbmQsIGljb247XG4gICAgaWYgKGl0ZW0ua2luZCAhPSBudWxsKSB7XG4gICAgICBraW5kID0gQ1RBR1NfS0lORF9OQU1FU1tpdGVtLmtpbmRdO1xuICAgICAgaWNvbiA9IENUQUdTX0tJTkRfSUNPTlNbaXRlbS5raW5kXTtcbiAgICB9XG4gICAgaWNvbiA9IGljb24gfHwgREVGQVVMVF9JQ09OO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IHRpdGxlPXtraW5kfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZmlsZSBpY29uICR7aWNvbn1gfT48Y29kZT57aXRlbS5uYW1lfTwvY29kZT48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm9tbmlzZWFyY2gtc3ltYm9sLXJlc3VsdC1maWxlbmFtZVwiPntwYXRofTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG5cbiAgYXN5bmMgZXhlY3V0ZVF1ZXJ5KHF1ZXJ5OiBzdHJpbmcsIGRpcmVjdG9yeT86IGF0b20kRGlyZWN0b3J5KTogUHJvbWlzZTxBcnJheTxGaWxlUmVzdWx0Pj4ge1xuICAgIGlmIChkaXJlY3RvcnkgPT0gbnVsbCB8fCBxdWVyeS5sZW5ndGggPCBNSU5fUVVFUllfTEVOR1RIKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3QgZGlyID0gZGlyZWN0b3J5LmdldFBhdGgoKTtcbiAgICBjb25zdCBzZXJ2aWNlID0gYXdhaXQgZ2V0Q3RhZ3NTZXJ2aWNlKGRpcmVjdG9yeSk7XG4gICAgaWYgKHNlcnZpY2UgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8vIEhBQ0s6IEN0YWdzIHJlc3VsdHMgdHlwaWNhbGx5IGp1c3QgZHVwbGljYXRlIEhhY2sgcmVzdWx0cyB3aGVuIHRoZXkncmUgcHJlc2VudC5cbiAgICAvLyBGaWx0ZXIgb3V0IHJlc3VsdHMgZnJvbSBQSFAgZmlsZXMgd2hlbiB0aGUgSGFjayBzZXJ2aWNlIGlzIGF2YWlsYWJsZS5cbiAgICAvLyBUT0RPKGhhbnNvbncpOiBSZW1vdmUgdGhpcyB3aGVuIHF1aWNrLW9wZW4gaGFzIHByb3BlciByYW5raW5nL2RlLWR1cGxpY2F0aW9uLlxuICAgIGxldCBoYWNrO1xuICAgIGlmIChmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1yZW1vdGUtY3RhZ3MuZGlzYWJsZVdpdGhIYWNrJykgIT09IGZhbHNlKSB7XG4gICAgICBoYWNrID0gYXdhaXQgZ2V0SGFja1NlcnZpY2UoZGlyZWN0b3J5KTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHNlcnZpY2UuZmluZFRhZ3MocXVlcnksIHtcbiAgICAgICAgY2FzZUluc2Vuc2l0aXZlOiB0cnVlLFxuICAgICAgICBwYXJ0aWFsTWF0Y2g6IHRydWUsXG4gICAgICAgIGxpbWl0OiBSRVNVTFRTX0xJTUlULFxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChyZXN1bHRzXG4gICAgICAgIC5maWx0ZXIodGFnID0+IGhhY2sgPT0gbnVsbCB8fCAhdGFnLmZpbGUuZW5kc1dpdGgoJy5waHAnKSlcbiAgICAgICAgLm1hcChhc3luYyB0YWcgPT4ge1xuICAgICAgICAgIGNvbnN0IGxpbmUgPSBhd2FpdCBnZXRMaW5lTnVtYmVyRm9yVGFnKHRhZyk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLnRhZyxcbiAgICAgICAgICAgIHBhdGg6IHRhZy5maWxlLFxuICAgICAgICAgICAgZGlyLFxuICAgICAgICAgICAgbGluZSxcbiAgICAgICAgICB9O1xuICAgICAgICB9KSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNlcnZpY2UuZGlzcG9zZSgpO1xuICAgIH1cbiAgfSxcblxufTogUHJvdmlkZXIpO1xuIl19