// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: black; icon-glyph: magic;

const FileOperations = importModule("gym_workout/helper/FileOperations.js")

const workoutFolder = FileOperations.getCurrentYearFolder()

const fm = FileManager.iCloud()

const allExercises = FileOperations.allExercises()




fm.listContents(workoutFolder).forEach(workoutFileName => {
   const workout = FileOperations.readJsonFile(`${workoutFolder}/${workoutFileName}`)

   const bodypart = workoutFileName.split(" ")[1].replace(".json", "")

   Object.keys(workout).forEach(exercise_name => {
      // QuickLook.present(bodypart,false)
      // QuickLook.present(exercise_names,false)
      allExercises[bodypart][exercise_name]["count"] += 1
      const kg_rekord = allExercises[bodypart][exercise_name]["rekords"]["maxWeight"]["amount"]
      const reps_rekord = allExercises[bodypart][exercise_name]["rekords"]["maxWeight"]["reps"]
      
      workout[exercise_name].forEach(oneSet => {
         // console.log(oneSet)
         if(kg_rekord < oneSet.weight.amount){
            allExercises[bodypart][exercise_name]["rekords"]["maxWeight"]["amount"] = oneSet.weight.amount
            allExercises[bodypart][exercise_name]["rekords"]["maxWeight"]["reps"] = oneSet.repetitions
         }
         else if(kg_rekord === oneSet.weight.amount && reps_rekord < oneSet.repetitions){
            allExercises[bodypart][exercise_name]["rekords"]["maxWeight"]["amount"] = oneSet.weight.amount
            allExercises[bodypart][exercise_name]["rekords"]["maxWeight"]["reps"] = oneSet.repetitions
         } 
      }) 
   })
})
FileOperations.saveAllExercises(allExercises)