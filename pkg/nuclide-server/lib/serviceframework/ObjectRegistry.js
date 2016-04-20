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
        subscription.unsubscribe();
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
//# sourceMappingURL=data:application/json;base64,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eS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxudHlwZSBPYmplY3RSZWdpc3RyYXRpb24gPSB7XG4gIGludGVyZmFjZTogc3RyaW5nO1xuICByZW1vdGVJZDogbnVtYmVyO1xuICBvYmplY3Q6IFJlbW90ZU9iamVjdDtcbn07XG5cbi8vIEFsbCByZW1vdGFibGUgb2JqZWN0cyBoYXZlIHNvbWUgc2V0IG9mIG5hbWVkIGZ1bmN0aW9ucyxcbi8vIGFuZCB0aGV5IGFsc28gaGF2ZSBhIGRpc3Bvc2UgbWV0aG9kLlxuZXhwb3J0IHR5cGUgUmVtb3RlT2JqZWN0ID0ge1xuICBbaWQ6c3RyaW5nXTogRnVuY3Rpb247XG4gIGRpc3Bvc2U6ICgpID0+IHZvaWQ7XG59O1xuXG4vLyBIYW5kbGVzIGxpZmV0aW1lcyBvZiBtYXJzaGFsbGluZyB3cmFwcGVycyByZW1vdGUgb2JqZWN0cy5cbmV4cG9ydCBjbGFzcyBPYmplY3RSZWdpc3RyeSB7XG4gIF9yZWdpc3RyYXRpb25zQnlJZDogTWFwPG51bWJlciwgT2JqZWN0UmVnaXN0cmF0aW9uPjtcbiAgX3JlZ2lzdHJhdGlvbnNCeU9iamVjdDogTWFwPFJlbW90ZU9iamVjdCwgT2JqZWN0UmVnaXN0cmF0aW9uPjtcbiAgX25leHRPYmplY3RJZDogbnVtYmVyO1xuICBfc3Vic2NyaXB0aW9uczogTWFwPG51bWJlciwgcngkSVN1YnNjcmlwdGlvbj47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fbmV4dE9iamVjdElkID0gMTtcbiAgICB0aGlzLl9yZWdpc3RyYXRpb25zQnlJZCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9yZWdpc3RyYXRpb25zQnlPYmplY3QgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIGdldChyZW1vdGVJZDogbnVtYmVyKTogUmVtb3RlT2JqZWN0IHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0UmVnaXN0cmF0aW9uKHJlbW90ZUlkKS5vYmplY3Q7XG4gIH1cblxuICBfZ2V0UmVnaXN0cmF0aW9uKHJlbW90ZUlkOiBudW1iZXIpOiBPYmplY3RSZWdpc3RyYXRpb24ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3JlZ2lzdHJhdGlvbnNCeUlkLmdldChyZW1vdGVJZCk7XG4gICAgaW52YXJpYW50KHJlc3VsdCAhPSBudWxsKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZ2V0SW50ZXJmYWNlKHJlbW90ZUlkOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9nZXRSZWdpc3RyYXRpb24ocmVtb3RlSWQpLmludGVyZmFjZTtcbiAgfVxuXG4gIGFzeW5jIGRpc3Bvc2VPYmplY3QocmVtb3RlSWQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJlZ2lzdHJhdGlvbiA9IHRoaXMuX2dldFJlZ2lzdHJhdGlvbihyZW1vdGVJZCk7XG4gICAgY29uc3Qgb2JqZWN0ID0gcmVnaXN0cmF0aW9uLm9iamVjdDtcblxuICAgIHRoaXMuX3JlZ2lzdHJhdGlvbnNCeUlkLmRlbGV0ZShyZW1vdGVJZCk7XG4gICAgdGhpcy5fcmVnaXN0cmF0aW9uc0J5T2JqZWN0LmRlbGV0ZShvYmplY3QpO1xuXG4gICAgLy8gQ2FsbCB0aGUgb2JqZWN0J3MgbG9jYWwgZGlzcG9zZSBmdW5jdGlvbi5cbiAgICBhd2FpdCBvYmplY3QuZGlzcG9zZSgpO1xuICB9XG5cbiAgZGlzcG9zZVN1YnNjcmlwdGlvbihyZXF1ZXN0SWQ6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMucmVtb3ZlU3Vic2NyaXB0aW9uKHJlcXVlc3RJZCk7XG4gICAgaWYgKHN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB9XG4gIH1cblxuICAvLyBQdXQgdGhlIG9iamVjdCBpbiB0aGUgcmVnaXN0cnkuXG4gIGFkZChpbnRlcmZhY2VOYW1lOiBzdHJpbmcsIG9iamVjdDogT2JqZWN0KTogbnVtYmVyIHtcbiAgICBjb25zdCBleGlzdGluZ1JlZ2lzdHJhdGlvbiA9IHRoaXMuX3JlZ2lzdHJhdGlvbnNCeU9iamVjdC5nZXQob2JqZWN0KTtcbiAgICBpZiAoZXhpc3RpbmdSZWdpc3RyYXRpb24gIT0gbnVsbCkge1xuICAgICAgaW52YXJpYW50KGV4aXN0aW5nUmVnaXN0cmF0aW9uLmludGVyZmFjZSA9PT0gaW50ZXJmYWNlTmFtZSk7XG4gICAgICByZXR1cm4gZXhpc3RpbmdSZWdpc3RyYXRpb24ucmVtb3RlSWQ7XG4gICAgfVxuXG4gICAgY29uc3Qgb2JqZWN0SWQgPSB0aGlzLl9uZXh0T2JqZWN0SWQ7XG4gICAgdGhpcy5fbmV4dE9iamVjdElkKys7XG5cbiAgICBjb25zdCByZWdpc3RyYXRpb24gPSB7XG4gICAgICBpbnRlcmZhY2U6IGludGVyZmFjZU5hbWUsXG4gICAgICByZW1vdGVJZDogb2JqZWN0SWQsXG4gICAgICBvYmplY3QsXG4gICAgfTtcblxuICAgIHRoaXMuX3JlZ2lzdHJhdGlvbnNCeUlkLnNldChvYmplY3RJZCwgcmVnaXN0cmF0aW9uKTtcbiAgICB0aGlzLl9yZWdpc3RyYXRpb25zQnlPYmplY3Quc2V0KG9iamVjdCwgcmVnaXN0cmF0aW9uKTtcblxuICAgIHJldHVybiBvYmplY3RJZDtcbiAgfVxuXG4gIGFkZFN1YnNjcmlwdGlvbihyZXF1ZXN0SWQ6IG51bWJlciwgc3Vic2NyaXB0aW9uOiByeCRJU3Vic2NyaXB0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5zZXQocmVxdWVzdElkLCBzdWJzY3JpcHRpb24pO1xuICB9XG5cbiAgcmVtb3ZlU3Vic2NyaXB0aW9uKHJlcXVlc3RJZDogbnVtYmVyKTogP3J4JElTdWJzY3JpcHRpb24ge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX3N1YnNjcmlwdGlvbnMuZ2V0KHJlcXVlc3RJZCk7XG4gICAgaWYgKHN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRlbGV0ZShyZXF1ZXN0SWQpO1xuICAgIH1cbiAgICByZXR1cm4gc3Vic2NyaXB0aW9uO1xuICB9XG5cbiAgLy8gRGlzcG9zZXMgYWxsIG9iamVjdCBpbiB0aGUgcmVnaXN0cnlcbiAgYXN5bmMgZGlzcG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBpZHMgPSBBcnJheS5mcm9tKHRoaXMuX3JlZ2lzdHJhdGlvbnNCeUlkLmtleXMoKSk7XG4gICAgbG9nZ2VyLmluZm8oYERpc3Bvc2luZyAke2lkcy5sZW5ndGh9IHJlZ2lzdHJhdGlvbnNgKTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKGlkcy5tYXAoYXN5bmMgaWQgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5kaXNwb3NlT2JqZWN0KGlkKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKGBFcnJvciBkaXNwb3NpbmcgbWFyc2hhbGxlZCBvYmplY3QuYCwgZSk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IEFycmF5LmZyb20odGhpcy5fc3Vic2NyaXB0aW9ucy5rZXlzKCkpO1xuICAgIGxvZ2dlci5pbmZvKGBEaXNwb3NpbmcgJHtzdWJzY3JpcHRpb25zLmxlbmd0aH0gc3Vic2NyaXB0aW9uc2ApO1xuICAgIGZvciAoY29uc3QgaWQgb2Ygc3Vic2NyaXB0aW9ucykge1xuICAgICAgdHJ5IHtcblxuICAgICAgICB0aGlzLmRpc3Bvc2VTdWJzY3JpcHRpb24oaWQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBsb2dnZXIuZXJyb3IoYEVycm9yIGRpc3Bvc2luZyBzdWJzY3JpcHRpb25gLCBlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==