'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default =














showTriggerConflictWarning;var _featureConfig;function _load_featureConfig() {return _featureConfig = _interopRequireDefault(require('../../../../nuclide-commons-atom/feature-config'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                         * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                         * All rights reserved.
                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                         * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                         * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                         * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                         * 
                                                                                                                                                                                                                                                                                         * @format
                                                                                                                                                                                                                                                                                         */function showTriggerConflictWarning() {const triggerKeys = (_featureConfig || _load_featureConfig()).default.get(`hyperclick.${process.platform}TriggerKeys`);if (!(typeof triggerKeys === 'string')) {throw new Error('Invariant violation: "typeof triggerKeys === \'string\'"');}const triggerKeyDescription = getTriggerDescription(triggerKeys);const { platform } = process;const commandOrMeta = platform === 'darwin' ? 'command' : 'meta';const optionOrAlt = platform === 'darwin' ? 'option' : 'alt';const alternative = triggerKeys === 'altKey,metaKey' ?
  commandOrMeta :
  `${commandOrMeta} + ${optionOrAlt}`;
  return atom.notifications.addInfo(
  `Hyperclick (jump to definition) is using ${triggerKeyDescription}`,
  {
    description:
    `If you want to use ${triggerKeyDescription} for multiple cursors instead,` +
    ' change the Hyperclick "Trigger Keys" setting.<br /><br />' +
    `(You can still use ${alternative} + click for multiple cursors.)`,
    dismissable: true });


}

function getTriggerDescription(trigger) {
  const schema = (_featureConfig || _load_featureConfig()).default.getSchema(
  `hyperclick.${process.platform}TriggerKeys`);if (!(

  schema != null && schema.enum != null)) {throw new Error('Invariant violation: "schema != null && schema.enum != null"');}
  const match = schema.enum.find(option => {if (!(
    option != null && typeof option.value === 'string')) {throw new Error('Invariant violation: "option != null && typeof option.value === \'string\'"');}
    return option.value === trigger;
  });if (!(
  match != null && typeof match.description === 'string')) {throw new Error('Invariant violation: "match != null && typeof match.description === \'string\'"');}
  return match.description;
}