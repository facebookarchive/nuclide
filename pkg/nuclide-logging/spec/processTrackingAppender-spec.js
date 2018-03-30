/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import log4js from 'log4js';
import {runCommand, LOG_CATEGORY} from 'nuclide-commons/process';

describe('processTrackingAppender', () => {
  it('captures process exits', () => {
    waitsForPromise(async () => {
      const trackSpy = spyOn(
        require('nuclide-commons/analytics'),
        'trackSampled',
      );
      log4js.configure({
        appenders: [
          {
            type: require.resolve('../lib/processTrackingAppender'),
            category: LOG_CATEGORY,
          },
        ],
      });

      await runCommand('true', ['1']).toPromise();

      expect(trackSpy).toHaveBeenCalledWith('process-exit', 10, {
        command: 'true 1',
        duration: jasmine.any(Number),
      });
    });
  });
});
