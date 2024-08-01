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
const Time = importModule("Time.js")


const fm = FileManager.iCloud()

// Global accessable paths
const gymPath = fm.documentsDirectory() + "/gym_workout"
module.exports.gymPath = gymPath;

const workoutsFolder = gymPath + "/workouts"
module.exports.workoutsFolder = workoutsFolder;

const picturesPath = gymPath + "/pictures"
module.exports.picturesPath = picturesPath;

const allExercisesPath = gymPath + "/allExercises.json"
module.exports.allExercisesPath = allExercisesPath;

const settingsPath = gymPath + "/settings.json"
module.exports.settingsPath = settingsPath;



// ----------------------------------------------
// -------------- load/write files --------------
// ----------------------------------------------


const readJsonFile = (filePath) => {
  /**
    filePath: string
    return: a JSON of the json at filePath
   */
  const json_str = fm.readString(filePath)
  return JSON.parse(json_str)
}
module.exports.readJsonFile = readJsonFile;

const writeJsonFile = (jsonObject, destinationPath) => {
  /**
    jsonObject: object, that should be saved
    destinationPath: string
    
    Writes a json object at destinationPath
   */
  // attention this file overwrites the destination json-file
  // null, 2 makes it pretty
  fm.writeString(destinationPath, JSON.stringify(jsonObject, null, 2))
}
module.exports.writeJsonFile = writeJsonFile;


const globalSettings = () => {
  // returns the setting json
  return readJsonFile(settingsPath)
}
module.exports.globalSettings = globalSettings;

const save_settings = (json_obj) => {
  // saves the setting json
  writeJsonFile(json_obj, settingsPath)
}
module.exports.save_settings = save_settings;

const allExercises = () => {

  /* 
  Loads the information (rekords, last workout,...) as JSON about
  all exercises from the file.
  */

  return readJsonFile(allExercisesPath)
}
module.exports.allExercises = allExercises;

const saveAllExercises = (json_obj) => {
  // saves all exercises to the specific file
  return writeJsonFile(json_obj, allExercisesPath)
}
module.exports.saveAllExercises = saveAllExercises;

const removeFile = (path) => {
  fm.remove(path)
}
module.exports.removeFile = removeFile;

const addPicToRow = (row, name) => {
  /**
    row: UITableRow
    name: string

    Returns a row with a picture that has the same 
    name as 'name' in the picture folder. Every picture
    has to have .JPG as format
   */
  let pathToImage = `${picturesPath}/${name}.JPG`
  const image = fm.readImage(pathToImage)
  const cell = row.addImage(image)
  return cell
}
module.exports.addPicToRow = addPicToRow;


// --------------------------------------------------------
// -------------- load/save workout of today --------------
// --------------------------------------------------------


const getCurrentYearFolder = () => {
  /**
    return: string, path to current workouts folder of this year
   */
  // in the workoutsFolder are folder from the year to 
  //  -> keep the code performant if there are a lot of workouts
  const dateF = new DateFormatter()
  dateF.dateFormat = "yyyy"
  const currentYear = dateF.string(new Date())
  const pathToWorkoutsOfTheYear = workoutsFolder + "/" + currentYear
  if(!fm.isDirectory(pathToWorkoutsOfTheYear)){
    // folder doesn't exist -> create one
    fm.createDirectory(pathToWorkoutsOfTheYear, false)
  }
  return pathToWorkoutsOfTheYear
}
module.exports.getCurrentYearFolder = getCurrentYearFolder;

const getPathOfWorkoutOfToday = (bodypart) => {
  /**
    bodypart: string
    return: string, path to workout of today with mentioned bodypart
   */
  const pathToWorkoutsOfTheYear = getCurrentYearFolder()
  // here is the file name of the workouts defined
  const pathTodaysWorkout = `${pathToWorkoutsOfTheYear}/${Time.getCurrentDate()} ${bodypart}.json`
  return pathTodaysWorkout
}
module.exports.getPathOfWorkoutOfToday = getPathOfWorkoutOfToday;


const setWorkoutOfToday = (workout_json, bodypart) => {
  /**
    workout_json: object
    bodypart: string

    Writes or creates the current workoutout to the filesystem
   */
  // just write to the file system 
  const pathTodaysWorkout = getPathOfWorkoutOfToday(bodypart)
  writeJsonFile(workout_json, pathTodaysWorkout)
}
module.exports.setWorkoutOfToday = setWorkoutOfToday;


const getWorkoutOfToday = (bodypart, createFile) => {
  /**
    bodypart: string
    createFile: bool

    A workout contains exercises checks if workout for today exists
    if not create this file
   */
  
  const pathToWorkoutsOfTheYear = getCurrentYearFolder()
  // here is the file name of the workouts defined
  const pathTodaysWorkout = `${pathToWorkoutsOfTheYear}/${Time.getCurrentDate()} ${bodypart}.json`
  let workoutToday_json = {}
  if(fm.fileExists(pathTodaysWorkout)){
    workoutToday_json = readJsonFile(pathTodaysWorkout)
  }
  else{
    if(createFile){
      // create file
      writeJsonFile(workoutToday_json, pathTodaysWorkout) 
    }
  }
  
  return workoutToday_json
}
module.exports.getWorkoutOfToday = getWorkoutOfToday;

const loadWorkoutsOfToday = (selectedBodyparts) => {
  /**
    selectedBodyparts: [string]
    return: {bodypart: object}, a dict for the workouts of today
      sorted by the bodypart
   */
  const createFileIfNotExist = false
  let workoutsOfToday = {}
  selectedBodyparts.forEach(bodypart => {
		workoutsOfToday[bodypart] = getWorkoutOfToday(bodypart, createFileIfNotExist)
	})
  return workoutsOfToday
}
module.exports.loadWorkoutsOfToday = loadWorkoutsOfToday;



const loadExercises_inTimeRange = (older_date, younger_date) => {
  /**
    older_date: Date
    younger_date: Date
    return: [{workout: , bodypart:}], loads workouts 
      and stores them in an array for the time range
  */
  const exercises = []
  // QuickLook.present(typeof younger_date)

  if(younger_date < older_date){
    //switch dates. 
    const tmp = younger_date
    younger_date = older_date
    older_date = tmp
  }
  let startYear = Number(older_date.getFullYear())
  let endYear = Number(younger_date.getFullYear())
  
  let continueSearch = true
  

  // iterate from oldest year to newest
  for(let cur_year=startYear; continueSearch && cur_year <= endYear; cur_year+=1){
    const path = workoutsFolder + "/" + String(cur_year)
    // check if folder exists
    if(fm.isDirectory(path)){
      const allFiles = fm.listContents(path).sort()
      // iterate from the newest to the oldest
      for(let i=0; i < allFiles.length-1; i+=1){
        const fileName = allFiles[i]
        const dateOfWorkout = Time.toDate(fileName.split(" ")[0])
        if(dateOfWorkout < younger_date && older_date < dateOfWorkout){
          // workout lays in date range
          // string "date bodypart.json"
          let bodypartAndJson = fileName.split(" ")[1]
          const bodypart = bodypartAndJson.substring(0, bodypartAndJson.length - 5)
          //load workout
          const workout = readJsonFile(path+"/"+fileName)
          exercises.push({workout: workout, bodypart:bodypart})
          // exercises.push(fileName)
        }
        else if(dateOfWorkout > younger_date){
          // we cross the upper range border
          continueSearch = false
          break;
        }
      }

    }
  }
  return exercises
}
module.exports.loadExercises_inTimeRange = loadExercises_inTimeRange;












// ------------------------------------------------------------------
// -------------- ensure that all pics are JPG-format ---------------
// ------------------------------------------------------------------

const convert2JPG = (image, name) => {
   /**
    image: Image
    name: string
      Converts an image to JPG file
      and saves it to photo folder with jpg format
    */

   const base64image = Data.fromJPEG(image)
   const image2 = Image.fromData(base64image)
   fm.writeImage(picturesPath+"/"+name+".JPG",image2)
} 
module.exports.convert2JPG = convert2JPG;


const convertCurrentFolder = () => {
   /*
    convert current photo folder to only .JPG photos
   */
   const photoNames = fm.listContents(picturesPath)
   
   for(let i = 0; i < photoNames.length; i++) {
      const splittedName = photoNames[i].split(".")
      // last entry is the file format of the picture
      const extension = splittedName[splittedName.length-1]
      const name = photoNames[i].replace("."+extension, "")

      if(extension === "JPG"){
         continue
      }
      const image = fm.readImage(picturesPath+"/"+name+"."+extension)
      convert2JPG(image, name)
   }

}
module.exports.convertCurrentFolder = convertCurrentFolder;

