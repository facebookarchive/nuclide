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
import type {LanguageStatusProvider} from './types';

import classnames from 'classnames';
import marked from 'marked';
import nullthrows from 'nullthrows';
import {Button, ButtonTypes} from 'nuclide-commons-ui/Button';
import {ButtonGroup} from 'nuclide-commons-ui/ButtonGroup';
import {Icon} from 'nuclide-commons-ui/Icon';
import * as React from 'react';

export type ServerStatus = {
  provider: LanguageStatusProvider,
  data: StatusData,
};

type Props = {
  serverStatuses: Array<ServerStatus>,
  editor: ?atom$TextEditor,
};

type State = {
  hovered: boolean,
  selectedServerName: ?string,
};

export default class StatusComponent extends React.Component<Props, State> {
  props: Props = {serverStatuses: [], editor: null};
  state: State = {hovered: false, selectedServerName: null};

  render(): React.Node {
    const serverStatuses = this.props.serverStatuses.filter(
      status => status.data.kind !== 'null',
    );
    const active = this.state.hovered || this.state.selectedServerName != null;
    const selectedServerStatus = this.props.serverStatuses.find(
      s => s.provider.name === this.state.selectedServerName,
    );
    return (
      <div className="nuclide-language-status-container">
        {this._renderDetails(selectedServerStatus)}
        <div className="nuclide-language-status-bar-and-dropdown-container">
          <div className="nuclide-language-status-bar-container">
            {serverStatuses.map(status => this._renderBar(status, active))}
          </div>
          <div
            // Use opacity instead of visibility so onMouseEnter still triggers
            style={{opacity: active ? 1.0 : 0.0}}
            className="nuclide-language-status-dropdown">
            {serverStatuses.map(this._renderDropdownItem)}
          </div>
        </div>
      </div>
    );
  }

  _renderDetails = (status: ?ServerStatus): ?React.Node => {
    if (status == null || status.data.kind === 'null') {
      return null;
    }
    const {provider, data} = status;
    const header = (
      <h1 className={'nuclide-language-status-details-heading'}>
        {provider.name}
      </h1>
    );
    const progress = this._renderDetailsProgress(data);
    const message = (
      <div
        dangerouslySetInnerHTML={{
          __html: marked(data.message),
        }}
      />
    );
    const buttons = this._renderDetailsButtons(status);
    return (
      <div
        className={classnames(
          'nuclide-language-status-details',
          'nuclide-language-status-details-' + data.kind,
        )}>
        {header}
        {progress}
        {message}
        {buttons}
      </div>
    );
  };

  _renderDetailsProgress(data: StatusData): ?React.Node {
    if (data.kind !== 'yellow' || data.fraction == null) {
      return null;
    }
    return <div>Progress: {(data.fraction * 100).toFixed(2)}%</div>;
  }

  _renderDetailsButtons = (status: ServerStatus): ?React.Node => {
    const {provider, data} = status;
    if (data.kind !== 'red' || data.buttons.length === 0) {
      return null;
    }
    return (
      <ButtonGroup>
        {data.buttons.map(b => (
          <Button
            key={b}
            buttonType={ButtonTypes.ERROR}
            onClick={() =>
              provider.clickStatus(
                nullthrows(this.props.editor),
                data.id || '',
                b,
              )
            }>
            {b}
          </Button>
        ))}
      </ButtonGroup>
    );
  };

  _renderDropdownItem = (status: ServerStatus): React.Node => {
    const {provider, data} = status;
    // Use icon if present otherwise the first letter of the name, capitalized.
    const icon =
      provider.icon != null ? (
        <Icon className="nuclide-language-status-icon" icon={provider.icon} />
      ) : (
        <div>{provider.name.substr(0, 1).toUpperCase()}</div>
      );
    return (
      <div
        className={classnames(
          'nuclide-language-status-dropdown-item',
          'nuclide-language-status-dropdown-item-' + data.kind,
        )}
        onMouseEnter={() => this.setState({hovered: true})}
        onMouseLeave={() => this.setState({hovered: false})}
        onClick={() => {
          if (this.state.selectedServerName === provider.name) {
            this.setState({selectedServerName: null});
          } else {
            this.setState({selectedServerName: provider.name});
          }
        }}>
        {icon}
      </div>
    );
  };

  _renderBar = (status: ServerStatus, active: boolean): React.Node => {
    const {provider, data} = status;
    return (
      <div
        key={provider.name}
        style={{height: this.state.hovered ? 16 : 8}}
        className={classnames(
          'nuclide-language-status-bar',
          'nuclide-language-status-bar-' +
            data.kind +
            (!active ? '-inactive' : ''),
        )}
        onMouseEnter={() => this.setState({hovered: true})}
        onMouseLeave={() => this.setState({hovered: false})}
      />
    );
  };
}
