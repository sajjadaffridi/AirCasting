import {
  removeMarker,
  drawTraceMarker
} from "../angular/code/services/google/_map.js";
import * as assets from "../assets";

let items = [];

export const hide = () => {
  items.forEach(item => {
    removeMarker(item.marker);
  });
  items = [];
};

export const show = points => {
  hide();
  points.forEach(point => {
    items.push({
      marker: drawTraceMarker({
        position: { lat: point.latitude, lng: point.longitude }
      }),
      point: point
    });
  });
};
