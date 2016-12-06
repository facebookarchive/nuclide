"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.startServer = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 20
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/startServer", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 21
        },
        kind: "string"
      });
    }).publish();
  };

  remoteModule.getDeviceList = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 26
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getDeviceList", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 27
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 27
          },
          kind: "named",
          name: "DeviceDescription"
        }
      });
    });
  };

  remoteModule.getDeviceArchitecture = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 32
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 33
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getDeviceArchitecture", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 34
        },
        kind: "string"
      });
    });
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: new Map([["Object", {
    kind: "alias",
    name: "Object",
    location: {
      type: "builtin"
    }
  }], ["Date", {
    kind: "alias",
    name: "Date",
    location: {
      type: "builtin"
    }
  }], ["RegExp", {
    kind: "alias",
    name: "RegExp",
    location: {
      type: "builtin"
    }
  }], ["Buffer", {
    kind: "alias",
    name: "Buffer",
    location: {
      type: "builtin"
    }
  }], ["fs.Stats", {
    kind: "alias",
    name: "fs.Stats",
    location: {
      type: "builtin"
    }
  }], ["NuclideUri", {
    kind: "alias",
    name: "NuclideUri",
    location: {
      type: "builtin"
    }
  }], ["atom$Point", {
    kind: "alias",
    name: "atom$Point",
    location: {
      type: "builtin"
    }
  }], ["atom$Range", {
    kind: "alias",
    name: "atom$Range",
    location: {
      type: "builtin"
    }
  }], ["DeviceDescription", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "AdbService.js",
      line: 17
    },
    name: "DeviceDescription",
    definition: {
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 17
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 17
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 17
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 17
        },
        name: "architecture",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 17
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["startServer", {
    kind: "function",
    name: "startServer",
    location: {
      type: "source",
      fileName: "AdbService.js",
      line: 19
    },
    type: {
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 19
      },
      kind: "function",
      argumentTypes: [{
        name: "adbPath",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 20
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 21
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 21
          },
          kind: "string"
        }
      }
    }
  }], ["getDeviceList", {
    kind: "function",
    name: "getDeviceList",
    location: {
      type: "source",
      fileName: "AdbService.js",
      line: 25
    },
    type: {
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 25
      },
      kind: "function",
      argumentTypes: [{
        name: "adbPath",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 26
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 27
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 27
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 27
            },
            kind: "named",
            name: "DeviceDescription"
          }
        }
      }
    }
  }], ["getDeviceArchitecture", {
    kind: "function",
    name: "getDeviceArchitecture",
    location: {
      type: "source",
      fileName: "AdbService.js",
      line: 31
    },
    type: {
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 31
      },
      kind: "function",
      argumentTypes: [{
        name: "adbPath",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 32
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "device",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 33
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 34
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 34
          },
          kind: "string"
        }
      }
    }
  }]])
});