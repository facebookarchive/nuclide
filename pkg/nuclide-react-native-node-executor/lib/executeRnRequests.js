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

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _nuclideCommonsLibProcess = require('../../nuclide-commons/lib/process');

var _nuclideLogging = require('../../nuclide-logging');

var _atom = require('atom');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _rx = require('rx');

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

  return _rx.Observable.merge(workerProcess.map(function (process) {
    return {
      kind: 'pid',
      pid: process.pid
    };
  }),

  // The messages we're receiving from the worker process.
  workerProcess.flatMap(function (process) {
    return _rx.Observable.fromEvent(process, 'message');
  }), _rx.Observable.create(function () {
    return new _atom.CompositeDisposable(
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
    workerProcess.flatMapLatest(function (process) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV4ZWN1dGVSblJlcXVlc3RzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQ0FhMEIsOEJBQThCOzs7O3dDQUtqRCxtQ0FBbUM7OzhCQUNsQix1QkFBdUI7O29CQUNiLE1BQU07O29CQUN2QixNQUFNOzs7O2tCQUNFLElBQUk7O0FBRTdCLElBQU0sTUFBTSxHQUFHLGdDQUFXLENBQUM7O0FBRXBCLFNBQVMsaUJBQWlCLENBQUMsVUFBaUMsRUFBZ0M7QUFDakcsTUFBTSxhQUFhLEdBQUcsbURBQW9COzs7O0FBR3hDLDZEQUNFLGtCQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLEVBQ25DLEVBQUUsRUFDRjtBQUNFLGdCQUFRLEVBQUUsQ0FBQyxhQUFhLENBQUM7QUFDekIsZ0JBQVEsRUFBRSxrQ0FBYyxHQUFHLENBQUMsaUNBQWlDLENBQUM7QUFDOUQsY0FBTSxFQUFFLElBQUk7T0FDYixDQUNGOztHQUNGLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFWCxTQUFPLGVBQVcsS0FBSyxDQUNyQixhQUFhLENBQUMsR0FBRyxDQUFDLFVBQUEsT0FBTztXQUFLO0FBQzVCLFVBQUksRUFBRSxLQUFLO0FBQ1gsU0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHO0tBQ2pCO0dBQUMsQ0FBQzs7O0FBSUQsZUFBYSxDQUFDLE9BQU8sQ0FDbkIsVUFBQSxPQUFPO1dBQUksZUFBVyxTQUFTLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQztHQUFBLENBQ3BELEVBR0gsZUFBVyxNQUFNLENBQUM7V0FDaEI7O0FBRUUsY0FBVSxDQUNQLGNBQWMsQ0FBQyxhQUFhLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQzthQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUFDLENBQUMsQ0FDakQsU0FBUyxDQUFDLFVBQUMsSUFBa0IsRUFBSztpQ0FBdkIsSUFBa0I7O1VBQWpCLE9BQU87VUFBRSxPQUFPO0FBQVEsYUFBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUFFLENBQUM7OztBQUdoRSxpQkFBYSxDQUNWLGFBQWEsQ0FBQyxVQUFBLE9BQU87YUFBSSwrQ0FBZ0IsT0FBTyxDQUFDO0tBQUEsQ0FBQyxDQUNsRCxTQUFTLENBQUMsVUFBQSxPQUFPLEVBQUk7QUFDcEIsY0FBUSxPQUFPLENBQUMsSUFBSTtBQUNsQixhQUFLLE9BQU87QUFDVixnQkFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3BDLGlCQUFPO0FBQUEsQUFDVCxhQUFLLFFBQVEsQ0FBQztBQUNkLGFBQUssUUFBUTtBQUNYLGdCQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUNyQyxpQkFBTztBQUFBLE9BQ1Y7S0FDRixDQUFDLENBQ0w7R0FDRixDQUFDLENBRUgsQ0FBQyxLQUFLLEVBQUUsQ0FBQztDQUNYIiwiZmlsZSI6ImV4ZWN1dGVSblJlcXVlc3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0V4ZWN1dG9yUmVzcG9uc2UsIFJuUmVxdWVzdH0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL251Y2xpZGUtZmVhdHVyZS1jb25maWcnO1xuaW1wb3J0IHtcbiAgY3JlYXRlUHJvY2Vzc1N0cmVhbSxcbiAgZm9ya1dpdGhFeGVjRW52aXJvbm1lbnQsXG4gIGdldE91dHB1dFN0cmVhbSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zL2xpYi9wcm9jZXNzJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG5leHBvcnQgZnVuY3Rpb24gZXhlY3V0ZVJuUmVxdWVzdHMocm5SZXF1ZXN0czogT2JzZXJ2YWJsZTxSblJlcXVlc3Q+KTogT2JzZXJ2YWJsZTxFeGVjdXRvclJlc3BvbnNlPiB7XG4gIGNvbnN0IHdvcmtlclByb2Nlc3MgPSBjcmVhdGVQcm9jZXNzU3RyZWFtKCgpID0+IChcbiAgICAvLyBUT0RPOiBUaGUgbm9kZSBsb2NhdGlvbi9wYXRoIG5lZWRzIHRvIGJlIG1vcmUgY29uZmlndXJhYmxlLiBXZSBuZWVkIHRvIGZpZ3VyZSBvdXQgYSB3YXkgdG9cbiAgICAvLyAgIGhhbmRsZSB0aGlzIGFjcm9zcyB0aGUgYm9hcmQuXG4gICAgZm9ya1dpdGhFeGVjRW52aXJvbm1lbnQoXG4gICAgICBwYXRoLmpvaW4oX19kaXJuYW1lLCAnZXhlY3V0b3IuanMnKSxcbiAgICAgIFtdLFxuICAgICAge1xuICAgICAgICBleGVjQXJndjogWyctLWRlYnVnLWJyayddLFxuICAgICAgICBleGVjUGF0aDogZmVhdHVyZUNvbmZpZy5nZXQoJ251Y2xpZGUtcmVhY3QtbmF0aXZlLnBhdGhUb05vZGUnKSxcbiAgICAgICAgc2lsZW50OiB0cnVlLFxuICAgICAgfSxcbiAgICApXG4gICkpLnNoYXJlKCk7XG5cbiAgcmV0dXJuIE9ic2VydmFibGUubWVyZ2UoXG4gICAgd29ya2VyUHJvY2Vzcy5tYXAocHJvY2VzcyA9PiAoe1xuICAgICAga2luZDogJ3BpZCcsXG4gICAgICBwaWQ6IHByb2Nlc3MucGlkLFxuICAgIH0pKSxcblxuICAgIC8vIFRoZSBtZXNzYWdlcyB3ZSdyZSByZWNlaXZpbmcgZnJvbSB0aGUgd29ya2VyIHByb2Nlc3MuXG4gICAgKFxuICAgICAgd29ya2VyUHJvY2Vzcy5mbGF0TWFwKFxuICAgICAgICBwcm9jZXNzID0+IE9ic2VydmFibGUuZnJvbUV2ZW50KHByb2Nlc3MsICdtZXNzYWdlJylcbiAgICAgICk6IE9ic2VydmFibGU8RXhlY3V0b3JSZXNwb25zZT5cbiAgICApLFxuXG4gICAgT2JzZXJ2YWJsZS5jcmVhdGUoKCkgPT4gKFxuICAgICAgbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICAgIC8vIFNlbmQgdGhlIGluY29taW5nIHJlcXVlc3RzIHRvIHRoZSB3b3JrZXIgcHJvY2VzcyBmb3IgZXZhbHVhdGlvbi5cbiAgICAgICAgcm5SZXF1ZXN0c1xuICAgICAgICAgIC53aXRoTGF0ZXN0RnJvbSh3b3JrZXJQcm9jZXNzLCAociwgcCkgPT4gKFtyLCBwXSkpXG4gICAgICAgICAgLnN1YnNjcmliZSgoW3JlcXVlc3QsIHByb2Nlc3NdKSA9PiB7IHByb2Nlc3Muc2VuZChyZXF1ZXN0KTsgfSksXG5cbiAgICAgICAgLy8gUGlwZSBvdXRwdXQgZnJvbSBmb3JrZWQgcHJvY2Vzcy4gVGhpcyBqdXN0IG1ha2VzIHRoaW5ncyBlYXNpZXIgdG8gZGVidWcgZm9yIHVzLlxuICAgICAgICB3b3JrZXJQcm9jZXNzXG4gICAgICAgICAgLmZsYXRNYXBMYXRlc3QocHJvY2VzcyA9PiBnZXRPdXRwdXRTdHJlYW0ocHJvY2VzcykpXG4gICAgICAgICAgLnN1YnNjcmliZShtZXNzYWdlID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAobWVzc2FnZS5raW5kKSB7XG4gICAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IobWVzc2FnZS5lcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIGNhc2UgJ3N0ZGVycic6XG4gICAgICAgICAgICAgIGNhc2UgJ3N0ZG91dCc6XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8obWVzc2FnZS5kYXRhLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSxcbiAgICAgIClcbiAgICApKSxcblxuICApLnNoYXJlKCk7XG59XG4iXX0=