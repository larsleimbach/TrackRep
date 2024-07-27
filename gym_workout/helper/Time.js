// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: magic;

const dateFormatter = "yyyy.MM.dd"
module.exports.dateFormatter = dateFormatter;

const timeFormatter = "HH-mm-ss"
module.exports.timeFormatter = timeFormatter;

// ------------------------------------------------------
// --------------------- time function ------------------

const getCurrentTime = () => {
  /**
    return: string, the current time with specified formatter  
   */
  
  let date = new DateFormatter()
  date.dateFormat = timeFormatter
  let currentTime = new Date()
  return date.string(currentTime)
};
module.exports.getCurrentTime = getCurrentTime;

const dateToString = (date) => {
  /*
   return: Date, day as string with format
  */
  let formatter = new DateFormatter()
  formatter.dateFormat = dateFormatter
  return formatter.string(date)
};
module.exports.dateToString = dateToString;

const getCurrentDate = () => {
  /*
   returns current day as string with format
  */
  let currentTime = new Date()
  return dateToString(currentTime)
};
module.exports.getCurrentDate = getCurrentDate;

const getCurrentDateAndTime = () => {
  /**
    return: string, of current date and time
   */
  let date = new DateFormatter()
  date.dateFormat = dateFormatter + " " + timeFormatter
  let currentTime = new Date()
  return date.string(currentTime)
}
module.exports.getCurrentDateAndTime = getCurrentDateAndTime;

const toDate = (date_str) => {
  /**
    return: Date
    Converts a string with internal date formatter
    to a date.
   */
  
  let date = new DateFormatter()
  if(date_str.includes("-") && date_str.includes(".")){
    // is time and date
    date.dateFormat = dateFormatter + " " + timeFormatter
  }
  else if(date_str.includes(".")){
    // is date
    date.dateFormat = dateFormatter
  }
  else if(date_str.includes("-")){
    // is time
    date.dateFormat = timeFormatter
  }
  else{
    console.error(`could not detect string in toDate(): ${date_str}`)
  }
  return date.date(date_str)
};
module.exports.toDate = toDate;
