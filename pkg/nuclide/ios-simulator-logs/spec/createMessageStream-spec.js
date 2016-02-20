'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import featureConfig from '../../feature-config';
import {createMessageStream} from '../lib/createMessageStream';
import Rx from 'rx';

describe('createMessageStream', () => {

  beforeEach(() => {
    const config = require('../package.json').nuclide.config;
    // $UPFixMe: With UP, the default settings are set by the loader, but I don't have a good way to
    // do that just for tests (yet).
    Object.keys(config).forEach(k =>
      featureConfig.setSchema(`nuclide-ios-simulator-logs.${k}`, config[k])
    );
  });

  it('splits the output by record', () => {
    waitsForPromise(async () => {
      const output$ = Rx.Observable.from(OUTPUT_LINES);
      const message$ = createMessageStream(output$)
        .map(message => message.text)
        .toArray();

      const messages = await message$.toPromise();
      expect(messages).toEqual([
        'Message 1',
        'Message 2',
      ]);
    });
  });

});

const OUTPUT_LINES = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
  '<plist version="1.0">',
  '<array>',
  '  <dict>',
  '    <key>ASLMessageID</key>',
  '    <string>54706</string>',
  '    <key>Time</key>',
  '    <string>Feb 17 12:52:17</string>',
  '    <key>TimeNanoSec</key>',
  '    <string>469585000</string>',
  '    <key>Level</key>',
  '    <string>2</string>',
  '    <key>PID</key>',
  '    <string>38152</string>',
  '    <key>UID</key>',
  '    <string>1507447745</string>',
  '    <key>GID</key>',
  '    <string>1876110778</string>',
  '    <key>ReadGID</key>',
  '    <string>80</string>',
  '    <key>Host</key>',
  '    <string>matthewwith-mbp</string>',
  '    <key>Sender</key>',
  '    <string>UIExplorer</string>',
  '    <key>Facility</key>',
  '    <string>user</string>',
  '    <key>Message</key>',
  '    <string>Message 1</string>',
  '    <key>ASLSHIM</key>',
  '    <string>1</string>',
  '    <key>SenderMachUUID</key>',
  '    <string>09F5C0C0-7587-39E8-A92E-7B130965D76C</string>',
  '  </dict>',
  '</array>',
  '</plist>',
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
  '<plist version="1.0">',
  '<array>',
  '  <dict>',
  '    <key>ASLMessageID</key>',
  '    <string>54706</string>',
  '    <key>Time</key>',
  '    <string>Feb 17 12:52:17</string>',
  '    <key>TimeNanoSec</key>',
  '    <string>469585000</string>',
  '    <key>Level</key>',
  '    <string>2</string>',
  '    <key>PID</key>',
  '    <string>38152</string>',
  '    <key>UID</key>',
  '    <string>1507447745</string>',
  '    <key>GID</key>',
  '    <string>1876110778</string>',
  '    <key>ReadGID</key>',
  '    <string>80</string>',
  '    <key>Host</key>',
  '    <string>matthewwith-mbp</string>',
  '    <key>Sender</key>',
  '    <string>UIExplorer</string>',
  '    <key>Facility</key>',
  '    <string>user</string>',
  '    <key>Message</key>',
  '    <string>Message 2</string>',
  '    <key>ASLSHIM</key>',
  '    <string>1</string>',
  '    <key>SenderMachUUID</key>',
  '    <string>09F5C0C0-7587-39E8-A92E-7B130965D76C</string>',
  '  </dict>',
  '</array>',
  '</plist>',
];
