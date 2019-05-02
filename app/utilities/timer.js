const TIMER_INTERVAL = 60 * 1000 * 5;
const TIMER_MAX_TIMEOUT = 4 * 24 * 3600000;

const timers = [];
let timerChecker;

export function TimerPolling(func, date) {
  timers.push({
    func: func,
    date: date
  });

  console.log('tpolling', date);

  if (!timerChecker) timerChecker = window.setInterval(function () {
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
  }, TIMER_INTERVAL)
}


export function TimerDynamic(cb, date, minInterval) {
  if (!date) return;
  const timeDiff = date - Date.now();
  let interval;
  console.log('t init', date, interval);

  if (timeDiff > 0) {
    if (timeDiff > TIMER_MAX_TIMEOUT) return TimerPolling(cb, date);
    if (minInterval) {
      interval = Math.max(minInterval, timeDiff);
    } else {
      interval = timeDiff;
    }
  } else if (!minInterval || timeDiff === 0) {
    return cb();
  } else {
    interval = minInterval;
  }

  console.log('t timeout', date, interval);
  setTimeout(cb, interval);
}

console.log("%cManaged by David - @hellodavie", "background: #282a30; color: #ffb86e; line-height: 24px; padding: 8px 16px;")