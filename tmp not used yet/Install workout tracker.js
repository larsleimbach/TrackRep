// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: desktop;
/*
	Scoll down here are all files as string stored
*/
Script.complete()// dont execute this file its decrapted
const contentGlobalVars = `
let fm = FileManager.iCloud()//FileManager.local()

const gymPath = fm.documentsDirectory() + "/gym workout"
const workoutsFolder = gymPath + "/workouts"
const rekordsPath = gymPath + "/rekords.json"
const lastWorkoutPath = gymPath + "/lastWorkout.json"
const picturesPath = gymPath + "/pictures"
const settingsPath = gymPath + "/settings.json"

const globalVars = {
  legs:"legs", 
  biceps:"biceps", 
  triceps:"triceps", 
  shoulders:"schoulders", 
  chest:"chest",
  back:"back",
  dateFormater:"",//TODO
  gymFolder: gymPath,
  workoutsFolder: workoutsFolder,
  rekordsFile: rekordsPath,
  lastWorkoutFile: lastWorkoutPath,
  settingsFile: settingsPath,
  picturesPath: picturesPath,
}
/*
Naming conventions:
- isolated: every arm has its own weight
- weight: plates: this is a machine with weight plates
- lying: you lay with your back somewhere horizontal 
- incline: upward movement
- decline: downward movement
- cable: cable machines
*/
const exercises = {
  legs:[
     {name:"Squats"},
     {name:"Hack squats - weight plates"},
		 {name:"Legs - Hip adduction"},
     {name:"Butt - Hip abduction"},
     {name:"Leg press - classic"},
     {name:"Leg press - isolated"},
     {name:"Leg extension - seated machine"},
     {name:"Leg curl - weight plates"},
     {name:"Leg curl - seated machine"},
     {name:"Calf raise - seated weight plates"},
     {name:"Calf raise - standing machine"},
  ],
  chest:[
    {name:"Bench press - dumbbell lying"},
    {name:"Bench press - barbell lying"},
    {name:"Bench press - barbell decline"},
    {name:"Bench press - barbell incline"},
    {name:"Bench press - dumbbell decline"},
    {name:"Butterfly"},
    {name:"Chest fly - dumbbell"},
    {name:"Chest fly - cable cross decline"},
    {name:"Chest press - weight plates decline"},
    {name:"Chest press - weight plates super incline"},
    {name:"Chest press - weight plates horizontal lying"},
    {name:"Chest press - seated horizontal"},
  ],
  back: [
    {name:"Pulldown - cable wide"},
    {name:"Pulldown - weight plates front"},
    {name:"Rowing - barbell standing"},
    {name:"Rowing - cable seated"},
    {name:"Rowing - cable seated isolated"},
    {name:"Rowing - weight plates seated horizontal"},
    {name:"Rowing - weight plates seated d.y. horizontal"},
  ],
  triceps: [
    {name:"Pressdown - V-Bar"},
    {name:"Pressdown - Rope"},
    {name:"Pressdown - Straight bar"},
    {name:"Pressdown - Strap handle"},
  ],
  biceps: [
    {name:"SZ curls"},
    {name:"Biceps - curls cable machine"},
    {name:"Biceps - seated weight plates"},
  ],
  schoulders: [
    {name:"Shoulder press - dumbbell seated"},
    {name:"Shoulder fly - dumbbell standing"},
    {name:"Shoulder - cable lateral raise"},
    {name:"Shoulder - machine lateral raise"},    
    {name:"Shoulder press - weight plates"},
    {name:"Shoulder frontpress - machine"},
  ],
}


module.exports.globalVars = () => {return globalVars}
module.exports.exercises = () => {return exercises}
`;
/*
	Install whole application in the icloud folder
*/
let fm = FileManager.iCloud()//FileManager.local()

// creates a folder, if it doesnt exist yet
const createFolder = (path) => {
	if(!fm.isDirectory(path)){
  	// directory doesn't exist -> create it
		fm.createDirectory(path, false)
	}
}
// creates a file, if it doesnt exist yet
const createFile = (path, content) => {
	if(!fm.fileExists(path)){
		// overall rekord-file doesnt exist -> create it
		fm.writeString(path, content)
	}
}

// ------------------------------------
// -----------global vars--------------
// create global variables file in root folder
const root = fm.documentsDirectory();
const globalVarsFileName = "GlobalVars.js";
const globalVarsJsPath = root + "/"+ globalVarsFileName 
// create file for global vars
createFile(globalVarsJsPath, contentGlobalVars)
console.log("file global vars")
// load all possible workout form this file
let globalVarFile = importModule(globalVarsFileName)
// attention, these variables are functions
const globalVars = globalVarFile.globalVars();

// ------------------------------------
// -------------folders----------------
// root folder
console.log("gym folder", globalVars.gymFolder)
createFolder(globalVars.gymFolder);

// folder for all workouts
console.log("gym folder", globalVars.workoutsFolder)
createFolder(globalVars.workoutsFolder);

// folder for pictures
console.log("gym folder", globalVars.picturesPath)
createFolder(globalVars.picturesPath);
console.log("created all folders")

// ------------------------------------
// --------------files-----------------
let allWorkouts = globalVarFile.exercises();
// this file is similar to allWorkouts, but workoutnames are keys
let newWorkout = {};
// expand the name of workouts in the gloablvar-file with all properties of a workout
for(const [bodyPart, exercises] of Object.entries(allWorkouts)){
	
	// expand exercises json with definded stuff
	exercises.forEach(oldExercise => {
    let exercise = {};
    // add new properties for each exercise
    exercise["repetitions"] = 0
    exercise["weight"] = {unit:"kg",amount:0}
    exercise["time"] = ""
    exercise["type"] = "maxWeight"// all types: volume, maxWeight
		exercise["gymLocation"] = ""// maybe you workout in different gyms
		exercise["comment"] = ""
    newWorkout[oldExercise.name] = exercise;
  });  
}
const stringOf_allWorkout = JSON.stringify(newWorkout)

// create rekords file
createFile(globalVars.rekordsFile, stringOf_allWorkout)

// create last-workout file
createFile(globalVars.lastWorkoutFile, stringOf_allWorkout)


// create settings file
const settings = {
  gymlist:[],// maybe you workout in different gyms
  selectedGym:"",
  // will ask everytime after setting reps/weight, for a comment
  askForComment:false, 
  selectedBodyPart:[""],
};
createFile(globalVars.settingsFile, JSON.stringify(settings))


console.log("created all files")


//let text = fm.readString(".")