# nuclide-logging

A node package designed for logging on both Nuclide client and Nuclide server. It is based on [log4js](https://www.npmjs.com/package/log4js) with the ability to lazy initialize and update config after initialized.

## Usage

```js
var logger = require('nuclide-logging').getLogger();

logger.debug(...);
logger.error(...);
```

## Update Configuration

The logger will use the default configuration in `nuclide-logging/lib/config.js` to initialize nested log4js logger. However, one could update its configuration by calling
```js
var logger1 = require('nuclide-logging').getLogger();
require('nuclide-logging').updateConfig(config, option);
// logger1's configuration is updated as well.
```
Note this will also update the configuration of logger who has already been created.
