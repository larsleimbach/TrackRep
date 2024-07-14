// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: magic;

const FileOperations = importModule("gym_workout/helper/FileOperations.js")

const fileAllExercises = FileOperations.allExercises()
const lastWorkoutJson = FileOperations.readJsonFile(
   FileOperations.gymPath + "/lastWorkout.json"
)
const rekordsJson = FileOperations.readJsonFile(
   FileOperations.gymPath + "/rekords.json"
)

const newExercisePath = `${FileOperations.gymPath}/allExercises2.json`

const newExerciseFile = {}


Object.keys(fileAllExercises).forEach(bodypart => {
   const exercises = {}
   
   fileAllExercises[bodypart].forEach(exercise => {
      exercises[exercise.name] = {
         count: 0,
         expanded: false,
         bodypart: bodypart,
         lastWorkout: lastWorkoutJson[exercise.name],
         rekords: {
            volume: {
               amount: 0,
               unit:"kg*reps"
            },
            maxWeight: {
               amount: 0,
               reps: 0,
               unit: "kg"
            }
         }
      }
   })
   
   newExerciseFile[bodypart] = exercises
})


FileOperations.writeJsonFile(newExerciseFile,newExercisePath )