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

var _rx = require('rx');

var _FlowHelpers = require('./FlowHelpers');

var _FlowRoot = require('./FlowRoot');

var FlowRootContainer = (function () {
  function FlowRootContainer() {
    var _this = this;

    _classCallCheck(this, FlowRootContainer);

    this._flowRootMap = new Map();

    // No need to dispose of this subscription since we want to keep it for the entire life of this
    // object. When this object is garbage collected the subject should be too.
    this._flowRoot$ = new _rx.Subject();
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
        this._flowRoot$.onNext(instance);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dSb290Q29udGFpbmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQkFjc0IsSUFBSTs7MkJBRU0sZUFBZTs7d0JBQ3hCLFlBQVk7O0lBRXRCLGlCQUFpQjtBQU9qQixXQVBBLGlCQUFpQixHQU9kOzs7MEJBUEgsaUJBQWlCOztBQVExQixRQUFJLENBQUMsWUFBWSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7Ozs7QUFJOUIsUUFBSSxDQUFDLFVBQVUsR0FBRyxpQkFBYSxDQUFDO0FBQ2hDLFFBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQ3BDLFlBQUssWUFBWSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDM0QsQ0FBQyxDQUFDO0dBQ0o7O2VBaEJVLGlCQUFpQjs7NkJBa0JSLFdBQUMsSUFBWSxFQUFzQjtBQUNyRCxVQUFNLFFBQVEsR0FBRyxNQUFNLG9DQUFrQixJQUFJLENBQUMsQ0FBQztBQUMvQyxVQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDcEIsZUFBTyxJQUFJLENBQUM7T0FDYjs7QUFFRCxVQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQyxVQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IsZ0JBQVEsR0FBRyx1QkFBYSxRQUFRLENBQUMsQ0FBQztBQUNsQyxZQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUNsQztBQUNELGFBQU8sUUFBUSxDQUFDO0tBQ2pCOzs7NkJBRW1CLFdBQ2xCLElBQVksRUFDWixDQUFxQyxFQUN4QjtBQUNiLFVBQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqRCxVQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDcEIsZUFBTyxJQUFJLENBQUM7T0FDYjs7QUFFRCxhQUFPLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzFCOzs7V0FFVSx1QkFBdUI7QUFDaEMsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ25DOzs7V0FFcUIsa0NBQW1DO0FBQ3ZELGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDckMsWUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDOzs7QUFHeEMsZUFBTyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNO2lCQUFLLEVBQUMsVUFBVSxFQUFWLFVBQVUsRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFDO1NBQUMsQ0FBQyxDQUFDO09BQzVFLENBQUMsQ0FBQztLQUNKOzs7V0FFSSxpQkFBUztBQUNaLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQUEsUUFBUTtlQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUU7T0FBQSxDQUFDLENBQUM7QUFDMUQsVUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUMzQjs7O1NBNURVLGlCQUFpQiIsImZpbGUiOiJGbG93Um9vdENvbnRhaW5lci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5pbXBvcnQgdHlwZSB7U2VydmVyU3RhdHVzVXBkYXRlfSBmcm9tICcuL0Zsb3dTZXJ2aWNlJztcblxuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeCc7XG5cbmltcG9ydCB7ZmluZEZsb3dDb25maWdEaXJ9IGZyb20gJy4vRmxvd0hlbHBlcnMnO1xuaW1wb3J0IHtGbG93Um9vdH0gZnJvbSAnLi9GbG93Um9vdCc7XG5cbmV4cG9ydCBjbGFzcyBGbG93Um9vdENvbnRhaW5lciB7XG4gIC8vIHN0cmluZyByYXRoZXIgdGhhbiBOdWNsaWRlVXJpIGJlY2F1c2UgdGhpcyBtb2R1bGUgd2lsbCBhbHdheXMgZXhlY3V0ZSBhdCB0aGUgbG9jYXRpb24gb2YgdGhlXG4gIC8vIGZpbGUsIHNvIGl0IHdpbGwgYWx3YXlzIGJlIGEgcmVhbCBwYXRoIGFuZCBjYW5ub3QgYmUgcHJlZml4ZWQgd2l0aCBudWNsaWRlOi8vXG4gIF9mbG93Um9vdE1hcDogTWFwPHN0cmluZywgRmxvd1Jvb3Q+O1xuXG4gIF9mbG93Um9vdCQ6IFN1YmplY3Q8Rmxvd1Jvb3Q+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2Zsb3dSb290TWFwID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gTm8gbmVlZCB0byBkaXNwb3NlIG9mIHRoaXMgc3Vic2NyaXB0aW9uIHNpbmNlIHdlIHdhbnQgdG8ga2VlcCBpdCBmb3IgdGhlIGVudGlyZSBsaWZlIG9mIHRoaXNcbiAgICAvLyBvYmplY3QuIFdoZW4gdGhpcyBvYmplY3QgaXMgZ2FyYmFnZSBjb2xsZWN0ZWQgdGhlIHN1YmplY3Qgc2hvdWxkIGJlIHRvby5cbiAgICB0aGlzLl9mbG93Um9vdCQgPSBuZXcgU3ViamVjdCgpO1xuICAgIHRoaXMuX2Zsb3dSb290JC5zdWJzY3JpYmUoZmxvd1Jvb3QgPT4ge1xuICAgICAgdGhpcy5fZmxvd1Jvb3RNYXAuc2V0KGZsb3dSb290LmdldFBhdGhUb1Jvb3QoKSwgZmxvd1Jvb3QpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZ2V0Um9vdEZvclBhdGgocGF0aDogc3RyaW5nKTogUHJvbWlzZTw/Rmxvd1Jvb3Q+IHtcbiAgICBjb25zdCByb290UGF0aCA9IGF3YWl0IGZpbmRGbG93Q29uZmlnRGlyKHBhdGgpO1xuICAgIGlmIChyb290UGF0aCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgaW5zdGFuY2UgPSB0aGlzLl9mbG93Um9vdE1hcC5nZXQocm9vdFBhdGgpO1xuICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgIGluc3RhbmNlID0gbmV3IEZsb3dSb290KHJvb3RQYXRoKTtcbiAgICAgIHRoaXMuX2Zsb3dSb290JC5vbk5leHQoaW5zdGFuY2UpO1xuICAgIH1cbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICBhc3luYyBydW5XaXRoUm9vdDxUPihcbiAgICBmaWxlOiBzdHJpbmcsXG4gICAgZjogKGluc3RhbmNlOiBGbG93Um9vdCkgPT4gUHJvbWlzZTxUPixcbiAgKTogUHJvbWlzZTw/VD4ge1xuICAgIGNvbnN0IGluc3RhbmNlID0gYXdhaXQgdGhpcy5nZXRSb290Rm9yUGF0aChmaWxlKTtcbiAgICBpZiAoaW5zdGFuY2UgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGF3YWl0IGYoaW5zdGFuY2UpO1xuICB9XG5cbiAgZ2V0QWxsUm9vdHMoKTogSXRlcmFibGU8Rmxvd1Jvb3Q+IHtcbiAgICByZXR1cm4gdGhpcy5fZmxvd1Jvb3RNYXAudmFsdWVzKCk7XG4gIH1cblxuICBnZXRTZXJ2ZXJTdGF0dXNVcGRhdGVzKCk6IE9ic2VydmFibGU8U2VydmVyU3RhdHVzVXBkYXRlPiB7XG4gICAgcmV0dXJuIHRoaXMuX2Zsb3dSb290JC5mbGF0TWFwKHJvb3QgPT4ge1xuICAgICAgY29uc3QgcGF0aFRvUm9vdCA9IHJvb3QuZ2V0UGF0aFRvUm9vdCgpO1xuICAgICAgLy8gVGhlIHN0YXR1cyB1cGRhdGUgc3RyZWFtIHdpbGwgYmUgY29tcGxldGVkIHdoZW4gYSByb290IGlzIGRpc3Bvc2VkLCBzbyB0aGVyZSBpcyBubyBuZWVkIHRvXG4gICAgICAvLyB1c2UgdGFrZVVudGlsIGhlcmUgdG8gdHJ1bmNhdGUgdGhlIHN0cmVhbSBhbmQgcmVsZWFzZSByZXNvdXJjZXMuXG4gICAgICByZXR1cm4gcm9vdC5nZXRTZXJ2ZXJTdGF0dXNVcGRhdGVzKCkubWFwKHN0YXR1cyA9PiAoe3BhdGhUb1Jvb3QsIHN0YXR1c30pKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNsZWFyKCk6IHZvaWQge1xuICAgIHRoaXMuX2Zsb3dSb290TWFwLmZvckVhY2goaW5zdGFuY2UgPT4gaW5zdGFuY2UuZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9mbG93Um9vdE1hcC5jbGVhcigpO1xuICB9XG59XG4iXX0=