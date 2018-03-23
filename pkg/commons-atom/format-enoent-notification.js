'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = formatEnoentNotification;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const capitalize = str => str[0].toUpperCase() + str.substr(1);

function formatEnoentNotification(options) {
  const { feature, toolName, pathSetting } = options;
  const schema = (_featureConfig || _load_featureConfig()).default.getSchema(pathSetting);
  const settingTitle = schema.title;
  const categoryTitle = capitalize(pathSetting.split('.').shift());
  const command = (_featureConfig || _load_featureConfig()).default.get(pathSetting);
  const capitalizedFeature = capitalize(feature);
  const description = `${capitalizedFeature} needs *${toolName}* but Nuclide couldn't find it at \`${command}\`.

**Troubleshooting Tips**
1. Make sure that *${toolName}* is installed. Some Nuclide features require tools that aren't
   bundled with Nuclide. You may need to install this tool yourself.
2. Make sure that *${toolName}* can be run using the command \`${command}\`.
3. Atom doesn't know about PATH modifications made in your shell config (".bash_profile", ".zshrc",
   etc.). If *${toolName}* is installed and you can run it successfully from your terminal using the
   command \`${command}\`, Nuclide may just not be looking in the right place. Update the command by
   changing the **${(0, (_string || _load_string()).maybeToString)(settingTitle)}** setting (under **${categoryTitle}**) on the
   Nuclide settings page.`;

  return {
    message: `Nuclide couldn't find *${toolName}*!`,
    meta: {
      dismissable: true,
      description
    }
  };
}