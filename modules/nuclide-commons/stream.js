'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeStream = observeStream;
exports.observeRawStream = observeRawStream;
exports.writeToStream = writeToStream;

var _stream = _interopRequireDefault(require('stream'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('./UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('./event');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Observe a stream like stdout or stderr.
 */
/**
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

function observeStream(stream) {
  return observeRawStream(stream).map(data => data.toString());
}

function observeRawStream(stream) {
  const error = _rxjsBundlesRxMinJs.Observable.fromEvent(stream, 'error').flatMap(_rxjsBundlesRxMinJs.Observable.throw);
  return _rxjsBundlesRxMinJs.Observable.fromEvent(stream, 'data').merge(error).takeUntil(_rxjsBundlesRxMinJs.Observable.fromEvent(stream, 'end'));
}

/**
 * Write an observed readable stream into a writeable stream. Effectively a pipe() for observables.
 * Returns an observable accumulating the number of bytes processed.
 */
function writeToStream(source, destStream) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    let byteCount = 0;

    const byteCounterStream = new _stream.default.Transform({
      transform(chunk, encoding, cb) {
        byteCount += chunk.byteLength;
        observer.next(byteCount);
        cb(null, chunk);
      }
    });

    byteCounterStream.pipe(destStream);

    return new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_event || _load_event()).attachEvent)(destStream, 'error', err => {
      observer.error(err);
    }), (0, (_event || _load_event()).attachEvent)(destStream, 'close', () => {
      observer.complete();
    }), source.subscribe(buffer => {
      byteCounterStream.write(buffer);
    }, err => {
      observer.error(err);
    }, () => {
      byteCounterStream.end();
    }));
  }).share();
}