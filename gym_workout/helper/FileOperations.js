// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: magic;
const Time = importModule("Time.js")


const fm = FileManager.iCloud()//FileManager.local()

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
  const json_str = fm.readString(filePath)
  //console.log(json_str)
  return JSON.parse(json_str)
}
module.exports.readJsonFile = readJsonFile;

const writeJsonFile = (jsonObject, destinationPath) => {
  // attention this file overwrites the destination json-file
  // null, 2 makes it pretty
  fm.writeString(destinationPath, JSON.stringify(jsonObject, null, 2))
}
module.exports.writeJsonFile = writeJsonFile;


const globalSettings = () => {
  return readJsonFile(settingsPath)
}
module.exports.globalSettings = globalSettings;

const save_settings = (json_obj) => {
  writeJsonFile(json_obj, settingsPath)
}
module.exports.save_settings = save_settings;

const allExercises = () => {
  /* 
  Naming conventions:
   - isolated: every arm has its own weight
   - weight plates: this is a machine with weight plates
   - lying: you lay with your back somewhere horizontal to the ground
   - incline: upward movement
   - decline: downward movement
   - cable: cable machines without removable weight plates
  */
  return readJsonFile(allExercisesPath)
}
module.exports.allExercises = allExercises;

const saveAllExercises = (json_obj) => {
  return writeJsonFile(json_obj, allExercisesPath)
}
module.exports.saveAllExercises = saveAllExercises;

const removeFile = (path) => {
  // console.log(path)
  fm.remove(path)
}
module.exports.removeFile = removeFile;

const addPicToRow = (row, name) => {
  /**
    returns a row with a picture that has the same 
    name as 'name' in the picture folder
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
  workouts are sorted regarding their year 
   */
  // in the workoutsFolder are folder from the year to 
  //  keep the code performant if there are a lot of workouts
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
  const pathToWorkoutsOfTheYear = getCurrentYearFolder()
  // here is the file name of the workouts defined
  const pathTodaysWorkout = `${pathToWorkoutsOfTheYear}/${Time.getCurrentDate()} ${bodypart}.json`
  return pathTodaysWorkout
}
module.exports.getPathOfWorkoutOfToday = getPathOfWorkoutOfToday;


const setWorkoutOfToday = (workout_json, bodypart) => {
  /**
  writes or creates the current workout out to the filesystem
   */
  // just write to the file system 
  const pathTodaysWorkout = getPathOfWorkoutOfToday(bodypart)
  writeJsonFile(workout_json, pathTodaysWorkout)
}
module.exports.setWorkoutOfToday = setWorkoutOfToday;


const getWorkoutOfToday = (bodypart, createFile) => {
  /**
  a workout contains exercises
  checks if workout for today exists
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
  loads workouts and stores them in an array
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

const getPhotoFileExtension = (pathToImage, fm) => {
/* get correct photo-file extension for filename
 *
 * pathToImage: whole path except the extension
 * fm: FileManager object
 * return correct file-extension
 */  
    let extensions = [".PNG",".JPG",".jpg",".png",".HEIC",".jpeg"]
		for(let i = 0; i < extensions.length; i++){
      const extension = extensions[i]
      const path = pathToImage+extension
      console.log(path)
    	if(fm.fileExists(path)){
        // if(!fm.isFileDownloaded(path)){
        //   const returnVal = await downloadFileFromiCloud(path)
        //   QuickLook.present(returnVal, false)
        // }
     		return extension
    	}
    }
    console.error("could not find file")
    console.error(pathToImage)
}
//module.exports.getPhotoFileExtension = getPhotoFileExtension;

const convert2JPG = (image, name) => {
   /**
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

