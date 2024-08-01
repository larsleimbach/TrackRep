// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: dumbbell;

/**
 * Author: Lars Leimbach
 * License: MIT
 *
 * This file is part of TrackRep!💪.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
