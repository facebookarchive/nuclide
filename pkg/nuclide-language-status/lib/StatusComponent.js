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

import type {StatusData} from '../../nuclide-language-service/lib/LanguageService';
import type {LanguageStatusProvider, StatusKind} from './types';

import marked from 'marked';
import classnames from 'classnames';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Icon} from 'nuclide-commons-ui/Icon';
import * as React from 'react';
import SettingsTooltip from './SettingsTooltip';
import StatusTooltip from './StatusTooltip';

export type ServerStatus = {
  provider: LanguageStatusProvider,
  data: StatusData,
};

type Props = {
  serverStatuses: Array<ServerStatus>, // all providers relevant to this editor, plus their data
  settings: Map<LanguageStatusProvider, StatusKind>,
  onUpdateSettings: (
    newSettings: Map<LanguageStatusProvider, StatusKind>,
  ) => void,
  editor: atom$TextEditor,
};

type State = {
  hovered: boolean,
};

const kindPriorities: Array<StatusKind> = ['red', 'yellow', 'green'];

export default class StatusComponent extends React.Component<Props, State> {
  _tooltipRefs: Map<string, HTMLElement> = new Map();
  _disposables: UniversalDisposable = new UniversalDisposable();

  state: State = {
    hovered: false,
  };

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render(): React.Node {
    const {settings} = this.props;
    const statuses = this.props.serverStatuses
      .filter(status => {
        // For a status to be potentially visible, (1) the user has to have set its
        // preference to be shown (always/on-progress/on-errors), and (2) the status
        // provider must have reported a non-null status.data.kind.
        const settingKind = settings.get(status.provider);
        return (
          settingKind != null &&
          settingKind !== 'null' &&
          status.data.kind !== 'null'
        );
      })
      .map(status => {
        // A status tab will be either "visible" (because of a combination
        // of the user's preference plus the current status.data.kind) or just
        // "contingently-visible" (i.e. visible only when you hover)
        const kind = settings.get(status.provider);
        const visible =
          kindPriorities.indexOf(kind) >=
          kindPriorities.indexOf(status.data.kind);
        return [status, visible];
      })
      .sort(([a, aVisible], [b, bVisible]) => {
        // We'll sort the contingently-visible ones all to the left and the visible
        // ones to the right. That way there won't be any gaps amongst visible ones.
        // And within that, we'll sort by priority.
        if (aVisible !== bVisible) {
          return aVisible ? 1 : -1;
        } else if (a.provider.priority !== b.provider.priority) {
          return a.provider.priority - b.provider.priority;
        } else {
          return a.provider.name.localeCompare(b.provider.name);
        }
      });
    return (
      <div
        onMouseEnter={() => this.setState({hovered: true})}
        onMouseLeave={() => this.setState({hovered: false})}
        className="nuclide-language-status-container">
        {this._renderBar(statuses)}
        <div className="nuclide-language-status-providers-container">
          {this._renderSettings()}
          {statuses.map(([status, visible]) =>
            this._renderProvider(status, this.state.hovered || visible),
          )}
        </div>
      </div>
    );
  }

  _renderSettings(): React.Node {
    return (
      <div
        className="nuclide-language-status-provider nuclide-language-status-provider-settings"
        data-name="settings"
        key="settings"
        style={{opacity: this.state.hovered ? 1 : 0}}
        ref={this._setTooltipRef}>
        <Icon className="nuclide-language-status-icon" icon="gear" />
        <SettingsTooltip
          onUpdateSettings={this.props.onUpdateSettings}
          parentRef={this._tooltipRefs.get('settings')}
          providers={this.props.serverStatuses.map(
            ({provider, data}) => provider,
          )}
          settings={this.props.settings}
        />
      </div>
    );
  }

  _renderBar = (statuses: Array<[ServerStatus, boolean]>): React.Node => {
    const kind: ?StatusKind = statuses
      .map(([s, visible]) => s.data.kind)
      .sort(
        (k1, k2) => kindPriorities.indexOf(k1) - kindPriorities.indexOf(k2),
      )[0];
    return (
      <div
        className={classnames('nuclide-language-status-bar', {
          'nuclide-language-status-bar-green': kind === 'green',
          'nuclide-language-status-bar-yellow': kind === 'yellow',
          'nuclide-language-status-bar-red': kind === 'red',
        })}
      />
    );
  };

  _renderProvider = (status: ServerStatus, visible: boolean): React.Node => {
    const {provider, data} = status;

    const icon = this._renderIcon(provider);
    const progress = this._renderProgress(data);

    return (
      <div
        className={classnames(
          'nuclide-language-status-provider',
          'nuclide-language-status-provider-' + data.kind,
        )}
        data-name={status.provider.name}
        key={status.provider.name}
        style={{opacity: visible ? 1 : 0}}
        ref={this._setTooltipRef}>
        {icon}
        {progress}
        <StatusTooltip
          parentRef={this._tooltipRefs.get(status.provider.name)}
          status={status}
          editor={this.props.editor}
        />
      </div>
    );
  };

  _renderIcon(provider: LanguageStatusProvider): React.Node {
    const {icon, iconMarkdown, name} = provider;
    if (icon != null) {
      return <Icon className="nuclide-language-status-icon" icon={icon} />;
    }
    if (iconMarkdown != null) {
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: marked(iconMarkdown),
          }}
        />
      );
    }
    // Default to showing the capitalized first letter of the server's name
    return <div>{name.substr(0, 1).toUpperCase()}</div>;
  }

  _renderProgress(data: StatusData): ?string {
    if (data.kind !== 'yellow') {
      return null;
    }
    if (data.shortMessage != null) {
      return data.shortMessage;
    }
    if (data.progress != null) {
      const {numerator, denominator} = data.progress;
      return (
        Math.round(
          (numerator / (denominator == null ? 100 : denominator)) * 100,
        ) + '%'
      );
    }
    return null;
  }

  _setTooltipRef = (ref: React.ElementRef<any>): void => {
    if (ref == null) {
      return;
    }
    this._tooltipRefs.set(ref.dataset.name, ref);
  };
}
