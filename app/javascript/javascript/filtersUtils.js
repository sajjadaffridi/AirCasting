import Clipboard from "clipboard";
import moment from "moment";
import tippy from "tippy.js";

export const endOfToday = () =>
  moment()
    .utc()
    .endOf("day")
    .format("X");

export const oneYearAgo = () =>
  moment()
    .utc()
    .startOf("day")
    .subtract(1, "year")
    .format("X");

export const presentMoment = () =>
  moment()
    .utc()
    .format("X");

export const oneHourAgo = () =>
  moment()
    .utc()
    .subtract(1, "hour")
    .format("X");

export const daterangepickerConfig = (timeFrom, timeTo) => ({
  linkedCalendars: false,
  timePicker: true,
  timePicker24Hour: true,
  startDate: moment
    .unix(timeFrom)
    .utc()
    .format("MM/DD/YY HH:mm"),
  endDate: moment
    .unix(timeTo)
    .utc()
    .format("MM/DD/YY HH:mm"),
  locale: {
    format: "MM/DD/YY HH:mm"
  }
});

export const setupTimeRangeFilter = (
  onTimeRangeChanged,
  timeFrom,
  timeTo,
  onIsVisibleChange
) => {
  if (document.getElementById("time-range")) {
    $("#time-range").daterangepicker(
      daterangepickerConfig(timeFrom, timeTo),
      function(timeFrom, timeTo) {
        timeFrom = timeFrom.utcOffset(0, true).unix();
        timeTo = timeTo.utcOffset(0, true).unix();

        onTimeRangeChanged(timeFrom, timeTo);
      }
    );

    $("#time-range").on("show.daterangepicker", () => onIsVisibleChange(true));
    $("#time-range").on("hide.daterangepicker", () => onIsVisibleChange(false));
  } else {
    window.setTimeout(
      setupTimeRangeFilter(
        onTimeRangeChanged,
        timeFrom,
        timeTo,
        onIsVisibleChange
      ),
      100
    );
  }
};
export const setupTagsAutocomplete = (callback, path, createParams) => {
  if (document.getElementById("tags")) {
    $(`#tags`)
      .autocomplete({
        source: function(request, response) {
          const data = {
            q: { input: request.term, ...createParams() }
          };
          $.getJSON(path, data, response);
        },
        select: function(event, ui) {
          callback(ui.item.value);
        },
        minLength: 0
      })
      .focus(function() {
        $(this).autocomplete("search");
      });
  } else {
    window.setTimeout(setupAutocomplete(callback, path), 100);
  }
};

export const setupProfileNamesAutocomplete = callback => {
  if (document.getElementById("profile-names")) {
    $(`#profile-names`).autocomplete({
      source: function(request, response) {
        const data = {
          q: { input: request.term }
        };
        $.getJSON("api/autocomplete/usernames", data, response);
      },
      select: function(event, ui) {
        callback(ui.item.value);
      }
    });
  } else {
    window.setTimeout(setupAutocomplete(callback), 100);
  }
};

export const setupClipboard = () => {
  new Clipboard("#copy-link-button");
};

const tooltipInstance = (() => {
  let instance;

  return tooltipId => {
    const oldInstance = instance;
    instance =
      tippy(`#${tooltipId}`, {
        animateFill: false,
        interactive: true,
        theme: "light-border",
        trigger: "manual"
      })[0] || oldInstance;

    return instance;
  };
})();

export const fetchShortUrl = (tooltipId, currentUrl) => {
  const tooltip = tooltipInstance(tooltipId);

  tooltip.setContent("Fetching...");
  tooltip.show();

  fetch("api/short_url?longUrl=" + currentUrl)
    .then(response => response.json())
    .then(json => updateTooltipContent(json.short_url, tooltip))
    .catch(err => {
      console.warn("Couldn't fetch shorten url: ", err);
      updateTooltipContent(currentUrl, tooltip);
    });
};

const updateTooltipContent = (link, tooltip) => {
  const content = `
    <input value=${link}></input>
    <button
      id='copy-link-button'
      class='button button--primary copy-link-button'
      data-clipboard-text=${link}
    >
      copy
    </button>
  `;

  tooltip.setContent(content);

  document.getElementById("copy-link-button").addEventListener("click", () => {
    tooltip.setContent("Copied!");

    window.setTimeout(tooltip.hide, 1000);
  });
};

export const findLocation = (location, params, map) => {
  params.update({ data: { location: location } });
  map.goToAddress(location);
};

export const clearLocation = (callback, params) => {
  callback(null);
  params.update({ data: { location: "" } });
};
