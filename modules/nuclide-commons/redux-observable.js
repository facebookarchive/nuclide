'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ActionsObservable = undefined;
exports.combineEpics = combineEpics;
exports.createEpicMiddleware = createEpicMiddleware;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

// This should be { type: readonly string } when we get readonly props. Because this is used with
// disjoint unions we can't use `string` here due to mutation concerns. Flow doesn't know that we
// aren't going to mutate the objects with a random string value so it can't allow us to pass a
// specific action type into something of type { type: string }
function combineEpics(...epics) {
  return (actions, store, extra) => {
    const streams = epics.map(epic => epic(actions, store, extra));
    return _rxjsBundlesRxMinJs.Observable.merge(...streams);
  };
} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * 
   * @format
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

function createEpicMiddleware(rootEpic) {
  const actions = new _rxjsBundlesRxMinJs.Subject();
  const actionsObs = new ActionsObservable(actions);

  return store => next => {
    if (rootEpic != null) {
      rootEpic(actionsObs, store).subscribe(store.dispatch);
    }
    return action => {
      const result = next(action);
      actions.next(action);
      return result;
    };
  };
}

class ActionsObservable extends _rxjsBundlesRxMinJs.Observable {

  constructor(actionsSubject) {
    super();
    this.source = actionsSubject;
  }

  lift(operator) {
    const observable = new ActionsObservable(this);
    observable.operator = operator;
    return observable;
  }

  ofType(...keys) {
    const result = this.filter(({ type }) => {
      const len = keys.length;
      if (len === 1) {
        return type === keys[0];
      } else {
        for (let i = 0; i < len; i++) {
          if (keys[i] === type) {
            return true;
          }
        }
      }
      return false;
    });
    return result;
  }
}
exports.ActionsObservable = ActionsObservable;