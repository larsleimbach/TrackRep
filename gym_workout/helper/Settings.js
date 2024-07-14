// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: magic;

const FileOperations = importModule("FileOperations.js")
const GlobalVariables = importModule("GlobalVars.js")

// ------------------------------------------------------
// ------------------ settings funcitons ----------------

const addGym = async (allowAbort) => {
  /**
   * Input: allowAbort:bool , if true it wont ask forever for input
   * add a new gym name to gym list
   * return -1, on failure, otheriwse not -1
   */
  
  // loads settings for file
	const settings = FileOperations.globalSettings()
  // do boot up sequence
  // choose gym:
  let pressedButton = -1
  let gymName = ""
  do{
    const gym_alert = new Alert();
    gym_alert.title = "What's the name of your gym(s)?"
    gym_alert.addTextField("e.g. \"Kraft station cologne\"", "")
    gym_alert.addAction("Add Gym")
    gym_alert.addCancelAction("Cancel")
    pressedButton = await gym_alert.present()
    gymName = gym_alert.textFieldValue(0)
    
    if((!allowAbort && pressedButton === -1) || 
        (pressedButton !== -1 && gymName === "")){
    	const alert = new Alert()
      alert.title = "Please type in a gym name."
      await alert.present()
      continue; // skip while checking
    }
  } while(!allowAbort && pressedButton === -1);

  if(pressedButton === -1){
    return -1
  }
  settings.gymlist.push(gymName)
  settings.selectedGym = gymName
  // save to settings.json file
	
  FileOperations.writeJsonFile(settings, FileOperations.settingsPath)
}
module.exports.addGym = addGym;

const delteGym = async () => {
  // show gyms list, chooseMultiple, withPicture
  
  
  

  const settings = FileOperations.globalSettings()
  const chooseMultiple = true
  const withPictures = false
  const withTitle = false
  const alreadSelectedGyms = []

  const choosenIdx = await GlobalVariables.chooseFromList(settings.gymlist, 
                                                         chooseMultiple, 
                                                         withPictures, 
                                                         alreadSelectedGyms,
                                                         withTitle)

  choosenIdx.forEach((i) => {
    if(settings.selectedGym === settings.gymlist[i]){
      // delte selected gym too
      settings.selectedGym = ""
    }
    // delte from list
    settings.gymlist.splice(i,1)
  })
  
  // save settings to file 
  FileOperations.writeJsonFile(settings, FileOperations.settingsPath)
}
module.exports.delteGym = delteGym;


const selectGym = async () => {
  /**
    select current gym
   */
  const settings = FileOperations.globalSettings()
  const chooseMultiple = false
  const withPictures = false
  const withTitle = true
  const idxOfCurrentSelectedGym = [settings.gymlist.indexOf(settings.selectedGym)]
  const titleAndListOfGyms = ["Select your current gym", ...settings.gymlist]
  
  
  const choosenIdx = await GlobalVariables.chooseFromList(titleAndListOfGyms, 
                                                         chooseMultiple, 
                                                         withPictures, 
                                                         idxOfCurrentSelectedGym,
                                                         withTitle)

  if(choosenIdx.length > 0){
    settings.selectedGym = settings.gymlist[choosenIdx[0]]
    FileOperations.writeJsonFile(settings, FileOperations.settingsPath)
  }
};
module.exports.selectGym = selectGym;
// await selectGym()

const setCommentInSettings = async () => { 
  /**
    sets the option in the settings file 
    to get asked after exercise for a comment
   */
  

  const comment_alert = new Alert();
  comment_alert.title = "Do want to get asked everytime for a comment when you did an exercise?"
  comment_alert.addAction("Yes")
  comment_alert.addCancelAction("No")
  const pressedButton = await comment_alert.present()

  const settings = FileOperations.globalSettings()
  
  settings.askForComment = pressedButton === 0 // yes was pressed
  // save json file
  FileOperations.writeJsonFile(settings, FileOperations.settingsPath)
};
module.exports.setCommentInSettings = setCommentInSettings;


const addExercies = async () => {
/**
ask for a picture in the photo libaray or taking a photo
if rejected don't set a pic
name : string

*/
const allExercises = FileOperations.allExercises()
// get bodypart
const allBodyparts = Object.keys(allExercises)
const chooseMultiple = false
const withPictures = true
const withTitle = false
const preSelectedBodyparts_idxs = []
const selectedBodyparts_idxs = await GlobalVariables.chooseFromList(
  allBodyparts,
  chooseMultiple, 
  withPictures, 
  preSelectedBodyparts_idxs,
  withTitle
)
const bodypart = allBodyparts[selectedBodyparts_idxs[0]]

// get Name
const exercise_alert = new Alert();
exercise_alert.title = "Exercise Name:"
exercise_alert.addTextField("e.g. \"Bench Press\"", "")
exercise_alert.addAction("Add exercise")
exercise_alert.addCancelAction("Cancel")
const pressedButton = await exercise_alert.present()
const exerciseName = exercise_alert.textFieldValue(0)
// select picture from photo lib or files
const selectedImage = await Photos.fromLibrary()
// save pic in picture folder
// convert to jpeg
FileOperations.convert2JPG(selectedImage, exerciseName)
// set entry in all Exercises.json
const settings = FileOperations.globalSettings()
const dummyLastWorkout = {
    repetitions: 0,
    weight: {
      unit: "kg",
      amount: 0
    },
    time: "2001.02.01 07-36-13",
    type: "maxWeight",
    gymLocation: settings.selectedGym,
    comment: ""
}

const newExercise = {
  count: 0,
  expanded: false,
  bodypart: bodypart,
  lastWorkout: [dummyLastWorkout],
  rekords: {
    volume: {
      amount: 0,
      unit: "kg*reps",
      reps:0
    },
    maxWeight: {
      amount: 0,
      unit: "kg",
      reps:0
    }
  }
}

allExercises[bodypart][exerciseName] = newExercise
// notification to restart app
const notification = new Notification()
notification.body = "Restart App!🔁"
await notification.schedule()

FileOperations.saveAllExercises(allExercises)
};
module.exports.addExercies = addExercies;





const openSettings = async () => {
   /**
   The main function that opens the selection for 
   a setting function
    */

  const settings = FileOperations.globalSettings()

  const rowsInSettings = [
    "Select Gym",
    "Add Gym",
    "Delte Gym",
    "Ask everytime for a comment",
    "Add Exercise"
  ]
  const chooseMultiple = false
  const withPictures = false
  const withTitle = false
  const choosenIdx = await GlobalVariables.chooseFromList(rowsInSettings, 
                                                         chooseMultiple, 
                                                         withPictures, [],
                                                         withTitle)
  if(choosenIdx.length > 0){
    const idx = choosenIdx[0]
    if(idx == 0){
      await selectGym()
    }
    else if(idx == 1){
      const allowAbort = true
      await addGym(allowAbort)
    }
    else if(idx == 2){
      await delteGym()
    }
    else if(idx == 3){
      await setCommentInSettings()
    }
    else if(idx == 4){
      await addExercies()
    }
    else{
      console.error("Index out of range for selected settings option")
    }
  }

};
module.exports.openSettings = openSettings;

// await openSettings()
