"use strict";

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getDevices = function () {
    return _client.callRemoteFunction("FbsimctlService/getDevices", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "FbsimctlDevice"
        }
      });
    });
  };

  remoteModule.install = function (arg0, arg1) {
    return _client.callRemoteFunction("FbsimctlService/install", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "port",
      type: {
        kind: "string"
      }
    }, {
      name: "ipaUri",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.relaunch = function (arg0, arg1) {
    return _client.callRemoteFunction("FbsimctlService/relaunch", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "port",
      type: {
        kind: "string"
      }
    }, {
      name: "bundleId",
      type: {
        kind: "string"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.getBundleIdOfBundleAtPath = function (arg0) {
    return _client.callRemoteFunction("FbsimctlService/getBundleIdOfBundleAtPath", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "bundlePath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "defs", {
  value: {
    Object: {
      kind: "alias",
      name: "Object",
      location: {
        type: "builtin"
      }
    },
    Date: {
      kind: "alias",
      name: "Date",
      location: {
        type: "builtin"
      }
    },
    RegExp: {
      kind: "alias",
      name: "RegExp",
      location: {
        type: "builtin"
      }
    },
    Buffer: {
      kind: "alias",
      name: "Buffer",
      location: {
        type: "builtin"
      }
    },
    "fs.Stats": {
      kind: "alias",
      name: "fs.Stats",
      location: {
        type: "builtin"
      }
    },
    NuclideUri: {
      kind: "alias",
      name: "NuclideUri",
      location: {
        type: "builtin"
      }
    },
    atom$Point: {
      kind: "alias",
      name: "atom$Point",
      location: {
        type: "builtin"
      }
    },
    atom$Range: {
      kind: "alias",
      name: "atom$Range",
      location: {
        type: "builtin"
      }
    },
    State: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 12
      },
      name: "State",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "Creating"
        }, {
          kind: "string-literal",
          value: "Booting"
        }, {
          kind: "string-literal",
          value: "Shutting Down"
        }, {
          kind: "string-literal",
          value: "Shutdown"
        }, {
          kind: "string-literal",
          value: "Booted"
        }, {
          kind: "string-literal",
          value: "Unknown"
        }]
      }
    },
    DeviceType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 30
      },
      name: "DeviceType",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "simulator"
        }, {
          kind: "string-literal",
          value: "physical_device"
        }]
      }
    },
    FbsimctlDevice: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 21
      },
      name: "FbsimctlDevice",
      definition: {
        kind: "object",
        fields: [{
          name: "name",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "udid",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "state",
          type: {
            kind: "named",
            name: "State"
          },
          optional: false
        }, {
          name: "os",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "arch",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "type",
          type: {
            kind: "named",
            name: "DeviceType"
          },
          optional: false
        }]
      }
    },
    getDevices: {
      kind: "function",
      name: "getDevices",
      location: {
        type: "source",
        fileName: "FbsimctlService.js",
        line: 23
      },
      type: {
        location: {
          type: "source",
          fileName: "FbsimctlService.js",
          line: 23
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "FbsimctlDevice"
            }
          }
        }
      }
    },
    install: {
      kind: "function",
      name: "install",
      location: {
        type: "source",
        fileName: "FbsimctlService.js",
        line: 32
      },
      type: {
        location: {
          type: "source",
          fileName: "FbsimctlService.js",
          line: 32
        },
        kind: "function",
        argumentTypes: [{
          name: "port",
          type: {
            kind: "string"
          }
        }, {
          name: "ipaUri",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    relaunch: {
      kind: "function",
      name: "relaunch",
      location: {
        type: "source",
        fileName: "FbsimctlService.js",
        line: 40
      },
      type: {
        location: {
          type: "source",
          fileName: "FbsimctlService.js",
          line: 40
        },
        kind: "function",
        argumentTypes: [{
          name: "port",
          type: {
            kind: "string"
          }
        }, {
          name: "bundleId",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    getBundleIdOfBundleAtPath: {
      kind: "function",
      name: "getBundleIdOfBundleAtPath",
      location: {
        type: "source",
        fileName: "FbsimctlService.js",
        line: 52
      },
      type: {
        location: {
          type: "source",
          fileName: "FbsimctlService.js",
          line: 52
        },
        kind: "function",
        argumentTypes: [{
          name: "bundlePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "string"
          }
        }
      }
    }
  }
});