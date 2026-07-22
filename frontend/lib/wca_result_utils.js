const NUMBER_EVENTS = new Set([
  "333fm",
]);

const MULTI_EVENTS = new Set([
  "333mbf",
]);

export function formatResult(value, eventId, isAverage = false) {
  if (value === null || value === undefined) return "-";

  switch (value) {
    case -2:
      return "DNS";

    case -1:
      return "DNF";

    case 0:
      return "";
  }

  if (MULTI_EVENTS.has(eventId)) {
    return formatMultiBlind(value);
  }

  if (NUMBER_EVENTS.has(eventId)) {
    return formatNumber(value, isAverage);
  }

  return formatTime(value);
}

function formatTime(cs) {
  const totalSeconds = Math.floor(cs / 100);

  const centiseconds = cs % 100;

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
  }

  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, "0")}.${String(
      centiseconds
    ).padStart(2, "0")}`;
  }

  return `${seconds}.${String(centiseconds).padStart(2, "0")}`;
}

function formatNumber(value, isAverage) {
  if (!isAverage) {
    return value.toString();
  }

  return (value / 100).toFixed(2);
}

function formatMultiBlind(value) {
  const s = value.toString().padStart(10, "0");

  if (s[0] === "0") {
    const DD = Number(s.slice(1, 3));
    const T = Number(s.slice(3, 8));
    const MM = Number(s.slice(8, 10));

    const difference = 99 - DD;
    const solved = difference + MM;
    const attempted = solved + MM;

    let result = `${solved}/${attempted}`;

    if (T !== 99999) {
      const h = Math.floor(T / 3600);
      const m = Math.floor((T % 3600) / 60);
      const sec = T % 60;

      if (h > 0) {
        result += ` ${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(
          2,
          "0"
        )}`;
      } else {
        result += ` ${m}:${String(sec).padStart(2, "0")}`;
      }
    }

    return result;
  }

  const SS = Number(s.slice(1, 3));
  const AA = Number(s.slice(3, 5));
  const T = Number(s.slice(5, 10));

  const solved = 99 - SS;
  const attempted = AA;

  let result = `${solved}/${attempted}`;

  if (T !== 99999) {
    const h = Math.floor(T / 3600);
    const m = Math.floor((T % 3600) / 60);
    const sec = T % 60;

    if (h > 0) {
      result += ` ${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(
        2,
        "0"
      )}`;
    } else {
      result += ` ${m}:${String(sec).padStart(2, "0")}`;
    }
  }

  return result;
}