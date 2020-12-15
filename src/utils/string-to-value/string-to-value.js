import time from "../time/time";
export default function (valueStr) {
  if (typeof valueStr == "string") {
    if (valueStr.split(".").length == 2) {
      // For 1.345
      return parseFloat(valueStr);
    } else if (valueStr.search(":") > -1) {
      // For 00:00:00
      return time.timestringToSeconds(valueStr);
    } else {
      return parseInt(valueStr);
    }
  } else {
    return valueStr;
  }
}
