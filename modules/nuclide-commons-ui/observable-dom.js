'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.ResizeObservable = exports.PerformanceObservable = exports.MutationObservable = exports.IntersectionObservable = exports._DOMObserverObservable = undefined;















var _os = _interopRequireDefault(require('os'));
var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _shallowequal;
function _load_shallowequal() {return _shallowequal = _interopRequireDefault(require('shallowequal'));}var _collection;
function _load_collection() {return _collection = require('../nuclide-commons/collection');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

/**
                                                                                                                                                                                           * Creates an observable sequence from a DOM-style Observer.
                                                                                                                                                                                           *
                                                                                                                                                                                           * **Use this sparingly: prefer to use the extended, specialized classes below
                                                                                                                                                                                           *   or add a new one below when a new DOM-style Observer comes along*
                                                                                                                                                                                           *
                                                                                                                                                                                           * Emits the same array or EntryList (as with PerformanceObservers) as the
                                                                                                                                                                                           * original DOM Observable.
                                                                                                                                                                                           *
                                                                                                                                                                                           * Known to work with DOM `MutationObserver`, `IntersectionObserver`,
                                                                                                                                                                                           * `ResizeObserver`, and `PerformanceObserver`
                                                                                                                                                                                           *
                                                                                                                                                                                           * A DOM-style Observer is defined as implementing the `DOMObserver` interface
                                                                                                                                                                                           * below. Here's an example with `MutationObserver`:
                                                                                                                                                                                           *
                                                                                                                                                                                           *   const mutations = DOMObserverObservable.create(
                                                                                                                                                                                           *    MutationObserver,
                                                                                                                                                                                           *    document.getElementById('bar'),
                                                                                                                                                                                           *    { attributes: true, childList: true, characterData: true }
                                                                                                                                                                                           *   );
                                                                                                                                                                                           *
                                                                                                                                                                                           *   mutations.subscribe(record => console.log(record));
                                                                                                                                                                                           *
                                                                                                                                                                                           * This emits and logs each batch of MutationRecords unmodified as an array. To
                                                                                                                                                                                           * emit and log each record individually on the observable, call
                                                                                                                                                                                           * `.flattenEntries()` before subscribing:
                                                                                                                                                                                           *
                                                                                                                                                                                           *   const mutations = DOMObserverObservable.create(
                                                                                                                                                                                           *    MutationObserver,
                                                                                                                                                                                           *    document.getElementById('bar'),
                                                                                                                                                                                           *    { attributes: true, childList: true, characterData: true }
                                                                                                                                                                                           *   ).flattenEntries();
                                                                                                                                                                                           *
                                                                                                                                                                                           *   mutations.subscribe(record => console.log(record));
                                                                                                                                                                                           *
                                                                                                                                                                                           * This results in MutationRecord objects emitted *individually* and
                                                                                                                                                                                           * synchonrously every time a mutation occurs.
                                                                                                                                                                                           *
                                                                                                                                                                                           * To add additional observations to the observable, use `observe`:
                                                                                                                                                                                           *
                                                                                                                                                                                           *   const mutations = DOMObserverObservable.create(MutationObserver)
                                                                                                                                                                                           *      .observe(
                                                                                                                                                                                           *        document.getElementById('bar'),
                                                                                                                                                                                           *        {attributes: true, childList: true, characterData: true}
                                                                                                                                                                                           *      )
                                                                                                                                                                                           *      .observe(
                                                                                                                                                                                           *        document.getElementById('bar'),
                                                                                                                                                                                           *        {attributes: true}
                                                                                                                                                                                           *      )
                                                                                                                                                                                           *      .flattenEntries();
                                                                                                                                                                                           *
                                                                                                                                                                                           *   mutations.subscribe(record => console.log(record));
                                                                                                                                                                                           */

// $FlowFixMe(>=0.55.0) Flow suppress








class DOMObserverObservable extends _rxjsBundlesRxMinJs.Observable



{





  constructor(
  DOMObserverCtor,
  ...observeArgs)
  {
    super();this._observations = [];this._refs = 0;
    this._DOMObserverCtor = DOMObserverCtor;
    if (observeArgs.length > 0) {
      this.observe(...observeArgs);
    }
  }

  lift(operator) {
    const Constructor = this.constructor;
    const [firstObservation, ...restObservations] = this._observations;
    const obs = new Constructor(this._DOMObserverCtor, ...firstObservation);
    for (const observation of restObservations) {
      obs.observe(...observation);
    }
    obs.source = this;
    obs.operator = operator;
    return obs;
  }

  observe(...observeArgs) {
    this._observations.push(observeArgs);

    if (this._domObserver != null) {
      this._domObserver.observe(...observeArgs);
    }
  }

  unobserve(...unobserveArgs) {
    if (this._domObserver != null && this._domObserver.unobserve == null) {
      throw new Error(
      `Cannot unobserve: This observable has an active ${
      this._DOMObserverCtor.name
      } and it does not support unobserve`);

    }

    for (let i = 0; i < this._observations.length; i++) {
      if ((0, (_shallowequal || _load_shallowequal()).default)(this._observations[i], unobserveArgs)) {
        this._observations.splice(i, 1);
        break;
      }
    }

    if (this._domObserver != null && this._domObserver.unobserve != null) {
      this._domObserver.unobserve(...unobserveArgs);
    }
  }

  flattenEntries() {
    return this.mergeMap(records => {
      if ((0, (_collection || _load_collection()).isIterable)(records)) {
        // $FlowFixMe
        return _rxjsBundlesRxMinJs.Observable.from(records);
        // $FlowFixMe
      } else if (typeof records.getEntries === 'function') {
        return _rxjsBundlesRxMinJs.Observable.from(records.getEntries());
      }

      return _rxjsBundlesRxMinJs.Observable.throw(
      new Error(
      'Tried to merge DOM Observer entries, but they were not iterable nor were they an EntryList.'));


    });
  }

  _subscribe(subscriber) {
    if (this._refs === 0) {if (!(
      this._domObserver == null)) {throw new Error('Invariant violation: "this._domObserver == null"');}
      this._domObserver = new this._DOMObserverCtor(records => {
        subscriber.next(records);
      });

      for (const observation of this._observations) {
        this._domObserver.observe(...observation);
      }
    }

    const subscription = new _rxjsBundlesRxMinJs.Subscription();
    this._refs++;
    subscription.add(() => {
      this._refs--;

      // the underlying observer should only disconnect when all subscribers have
      // unsubscribed
      if (this._refs === 0) {if (!(
        this._domObserver != null)) {throw new Error('Invariant violation: "this._domObserver != null"');}
        this._domObserver.disconnect();
        this._domObserver = null;
      }
    });

    return subscription;
  }} /**
      * Copyright (c) 2017-present, Facebook, Inc.
      * All rights reserved.
      *
      * This source code is licensed under the BSD-style license found in the
      * LICENSE file in the root directory of this source tree. An additional grant
      * of patent rights can be found in the PATENTS file in the same directory.
      *
      * 
      * @format
      */ /* eslint-env browser */ /* global IntersectionObserver, PerformanceObserver, ResizeObserver, DOMRect */const _DOMObserverObservable = exports._DOMObserverObservable = DOMObserverObservable; /**
                                                                                                                                                                                                         * Returns an RxJS Observable that wraps an IntersectionObserver
                                                                                                                                                                                                         */class IntersectionObservable extends DOMObserverObservable {
  constructor(target) {if (!(

    // eslint-disable-next-line eqeqeq
    global.IntersectionObserver !== null)) {throw new Error(
      'environment must contain IntersectionObserver');}

    // $FlowFixMe(>=0.55.0) Flow suppress
    super(IntersectionObserver, target);
  }}exports.IntersectionObservable = IntersectionObservable;


/**
                                                              * Returns an RxJS Observable that wraps a MutationObserver
                                                              */
class MutationObservable extends DOMObserverObservable




{
  constructor(target, options) {if (!(

    // eslint-disable-next-line eqeqeq
    global.MutationObserver !== null)) {throw new Error(
      'environment must contain MutationObserver');}

    // $FlowFixMe(>=0.55.0) Flow suppress
    super(MutationObserver, target);
  }}exports.MutationObservable = MutationObservable;


/**
                                                      * Returns an RxJS Observable that wraps a PerformanceObserver
                                                      */
class PerformanceObservable extends DOMObserverObservable



{
  constructor(options) {if (!(

    // eslint-disable-next-line eqeqeq
    global.PerformanceObserver !== null)) {throw new Error(
      'environment must contain PerformanceObserver');}

    // $FlowFixMe(>=0.55.0) Flow suppress
    super(PerformanceObserver, options);
  }}exports.PerformanceObservable = PerformanceObservable;


/**
                                                            * Returns an RxJS Observable that wraps a ResizeObserver
                                                            */
class ResizeObservable extends DOMObserverObservable



{
  constructor(target) {if (!(

    // eslint-disable-next-line eqeqeq
    global.ResizeObserver !== null)) {throw new Error(
      'environment must contain ResizeObserver');}


    if (_os.default.platform() === 'win32' || _os.default.platform() === 'linux') {
      super(WindowsResizeMeasurementPatchingObserver, target);
    } else {
      // $FlowFixMe(>=0.55.0) Flow suppress
      super(ResizeObserver, target);
    }
  }}exports.ResizeObservable = ResizeObservable;


function lastRectPerTarget(
entries)
{
  const rectMap = new Map();
  entries.forEach(entry => rectMap.set(entry.target, entry.contentRect));
  return rectMap;
}

function remeasureContentRect(
element,
contentRect)
{
  const { clientHeight, clientWidth } = element;

  // Client height/width include padding
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth
  // We have to strip it to obtain result similar to what the original computed style provided
  const computedStyle = window.getComputedStyle(element);
  const { paddingLeft, paddingRight, paddingTop, paddingBottom } = computedStyle;

  const height =
  clientHeight - parseFloat(paddingTop) - parseFloat(paddingBottom);
  const width =
  clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight);

  return new DOMRect(contentRect.x, contentRect.y, width, height);
}

/*
   * The values provided by the ResizeOverver on Windows do not seem to reflect the actual size
   * of the element (!!!), so we need to "fix" them before passing on to the downstream subscriber
   * We're wrapping the ResizeObserver instance and are patching the last result of the array with
   * a set of custom measured values
   */
class WindowsResizeMeasurementPatchingObserver {


  constructor(callback, ...rest) {
    const remeasuringCallback = entries => {
      const rebuiltEntries = [];
      const mappedRects = lastRectPerTarget(entries);
      mappedRects.forEach((originalRect, target) => {
        const contentRect = remeasureContentRect(target, originalRect);
        rebuiltEntries.push({ target, contentRect });
      });

      callback(rebuiltEntries);
    };
    this._resizeObserver = new ResizeObserver(remeasuringCallback, ...rest);

    // To make flow happy
    return this;
  }

  observe(...observeArgs) {
    this._resizeObserver.observe(...observeArgs);
  }

  disconnect() {
    this._resizeObserver.disconnect();
  }

  unobserve(...unobserveArgs) {
    if (typeof this._resizeObserver.unobserve === 'function') {
      this._resizeObserver.unobserve(...unobserveArgs);
    }
  }}