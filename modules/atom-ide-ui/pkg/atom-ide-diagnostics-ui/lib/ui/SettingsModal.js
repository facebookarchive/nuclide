/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import * as React from 'react';
import BoundSettingsControl from 'nuclide-commons-ui/BoundSettingsControl';

type Props = {
  config: Array<SettingsSectionProps>,
};

type SettingsSectionProps = {
  providerName: string,
  settings: Array<string>,
};

export default function SettingsModal(props: Props): ?React.Element<any> {
  return (
    <div className="settings-view">
      {props.config.map(p => <SettingsSection key={p.providerName} {...p} />)}
    </div>
  );
}

function SettingsSection(props: SettingsSectionProps): ?React.Element<any> {
  return (
    <section className="settings-panel">
      <h1 className="section-heading">{props.providerName}</h1>
      {props.settings.map(keyPath => (
        <BoundSettingsControl key={keyPath} keyPath={keyPath} />
      ))}
    </section>
  );
}
