'use strict';

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _createMessageStream;

function _load_createMessageStream() {
  return _createMessageStream = _interopRequireDefault(require('../lib/createMessageStream'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('createMessageStream', () => {
  it('splits the output by message', async () => {
    const original = (_featureConfig || _load_featureConfig()).default.observeAsStream.bind((_featureConfig || _load_featureConfig()).default);
    jest.spyOn((_featureConfig || _load_featureConfig()).default, 'observeAsStream').mockImplementation(name => name === 'nuclide-adb-logcat.whitelistedTags' ? _rxjsBundlesRxMinJs.Observable.of('.*') : original(name));

    await (async () => {
      const output = _rxjsBundlesRxMinJs.Observable.from(['[ 01-14 17:15:01.003   640:  654 I/ProcessStatsService ]', 'Prepared write state in 0ms', '', '[ 01-14 17:15:01.003   640:  654 I/ProcessStatsService ]', 'Prepared write state in 0ms', '']);

      const messages = await (0, (_createMessageStream || _load_createMessageStream()).default)(output).map(message => message.text).toArray().toPromise();

      expect(messages.length).toBe(2);
      messages.forEach(message => {
        expect(message).toBe('Prepared write state in 0ms');
      });
    })();
  });

  it('only includes messages with whitelisted tags', async () => {
    const original = (_featureConfig || _load_featureConfig()).default.observeAsStream.bind((_featureConfig || _load_featureConfig()).default);
    jest.spyOn((_featureConfig || _load_featureConfig()).default, 'observeAsStream').mockImplementation(name => name === 'nuclide-adb-logcat.whitelistedTags' ? _rxjsBundlesRxMinJs.Observable.of('ExampleTag') : original(name));

    await (async () => {
      const output = _rxjsBundlesRxMinJs.Observable.from(['[ 01-14 17:15:01.003   640:  654 I/ProcessStatsService ]', 'Bad', '', '[ 01-14 17:15:01.003   640:  654 I/ExampleTag ]', 'Good', '']);

      const messages = await (0, (_createMessageStream || _load_createMessageStream()).default)(output).map(message => message.text).toArray().toPromise();

      expect(messages).toEqual(['Good']);
    })();
  });

  it('shows an error (once) if the regular expression is invalid', async () => {
    jest.spyOn(atom.notifications, 'addError').mockImplementation(() => {});
    const original = (_featureConfig || _load_featureConfig()).default.observeAsStream.bind((_featureConfig || _load_featureConfig()).default);
    jest.spyOn((_featureConfig || _load_featureConfig()).default, 'observeAsStream').mockImplementation(name => name === 'nuclide-adb-logcat.whitelistedTags' ? _rxjsBundlesRxMinJs.Observable.of('(') : original(name));

    await (async () => {
      const output = _rxjsBundlesRxMinJs.Observable.from(['[ 01-14 17:15:01.003   640:  654 I/ProcessStatsService ]', 'Bad', '', '[ 01-14 17:15:01.003   640:  654 I/ExampleTag ]', 'Good', '']);
      await (0, (_createMessageStream || _load_createMessageStream()).default)(output).toPromise();
      expect(atom.notifications.addError.mock.calls.length).toBe(1);
    })();
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict-local
     * @format
     */