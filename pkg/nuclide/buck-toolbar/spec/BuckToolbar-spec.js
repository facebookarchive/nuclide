'use babel';
/* @flow */

var {dotAppDirectoryForAppleBundleOutput} = require('../lib/helpers');

describe('BuckToolbar', () => {
  it('.dotAppDirectoryForAppleBundleOutput()', () => {
    var zipPath = 'buck-out/gen/Apps/Example/ExampleApp.zip';
    expect(dotAppDirectoryForAppleBundleOutput(zipPath)).toBe(
      'buck-out/gen/Apps/Example/ExampleApp/ExampleApp.app');
  });
});
