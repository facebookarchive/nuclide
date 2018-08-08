"use strict";

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _createMessageStream() {
  const data = _interopRequireDefault(require("../lib/createMessageStream"));

  _createMessageStream = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
describe('createMessageStream', () => {
  it('splits the output by message', async () => {
    const original = _featureConfig().default.observeAsStream.bind(_featureConfig().default);

    jest.spyOn(_featureConfig().default, 'observeAsStream').mockImplementation(name => name === 'nuclide-adb-logcat.whitelistedTags' ? _RxMin.Observable.of('.*') : original(name));

    const output = _RxMin.Observable.from(['[ 01-14 17:15:01.003   640:  654 I/ProcessStatsService ]', 'Prepared write state in 0ms', '', '[ 01-14 17:15:01.003   640:  654 I/ProcessStatsService ]', 'Prepared write state in 0ms', '']);

    const messages = await (0, _createMessageStream().default)(output).map(message => message.text).toArray().toPromise();
    expect(messages.length).toBe(2);
    messages.forEach(message => {
      expect(message).toBe('Prepared write state in 0ms');
    });
  });
  it('only includes messages with whitelisted tags', async () => {
    const original = _featureConfig().default.observeAsStream.bind(_featureConfig().default);

    jest.spyOn(_featureConfig().default, 'observeAsStream').mockImplementation(name => name === 'nuclide-adb-logcat.whitelistedTags' ? _RxMin.Observable.of('ExampleTag') : original(name));

    const output = _RxMin.Observable.from(['[ 01-14 17:15:01.003   640:  654 I/ProcessStatsService ]', 'Bad', '', '[ 01-14 17:15:01.003   640:  654 I/ExampleTag ]', 'Good', '']);

    const messages = await (0, _createMessageStream().default)(output).map(message => message.text).toArray().toPromise();
    expect(messages).toEqual(['Good']);
  });
  it('shows an error (once) if the regular expression is invalid', async () => {
    jest.spyOn(atom.notifications, 'addError').mockImplementation(() => {});

    const original = _featureConfig().default.observeAsStream.bind(_featureConfig().default);

    jest.spyOn(_featureConfig().default, 'observeAsStream').mockImplementation(name => name === 'nuclide-adb-logcat.whitelistedTags' ? _RxMin.Observable.of('(') : original(name));

    const output = _RxMin.Observable.from(['[ 01-14 17:15:01.003   640:  654 I/ProcessStatsService ]', 'Bad', '', '[ 01-14 17:15:01.003   640:  654 I/ExampleTag ]', 'Good', '']);

    await (0, _createMessageStream().default)(output).toPromise();
    expect(atom.notifications.addError.mock.calls.length).toBe(1);
  });
});