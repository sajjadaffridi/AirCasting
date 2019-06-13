export const heat = ($rootScope, params) => {
  var Heat = function() {
    var self = this;
    this.namesBySensor = ["very_low", "low", "medium", "high", "very_high"];
    this.heatPercentage = {};
    this.scope = $rootScope.$new();
    this.scope.params = params;
    this.scope.$watch(
      "params.get('data').heat",
      function(newValue, oldValue) {
        console.log("watch - params.get('data').heat");
        if (!newValue || _(newValue).isEmpty()) {
          return;
        }
        var value = newValue;
        var scale = value.highest - value.lowest;
        var percentageHeat = {
          highest: Math.round(
            ((1.0 * (value.highest - value.high)) / scale) * 100
          ),
          high: Math.round(((1.0 * (value.high - value.mid)) / scale) * 100),
          mid: Math.round(((1.0 * (value.mid - value.low)) / scale) * 100)
        };
        percentageHeat.low =
          100 -
          percentageHeat.highest -
          percentageHeat.high -
          percentageHeat.mid;
        _(["highest", "high", "mid", "low"]).each(function(heat) {
          self.heatPercentage[heat] = { width: percentageHeat[heat] + "%" };
        });
      },
      true
    );
  };

  Heat.prototype = {
    get: function() {
      return this.heatPercentage;
    },
    getValue: function(name) {
      return (this.getValues() || {})[name];
    },
    getValues: function() {
      return params.get("data").heat;
    },
    parse: function(heat) {
      var parsedHeat = _(heat).map(function(item) {
        return _.str.toNumber(item);
      });
      return {
        highest: parsedHeat[4],
        high: parsedHeat[3],
        mid: parsedHeat[2],
        low: parsedHeat[1],
        lowest: parsedHeat[0]
      };
    },

    toSensoredList: function(sensor) {
      var self = this;
      if (!sensor) return [];
      return _(this.namesBySensor).map(function(name) {
        return _.str.toNumber(sensor["threshold_" + name]);
      });
    },
    getLevel: function(value) {
      if (value < this.getValue("lowest")) {
        return null;
      } else if (value <= this.getValue("low")) {
        return 1;
      } else if (value <= this.getValue("mid")) {
        return 2;
      } else if (value <= this.getValue("high")) {
        return 3;
      } else if (value <= this.getValue("highest")) {
        return 4;
      } else {
        return null;
      }
    },

    levelName: function(value) {
      if (value < this.getValue("lowest")) {
        return "default";
      } else if (value <= this.getValue("low")) {
        return "low";
      } else if (value <= this.getValue("mid")) {
        return "mid";
      } else if (value <= this.getValue("high")) {
        return "high";
      } else if (value <= this.getValue("highest")) {
        return "highest";
      } else {
        return "default";
      }
    },
    outsideOfScope: function(value) {
      return (
        value < this.getValue("lowest") || value > this.getValue("highest")
      );
    },
    classByValue: function(value) {
      switch (this.getLevel(Math.round(value))) {
        case 1:
          return "green-bg";

        case 2:
          return "yellow-bg";

        case 3:
          return "orange-bg";

        case 4:
          return "red-bg";

        default:
          return "grey-bg";
      }
    }
  };

  return new Heat();
};
