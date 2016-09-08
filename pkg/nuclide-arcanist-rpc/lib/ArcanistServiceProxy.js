"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.findArcConfigDirectory = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 54
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findArcConfigDirectory", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 54
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 54
          },
          kind: "named",
          name: "NuclideUri"
        }
      });
    });
  };

  remoteModule.readArcConfig = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 62
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/readArcConfig", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 62
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 62
          },
          kind: "any"
        }
      });
    });
  };

  remoteModule.findArcProjectIdOfPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 77
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findArcProjectIdOfPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 77
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 77
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.getProjectRelativePath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 82
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/getProjectRelativePath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 82
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 82
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.findDiagnostics = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "pathToFiles",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 88
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 88
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }, {
      name: "skip",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 89
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 89
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findDiagnostics", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 90
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 90
          },
          kind: "named",
          name: "ArcDiagnostic"
        }
      });
    });
  };

  remoteModule.createPhabricatorRevision = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 167
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/createPhabricatorRevision", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 168
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 168
          },
          name: "stderr",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 168
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 168
          },
          name: "stdout",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 168
            },
            kind: "string"
          },
          optional: true
        }]
      });
    }).publish();
  };

  remoteModule.updatePhabricatorRevision = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 173
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "message",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 174
        },
        kind: "string"
      }
    }, {
      name: "allowUntracked",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 175
        },
        kind: "boolean"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/updatePhabricatorRevision", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 176
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 176
          },
          name: "stderr",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 176
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 176
          },
          name: "stdout",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 176
            },
            kind: "string"
          },
          optional: true
        }]
      });
    }).publish();
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
    trackOperationTiming = arguments[1];
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
  }], ["ArcDiagnostic", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 37
    },
    name: "ArcDiagnostic",
    definition: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 37
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 38
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 38
          },
          kind: "union",
          types: [{
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 38
            },
            kind: "string-literal",
            value: "Error"
          }, {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 38
            },
            kind: "string-literal",
            value: "Warning"
          }]
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 39
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 39
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 40
        },
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 40
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 41
        },
        name: "row",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 41
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 42
        },
        name: "col",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 42
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 43
        },
        name: "code",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 43
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 43
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 46
        },
        name: "original",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 46
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 47
        },
        name: "replacement",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 47
          },
          kind: "string"
        },
        optional: true
      }]
    }
  }], ["findArcConfigDirectory", {
    kind: "function",
    name: "findArcConfigDirectory",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 54
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 54
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 54
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 54
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 54
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 54
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }
    }
  }], ["readArcConfig", {
    kind: "function",
    name: "readArcConfig",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 62
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 62
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 62
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 62
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 62
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 62
            },
            kind: "any"
          }
        }
      }
    }
  }], ["findArcProjectIdOfPath", {
    kind: "function",
    name: "findArcProjectIdOfPath",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 77
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 77
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 77
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 77
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 77
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 77
            },
            kind: "string"
          }
        }
      }
    }
  }], ["getProjectRelativePath", {
    kind: "function",
    name: "getProjectRelativePath",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 82
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 82
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 82
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 82
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 82
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 82
            },
            kind: "string"
          }
        }
      }
    }
  }], ["findDiagnostics", {
    kind: "function",
    name: "findDiagnostics",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 87
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 87
      },
      kind: "function",
      argumentTypes: [{
        name: "pathToFiles",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 88
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 88
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "skip",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 89
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 89
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 90
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 90
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 90
            },
            kind: "named",
            name: "ArcDiagnostic"
          }
        }
      }
    }
  }], ["createPhabricatorRevision", {
    kind: "function",
    name: "createPhabricatorRevision",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 166
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 166
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 167
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 168
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 168
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 168
            },
            name: "stderr",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 168
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 168
            },
            name: "stdout",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 168
              },
              kind: "string"
            },
            optional: true
          }]
        }
      }
    }
  }], ["updatePhabricatorRevision", {
    kind: "function",
    name: "updatePhabricatorRevision",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 172
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 172
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 173
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 174
          },
          kind: "string"
        }
      }, {
        name: "allowUntracked",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 175
          },
          kind: "boolean"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 176
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 176
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 176
            },
            name: "stderr",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 176
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 176
            },
            name: "stdout",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 176
              },
              kind: "string"
            },
            optional: true
          }]
        }
      }
    }
  }]])
});