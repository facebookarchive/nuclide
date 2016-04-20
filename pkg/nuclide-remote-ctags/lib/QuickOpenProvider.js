var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var getCtagsService = _asyncToGenerator(function* (directory) {
  // The tags package looks in the directory, so give it a sample file.
  var path = (0, _nuclideRemoteUri.join)(directory.getPath(), 'file');
  var service = (0, _nuclideRemoteConnection.getServiceByNuclideUri)('CtagsService', path);
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

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _nuclideHackSymbolProviderLibGetHackService = require('../../nuclide-hack-symbol-provider/lib/getHackService');

var _nuclideRemoteConnection = require('../../nuclide-remote-connection');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

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
    var path = (0, _nuclideRemoteUri.relative)(item.dir, item.path);
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
    if (_nuclideFeatureConfig2['default'].get('nuclide-remote-ctags.disableWithHack') !== false) {
      hack = yield (0, _nuclideHackSymbolProviderLibGetHackService.getHackService)(directory);
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
//# sourceMappingURL=data:application/json;base64,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QUtELFFBQUksSUFBSSxZQUFBLENBQUM7QUFDVCxRQUFJLGtDQUFjLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxLQUFLLEtBQUssRUFBRTtBQUN2RSxVQUFJLEdBQUcsTUFBTSxnRUFBZSxTQUFTLENBQUMsQ0FBQztLQUN4Qzs7QUFFRCxRQUFJO0FBQ0YsVUFBTSxPQUFPLEdBQUcsTUFBTSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRTtBQUM1Qyx1QkFBZSxFQUFFLElBQUk7QUFDckIsb0JBQVksRUFBRSxJQUFJO0FBQ2xCLGFBQUssRUFBRSxhQUFhO09BQ3JCLENBQUMsQ0FBQzs7QUFFSCxhQUFPLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQzdCLE1BQU0sQ0FBQyxVQUFBLEdBQUc7ZUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO09BQUEsQ0FBQyxDQUN6RCxHQUFHLG1CQUFDLFdBQU0sR0FBRyxFQUFJO0FBQ2hCLFlBQU0sSUFBSSxHQUFHLE1BQU0sZ0NBQW9CLEdBQUcsQ0FBQyxDQUFDO0FBQzVDLDRCQUNLLEdBQUc7QUFDTixjQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7QUFDZCxhQUFHLEVBQUgsR0FBRztBQUNILGNBQUksRUFBSixJQUFJO1dBQ0o7T0FDSCxFQUFDLENBQUMsQ0FBQztLQUNQLFNBQVM7QUFDUixhQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDbkI7R0FDRixDQUFBOztDQUVGLEFBQVcsQ0FBQyIsImZpbGUiOiJRdWlja09wZW5Qcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRmlsZVJlc3VsdCxcbiAgUHJvdmlkZXIsXG4gIFByb3ZpZGVyVHlwZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1xdWljay1vcGVuLWludGVyZmFjZXMnO1xuXG5pbXBvcnQgdHlwZSB7Q3RhZ3NSZXN1bHQsIEN0YWdzU2VydmljZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY3RhZ3MtYmFzZSc7XG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL251Y2xpZGUtZmVhdHVyZS1jb25maWcnO1xuaW1wb3J0IHtnZXRIYWNrU2VydmljZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oYWNrLXN5bWJvbC1wcm92aWRlci9saWIvZ2V0SGFja1NlcnZpY2UnO1xuaW1wb3J0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJztcbmltcG9ydCB7am9pbiwgcmVsYXRpdmV9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQge0NUQUdTX0tJTkRfSUNPTlMsIENUQUdTX0tJTkRfTkFNRVMsIGdldExpbmVOdW1iZXJGb3JUYWd9IGZyb20gJy4vdXRpbHMnO1xuXG4vLyBjdGFncyBkb2Vzbid0IGhhdmUgYSB0cnVlIGxpbWl0IEFQSSwgc28gaGF2aW5nIHRvbyBtYW55IHJlc3VsdHMgc2xvd3MgZG93biBOdWNsaWRlLlxuY29uc3QgTUlOX1FVRVJZX0xFTkdUSCA9IDI7XG5jb25zdCBSRVNVTFRTX0xJTUlUID0gMTA7XG5jb25zdCBERUZBVUxUX0lDT04gPSAnaWNvbi1zcXVpcnJlbCc7XG5cbnR5cGUgUmVzdWx0ID0gRmlsZVJlc3VsdCAmIEN0YWdzUmVzdWx0ICYge2Rpcjogc3RyaW5nfTtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0Q3RhZ3NTZXJ2aWNlKFxuICBkaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5LFxuKTogUHJvbWlzZTw/Q3RhZ3NTZXJ2aWNlPiB7XG4gIC8vIFRoZSB0YWdzIHBhY2thZ2UgbG9va3MgaW4gdGhlIGRpcmVjdG9yeSwgc28gZ2l2ZSBpdCBhIHNhbXBsZSBmaWxlLlxuICBjb25zdCBwYXRoID0gam9pbihkaXJlY3RvcnkuZ2V0UGF0aCgpLCAnZmlsZScpO1xuICBjb25zdCBzZXJ2aWNlID0gZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnQ3RhZ3NTZXJ2aWNlJywgcGF0aCk7XG4gIGlmIChzZXJ2aWNlID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gYXdhaXQgc2VydmljZS5nZXRDdGFnc1NlcnZpY2UocGF0aCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHtcblxuICBnZXRQcm92aWRlclR5cGUoKTogUHJvdmlkZXJUeXBlIHtcbiAgICByZXR1cm4gJ0RJUkVDVE9SWSc7XG4gIH0sXG5cbiAgZ2V0TmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnQ3RhZ3NTeW1ib2xQcm92aWRlcic7XG4gIH0sXG5cbiAgaXNSZW5kZXJhYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIGdldFRhYlRpdGxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdDdGFncyc7XG4gIH0sXG5cbiAgYXN5bmMgaXNFbGlnaWJsZUZvckRpcmVjdG9yeShkaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3Qgc3ZjID0gYXdhaXQgZ2V0Q3RhZ3NTZXJ2aWNlKGRpcmVjdG9yeSk7XG4gICAgaWYgKHN2YyAhPSBudWxsKSB7XG4gICAgICBzdmMuZGlzcG9zZSgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICBnZXRDb21wb25lbnRGb3JJdGVtKHVuY2FzdGVkSXRlbTogRmlsZVJlc3VsdCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIGNvbnN0IGl0ZW0gPSAoKHVuY2FzdGVkSXRlbTogYW55KTogUmVzdWx0KTtcbiAgICBjb25zdCBwYXRoID0gcmVsYXRpdmUoaXRlbS5kaXIsIGl0ZW0ucGF0aCk7XG4gICAgbGV0IGtpbmQsIGljb247XG4gICAgaWYgKGl0ZW0ua2luZCAhPSBudWxsKSB7XG4gICAgICBraW5kID0gQ1RBR1NfS0lORF9OQU1FU1tpdGVtLmtpbmRdO1xuICAgICAgaWNvbiA9IENUQUdTX0tJTkRfSUNPTlNbaXRlbS5raW5kXTtcbiAgICB9XG4gICAgaWNvbiA9IGljb24gfHwgREVGQVVMVF9JQ09OO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IHRpdGxlPXtraW5kfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZmlsZSBpY29uICR7aWNvbn1gfT48Y29kZT57aXRlbS5uYW1lfTwvY29kZT48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm9tbmlzZWFyY2gtc3ltYm9sLXJlc3VsdC1maWxlbmFtZVwiPntwYXRofTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG5cbiAgYXN5bmMgZXhlY3V0ZVF1ZXJ5KHF1ZXJ5OiBzdHJpbmcsIGRpcmVjdG9yeT86IGF0b20kRGlyZWN0b3J5KTogUHJvbWlzZTxBcnJheTxGaWxlUmVzdWx0Pj4ge1xuICAgIGlmIChkaXJlY3RvcnkgPT0gbnVsbCB8fCBxdWVyeS5sZW5ndGggPCBNSU5fUVVFUllfTEVOR1RIKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3QgZGlyID0gZGlyZWN0b3J5LmdldFBhdGgoKTtcbiAgICBjb25zdCBzZXJ2aWNlID0gYXdhaXQgZ2V0Q3RhZ3NTZXJ2aWNlKGRpcmVjdG9yeSk7XG4gICAgaWYgKHNlcnZpY2UgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8vIEhBQ0s6IEN0YWdzIHJlc3VsdHMgdHlwaWNhbGx5IGp1c3QgZHVwbGljYXRlIEhhY2sgcmVzdWx0cyB3aGVuIHRoZXkncmUgcHJlc2VudC5cbiAgICAvLyBGaWx0ZXIgb3V0IHJlc3VsdHMgZnJvbSBQSFAgZmlsZXMgd2hlbiB0aGUgSGFjayBzZXJ2aWNlIGlzIGF2YWlsYWJsZS5cbiAgICAvLyBUT0RPKGhhbnNvbncpOiBSZW1vdmUgdGhpcyB3aGVuIHF1aWNrLW9wZW4gaGFzIHByb3BlciByYW5raW5nL2RlLWR1cGxpY2F0aW9uLlxuICAgIGxldCBoYWNrO1xuICAgIGlmIChmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1yZW1vdGUtY3RhZ3MuZGlzYWJsZVdpdGhIYWNrJykgIT09IGZhbHNlKSB7XG4gICAgICBoYWNrID0gYXdhaXQgZ2V0SGFja1NlcnZpY2UoZGlyZWN0b3J5KTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHNlcnZpY2UuZmluZFRhZ3MocXVlcnksIHtcbiAgICAgICAgY2FzZUluc2Vuc2l0aXZlOiB0cnVlLFxuICAgICAgICBwYXJ0aWFsTWF0Y2g6IHRydWUsXG4gICAgICAgIGxpbWl0OiBSRVNVTFRTX0xJTUlULFxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChyZXN1bHRzXG4gICAgICAgIC5maWx0ZXIodGFnID0+IGhhY2sgPT0gbnVsbCB8fCAhdGFnLmZpbGUuZW5kc1dpdGgoJy5waHAnKSlcbiAgICAgICAgLm1hcChhc3luYyB0YWcgPT4ge1xuICAgICAgICAgIGNvbnN0IGxpbmUgPSBhd2FpdCBnZXRMaW5lTnVtYmVyRm9yVGFnKHRhZyk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLnRhZyxcbiAgICAgICAgICAgIHBhdGg6IHRhZy5maWxlLFxuICAgICAgICAgICAgZGlyLFxuICAgICAgICAgICAgbGluZSxcbiAgICAgICAgICB9O1xuICAgICAgICB9KSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNlcnZpY2UuZGlzcG9zZSgpO1xuICAgIH1cbiAgfSxcblxufTogUHJvdmlkZXIpO1xuIl19