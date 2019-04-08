let timers = [];

window.setInterval(function () {
  let now = Date.now();

  let i = 0;
  while (i < timers.length) {
    if (timers[i].date < now) {
      timers[i].func(now);
      timers.splice(i, 1);
    } else {
      i += 1;
    }
  }
}, 1000);

export default function (func, date) {
  timers.push({
    func: func,
    date: date
  });
}