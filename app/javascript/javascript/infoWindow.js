import constants from "./constants";
import {
  savePosition,
  mapObj,
  getSavedPosition,
  setHasChangedProgrammatically
} from "./mapsUtils";
import heat from "./heat";
import sensors from "./sensors";
import { getQ } from "./http";
import _ from "underscore";

let first = true;

const infoWindow = () => {
  var InfoWindow = function() {
    if (process.env.NODE_ENV !== "test") {
      this.popup = new google.maps.InfoWindow();
    }
  };

  InfoWindow.prototype = {
    get: function() {
      return this.popup;
    },

    show: function(url, data, position, sessionType) {
      if (first) savePosition();
      first = false;

      this.popup.setContent("fetching...");
      this.popup.setPosition(position);
      this.popup.setOptions({ disableAutoPan: true });
      this.popup.open(mapObj());

      getQ(url, data.q).then(data => this.onShowData(data, sessionType));
    },

    onShowData: function(data, sessionType) {
      const html =
        sessionType === constants.fixedSession
          ? `
              <div class="info-window">
                <div class="info_window__avg-color ${heat.classByValue(
                  data.average
                )}"></div>
                <p class="info-window__avg">avg. <strong>${Math.round(
                  data.average
                )}</strong> ${sensors.selected().unit_symbol}</p>
                <hr>
                <ul class="info-window__list">
                  <li>${data.number_of_instruments} instruments</li>
                  <li>${data.number_of_samples} measurements</li>
                  <li>${data.number_of_contributors} contributors</li>
                  <a id="info-window__link" class="info-window__link">zoom in and show sessions →</a>
                </ul>
              </div>
              `
          : `
              <div class="info-window">
                <div class="info_window__avg-color ${heat.classByValue(
                  data.average
                )}"></div>
                <p class="info-window__avg">avg. <strong>${Math.round(
                  data.average
                )}</strong> ${sensors.selected().unit_symbol}</p>
                <hr>
                <ul class="info-window__list">
                  <li>${data.number_of_samples} measurements</li>
                  <li>${data.number_of_contributors} contributors</li>
                </ul>
              </div>
              `;
      this.popup.setContent(html);
      setHasChangedProgrammatically(true);

      this.popup.setOptions({ disableAutoPan: false });
      this.popup.open(mapObj());

      google.maps.event.addListener(this.popup, "closeclick", function() {
        window.__mapNG.fitBounds(
          getSavedPosition().bounds,
          getSavedPosition().zoom
        );
        first = true;
      });

      document.getElementById("info-window__link") &&
        document
          .getElementById("info-window__link")
          .addEventListener("click", () =>
            window.__mapNG.zoomToSelectedCluster()
          );

      window.__mapNG.addListener("zoom_changed", _(this.hide).bind(this));
    },

    hide: function() {
      this.popup.close();
      first = true;
    }
  };

  return new InfoWindow();
};

export default infoWindow();
