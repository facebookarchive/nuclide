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
          line: 30
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
          line: 31
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
          line: 36
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
          line: 37
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 37
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
          line: 42
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
          line: 43
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
          line: 44
        },
        kind: "string"
      });
    });
  };

  remoteModule.getDeviceModel = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 49
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
          line: 50
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getDeviceModel", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 51
        },
        kind: "string"
      });
    });
  };

  remoteModule.getAPIVersion = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 56
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
          line: 57
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getAPIVersion", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 58
        },
        kind: "string"
      });
    });
  };

  remoteModule.installPackage = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 63
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
          line: 64
        },
        kind: "string"
      }
    }, {
      name: "packagePath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 65
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/installPackage", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 66
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.uninstallPackage = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 71
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
          line: 72
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 73
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/uninstallPackage", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 74
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.getPidFromPackageName = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 79
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
          line: 80
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 81
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getPidFromPackageName", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 82
        },
        kind: "number"
      });
    });
  };

  remoteModule.forwardJdwpPortToPid = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 87
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
          line: 88
        },
        kind: "string"
      }
    }, {
      name: "tcpPort",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 89
        },
        kind: "number"
      }
    }, {
      name: "pid",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 90
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/forwardJdwpPortToPid", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 91
        },
        kind: "string"
      });
    });
  };

  remoteModule.launchActivity = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 96
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
          line: 97
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 98
        },
        kind: "string"
      }
    }, {
      name: "activity",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 99
        },
        kind: "string"
      }
    }, {
      name: "action",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 100
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/launchActivity", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 101
        },
        kind: "string"
      });
    });
  };

  remoteModule.activityExists = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 106
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
          line: 107
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 108
        },
        kind: "string"
      }
    }, {
      name: "activity",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 109
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/activityExists", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 110
        },
        kind: "boolean"
      });
    });
  };

  remoteModule.getJavaProcesses = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 115
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
          line: 116
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getJavaProcesses", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 117
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 117
          },
          kind: "named",
          name: "AndroidJavaProcess"
        }
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
    DeviceDescription: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 16
      },
      name: "DeviceDescription",
      definition: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 16
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
            line: 18
          },
          name: "architecture",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 18
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 19
          },
          name: "apiVersion",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 19
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 20
          },
          name: "model",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 20
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    AndroidJavaProcess: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 23
      },
      name: "AndroidJavaProcess",
      definition: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 23
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 24
          },
          name: "user",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 24
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 25
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 25
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 26
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 26
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    startServer: {
      kind: "function",
      name: "startServer",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 29
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 29
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 30
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 31
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 31
            },
            kind: "string"
          }
        }
      }
    },
    getDeviceList: {
      kind: "function",
      name: "getDeviceList",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 35
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 35
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 36
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 37
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 37
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "AdbService.js",
                line: 37
              },
              kind: "named",
              name: "DeviceDescription"
            }
          }
        }
      }
    },
    getDeviceArchitecture: {
      kind: "function",
      name: "getDeviceArchitecture",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 41
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 41
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 42
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
              line: 43
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 44
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 44
            },
            kind: "string"
          }
        }
      }
    },
    getDeviceModel: {
      kind: "function",
      name: "getDeviceModel",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 48
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 48
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 49
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
              line: 50
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 51
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 51
            },
            kind: "string"
          }
        }
      }
    },
    getAPIVersion: {
      kind: "function",
      name: "getAPIVersion",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 55
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 55
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 56
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
              line: 57
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 58
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 58
            },
            kind: "string"
          }
        }
      }
    },
    installPackage: {
      kind: "function",
      name: "installPackage",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 62
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 62
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 63
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
              line: 64
            },
            kind: "string"
          }
        }, {
          name: "packagePath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 65
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 66
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 66
            },
            kind: "named",
            name: "ProcessMessage"
          }
        }
      }
    },
    uninstallPackage: {
      kind: "function",
      name: "uninstallPackage",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 70
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 70
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 71
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
              line: 72
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 73
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 74
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 74
            },
            kind: "named",
            name: "ProcessMessage"
          }
        }
      }
    },
    getPidFromPackageName: {
      kind: "function",
      name: "getPidFromPackageName",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 78
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 78
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 79
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
              line: 80
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 81
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 82
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 82
            },
            kind: "number"
          }
        }
      }
    },
    forwardJdwpPortToPid: {
      kind: "function",
      name: "forwardJdwpPortToPid",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 86
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 86
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 87
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
              line: 88
            },
            kind: "string"
          }
        }, {
          name: "tcpPort",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 89
            },
            kind: "number"
          }
        }, {
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 90
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 91
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 91
            },
            kind: "string"
          }
        }
      }
    },
    launchActivity: {
      kind: "function",
      name: "launchActivity",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 95
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 95
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 96
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
              line: 97
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 98
            },
            kind: "string"
          }
        }, {
          name: "activity",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 99
            },
            kind: "string"
          }
        }, {
          name: "action",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 100
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 101
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 101
            },
            kind: "string"
          }
        }
      }
    },
    activityExists: {
      kind: "function",
      name: "activityExists",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 105
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 105
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 106
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
              line: 107
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 108
            },
            kind: "string"
          }
        }, {
          name: "activity",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 109
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 110
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 110
            },
            kind: "boolean"
          }
        }
      }
    },
    getJavaProcesses: {
      kind: "function",
      name: "getJavaProcesses",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 114
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 114
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 115
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
              line: 116
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 117
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 117
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "AdbService.js",
                line: 117
              },
              kind: "named",
              name: "AndroidJavaProcess"
            }
          }
        }
      }
    },
    ProcessExitMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 13
      },
      name: "ProcessExitMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 13
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 15
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "number"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 16
          },
          name: "signal",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 16
              },
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    ProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 20
      },
      name: "ProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 20
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 20
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 21
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 21
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 22
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 22
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 23
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 24
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 24
              },
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 25
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 25
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 13
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 14
              },
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            name: "exitCode",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 15
                },
                kind: "number"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            name: "signal",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 16
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 16
                },
                kind: "string"
              }
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 26
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 27
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 27
              },
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 28
            },
            name: "error",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 28
              },
              kind: "named",
              name: "Object"
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    ProcessInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 31
      },
      name: "ProcessInfo",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 31
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 32
          },
          name: "parentPid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 32
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 33
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 33
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 34
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 34
            },
            kind: "string"
          },
          optional: false
        }]
      }
    }
  }
});