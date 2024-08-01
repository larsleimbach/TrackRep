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
const FileOperations = importModule("FileOperations.js")
const Time = importModule("Time.js")

// IDs to know in the main function which row we pressed on
const id_reps_row = "reps"
module.exports.id_reps_row = id_reps_row
const id_weight_row = "weight"
module.exports.id_weight_row = id_weight_row

const count_rows_of_ex = 9
module.exports.count_rows_of_ex = count_rows_of_ex




const amount_change = (id_row, unit) => {
  /**
    id_row: string
    unit: string
    return: number, the amount (always positiv) 
      how much should the amount change when pressing + or -
   */
  if(id_row === id_reps_row){
    return 1
  }
  else if(id_row === id_weight_row){
    if(unit == "kg"){
        return 1.0 //1.25
    }
    else if(unit == "lbs"){
        return 2.75 // == 1.25kg
    }
  }
  return 0
}
module.exports.amount_change = amount_change




const chooseFromList = async (list, 
                              chooseMultiple, 
                              withPicture,
                              alreadySelected,
                              withTitle) => {
  /* 
    list:[string], the name coresponds 
        to a picture in the picture folder too
	 *  chooseMultiple: bool, you can select multiple
   *  withPicture: bool, show pictureCell
   *  alreadySelected: [int], these indicies that are alreay seleted
      withTitle: bool, add photo with same name in the picture folder
   *  return: [string] which indices of list were choosen 
	 */
  
	const table = new UITable()
	const cellHeight = 80
  table.showSeparators = true
  
	const rowsSelected = alreadySelected 
	const rows = [] // if one cell is touched -> change here its properties
  let i = 0
  let minus1 = 0
  if(withTitle){
    // fist item is the title
    i = 1
    minus1 = 1
    const titleRow = new UITableRow()
    titleRow.isHeader = true
    // first item in list is title
    titleRow.addText(list[0],"")
    table.addRow(titleRow)
  }

  const onSelect = (touchedIdx) => {
    // call back function that set selected
    let realTouchedIdx = touchedIdx - minus1
    let color = Color.gray()
    const index = rowsSelected.indexOf(realTouchedIdx);
    if (index > -1) { 
      // remove from array and set color again to white
      rowsSelected.splice(index, 1); 
      color = Color.clear()
    }
    else{
      rowsSelected.push(realTouchedIdx)
    }
    rows[realTouchedIdx].backgroundColor = color
    table.reload()
  }
  
  // create table
  for(; i < list.length; i++){
    const item = list[i]
    const row = new UITableRow()
    // check if row was already selected:
    if (rowsSelected.includes(i - minus1)) {
      // mark row as selected
      row.backgroundColor = Color.gray()
    }
    row.height = cellHeight
    // dismiss only when we want to select only one line
    row.dismissOnSelect = !chooseMultiple
  	row.onSelect = onSelect
    
    if(withPicture){
      FileOperations.addPicToRow(row, item)
    }
  	
    const cellText = row.addText(item, "")
    
	 	table.addRow(row)
    rows.push(row)
  }
  
	await table.present(false)
  
  if(!chooseMultiple && rowsSelected.length > 0){
    // choose last added item ignore before selected values
    return [rowsSelected[rowsSelected.length-1]]
  }
  return rowsSelected
}
module.exports.chooseFromList = chooseFromList;


const askForComment = async () => {
  /**
    return: string, which is the comment for an exercise
    Ask for comment.
   */
  const comment_alert = new Alert();
  comment_alert.title = "Comment for exercise:"
  comment_alert.addTextField("type here", "")
  comment_alert.addAction("Ok")
  comment_alert.addCancelAction("Cancel")
  const pressedButton = await comment_alert.present()
  
  if(pressedButton === 0){
    return comment_alert.textFieldValue(0)
  }
  return ""
};
module.exports.askForComment = askForComment;


const sortByFrequency = (exercises) => {
  /**
    exercises: [{count:int, ... }]
    sort by count value
    return, sorted list of these objects
   */
  exercises.sort(function(x, y) {
  if (x.count > y.count) {
    return -1;
  }
  else if (x.count < y.count) {
    return 1;
  }
  return 0;
  });
  return exercises
}
module.exports.sortByFrequency = sortByFrequency;


const sortByDate = (exercises) => {
  /**
    sort by date value
    exercises: [{time:int, ... }]
    return, sorted list of these objects
   */
  exercises.sort(function(x, y) {

  if (x.time > y.time) {
    return -1;
  }
  else if (x.time < y.time) {
    return 1;
  }
  return 0;
  });
  return exercises
}
module.exports.sortByDate = sortByDate;

// ------------------------------------------------
// ----------------save workout--------------------
// ------------------------------------------------

const getMaxWeightAndVolume = (exerciseSets) => {
  /**
    return: [int], 3 values: [maxWeight, repsForMaxWeight, volume]
    Funcitons searches for the max weight, reps for max weight set,
    and volume of on array of sets from one exercise.
   */
  let volume = 0
  let maxWeight = 0
  let repsForMaxWeight = 0

  // iterate through sets 
  exerciseSets.forEach(set => {
    if(set.type == "maxWeight"){
      // search for highest weight + its repitions
      if(set.weight.amount > maxWeight || set.repetitions > repsForMaxWeight){
        maxWeight = set.weight.amount
        repsForMaxWeight = set.repetitions
      }
    }
    else if(set.type == "volume"){
      // calculate volume for several sets of on exercise
      volume += set.weight.amount*set.repetitions
    }
  }) 
  return [maxWeight, repsForMaxWeight, volume]
}
module.exports.getMaxWeightAndVolume = getMaxWeightAndVolume;


const updateRekords = (exerciseName, 
                       exerciseSets, 
                       allExercises,
                       bodypart) => {
  /**
    exerciseName: string
    exerciseSets: [{exericse}]
    allExercises: object, infos about all exercises
    bodypart: string

    Updates rekords in allExercises if one set in 
    exerciseSets beats current rekord.
   */
  // variables that store the final (maybe) new rekord  
  let [maxWeight, repsForMaxWeight, volume] = getMaxWeightAndVolume(exerciseSets)

  // iterate through sets 
  exerciseSets.forEach(set => {
    if(set.type == "maxWeight"){
      // search for highest weight + its repitions
      if(set.weight.amount > maxWeight){
        maxWeight = set.weight.amount
        repsForMaxWeight = set.repetitions
      }
    }
    else if(set.type == "volume"){
      // calculate volume for several sets of on exercise
      volume += set.weight.amount*set.repetitions
    }
  })

  // load rekord file
  // check if rekord entry exists:
  if(allExercises[bodypart].hasOwnProperty(exerciseName)){
    // rekord entry does exists, update values
    if(allExercises[bodypart][exerciseName].rekords.volume.amount < volume){
      // updates volumen
      allExercises[bodypart][exerciseName].rekords.volume.amount = volume
    }
    else if((allExercises[bodypart][exerciseName].rekords.maxWeight.amount == maxWeight
            && allExercises[bodypart][exerciseName].rekords.maxWeight.reps < repsForMaxWeight)
            || allExercises[bodypart][exerciseName].rekords.maxWeight.amount < maxWeight){
      // updates max weight
      allExercises[bodypart][exerciseName].rekords.maxWeight.amount = maxWeight
      allExercises[bodypart][exerciseName].rekords.maxWeight.reps = repsForMaxWeight
    }
  }
  else{
    console.error("exercise name deoes not exists")
  }
}


const updateWorkoutOfToday = async (workoutType,
                                    exerciseName,
                                    bodypart, 
                                    sets,
                                    workoutOfToday,
                                    settings) => {
  /** 
    workoutType: string
    exerciseName: string
    bodypart: string
    sets: [object], infos about one set
    workoutOfToday: {bodypart:workout}
    settings: object, global settings
    There was a change in the for information of a set 
    -> safe workout of today updated to the file system
  */ 
  if(!workoutOfToday.hasOwnProperty(exerciseName)){
    // array of exercises does not exist  
    console.error("workout doesn't have this exercise key!")
  }
  let comment = ""
  // check if I should ask for a comment
  if(settings.askForComment){
     comment = await askForComment()
  }

  // update all sets
  workoutOfToday[exerciseName] = sets
  // store to file system
  FileOperations.setWorkoutOfToday(workoutOfToday, bodypart)

}
module.exports.updateWorkoutOfToday = updateWorkoutOfToday;

const saveWorkout = async (workoutType,
                           exerciseName,
                           bodypart, 
                           weight, 
                           reps,
                           workoutOfToday,
                           settings,
                           allExercises) => {
  /**
  workoutType: string
  exerciseName: string
  bodypart: string
  weight: number
  reps: number
  workoutOfToday: {bodypart:workout}
  settings: object, global settings
  allExercises: object, all infos about all exercises
  This this workout to the file system:
    - check if workout file for this bodypart exist
      yes: add it to this file
      no: create a workout file and it to this
    - update count in allWorkouts.json 
  write this workout to the file workoutOfToday
  */

  // check if you did today a workout for this bodypart
  // check if exerciseName exists:
  if(!workoutOfToday.hasOwnProperty(exerciseName)){
    // array of exercises does not exist  
    workoutOfToday[exerciseName] = []
  }

  let comment = ""
  // check if I should ask for a comment
  if(settings.askForComment){
     comment = await askForComment()
  }
  
  // create workout information
  const workout = {
    repetitions: reps,
    weight: {unit: settings.weightUnit, amount: weight},
    time: Time.getCurrentDateAndTime(),
    type: workoutType,
    gymLocation: settings.selectedGym,
    comment: comment
  }

  // add to exercise Name
  workoutOfToday[exerciseName].push(workout)
  // store to file system
  FileOperations.setWorkoutOfToday(workoutOfToday, bodypart)
}
module.exports.saveWorkout = saveWorkout;


const deleteSetFromWorkout = (wokoutOfToday, 
                              exercise_name,
                              bodypart,
                              idx_in_sets) => {
  /**
    wokoutOfToday: object, for one bodypart the corresponsing workout
    exercise_name: string
    bodypart: string
    idx_in_sets: int, which index should be deleted
    After pressing the delete button this function will be triggered
  */
  // delte from array
  wokoutOfToday[exercise_name].splice(idx_in_sets, idx_in_sets+1 , ...[]) 
  if(wokoutOfToday[exercise_name].length === 0){
    // delte key if array empty
    delete wokoutOfToday[exercise_name];
  }
  
  if(Object.keys(wokoutOfToday).length === 0){
    // delte file if file is empty
    const pathToWorkout = FileOperations.getPathOfWorkoutOfToday(bodypart)
    FileOperations.removeFile(pathToWorkout)
  }
  else{
    FileOperations.setWorkoutOfToday(wokoutOfToday, bodypart)
  }
}
module.exports.deleteSetFromWorkout = deleteSetFromWorkout;

const update_last_workouts = (allExercises,
                              bodypart,
                              exercise_name,
                              sets) => {
  /**
    allExercises: object, info about all exercises
    bodypart: string
    exerise_name: string
    sets: [object], current sets for exercise 'exericse_name'
    Load last workouts on first time of the day when opening the app
  */
  // iterate through all file until this date
  const lastWorkout = allExercises[bodypart][exercise_name].lastWorkout
  if(lastWorkout.length > 0){
    let date_in_allEx = lastWorkout[lastWorkout.length-1].time
    if(date_in_allEx === ""){
      // there is not last workout
      allExercises[bodypart][exercise_name].lastWorkout = sets  
    }
    else{
      date_in_allEx = Time.toDate(date_in_allEx)
      const date_in_sets = Time.toDate(sets[sets.length-1].time)

      if(date_in_allEx < date_in_sets){
        // date_in_sets is junger
        allExercises[bodypart][exercise_name].lastWorkout = sets 
      }
    }
  }
  else {
    // there is no last workout -> set this as last workout
    allExercises[bodypart][exercise_name].lastWorkout = sets
  }
  // update entries in allExercises.json

}

const checkRekords_and_lastWorkouts = () => {
  /**
    Checks all the exercises up to settings.lastCheckRekords (Date)
    then it updates the rekords in allExerceses
    until last month
  */
  const settings = FileOperations.globalSettings()
  const allExercises = FileOperations.allExercises()

  let lastTimeCheckRekords = settings.lastTimeOpened

	if(lastTimeCheckRekords === ""){
    lastTimeCheckRekords = "2000.02.02"// some old date
  }
  // weird conversion between strings and dates... but it works
  const dateLastTime = Time.toDate(lastTimeCheckRekords)
  const beforeOneMonth = new Date(dateLastTime.setMonth(dateLastTime.getMonth() - 1))
  const string_beforeOneMonth = Time.dateToString(beforeOneMonth)

  //lastTimeCheckRekords = "2000.02.02"// some old date
  
  // iterating through all exercises until last 
  const dateOfToday = Time.getCurrentDate()
  const workouts = FileOperations.loadExercises_inTimeRange(
      Time.toDate(dateOfToday),
      Time.toDate(string_beforeOneMonth)
  )
  
  workouts.forEach(bodyP_workout => {
    const exercises = Object.keys(bodyP_workout.workout)
    exercises.forEach(oneExerciseNames => {
      const sets = bodyP_workout.workout[oneExerciseNames]
      updateRekords(oneExerciseNames, 
                    sets, 
                    allExercises,
                    bodyP_workout.bodypart)

      update_last_workouts(allExercises,
                           bodyP_workout.bodypart,
                           oneExerciseNames,
                           sets)
    
    })
  })
  // save all Exercises
  FileOperations.saveAllExercises(allExercises)
  // save settings
  settings.lastTimeOpened = dateOfToday + " " + Time.getCurrentTime()
  FileOperations.save_settings(settings) 
}
module.exports.checkRekords_and_lastWorkouts = checkRekords_and_lastWorkouts;


const get_last_set = (exerciseSets) => {
  /**
    return: [float], array of size 3 with last weight, reps, 
      and volume. Important for creating a new set...
   */
  let volume = 0
  let weight = 0
  let repsForWeight = 0

  const last_idx = exerciseSets.length - 1
  if(last_idx >= 0){
    const last_set = exerciseSets[last_idx]
    if(last_set.type == "maxWeight"){
      // search for highest weight + its repitions
      weight = last_set.weight.amount
      repsForWeight = last_set.repetitions
    }
    else if(last_set.type == "volume"){
      // calculate volume for several sets of on exercise
      volume = last_set.weight.amount*last_set.repetitions
    }
  }

  return [weight, repsForWeight, volume]
}
module.exports.get_last_set = get_last_set;