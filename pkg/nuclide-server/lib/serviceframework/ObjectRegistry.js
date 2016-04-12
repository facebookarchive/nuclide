Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideLogging = require('../../../nuclide-logging');

var logger = (0, _nuclideLogging.getLogger)();

// All remotable objects have some set of named functions,
// and they also have a dispose method.

// Handles lifetimes of marshalling wrappers remote objects.

var ObjectRegistry = (function () {
  function ObjectRegistry() {
    _classCallCheck(this, ObjectRegistry);

    this._nextObjectId = 1;
    this._registrationsById = new Map();
    this._registrationsByObject = new Map();
    this._subscriptions = new Map();
  }

  _createClass(ObjectRegistry, [{
    key: 'get',
    value: function get(remoteId) {
      return this._getRegistration(remoteId).object;
    }
  }, {
    key: '_getRegistration',
    value: function _getRegistration(remoteId) {
      var result = this._registrationsById.get(remoteId);
      (0, _assert2['default'])(result != null);
      return result;
    }
  }, {
    key: 'getInterface',
    value: function getInterface(remoteId) {
      return this._getRegistration(remoteId)['interface'];
    }
  }, {
    key: 'disposeObject',
    value: _asyncToGenerator(function* (remoteId) {
      var registration = this._getRegistration(remoteId);
      var object = registration.object;

      this._registrationsById['delete'](remoteId);
      this._registrationsByObject['delete'](object);

      // Call the object's local dispose function.
      yield object.dispose();
    })
  }, {
    key: 'disposeSubscription',
    value: function disposeSubscription(requestId) {
      var subscription = this.removeSubscription(requestId);
      if (subscription != null) {
        subscription.dispose();
      }
    }

    // Put the object in the registry.
  }, {
    key: 'add',
    value: function add(interfaceName, object) {
      var existingRegistration = this._registrationsByObject.get(object);
      if (existingRegistration != null) {
        (0, _assert2['default'])(existingRegistration['interface'] === interfaceName);
        return existingRegistration.remoteId;
      }

      var objectId = this._nextObjectId;
      this._nextObjectId++;

      var registration = {
        'interface': interfaceName,
        remoteId: objectId,
        object: object
      };

      this._registrationsById.set(objectId, registration);
      this._registrationsByObject.set(object, registration);

      return objectId;
    }
  }, {
    key: 'addSubscription',
    value: function addSubscription(requestId, subscription) {
      this._subscriptions.set(requestId, subscription);
    }
  }, {
    key: 'removeSubscription',
    value: function removeSubscription(requestId) {
      var subscription = this._subscriptions.get(requestId);
      if (subscription != null) {
        this._subscriptions['delete'](requestId);
      }
      return subscription;
    }

    // Disposes all object in the registry
  }, {
    key: 'dispose',
    value: _asyncToGenerator(function* () {
      var _this = this;

      var ids = Array.from(this._registrationsById.keys());
      logger.info('Disposing ' + ids.length + ' registrations');

      yield Promise.all(ids.map(_asyncToGenerator(function* (id) {
        try {
          yield _this.disposeObject(id);
        } catch (e) {
          logger.error('Error disposing marshalled object.', e);
        }
      })));

      var subscriptions = Array.from(this._subscriptions.keys());
      logger.info('Disposing ' + subscriptions.length + ' subscriptions');
      for (var _id of subscriptions) {
        try {
          this.disposeSubscription(_id);
        } catch (e) {
          logger.error('Error disposing subscription', e);
        }
      }
    })
  }]);

  return ObjectRegistry;
})();

exports.ObjectRegistry = ObjectRegistry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk9iamVjdFJlZ2lzdHJ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQVdzQixRQUFROzs7OzhCQUNOLDBCQUEwQjs7QUFFbEQsSUFBTSxNQUFNLEdBQUcsZ0NBQVcsQ0FBQzs7Ozs7OztJQWdCZCxjQUFjO0FBTWQsV0FOQSxjQUFjLEdBTVg7MEJBTkgsY0FBYzs7QUFPdkIsUUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7QUFDdkIsUUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDcEMsUUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDeEMsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0dBQ2pDOztlQVhVLGNBQWM7O1dBYXRCLGFBQUMsUUFBZ0IsRUFBZ0I7QUFDbEMsYUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDO0tBQy9DOzs7V0FFZSwwQkFBQyxRQUFnQixFQUFzQjtBQUNyRCxVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JELCtCQUFVLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQztBQUMxQixhQUFPLE1BQU0sQ0FBQztLQUNmOzs7V0FFVyxzQkFBQyxRQUFnQixFQUFVO0FBQ3JDLGFBQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxhQUFVLENBQUM7S0FDbEQ7Ozs2QkFFa0IsV0FBQyxRQUFnQixFQUFpQjtBQUNuRCxVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckQsVUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQzs7QUFFbkMsVUFBSSxDQUFDLGtCQUFrQixVQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekMsVUFBSSxDQUFDLHNCQUFzQixVQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7OztBQUczQyxZQUFNLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN4Qjs7O1dBRWtCLDZCQUFDLFNBQWlCLEVBQVE7QUFDM0MsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3hELFVBQUksWUFBWSxJQUFJLElBQUksRUFBRTtBQUN4QixvQkFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3hCO0tBQ0Y7Ozs7O1dBR0UsYUFBQyxhQUFxQixFQUFFLE1BQWMsRUFBVTtBQUNqRCxVQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDckUsVUFBSSxvQkFBb0IsSUFBSSxJQUFJLEVBQUU7QUFDaEMsaUNBQVUsb0JBQW9CLGFBQVUsS0FBSyxhQUFhLENBQUMsQ0FBQztBQUM1RCxlQUFPLG9CQUFvQixDQUFDLFFBQVEsQ0FBQztPQUN0Qzs7QUFFRCxVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0FBQ3BDLFVBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7QUFFckIsVUFBTSxZQUFZLEdBQUc7QUFDbkIscUJBQVcsYUFBYTtBQUN4QixnQkFBUSxFQUFFLFFBQVE7QUFDbEIsY0FBTSxFQUFOLE1BQU07T0FDUCxDQUFDOztBQUVGLFVBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3BELFVBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDOztBQUV0RCxhQUFPLFFBQVEsQ0FBQztLQUNqQjs7O1dBRWMseUJBQUMsU0FBaUIsRUFBRSxZQUF5QixFQUFRO0FBQ2xFLFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztLQUNsRDs7O1dBRWlCLDRCQUFDLFNBQWlCLEVBQWdCO0FBQ2xELFVBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3hELFVBQUksWUFBWSxJQUFJLElBQUksRUFBRTtBQUN4QixZQUFJLENBQUMsY0FBYyxVQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDdkM7QUFDRCxhQUFPLFlBQVksQ0FBQztLQUNyQjs7Ozs7NkJBR1ksYUFBa0I7OztBQUM3QixVQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZELFlBQU0sQ0FBQyxJQUFJLGdCQUFjLEdBQUcsQ0FBQyxNQUFNLG9CQUFpQixDQUFDOztBQUVyRCxZQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsbUJBQUMsV0FBTSxFQUFFLEVBQUk7QUFDcEMsWUFBSTtBQUNGLGdCQUFNLE1BQUssYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQzlCLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixnQkFBTSxDQUFDLEtBQUssdUNBQXVDLENBQUMsQ0FBQyxDQUFDO1NBQ3ZEO09BQ0YsRUFBQyxDQUFDLENBQUM7O0FBRUosVUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDN0QsWUFBTSxDQUFDLElBQUksZ0JBQWMsYUFBYSxDQUFDLE1BQU0sb0JBQWlCLENBQUM7QUFDL0QsV0FBSyxJQUFNLEdBQUUsSUFBSSxhQUFhLEVBQUU7QUFDOUIsWUFBSTtBQUNGLGNBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFFLENBQUMsQ0FBQztTQUM5QixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsZ0JBQU0sQ0FBQyxLQUFLLGlDQUFpQyxDQUFDLENBQUMsQ0FBQztTQUNqRDtPQUNGO0tBQ0Y7OztTQXRHVSxjQUFjIiwiZmlsZSI6Ik9iamVjdFJlZ2lzdHJ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG50eXBlIE9iamVjdFJlZ2lzdHJhdGlvbiA9IHtcbiAgaW50ZXJmYWNlOiBzdHJpbmc7XG4gIHJlbW90ZUlkOiBudW1iZXI7XG4gIG9iamVjdDogUmVtb3RlT2JqZWN0O1xufTtcblxuLy8gQWxsIHJlbW90YWJsZSBvYmplY3RzIGhhdmUgc29tZSBzZXQgb2YgbmFtZWQgZnVuY3Rpb25zLFxuLy8gYW5kIHRoZXkgYWxzbyBoYXZlIGEgZGlzcG9zZSBtZXRob2QuXG5leHBvcnQgdHlwZSBSZW1vdGVPYmplY3QgPSB7XG4gIFtpZDpzdHJpbmddOiBGdW5jdGlvbjtcbiAgZGlzcG9zZTogKCkgPT4gdm9pZDtcbn07XG5cbi8vIEhhbmRsZXMgbGlmZXRpbWVzIG9mIG1hcnNoYWxsaW5nIHdyYXBwZXJzIHJlbW90ZSBvYmplY3RzLlxuZXhwb3J0IGNsYXNzIE9iamVjdFJlZ2lzdHJ5IHtcbiAgX3JlZ2lzdHJhdGlvbnNCeUlkOiBNYXA8bnVtYmVyLCBPYmplY3RSZWdpc3RyYXRpb24+O1xuICBfcmVnaXN0cmF0aW9uc0J5T2JqZWN0OiBNYXA8UmVtb3RlT2JqZWN0LCBPYmplY3RSZWdpc3RyYXRpb24+O1xuICBfbmV4dE9iamVjdElkOiBudW1iZXI7XG4gIF9zdWJzY3JpcHRpb25zOiBNYXA8bnVtYmVyLCBJRGlzcG9zYWJsZT47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fbmV4dE9iamVjdElkID0gMTtcbiAgICB0aGlzLl9yZWdpc3RyYXRpb25zQnlJZCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9yZWdpc3RyYXRpb25zQnlPYmplY3QgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIGdldChyZW1vdGVJZDogbnVtYmVyKTogUmVtb3RlT2JqZWN0IHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0UmVnaXN0cmF0aW9uKHJlbW90ZUlkKS5vYmplY3Q7XG4gIH1cblxuICBfZ2V0UmVnaXN0cmF0aW9uKHJlbW90ZUlkOiBudW1iZXIpOiBPYmplY3RSZWdpc3RyYXRpb24ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3JlZ2lzdHJhdGlvbnNCeUlkLmdldChyZW1vdGVJZCk7XG4gICAgaW52YXJpYW50KHJlc3VsdCAhPSBudWxsKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZ2V0SW50ZXJmYWNlKHJlbW90ZUlkOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9nZXRSZWdpc3RyYXRpb24ocmVtb3RlSWQpLmludGVyZmFjZTtcbiAgfVxuXG4gIGFzeW5jIGRpc3Bvc2VPYmplY3QocmVtb3RlSWQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJlZ2lzdHJhdGlvbiA9IHRoaXMuX2dldFJlZ2lzdHJhdGlvbihyZW1vdGVJZCk7XG4gICAgY29uc3Qgb2JqZWN0ID0gcmVnaXN0cmF0aW9uLm9iamVjdDtcblxuICAgIHRoaXMuX3JlZ2lzdHJhdGlvbnNCeUlkLmRlbGV0ZShyZW1vdGVJZCk7XG4gICAgdGhpcy5fcmVnaXN0cmF0aW9uc0J5T2JqZWN0LmRlbGV0ZShvYmplY3QpO1xuXG4gICAgLy8gQ2FsbCB0aGUgb2JqZWN0J3MgbG9jYWwgZGlzcG9zZSBmdW5jdGlvbi5cbiAgICBhd2FpdCBvYmplY3QuZGlzcG9zZSgpO1xuICB9XG5cbiAgZGlzcG9zZVN1YnNjcmlwdGlvbihyZXF1ZXN0SWQ6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMucmVtb3ZlU3Vic2NyaXB0aW9uKHJlcXVlc3RJZCk7XG4gICAgaWYgKHN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFB1dCB0aGUgb2JqZWN0IGluIHRoZSByZWdpc3RyeS5cbiAgYWRkKGludGVyZmFjZU5hbWU6IHN0cmluZywgb2JqZWN0OiBPYmplY3QpOiBudW1iZXIge1xuICAgIGNvbnN0IGV4aXN0aW5nUmVnaXN0cmF0aW9uID0gdGhpcy5fcmVnaXN0cmF0aW9uc0J5T2JqZWN0LmdldChvYmplY3QpO1xuICAgIGlmIChleGlzdGluZ1JlZ2lzdHJhdGlvbiAhPSBudWxsKSB7XG4gICAgICBpbnZhcmlhbnQoZXhpc3RpbmdSZWdpc3RyYXRpb24uaW50ZXJmYWNlID09PSBpbnRlcmZhY2VOYW1lKTtcbiAgICAgIHJldHVybiBleGlzdGluZ1JlZ2lzdHJhdGlvbi5yZW1vdGVJZDtcbiAgICB9XG5cbiAgICBjb25zdCBvYmplY3RJZCA9IHRoaXMuX25leHRPYmplY3RJZDtcbiAgICB0aGlzLl9uZXh0T2JqZWN0SWQrKztcblxuICAgIGNvbnN0IHJlZ2lzdHJhdGlvbiA9IHtcbiAgICAgIGludGVyZmFjZTogaW50ZXJmYWNlTmFtZSxcbiAgICAgIHJlbW90ZUlkOiBvYmplY3RJZCxcbiAgICAgIG9iamVjdCxcbiAgICB9O1xuXG4gICAgdGhpcy5fcmVnaXN0cmF0aW9uc0J5SWQuc2V0KG9iamVjdElkLCByZWdpc3RyYXRpb24pO1xuICAgIHRoaXMuX3JlZ2lzdHJhdGlvbnNCeU9iamVjdC5zZXQob2JqZWN0LCByZWdpc3RyYXRpb24pO1xuXG4gICAgcmV0dXJuIG9iamVjdElkO1xuICB9XG5cbiAgYWRkU3Vic2NyaXB0aW9uKHJlcXVlc3RJZDogbnVtYmVyLCBzdWJzY3JpcHRpb246IElEaXNwb3NhYmxlKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5zZXQocmVxdWVzdElkLCBzdWJzY3JpcHRpb24pO1xuICB9XG5cbiAgcmVtb3ZlU3Vic2NyaXB0aW9uKHJlcXVlc3RJZDogbnVtYmVyKTogP0lEaXNwb3NhYmxlIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9zdWJzY3JpcHRpb25zLmdldChyZXF1ZXN0SWQpO1xuICAgIGlmIChzdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1YnNjcmlwdGlvbjtcbiAgfVxuXG4gIC8vIERpc3Bvc2VzIGFsbCBvYmplY3QgaW4gdGhlIHJlZ2lzdHJ5XG4gIGFzeW5jIGRpc3Bvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgaWRzID0gQXJyYXkuZnJvbSh0aGlzLl9yZWdpc3RyYXRpb25zQnlJZC5rZXlzKCkpO1xuICAgIGxvZ2dlci5pbmZvKGBEaXNwb3NpbmcgJHtpZHMubGVuZ3RofSByZWdpc3RyYXRpb25zYCk7XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChpZHMubWFwKGFzeW5jIGlkID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMuZGlzcG9zZU9iamVjdChpZCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihgRXJyb3IgZGlzcG9zaW5nIG1hcnNoYWxsZWQgb2JqZWN0LmAsIGUpO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBBcnJheS5mcm9tKHRoaXMuX3N1YnNjcmlwdGlvbnMua2V5cygpKTtcbiAgICBsb2dnZXIuaW5mbyhgRGlzcG9zaW5nICR7c3Vic2NyaXB0aW9ucy5sZW5ndGh9IHN1YnNjcmlwdGlvbnNgKTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIHN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuZGlzcG9zZVN1YnNjcmlwdGlvbihpZCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihgRXJyb3IgZGlzcG9zaW5nIHN1YnNjcmlwdGlvbmAsIGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19