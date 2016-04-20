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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.executeRnRequests = executeRnRequests;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _nuclideCommonsLibProcess = require('../../nuclide-commons/lib/process');

var _nuclideLogging = require('../../nuclide-logging');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _reactivexRxjs = require('@reactivex/rxjs');

var logger = (0, _nuclideLogging.getLogger)();

function executeRnRequests(rnRequests) {
  var workerProcess = (0, _nuclideCommonsLibProcess.createProcessStream)(function () {
    return(
      // TODO: The node location/path needs to be more configurable. We need to figure out a way to
      //   handle this across the board.
      (0, _nuclideCommonsLibProcess.forkWithExecEnvironment)(_path2['default'].join(__dirname, 'executor.js'), [], {
        execArgv: ['--debug-brk'],
        execPath: _nuclideFeatureConfig2['default'].get('nuclide-react-native.pathToNode'),
        silent: true
      })
    );
  }).share();

  return _reactivexRxjs.Observable.merge(workerProcess.map(function (process) {
    return {
      kind: 'pid',
      pid: process.pid
    };
  }),

  // The messages we're receiving from the worker process.
  workerProcess.flatMap(function (process) {
    return _reactivexRxjs.Observable.fromEvent(process, 'message');
  }), _reactivexRxjs.Observable.create(function () {
    return new _nuclideCommons.CompositeSubscription(
    // Send the incoming requests to the worker process for evaluation.
    rnRequests.withLatestFrom(workerProcess, function (r, p) {
      return [r, p];
    }).subscribe(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var request = _ref2[0];
      var process = _ref2[1];
      process.send(request);
    }),

    // Pipe output from forked process. This just makes things easier to debug for us.
    workerProcess.switchMap(function (process) {
      return (0, _nuclideCommonsLibProcess.getOutputStream)(process);
    }).subscribe(function (message) {
      switch (message.kind) {
        case 'error':
          logger.error(message.error.message);
          return;
        case 'stderr':
        case 'stdout':
          logger.info(message.data.toString());
          return;
      }
    }));
  })).share();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV4ZWN1dGVSblJlcXVlc3RzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs4QkFhb0MsdUJBQXVCOztvQ0FDakMsOEJBQThCOzs7O3dDQUtqRCxtQ0FBbUM7OzhCQUNsQix1QkFBdUI7O29CQUM5QixNQUFNOzs7OzZCQUNFLGlCQUFpQjs7QUFFMUMsSUFBTSxNQUFNLEdBQUcsZ0NBQVcsQ0FBQzs7QUFFcEIsU0FBUyxpQkFBaUIsQ0FBQyxVQUFpQyxFQUFnQztBQUNqRyxNQUFNLGFBQWEsR0FBRyxtREFBb0I7Ozs7QUFHeEMsNkRBQ0Usa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsRUFDbkMsRUFBRSxFQUNGO0FBQ0UsZ0JBQVEsRUFBRSxDQUFDLGFBQWEsQ0FBQztBQUN6QixnQkFBUSxFQUFFLGtDQUFjLEdBQUcsQ0FBQyxpQ0FBaUMsQ0FBQztBQUM5RCxjQUFNLEVBQUUsSUFBSTtPQUNiLENBQ0Y7O0dBQ0YsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUVYLFNBQU8sMEJBQVcsS0FBSyxDQUNyQixhQUFhLENBQUMsR0FBRyxDQUFDLFVBQUEsT0FBTztXQUFLO0FBQzVCLFVBQUksRUFBRSxLQUFLO0FBQ1gsU0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHO0tBQ2pCO0dBQUMsQ0FBQzs7O0FBSUQsZUFBYSxDQUFDLE9BQU8sQ0FDbkIsVUFBQSxPQUFPO1dBQUksMEJBQVcsU0FBUyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUM7R0FBQSxDQUNwRCxFQUdILDBCQUFXLE1BQU0sQ0FBQztXQUNoQjs7QUFFRSxjQUFVLENBQ1AsY0FBYyxDQUFDLGFBQWEsRUFBRSxVQUFDLENBQUMsRUFBRSxDQUFDO2FBQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQUMsQ0FBQyxDQUNqRCxTQUFTLENBQUMsVUFBQyxJQUFrQixFQUFLO2lDQUF2QixJQUFrQjs7VUFBakIsT0FBTztVQUFFLE9BQU87QUFBUSxhQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQUUsQ0FBQzs7O0FBR2hFLGlCQUFhLENBQ1YsU0FBUyxDQUFDLFVBQUEsT0FBTzthQUFJLCtDQUFnQixPQUFPLENBQUM7S0FBQSxDQUFDLENBQzlDLFNBQVMsQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUNwQixjQUFRLE9BQU8sQ0FBQyxJQUFJO0FBQ2xCLGFBQUssT0FBTztBQUNWLGdCQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEMsaUJBQU87QUFBQSxBQUNULGFBQUssUUFBUSxDQUFDO0FBQ2QsYUFBSyxRQUFRO0FBQ1gsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ3JDLGlCQUFPO0FBQUEsT0FDVjtLQUNGLENBQUMsQ0FDTDtHQUNGLENBQUMsQ0FFSCxDQUFDLEtBQUssRUFBRSxDQUFDO0NBQ1giLCJmaWxlIjoiZXhlY3V0ZVJuUmVxdWVzdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RXhlY3V0b3JSZXNwb25zZSwgUm5SZXF1ZXN0fSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHtDb21wb3NpdGVTdWJzY3JpcHRpb259IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQgZmVhdHVyZUNvbmZpZyBmcm9tICcuLi8uLi9udWNsaWRlLWZlYXR1cmUtY29uZmlnJztcbmltcG9ydCB7XG4gIGNyZWF0ZVByb2Nlc3NTdHJlYW0sXG4gIGZvcmtXaXRoRXhlY0Vudmlyb25tZW50LFxuICBnZXRPdXRwdXRTdHJlYW0sXG59IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucy9saWIvcHJvY2Vzcyc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdAcmVhY3RpdmV4L3J4anMnO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWN1dGVSblJlcXVlc3RzKHJuUmVxdWVzdHM6IE9ic2VydmFibGU8Um5SZXF1ZXN0Pik6IE9ic2VydmFibGU8RXhlY3V0b3JSZXNwb25zZT4ge1xuICBjb25zdCB3b3JrZXJQcm9jZXNzID0gY3JlYXRlUHJvY2Vzc1N0cmVhbSgoKSA9PiAoXG4gICAgLy8gVE9ETzogVGhlIG5vZGUgbG9jYXRpb24vcGF0aCBuZWVkcyB0byBiZSBtb3JlIGNvbmZpZ3VyYWJsZS4gV2UgbmVlZCB0byBmaWd1cmUgb3V0IGEgd2F5IHRvXG4gICAgLy8gICBoYW5kbGUgdGhpcyBhY3Jvc3MgdGhlIGJvYXJkLlxuICAgIGZvcmtXaXRoRXhlY0Vudmlyb25tZW50KFxuICAgICAgcGF0aC5qb2luKF9fZGlybmFtZSwgJ2V4ZWN1dG9yLmpzJyksXG4gICAgICBbXSxcbiAgICAgIHtcbiAgICAgICAgZXhlY0FyZ3Y6IFsnLS1kZWJ1Zy1icmsnXSxcbiAgICAgICAgZXhlY1BhdGg6IGZlYXR1cmVDb25maWcuZ2V0KCdudWNsaWRlLXJlYWN0LW5hdGl2ZS5wYXRoVG9Ob2RlJyksXG4gICAgICAgIHNpbGVudDogdHJ1ZSxcbiAgICAgIH0sXG4gICAgKVxuICApKS5zaGFyZSgpO1xuXG4gIHJldHVybiBPYnNlcnZhYmxlLm1lcmdlKFxuICAgIHdvcmtlclByb2Nlc3MubWFwKHByb2Nlc3MgPT4gKHtcbiAgICAgIGtpbmQ6ICdwaWQnLFxuICAgICAgcGlkOiBwcm9jZXNzLnBpZCxcbiAgICB9KSksXG5cbiAgICAvLyBUaGUgbWVzc2FnZXMgd2UncmUgcmVjZWl2aW5nIGZyb20gdGhlIHdvcmtlciBwcm9jZXNzLlxuICAgIChcbiAgICAgIHdvcmtlclByb2Nlc3MuZmxhdE1hcChcbiAgICAgICAgcHJvY2VzcyA9PiBPYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLCAnbWVzc2FnZScpXG4gICAgICApOiBPYnNlcnZhYmxlPEV4ZWN1dG9yUmVzcG9uc2U+XG4gICAgKSxcblxuICAgIE9ic2VydmFibGUuY3JlYXRlKCgpID0+IChcbiAgICAgIG5ldyBDb21wb3NpdGVTdWJzY3JpcHRpb24oXG4gICAgICAgIC8vIFNlbmQgdGhlIGluY29taW5nIHJlcXVlc3RzIHRvIHRoZSB3b3JrZXIgcHJvY2VzcyBmb3IgZXZhbHVhdGlvbi5cbiAgICAgICAgcm5SZXF1ZXN0c1xuICAgICAgICAgIC53aXRoTGF0ZXN0RnJvbSh3b3JrZXJQcm9jZXNzLCAociwgcCkgPT4gKFtyLCBwXSkpXG4gICAgICAgICAgLnN1YnNjcmliZSgoW3JlcXVlc3QsIHByb2Nlc3NdKSA9PiB7IHByb2Nlc3Muc2VuZChyZXF1ZXN0KTsgfSksXG5cbiAgICAgICAgLy8gUGlwZSBvdXRwdXQgZnJvbSBmb3JrZWQgcHJvY2Vzcy4gVGhpcyBqdXN0IG1ha2VzIHRoaW5ncyBlYXNpZXIgdG8gZGVidWcgZm9yIHVzLlxuICAgICAgICB3b3JrZXJQcm9jZXNzXG4gICAgICAgICAgLnN3aXRjaE1hcChwcm9jZXNzID0+IGdldE91dHB1dFN0cmVhbShwcm9jZXNzKSlcbiAgICAgICAgICAuc3Vic2NyaWJlKG1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgc3dpdGNoIChtZXNzYWdlLmtpbmQpIHtcbiAgICAgICAgICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihtZXNzYWdlLmVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgY2FzZSAnc3RkZXJyJzpcbiAgICAgICAgICAgICAgY2FzZSAnc3Rkb3V0JzpcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhtZXNzYWdlLmRhdGEudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLFxuICAgICAgKVxuICAgICkpLFxuXG4gICkuc2hhcmUoKTtcbn1cbiJdfQ==