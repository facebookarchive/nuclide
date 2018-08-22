"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateTunnel = validateTunnel;

function _memoize2() {
  const data = _interopRequireDefault(require("lodash/memoize"));

  _memoize2 = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function validateTunnel(tunnel) {
  if (tunnel.to.host === 'localhost') {
    return true;
  }

  const allowedPorts = await getAllowedPorts();

  if (allowedPorts == null) {
    return true;
  }

  return allowedPorts.includes(tunnel.to.port);
} // require fb-sitevar module lazily


const requireFetchSitevarOnce = (0, _memoize2().default)(() => {
  try {
    // $FlowFB
    return require("../../commons-node/fb-sitevar").fetchSitevarOnce;
  } catch (e) {
    return null;
  }
}); // returns either a list of allowed ports, or null if not restricted

async function getAllowedPorts() {
  const fetchSitevarOnce = requireFetchSitevarOnce();

  if (fetchSitevarOnce == null) {
    return null;
  }

  const allowedPorts = await fetchSitevarOnce('NUCLIDE_TUNNEL_ALLOWED_PORTS');

  if (allowedPorts == null) {
    return [];
  }

  return allowedPorts;
}