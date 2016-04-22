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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _reactivexRxjs = require('@reactivex/rxjs');

var _FlowHelpers = require('./FlowHelpers');

var _FlowRoot = require('./FlowRoot');

var FlowRootContainer = (function () {
  function FlowRootContainer() {
    var _this = this;

    _classCallCheck(this, FlowRootContainer);

    this._flowRootMap = new Map();

    // No need to dispose of this subscription since we want to keep it for the entire life of this
    // object. When this object is garbage collected the subject should be too.
    this._flowRoot$ = new _reactivexRxjs.Subject();
    this._flowRoot$.subscribe(function (flowRoot) {
      _this._flowRootMap.set(flowRoot.getPathToRoot(), flowRoot);
    });
  }

  _createClass(FlowRootContainer, [{
    key: 'getRootForPath',
    value: _asyncToGenerator(function* (path) {
      var rootPath = yield (0, _FlowHelpers.findFlowConfigDir)(path);
      if (rootPath == null) {
        return null;
      }

      var instance = this._flowRootMap.get(rootPath);
      if (!instance) {
        instance = new _FlowRoot.FlowRoot(rootPath);
        this._flowRoot$.next(instance);
      }
      return instance;
    })
  }, {
    key: 'runWithRoot',
    value: _asyncToGenerator(function* (file, f) {
      var instance = yield this.getRootForPath(file);
      if (instance == null) {
        return null;
      }

      return yield f(instance);
    })
  }, {
    key: 'getAllRoots',
    value: function getAllRoots() {
      return this._flowRootMap.values();
    }
  }, {
    key: 'getServerStatusUpdates',
    value: function getServerStatusUpdates() {
      return this._flowRoot$.flatMap(function (root) {
        var pathToRoot = root.getPathToRoot();
        // The status update stream will be completed when a root is disposed, so there is no need to
        // use takeUntil here to truncate the stream and release resources.
        return root.getServerStatusUpdates().map(function (status) {
          return { pathToRoot: pathToRoot, status: status };
        });
      });
    }
  }, {
    key: 'clear',
    value: function clear() {
      this._flowRootMap.forEach(function (instance) {
        return instance.dispose();
      });
      this._flowRootMap.clear();
    }
  }]);

  return FlowRootContainer;
})();

exports.FlowRootContainer = FlowRootContainer;

// string rather than NuclideUri because this module will always execute at the location of the
// file, so it will always be a real path and cannot be prefixed with nuclide://
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dSb290Q29udGFpbmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs2QkFjc0IsaUJBQWlCOzsyQkFFUCxlQUFlOzt3QkFDeEIsWUFBWTs7SUFFdEIsaUJBQWlCO0FBT2pCLFdBUEEsaUJBQWlCLEdBT2Q7OzswQkFQSCxpQkFBaUI7O0FBUTFCLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7OztBQUk5QixRQUFJLENBQUMsVUFBVSxHQUFHLDRCQUFhLENBQUM7QUFDaEMsUUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDcEMsWUFBSyxZQUFZLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUMzRCxDQUFDLENBQUM7R0FDSjs7ZUFoQlUsaUJBQWlCOzs2QkFrQlIsV0FBQyxJQUFZLEVBQXNCO0FBQ3JELFVBQU0sUUFBUSxHQUFHLE1BQU0sb0NBQWtCLElBQUksQ0FBQyxDQUFDO0FBQy9DLFVBQUksUUFBUSxJQUFJLElBQUksRUFBRTtBQUNwQixlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELFVBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9DLFVBQUksQ0FBQyxRQUFRLEVBQUU7QUFDYixnQkFBUSxHQUFHLHVCQUFhLFFBQVEsQ0FBQyxDQUFDO0FBQ2xDLFlBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQ2hDO0FBQ0QsYUFBTyxRQUFRLENBQUM7S0FDakI7Ozs2QkFFbUIsV0FDbEIsSUFBWSxFQUNaLENBQXFDLEVBQ3hCO0FBQ2IsVUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pELFVBQUksUUFBUSxJQUFJLElBQUksRUFBRTtBQUNwQixlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELGFBQU8sTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDMUI7OztXQUVVLHVCQUF1QjtBQUNoQyxhQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDbkM7OztXQUVxQixrQ0FBbUM7QUFDdkQsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksRUFBSTtBQUNyQyxZQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7OztBQUd4QyxlQUFPLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFBLE1BQU07aUJBQUssRUFBQyxVQUFVLEVBQVYsVUFBVSxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUM7U0FBQyxDQUFDLENBQUM7T0FDNUUsQ0FBQyxDQUFDO0tBQ0o7OztXQUVJLGlCQUFTO0FBQ1osVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBQSxRQUFRO2VBQUksUUFBUSxDQUFDLE9BQU8sRUFBRTtPQUFBLENBQUMsQ0FBQztBQUMxRCxVQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQzNCOzs7U0E1RFUsaUJBQWlCIiwiZmlsZSI6IkZsb3dSb290Q29udGFpbmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge09ic2VydmFibGV9IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5pbXBvcnQgdHlwZSB7U2VydmVyU3RhdHVzVXBkYXRlfSBmcm9tICcuLic7XG5cbmltcG9ydCB7U3ViamVjdH0gZnJvbSAnQHJlYWN0aXZleC9yeGpzJztcblxuaW1wb3J0IHtmaW5kRmxvd0NvbmZpZ0Rpcn0gZnJvbSAnLi9GbG93SGVscGVycyc7XG5pbXBvcnQge0Zsb3dSb290fSBmcm9tICcuL0Zsb3dSb290JztcblxuZXhwb3J0IGNsYXNzIEZsb3dSb290Q29udGFpbmVyIHtcbiAgLy8gc3RyaW5nIHJhdGhlciB0aGFuIE51Y2xpZGVVcmkgYmVjYXVzZSB0aGlzIG1vZHVsZSB3aWxsIGFsd2F5cyBleGVjdXRlIGF0IHRoZSBsb2NhdGlvbiBvZiB0aGVcbiAgLy8gZmlsZSwgc28gaXQgd2lsbCBhbHdheXMgYmUgYSByZWFsIHBhdGggYW5kIGNhbm5vdCBiZSBwcmVmaXhlZCB3aXRoIG51Y2xpZGU6Ly9cbiAgX2Zsb3dSb290TWFwOiBNYXA8c3RyaW5nLCBGbG93Um9vdD47XG5cbiAgX2Zsb3dSb290JDogU3ViamVjdDxGbG93Um9vdD47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZmxvd1Jvb3RNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBObyBuZWVkIHRvIGRpc3Bvc2Ugb2YgdGhpcyBzdWJzY3JpcHRpb24gc2luY2Ugd2Ugd2FudCB0byBrZWVwIGl0IGZvciB0aGUgZW50aXJlIGxpZmUgb2YgdGhpc1xuICAgIC8vIG9iamVjdC4gV2hlbiB0aGlzIG9iamVjdCBpcyBnYXJiYWdlIGNvbGxlY3RlZCB0aGUgc3ViamVjdCBzaG91bGQgYmUgdG9vLlxuICAgIHRoaXMuX2Zsb3dSb290JCA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdGhpcy5fZmxvd1Jvb3QkLnN1YnNjcmliZShmbG93Um9vdCA9PiB7XG4gICAgICB0aGlzLl9mbG93Um9vdE1hcC5zZXQoZmxvd1Jvb3QuZ2V0UGF0aFRvUm9vdCgpLCBmbG93Um9vdCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBnZXRSb290Rm9yUGF0aChwYXRoOiBzdHJpbmcpOiBQcm9taXNlPD9GbG93Um9vdD4ge1xuICAgIGNvbnN0IHJvb3RQYXRoID0gYXdhaXQgZmluZEZsb3dDb25maWdEaXIocGF0aCk7XG4gICAgaWYgKHJvb3RQYXRoID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCBpbnN0YW5jZSA9IHRoaXMuX2Zsb3dSb290TWFwLmdldChyb290UGF0aCk7XG4gICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgaW5zdGFuY2UgPSBuZXcgRmxvd1Jvb3Qocm9vdFBhdGgpO1xuICAgICAgdGhpcy5fZmxvd1Jvb3QkLm5leHQoaW5zdGFuY2UpO1xuICAgIH1cbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICBhc3luYyBydW5XaXRoUm9vdDxUPihcbiAgICBmaWxlOiBzdHJpbmcsXG4gICAgZjogKGluc3RhbmNlOiBGbG93Um9vdCkgPT4gUHJvbWlzZTxUPixcbiAgKTogUHJvbWlzZTw/VD4ge1xuICAgIGNvbnN0IGluc3RhbmNlID0gYXdhaXQgdGhpcy5nZXRSb290Rm9yUGF0aChmaWxlKTtcbiAgICBpZiAoaW5zdGFuY2UgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGF3YWl0IGYoaW5zdGFuY2UpO1xuICB9XG5cbiAgZ2V0QWxsUm9vdHMoKTogSXRlcmFibGU8Rmxvd1Jvb3Q+IHtcbiAgICByZXR1cm4gdGhpcy5fZmxvd1Jvb3RNYXAudmFsdWVzKCk7XG4gIH1cblxuICBnZXRTZXJ2ZXJTdGF0dXNVcGRhdGVzKCk6IE9ic2VydmFibGU8U2VydmVyU3RhdHVzVXBkYXRlPiB7XG4gICAgcmV0dXJuIHRoaXMuX2Zsb3dSb290JC5mbGF0TWFwKHJvb3QgPT4ge1xuICAgICAgY29uc3QgcGF0aFRvUm9vdCA9IHJvb3QuZ2V0UGF0aFRvUm9vdCgpO1xuICAgICAgLy8gVGhlIHN0YXR1cyB1cGRhdGUgc3RyZWFtIHdpbGwgYmUgY29tcGxldGVkIHdoZW4gYSByb290IGlzIGRpc3Bvc2VkLCBzbyB0aGVyZSBpcyBubyBuZWVkIHRvXG4gICAgICAvLyB1c2UgdGFrZVVudGlsIGhlcmUgdG8gdHJ1bmNhdGUgdGhlIHN0cmVhbSBhbmQgcmVsZWFzZSByZXNvdXJjZXMuXG4gICAgICByZXR1cm4gcm9vdC5nZXRTZXJ2ZXJTdGF0dXNVcGRhdGVzKCkubWFwKHN0YXR1cyA9PiAoe3BhdGhUb1Jvb3QsIHN0YXR1c30pKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNsZWFyKCk6IHZvaWQge1xuICAgIHRoaXMuX2Zsb3dSb290TWFwLmZvckVhY2goaW5zdGFuY2UgPT4gaW5zdGFuY2UuZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9mbG93Um9vdE1hcC5jbGVhcigpO1xuICB9XG59XG4iXX0=