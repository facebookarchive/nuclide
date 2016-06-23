'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {observableToBuildTaskInfo} from '../observableToBuildTaskInfo';
import invariant from 'assert';
import {Observable, Subscription, Subject} from 'rxjs';

describe('observableToBuildTaskInfo', () => {

  it('subscribes when the function is called', () => {
    const events = Observable.never();
    spyOn(events, 'subscribe').andCallThrough();
    observableToBuildTaskInfo(events);
    expect(events.subscribe).toHaveBeenCalled();
  });

  it('unsubscribes when TaskInfo.cancel is called', () => {
    const events = Observable.never();
    const sub = new Subscription();
    spyOn(events, 'subscribe').andReturn(sub);
    spyOn(sub, 'unsubscribe').andCallThrough();
    const taskInfo = observableToBuildTaskInfo(events);
    expect(sub.unsubscribe).not.toHaveBeenCalled();
    taskInfo.cancel();
    expect(sub.unsubscribe).toHaveBeenCalled();
  });

  it('relays progress events', () => {
    const events = new Subject();
    const taskInfo = observableToBuildTaskInfo(events);
    const spy = jasmine.createSpy();
    invariant(taskInfo.observeProgress != null);
    taskInfo.observeProgress(spy);
    events.next({kind: 'progress', progress: null});
    events.next({kind: 'progress', progress: 0});
    events.next({kind: 'progress', progress: 0.5});
    events.next({kind: 'progress', progress: 1});
    expect(spy.calls.map(call => call.args[0])).toEqual([null, 0, 0.5, 1]);
  });

});
