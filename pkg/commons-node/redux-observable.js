Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.combineEpics = combineEpics;
exports.createEpicMiddleware = createEpicMiddleware;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Derived from <https://github.com/redux-observable/redux-observable/> because their version
// imports an Rx operator module and we use a bundle. Original license follows:
//
// The MIT License (MIT)
//
// Copyright (c) 2016 Ben Lesh
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

// This should be { type: readonly string } when we get readonly props. Because this is used with
// disjoint unions we can't use `string` here due to mutation concerns. Flow doesn't know that we
// aren't going to mutate the objects with a random string value so it can't allow us to pass a
// specific action type into something of type { type: string }

function combineEpics() {
  for (var _len = arguments.length, epics = Array(_len), _key = 0; _key < _len; _key++) {
    epics[_key] = arguments[_key];
  }

  return function (actions, store) {
    var _Observable2;

    var streams = epics.map(function (epic) {
      return epic(actions, store);
    });
    return (_Observable2 = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable).merge.apply(_Observable2, _toConsumableArray(streams));
  };
}

function createEpicMiddleware(rootEpic) {
  var actions = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Subject();
  var actionsObs = new ActionsObservable(actions);

  return function (store) {
    return function (next) {
      if (rootEpic != null) {
        rootEpic(actionsObs, store).subscribe(store.dispatch);
      }
      return function (action) {
        var result = next(action);
        actions.next(action);
        return result;
      };
    };
  };
}

var ActionsObservable = (function (_Observable) {
  _inherits(ActionsObservable, _Observable);

  function ActionsObservable(actionsSubject) {
    _classCallCheck(this, ActionsObservable);

    _get(Object.getPrototypeOf(ActionsObservable.prototype), 'constructor', this).call(this);
    this.source = actionsSubject;
  }

  _createClass(ActionsObservable, [{
    key: 'lift',
    value: function lift(operator) {
      var observable = new ActionsObservable(this);
      observable.operator = operator;
      return observable;
    }
  }, {
    key: 'ofType',
    value: function ofType() {
      for (var _len2 = arguments.length, keys = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        keys[_key2] = arguments[_key2];
      }

      var result = this.filter(function (_ref) {
        var type = _ref.type;

        var len = keys.length;
        if (len === 1) {
          return type === keys[0];
        } else {
          for (var i = 0; i < len; i++) {
            if (keys[i] === type) {
              return true;
            }
          }
        }
        return false;
      });
      return result;
    }
  }]);

  return ActionsObservable;
})((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable);

exports.ActionsObservable = ActionsObservable;