import moment from "moment";

export const formatShowTime = (timeValue) => {
  if (timeValue) {
    const momentTime = moment(timeValue, [
      "HH:mm",
      "HH:mm:ss",
      "h:mm A",
      "h:mm a",
    ]);
    return momentTime.isValid() ? momentTime.format("h:mm A") : timeValue;
  }
  return "N/A";
};
