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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dSb290Q29udGFpbmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQkFjc0IsSUFBSTs7MkJBRU0sZUFBZTs7d0JBQ3hCLFlBQVk7O0lBRXRCLGlCQUFpQjtBQU9qQixXQVBBLGlCQUFpQixHQU9kOzs7MEJBUEgsaUJBQWlCOztBQVExQixRQUFJLENBQUMsWUFBWSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7Ozs7QUFJOUIsUUFBSSxDQUFDLFVBQVUsR0FBRyxpQkFBYSxDQUFDO0FBQ2hDLFFBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQ3BDLFlBQUssWUFBWSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDM0QsQ0FBQyxDQUFDO0dBQ0o7O2VBaEJVLGlCQUFpQjs7NkJBa0JSLFdBQUMsSUFBWSxFQUFzQjtBQUNyRCxVQUFNLFFBQVEsR0FBRyxNQUFNLG9DQUFrQixJQUFJLENBQUMsQ0FBQztBQUMvQyxVQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDcEIsZUFBTyxJQUFJLENBQUM7T0FDYjs7QUFFRCxVQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQyxVQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IsZ0JBQVEsR0FBRyx1QkFBYSxRQUFRLENBQUMsQ0FBQztBQUNsQyxZQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUNsQztBQUNELGFBQU8sUUFBUSxDQUFDO0tBQ2pCOzs7NkJBRW1CLFdBQ2xCLElBQVksRUFDWixDQUFxQyxFQUN4QjtBQUNiLFVBQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqRCxVQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDcEIsZUFBTyxJQUFJLENBQUM7T0FDYjs7QUFFRCxhQUFPLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzFCOzs7V0FFVSx1QkFBdUI7QUFDaEMsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ25DOzs7V0FFcUIsa0NBQW1DO0FBQ3ZELGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDckMsWUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDOzs7QUFHeEMsZUFBTyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNO2lCQUFLLEVBQUMsVUFBVSxFQUFWLFVBQVUsRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFDO1NBQUMsQ0FBQyxDQUFDO09BQzVFLENBQUMsQ0FBQztLQUNKOzs7V0FFSSxpQkFBUztBQUNaLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQUEsUUFBUTtlQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUU7T0FBQSxDQUFDLENBQUM7QUFDMUQsVUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUMzQjs7O1NBNURVLGlCQUFpQiIsImZpbGUiOiJGbG93Um9vdENvbnRhaW5lci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5pbXBvcnQgdHlwZSB7U2VydmVyU3RhdHVzVXBkYXRlfSBmcm9tICcuLic7XG5cbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncngnO1xuXG5pbXBvcnQge2ZpbmRGbG93Q29uZmlnRGlyfSBmcm9tICcuL0Zsb3dIZWxwZXJzJztcbmltcG9ydCB7Rmxvd1Jvb3R9IGZyb20gJy4vRmxvd1Jvb3QnO1xuXG5leHBvcnQgY2xhc3MgRmxvd1Jvb3RDb250YWluZXIge1xuICAvLyBzdHJpbmcgcmF0aGVyIHRoYW4gTnVjbGlkZVVyaSBiZWNhdXNlIHRoaXMgbW9kdWxlIHdpbGwgYWx3YXlzIGV4ZWN1dGUgYXQgdGhlIGxvY2F0aW9uIG9mIHRoZVxuICAvLyBmaWxlLCBzbyBpdCB3aWxsIGFsd2F5cyBiZSBhIHJlYWwgcGF0aCBhbmQgY2Fubm90IGJlIHByZWZpeGVkIHdpdGggbnVjbGlkZTovL1xuICBfZmxvd1Jvb3RNYXA6IE1hcDxzdHJpbmcsIEZsb3dSb290PjtcblxuICBfZmxvd1Jvb3QkOiBTdWJqZWN0PEZsb3dSb290PjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9mbG93Um9vdE1hcCA9IG5ldyBNYXAoKTtcblxuICAgIC8vIE5vIG5lZWQgdG8gZGlzcG9zZSBvZiB0aGlzIHN1YnNjcmlwdGlvbiBzaW5jZSB3ZSB3YW50IHRvIGtlZXAgaXQgZm9yIHRoZSBlbnRpcmUgbGlmZSBvZiB0aGlzXG4gICAgLy8gb2JqZWN0LiBXaGVuIHRoaXMgb2JqZWN0IGlzIGdhcmJhZ2UgY29sbGVjdGVkIHRoZSBzdWJqZWN0IHNob3VsZCBiZSB0b28uXG4gICAgdGhpcy5fZmxvd1Jvb3QkID0gbmV3IFN1YmplY3QoKTtcbiAgICB0aGlzLl9mbG93Um9vdCQuc3Vic2NyaWJlKGZsb3dSb290ID0+IHtcbiAgICAgIHRoaXMuX2Zsb3dSb290TWFwLnNldChmbG93Um9vdC5nZXRQYXRoVG9Sb290KCksIGZsb3dSb290KTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGdldFJvb3RGb3JQYXRoKHBhdGg6IHN0cmluZyk6IFByb21pc2U8P0Zsb3dSb290PiB7XG4gICAgY29uc3Qgcm9vdFBhdGggPSBhd2FpdCBmaW5kRmxvd0NvbmZpZ0RpcihwYXRoKTtcbiAgICBpZiAocm9vdFBhdGggPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IGluc3RhbmNlID0gdGhpcy5fZmxvd1Jvb3RNYXAuZ2V0KHJvb3RQYXRoKTtcbiAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICBpbnN0YW5jZSA9IG5ldyBGbG93Um9vdChyb290UGF0aCk7XG4gICAgICB0aGlzLl9mbG93Um9vdCQub25OZXh0KGluc3RhbmNlKTtcbiAgICB9XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9XG5cbiAgYXN5bmMgcnVuV2l0aFJvb3Q8VD4oXG4gICAgZmlsZTogc3RyaW5nLFxuICAgIGY6IChpbnN0YW5jZTogRmxvd1Jvb3QpID0+IFByb21pc2U8VD4sXG4gICk6IFByb21pc2U8P1Q+IHtcbiAgICBjb25zdCBpbnN0YW5jZSA9IGF3YWl0IHRoaXMuZ2V0Um9vdEZvclBhdGgoZmlsZSk7XG4gICAgaWYgKGluc3RhbmNlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBhd2FpdCBmKGluc3RhbmNlKTtcbiAgfVxuXG4gIGdldEFsbFJvb3RzKCk6IEl0ZXJhYmxlPEZsb3dSb290PiB7XG4gICAgcmV0dXJuIHRoaXMuX2Zsb3dSb290TWFwLnZhbHVlcygpO1xuICB9XG5cbiAgZ2V0U2VydmVyU3RhdHVzVXBkYXRlcygpOiBPYnNlcnZhYmxlPFNlcnZlclN0YXR1c1VwZGF0ZT4ge1xuICAgIHJldHVybiB0aGlzLl9mbG93Um9vdCQuZmxhdE1hcChyb290ID0+IHtcbiAgICAgIGNvbnN0IHBhdGhUb1Jvb3QgPSByb290LmdldFBhdGhUb1Jvb3QoKTtcbiAgICAgIC8vIFRoZSBzdGF0dXMgdXBkYXRlIHN0cmVhbSB3aWxsIGJlIGNvbXBsZXRlZCB3aGVuIGEgcm9vdCBpcyBkaXNwb3NlZCwgc28gdGhlcmUgaXMgbm8gbmVlZCB0b1xuICAgICAgLy8gdXNlIHRha2VVbnRpbCBoZXJlIHRvIHRydW5jYXRlIHRoZSBzdHJlYW0gYW5kIHJlbGVhc2UgcmVzb3VyY2VzLlxuICAgICAgcmV0dXJuIHJvb3QuZ2V0U2VydmVyU3RhdHVzVXBkYXRlcygpLm1hcChzdGF0dXMgPT4gKHtwYXRoVG9Sb290LCBzdGF0dXN9KSk7XG4gICAgfSk7XG4gIH1cblxuICBjbGVhcigpOiB2b2lkIHtcbiAgICB0aGlzLl9mbG93Um9vdE1hcC5mb3JFYWNoKGluc3RhbmNlID0+IGluc3RhbmNlLmRpc3Bvc2UoKSk7XG4gICAgdGhpcy5fZmxvd1Jvb3RNYXAuY2xlYXIoKTtcbiAgfVxufVxuIl19