"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.pushDotMerlinPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 54
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/pushDotMerlinPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 54
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 54
          },
          kind: "any"
        }
      });
    });
  };

  remoteModule.pushNewBuffer = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "name",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 59
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "content",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 59
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/pushNewBuffer", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 59
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 59
          },
          kind: "any"
        }
      });
    });
  };

  remoteModule.locate = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 65
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 66
        },
        kind: "number"
      }
    }, {
      name: "col",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 67
        },
        kind: "number"
      }
    }, {
      name: "kind",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 68
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/locate", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 69
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 69
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 70
            },
            name: "file",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 70
              },
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 71
            },
            name: "pos",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 71
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "MerlinService.js",
                  line: 72
                },
                name: "line",
                type: {
                  location: {
                    type: "source",
                    fileName: "MerlinService.js",
                    line: 72
                  },
                  kind: "number"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "MerlinService.js",
                  line: 73
                },
                name: "col",
                type: {
                  location: {
                    type: "source",
                    fileName: "MerlinService.js",
                    line: 73
                  },
                  kind: "number"
                },
                optional: false
              }]
            },
            optional: false
          }]
        }
      });
    });
  };

  remoteModule.enclosingType = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 85
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 86
        },
        kind: "number"
      }
    }, {
      name: "col",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 87
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/enclosingType", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 88
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 88
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 88
            },
            kind: "named",
            name: "MerlinType"
          }
        }
      });
    });
  };

  remoteModule.complete = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 94
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 95
        },
        kind: "number"
      }
    }, {
      name: "col",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 96
        },
        kind: "number"
      }
    }, {
      name: "prefix",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 97
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/complete", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 98
        },
        kind: "any"
      });
    });
  };

  remoteModule.errors = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 104
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/errors", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 105
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 105
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 105
            },
            kind: "named",
            name: "MerlinError"
          }
        }
      });
    });
  };

  remoteModule.outline = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 111
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/outline", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 112
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 112
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 112
            },
            kind: "named",
            name: "MerlinOutline"
          }
        }
      });
    });
  };

  remoteModule.cases = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 118
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "position",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 119
        },
        kind: "named",
        name: "atom$Point"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/cases", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 120
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 120
          },
          kind: "named",
          name: "MerlinCases"
        }
      });
    });
  };

  remoteModule.runSingleCommand = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 137
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "command",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 138
        },
        kind: "mixed"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/runSingleCommand", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 139
        },
        kind: "any"
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
  }], ["MerlinPosition", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "MerlinService.js",
      line: 16
    },
    name: "MerlinPosition",
    definition: {
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 16
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 17
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 17
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 18
        },
        name: "col",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 18
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }], ["MerlinType", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "MerlinService.js",
      line: 21
    },
    name: "MerlinType",
    definition: {
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 21
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 22
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 22
          },
          kind: "named",
          name: "MerlinPosition"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 23
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 23
          },
          kind: "named",
          name: "MerlinPosition"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 24
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 24
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 25
        },
        name: "tail",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 25
          },
          kind: "union",
          types: [{
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 25
            },
            kind: "string-literal",
            value: "no"
          }, {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 25
            },
            kind: "string-literal",
            value: "position"
          }, {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 25
            },
            kind: "string-literal",
            value: "call"
          }]
        },
        optional: false
      }]
    }
  }], ["MerlinError", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "MerlinService.js",
      line: 28
    },
    name: "MerlinError",
    definition: {
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 28
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 29
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 29
          },
          kind: "named",
          name: "MerlinPosition"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 30
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 30
          },
          kind: "named",
          name: "MerlinPosition"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 31
        },
        name: "valid",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 31
          },
          kind: "boolean"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 32
        },
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 32
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 33
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 33
          },
          kind: "union",
          types: [{
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 33
            },
            kind: "string-literal",
            value: "type"
          }, {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 33
            },
            kind: "string-literal",
            value: "parser"
          }, {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 33
            },
            kind: "string-literal",
            value: "env"
          }, {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 33
            },
            kind: "string-literal",
            value: "warning"
          }, {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 33
            },
            kind: "string-literal",
            value: "unknown"
          }]
        },
        optional: false
      }]
    }
  }], ["MerlinOutline", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "MerlinService.js",
      line: 36
    },
    name: "MerlinOutline",
    definition: {
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 36
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 37
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 37
          },
          kind: "named",
          name: "MerlinPosition"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 38
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 38
          },
          kind: "named",
          name: "MerlinPosition"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 39
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 39
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 40
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 40
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 41
        },
        name: "children",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 41
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 41
            },
            kind: "named",
            name: "MerlinOutline"
          }
        },
        optional: false
      }]
    }
  }], ["MerlinCases", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "MerlinService.js",
      line: 44
    },
    name: "MerlinCases",
    definition: {
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 44
      },
      kind: "tuple",
      types: [{
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 45
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 46
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 46
            },
            kind: "named",
            name: "MerlinPosition"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 47
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 47
            },
            kind: "named",
            name: "MerlinPosition"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 51
        },
        kind: "string"
      }]
    }
  }], ["pushDotMerlinPath", {
    kind: "function",
    name: "pushDotMerlinPath",
    location: {
      type: "source",
      fileName: "MerlinService.js",
      line: 54
    },
    type: {
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 54
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 54
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 54
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 54
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 54
            },
            kind: "any"
          }
        }
      }
    }
  }], ["pushNewBuffer", {
    kind: "function",
    name: "pushNewBuffer",
    location: {
      type: "source",
      fileName: "MerlinService.js",
      line: 59
    },
    type: {
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 59
      },
      kind: "function",
      argumentTypes: [{
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 59
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "content",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 59
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 59
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 59
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 59
            },
            kind: "any"
          }
        }
      }
    }
  }], ["locate", {
    kind: "function",
    name: "locate",
    location: {
      type: "source",
      fileName: "MerlinService.js",
      line: 64
    },
    type: {
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 64
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 65
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 66
          },
          kind: "number"
        }
      }, {
        name: "col",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 67
          },
          kind: "number"
        }
      }, {
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 68
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 69
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 69
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 69
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 70
              },
              name: "file",
              type: {
                location: {
                  type: "source",
                  fileName: "MerlinService.js",
                  line: 70
                },
                kind: "named",
                name: "NuclideUri"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 71
              },
              name: "pos",
              type: {
                location: {
                  type: "source",
                  fileName: "MerlinService.js",
                  line: 71
                },
                kind: "object",
                fields: [{
                  location: {
                    type: "source",
                    fileName: "MerlinService.js",
                    line: 72
                  },
                  name: "line",
                  type: {
                    location: {
                      type: "source",
                      fileName: "MerlinService.js",
                      line: 72
                    },
                    kind: "number"
                  },
                  optional: false
                }, {
                  location: {
                    type: "source",
                    fileName: "MerlinService.js",
                    line: 73
                  },
                  name: "col",
                  type: {
                    location: {
                      type: "source",
                      fileName: "MerlinService.js",
                      line: 73
                    },
                    kind: "number"
                  },
                  optional: false
                }]
              },
              optional: false
            }]
          }
        }
      }
    }
  }], ["enclosingType", {
    kind: "function",
    name: "enclosingType",
    location: {
      type: "source",
      fileName: "MerlinService.js",
      line: 84
    },
    type: {
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 84
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 85
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 86
          },
          kind: "number"
        }
      }, {
        name: "col",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 87
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 88
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 88
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 88
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 88
              },
              kind: "named",
              name: "MerlinType"
            }
          }
        }
      }
    }
  }], ["complete", {
    kind: "function",
    name: "complete",
    location: {
      type: "source",
      fileName: "MerlinService.js",
      line: 93
    },
    type: {
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 93
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 94
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 95
          },
          kind: "number"
        }
      }, {
        name: "col",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 96
          },
          kind: "number"
        }
      }, {
        name: "prefix",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 97
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 98
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 98
          },
          kind: "any"
        }
      }
    }
  }], ["errors", {
    kind: "function",
    name: "errors",
    location: {
      type: "source",
      fileName: "MerlinService.js",
      line: 103
    },
    type: {
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 103
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 104
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 105
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 105
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 105
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 105
              },
              kind: "named",
              name: "MerlinError"
            }
          }
        }
      }
    }
  }], ["outline", {
    kind: "function",
    name: "outline",
    location: {
      type: "source",
      fileName: "MerlinService.js",
      line: 110
    },
    type: {
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 110
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 111
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 112
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 112
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 112
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 112
              },
              kind: "named",
              name: "MerlinOutline"
            }
          }
        }
      }
    }
  }], ["cases", {
    kind: "function",
    name: "cases",
    location: {
      type: "source",
      fileName: "MerlinService.js",
      line: 117
    },
    type: {
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 117
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 118
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "position",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 119
          },
          kind: "named",
          name: "atom$Point"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 120
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 120
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 120
            },
            kind: "named",
            name: "MerlinCases"
          }
        }
      }
    }
  }], ["runSingleCommand", {
    kind: "function",
    name: "runSingleCommand",
    location: {
      type: "source",
      fileName: "MerlinService.js",
      line: 136
    },
    type: {
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 136
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 137
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "command",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 138
          },
          kind: "mixed"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 139
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 139
          },
          kind: "any"
        }
      }
    }
  }]])
});