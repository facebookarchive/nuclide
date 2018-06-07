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

import type {OnboardingTaskComponentProps} from '../../nuclide-onboarding/lib/types';

import * as React from 'react';
import AsyncStorage from 'idb-keyval';
import {ButtonSizes, ButtonTypes, Button} from 'nuclide-commons-ui/Button';
import RadioGroup from 'nuclide-commons-ui/RadioGroup';
import {track} from '../../nuclide-analytics';

export const EDITOR_IDE_EXPERIENCE_KEY =
  'nuclide-onboarding-editor-ide-experience';

const OTHER_EXPERIENCE_KEY = 'other';

const EDITOR_IDE_EXPERIENCE_OPTIONS: Array<{
  storageKey: string,
  label: React.Node,
}> = [
  {
    storageKey: 'atom',
    label: 'Atom',
  },
  {
    storageKey: 'eclipse',
    label: 'Eclipse',
  },
  {
    storageKey: 'emacs',
    label: 'Emacs',
  },
  {
    storageKey: 'intelliJ',
    label: 'IntelliJ',
  },
  {
    storageKey: 'sublime',
    label: 'Sublime Text',
  },
  {
    storageKey: 'vim',
    label: 'Vim',
  },
  {
    storageKey: 'vs-code',
    label: 'Visual Studio Code',
  },
  {
    storageKey: OTHER_EXPERIENCE_KEY,
    label: 'Other: ',
  },
];

const DESCRIPTIONS = {
  complete: `Thanks for selecting your previous editor/IDE experience.
    Your selection helps us make suggestions to improve your Nuclide experience.`,
  incomplete:
    'With which of the following editors/IDEs do you have the most experience?',
};

type State = {
  otherInputValue: string,
  selectedExperienceKey: string,
};

export default class EditorIDEExperienceComponent extends React.Component<
  OnboardingTaskComponentProps,
  State,
> {
  constructor(props: OnboardingTaskComponentProps) {
    super(props);
    this.state = {
      otherInputValue: '',
      selectedExperienceKey: EDITOR_IDE_EXPERIENCE_OPTIONS[0].storageKey,
    };
  }

  render() {
    return this.props.isCompleted ? (
      <span>{DESCRIPTIONS.complete}</span>
    ) : (
      <div>
        <span>{DESCRIPTIONS.incomplete}</span>
        <div>
          <RadioGroup
            className="nuclide-onboarding-editor-ide-experience-options"
            onSelectedChange={this._setEditorSelectionFromIndex}
            optionLabels={this._getOptionLabels()}
            selectedIndex={this._getSelectedIndex()}
          />
          <Button
            buttonType={ButtonTypes.SUCCESS}
            className="nuclide-onboarding-editor-ide-experience-button"
            disabled={!this._isOtherInputValid()}
            onClick={this._handleExperienceSelectionConfirmation}
            size={ButtonSizes.SMALL}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  _getOptionLabels(): Array<React.Node> {
    return EDITOR_IDE_EXPERIENCE_OPTIONS.map(option => {
      let label = option.label;
      if (option.storageKey === OTHER_EXPERIENCE_KEY) {
        const otherLabel = [label];
        const otherId = 'otherId';
        otherLabel.push(
          <label
            className="nuclide-onboarding-editor-ide-experience-other-label"
            htmlFor={otherId}
            key="other-experience">
            <input
              className="input-text native-key-bindings nuclide-onboarding-editor-ide-experience-other-input"
              id={otherId}
              onChange={this._updateOtherInputValue}
              onFocus={this._setOtherExperienceSelected}
              placeholder="Please specify"
              required={
                this.state.selectedExperienceKey === OTHER_EXPERIENCE_KEY
              }
              type="text"
            />
          </label>,
        );
        label = otherLabel;
      }
      return label;
    });
  }

  _getSelectedIndex(): number {
    return EDITOR_IDE_EXPERIENCE_OPTIONS.map(
      option => option.storageKey,
    ).indexOf(this.state.selectedExperienceKey);
  }

  _setEditorSelectionFromIndex = (newIndex: number) => {
    const selectedExperienceKey =
      EDITOR_IDE_EXPERIENCE_OPTIONS[newIndex].storageKey;
    this.setState({selectedExperienceKey});
  };

  _setOtherExperienceSelected = () => {
    if (this.state.selectedExperienceKey !== OTHER_EXPERIENCE_KEY) {
      this.setState({selectedExperienceKey: OTHER_EXPERIENCE_KEY});
    }
  };

  _logSelectedExperience() {
    let selectionKey = this.state.selectedExperienceKey;
    if (selectionKey === OTHER_EXPERIENCE_KEY) {
      selectionKey += ` (${this.state.otherInputValue})`;
    }

    track(EDITOR_IDE_EXPERIENCE_KEY, {
      experience: selectionKey,
    });
  }

  _isOtherInputValid(): boolean {
    const {otherInputValue, selectedExperienceKey} = this.state;
    return (
      selectedExperienceKey !== OTHER_EXPERIENCE_KEY ||
      (otherInputValue != null && otherInputValue.length > 0)
    );
  }

  _updateOtherInputValue = (event: SyntheticEvent<>) => {
    const otherInputValue = ((event.currentTarget: any): HTMLInputElement)
      .value;
    this.setState({otherInputValue});
  };

  _handleExperienceSelectionConfirmation = async () => {
    if (this._isOtherInputValid()) {
      await AsyncStorage.set(
        EDITOR_IDE_EXPERIENCE_KEY,
        this.state.selectedExperienceKey,
      );
      this.props.setTaskCompleted();
      this._logSelectedExperience();
    }
  };
}
