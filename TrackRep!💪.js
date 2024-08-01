// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: dumbbell;
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

const FileOperations = importModule("gym_workout/helper/FileOperations.js")
const GlobalVariables = importModule("gym_workout/helper/GlobalVars.js")
const SettingsModule = importModule("gym_workout/helper/Settings.js")
const Time = importModule("gym_workout/helper/Time.js")
const RowsGenerator = importModule("gym_workout/helper/RowsForTable.js")
const Updater = importModule("gym_workout/helper/Updates.js")


const startUpRoutine = async () => {
	/**
		shows a nice text when opening the app the first time
	 */
	// check if started for the first time
	let settings = FileOperations.globalSettings()
	
	if(settings.showStartupMessage){
		// do boot up sequence

		//TODO maybe make HTML welcome message
		const welcome_message = `
			Welcome to my basic workout-tracker 😊
			Main propose is to set the weight and repetitions 
			for one specific workout.
			
			How to use:
			- Press the widget "track workout" on your homescreen to track a workout
			- You can see you rekords in widgets "rekords"
			- If you want to change the gym where you train, press the widget "workout settings"

			Additionals features (in settings):
			- Add/remove gyms. To see where you did the workout
			- Add/remove/edit workout exercises with picture
			- Set a comment
		`;
		await QuickLook.present(welcome_message, true)

		// ----------------- add a gym or more -----------------
		const allowAbort = false
		let addMoreGyms = false
		do{
			await SettingsModule.addGym(allowAbort)

			const moreGyms_alert = new Alert()
			moreGyms_alert.title = "Do you want to add more gyms?"
			moreGyms_alert.addAction("Yes")
			moreGyms_alert.addCancelAction("No")
			const pressedButton = await moreGyms_alert.present()

			addMoreGyms = pressedButton == 0  // Yes was pressed
		} while(addMoreGyms);
		// ----------------------------------------------------

		// activate comment for an exercise
		await SettingsModule.setCommentInSettings()

		// -------------- ask for weight Unit -----------------
		let weightUnit = ""
		const unit_alert = new Alert()
		unit_alert.title = "What weight unit do you want to use"
		unit_alert.addAction("Pounds [lbs]")
		unit_alert.addCancelAction("Kilogramm [kg]")
		const pressedButton = await unit_alert.present()
		if(pressedButton == -1){
			weightUnit = "kg"
		}
		else{
			weightUnit = "lbs"
		}
		// ---------------------------------------------------
		
		// load again the settings file because was written and isn't up-to-date
		settings = FileOperations.globalSettings()
		settings.weightUnit = weightUnit
		// set time when used last this application
		
		settings.showStartupMessage = false
		
		// save settings.json
		FileOperations.writeJsonFile(settings, FileOperations.settingsPath)
	}
	
}





const exerciseSelector = async () => {
	/**
		Displays the app
	 */
	
	const table = new UITable()
	
	
	// all exercises are all the necessary information about an exercise
	const allExercises = FileOperations.allExercises()
	
	// names of all bodyparts: [string]
	const allBodyparts = Object.keys(allExercises)
	
	// gloabal settings which are saved in json
	let settings = FileOperations.globalSettings()
	
	// which bodyparts are selected for filtering exercises
	let selectedBodyparts = settings.selectedBodyparts
	// the indecies are needed for one function call
	let selectedBodyparts_idxs = selectedBodyparts.map(name => allBodyparts.indexOf(name))
	
	// This array represents the table such that the
	// table doesn't need to be reloaded everytime
	// [{row:UITableRow}]
	let rowsOfTable = [] 

	// load the workouts of today in a dict, if they exists yet
	let workoutsOfToday = FileOperations.loadWorkoutsOfToday(selectedBodyparts)
	
	// function called after tapping a row in the table:
	const onSelectOnRow = async (tappedRow) => {
		if(tappedRow <= 1){
			// filter row for body parts was pressed
			if(tappedRow >= 0){
				const chooseMultiple = true
				const withPictures = true
				const withTitle = false
				selectedBodyparts_idxs = await GlobalVariables.chooseFromList(
					allBodyparts,
					chooseMultiple, 
					withPictures, 
					selectedBodyparts_idxs,
					withTitle
				)
				selectedBodyparts = selectedBodyparts_idxs.map(i => allBodyparts[i])
				// set in settings
				settings.selectedBodyparts = selectedBodyparts
				FileOperations.writeJsonFile(settings, FileOperations.settingsPath)
				// load again workouts of today
				workoutsOfToday = FileOperations.loadWorkoutsOfToday(selectedBodyparts)
			}
			
			// create all rows again
			rowsOfTable = await RowsGenerator.refillCompleteTable(
				table,
				onSelectOnRow,
				selectedBodyparts,
				rowsOfTable,
				allExercises,
				settings,
				workoutsOfToday
			)
			return
		}
		// correct tapped row if rows are not visable
		tappedRow = RowsGenerator.correctIdx(tappedRow, rowsOfTable)
		
		// load here bodypart and exercise name of tapped exercise
		const bodypart = rowsOfTable[tappedRow].bodypart
		const exercise_name = rowsOfTable[tappedRow].exercise_name

		if(rowsOfTable[tappedRow].isExpanderRow){
			// --------------------------------------------------
			// ---------- Row with collapse symbol --------------
			// --------------------------------------------------

			// flip visibility in allExercises
			const visibility = !allExercises[bodypart][exercise_name].expanded
			allExercises[bodypart][exercise_name].expanded = visibility
			// update exapnder row
			const expanderRow = RowsGenerator.createExpanderRow(
				allExercises[bodypart][exercise_name],
				bodypart,
				onSelectOnRow,
				exercise_name
			)

			// set visibility until the next entry is a expanderRow
			for(let i = tappedRow+1; i < rowsOfTable.length && !rowsOfTable[i].hasOwnProperty("isExpanderRow"); i++){
				rowsOfTable[i].visible = visibility				
			}

			// update expander row and shows precessing rows
			RowsGenerator.updateRow(
				tappedRow,
				[expanderRow],
				table,
				rowsOfTable
			)
			// change 'expanded' for the next rows
			// save change things in allExercises in json file
			FileOperations.saveAllExercises(allExercises)			
			
		}
		else if(rowsOfTable[tappedRow].is_minus_plus_row){
			// -----------------------------------------------
			// ---------- Row with plus/minus symbol ---------
			// -----------------------------------------------
			// plus or minus was pressed
			const setsOfExercise = workoutsOfToday[bodypart][exercise_name]
			const idx_in_sets = rowsOfTable[tappedRow].idx_of_set
			
			const workoutType = setsOfExercise[idx_in_sets].workoutType
			// idxToBeupdated should alway be the idx of the plus row of repitions
			// update value in current workout of today
			if(rowsOfTable[tappedRow].is_reps_row){
				setsOfExercise[idx_in_sets].repetitions += rowsOfTable[tappedRow].amount_change
			}
			else if(rowsOfTable[tappedRow].is_weight_row){
				setsOfExercise[idx_in_sets].weight.amount += rowsOfTable[tappedRow].amount_change
			}
			// update last_set in allExercises
			allExercises[bodypart][exercise_name].lastWorkout = setsOfExercise

			// update row in table
			const rows = RowsGenerator.createOnlyRepsAndWeight_rows(
				setsOfExercise[idx_in_sets].repetitions,
				setsOfExercise[idx_in_sets].weight.amount,
				onSelectOnRow,
				setsOfExercise[idx_in_sets].weight.unit,
				bodypart,
				exercise_name,
				idx_in_sets,
				workoutType,
				rowsOfTable[tappedRow].firstRowInTable,
				allExercises[bodypart][exercise_name].expanded
			)
			RowsGenerator.updateRow(
				rowsOfTable[tappedRow].firstRowInTable,
				rows,
				table,
				rowsOfTable
			)

			// save workout of today to filesystem
			GlobalVariables.updateWorkoutOfToday(
				workoutType,
				exercise_name,
				bodypart,
				setsOfExercise,
				workoutsOfToday[bodypart],
				settings
			)
			
		}
		else if(rowsOfTable[tappedRow].is_add_set_row){
			// ------------------------------------
			// ---------- Add set row -------------
			// ------------------------------------

			const workoutType = "maxWeight"
			const unit = "kg"

			// get for maxWeight the max set of last workout
			const [maxWeight, repsForMaxWeight, volume] = GlobalVariables.get_last_set(
				allExercises[bodypart][exercise_name].lastWorkout
			)
			
			// take just weight and reps of last entry of arrayd
			GlobalVariables.saveWorkout(
				workoutType,
				exercise_name, 
				bodypart, 
				maxWeight, 
				repsForMaxWeight,
				workoutsOfToday[bodypart],
				settings,
				allExercises
			)
			
			// index where new set should be inserted
			let idx_of_set = 0
			if(workoutsOfToday.hasOwnProperty(bodypart) 
					&& workoutsOfToday[bodypart].hasOwnProperty(exercise_name)){
				// property checks are necessary
				idx_of_set = (workoutsOfToday[bodypart][exercise_name]).length - 1
			}
			//insert new row with reps and weight with 
			const rows = RowsGenerator.createOnlyRepsAndWeight_rows(
				repsForMaxWeight,
				maxWeight,
				onSelectOnRow,
				unit,
				bodypart,
				exercise_name,
				idx_of_set,
				workoutType,
				tappedRow,
				allExercises[bodypart][exercise_name].expanded
			)
			// insert rows in table
			RowsGenerator.insert_row(tappedRow, rows, table, rowsOfTable)
		}
		else if(rowsOfTable[tappedRow].is_delte_row){
			// ------------------------------------
			// ---------- Delete row --------------
			// ------------------------------------
			const idx_in_sets = rowsOfTable[tappedRow].idx_of_set
			const firstRowOfSet = rowsOfTable[tappedRow].firstRowInTable

			// update table and rowsOfTable
			RowsGenerator.deleteRows(firstRowOfSet, 
											 tappedRow, 
											 table, 
											 rowsOfTable,
											 exercise_name,
											 bodypart)

			// delte from backend
			GlobalVariables.deleteSetFromWorkout(
				workoutsOfToday[bodypart], 
				exercise_name,
				bodypart,
				idx_in_sets
			)
		}

	}
	// hacky trick to tell function it was NOT called from table
	onSelectOnRow(-1)	

	await table.present(false)
	
};

const askOnceForCurrentGym = async () => {
	/**
		Ask once every day in which gym you are training
	 */
	const settings = FileOperations.globalSettings()
	// get last last of using this app
	const dateLastTime = Time.toDate(settings.lastTimeOpened)
	const today = Time.toDate(Time.getCurrentDate())
	if(dateLastTime < today){
		await SettingsModule.selectGym()
	}
}


const main = async () => {
	// check boot-up stuff:
	// checkForUpdate()
	
	if(!(config.runsInAccessoryWidget || config.runsInApp)){
		// aborts app start if you open in Finder the Scritable folder
		return
	}

	// check if opened for the first time
 	await startUpRoutine()

	// ask for gym once a day-> because I often forget to set it 
	await askOnceForCurrentGym()

	// check the rekords and update last Workout once a day
	GlobalVariables.checkRekords_and_lastWorkouts()

	

	// sync with icloud! so download all file which aint downloaded
	// syncWithICloud()
	console.log("jo before updater")
	// check for update
	await Updater.update()
	
	// show exercise selector
	// rekords will be updated with every new entry
	// for selected excise ask for weight and repitions 
	exerciseSelector()

}
// Update work! ^^
await main()

Script.complete()