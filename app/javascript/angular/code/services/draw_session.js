import { drawSession } from "./_draw_session.js";

angular
  .module("aircasting")
  .factory("drawSession", ["sensors", "map", drawSession]);
