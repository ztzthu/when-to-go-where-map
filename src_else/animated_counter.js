/**
 * A simple customizable number counter that increments during the given duration.
 */
function animated_counter(id, label, title, color, value, duration = 4000) {
  let curr_value = 0;
  let step = Math.round(value / (duration / 10));
  let style = "color: " + color;

  let root = $(id);
  root.append(`<div class="ac_val" style="${style}">${curr_value}</div>`);
  root.append(`<div class="ac_label" style="${style}">${label}</div>`);
  root.append(`<div class="ac_title">${title}</div>`);

  setTimeout(() => {
    const interval = setInterval(() => {
      curr_value += step;
      $(id + " .ac_val").html(curr_value);

      if (curr_value >= value) clearInterval(interval);
    }, 10);
  }, 1000);
}

animated_counter(
  "#counter_pop_undernourished",
  "million",
  "people globally</br/>are undernourished",
  "rgb(255, 255, 178)",
  663
);

animated_counter(
  "#counter_us_feed",
  "million",
  "people could be fed with grains used for livestock in the US alone",
  "rgb(189, 0, 38)",
  800
);
