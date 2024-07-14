// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: magic;


const FileOperations = importModule("gym_workout/helper/FileOperations.js")
const SettingsModule = importModule("gym_workout/helper/Settings.js")
const GlobalVariables = importModule("gym_workout/helper/GlobalVars.js")

/**
This file contains the rows that were printed in the main view
*/

const reloadTable = (idx, table, rowsOfTable) => {
   /**
   idx: int, the index where the action happen (update/insert)
   */
   
   table.removeAllRows()
   rowsOfTable.forEach(rowInfo => {
      if(rowInfo.visible){
         // add only if row is visable
         table.addRow(rowInfo.row)
      }
   })
   table.reload()
}

const insert_row = (idx, rows, table, rowsOfTable) => {
  /**
  idx: int
  rows : [{row:UITableRow}]
  rowsOfTable : [{row:UITableRow}]
  table: UITable
  this function insert all rows in the rows array to the position in the rowsOfTable
  and the deletes everything in the table and rebuilds the table again the the
  rowsOfTable
  */
  rowsOfTable.splice(idx, 0, ...rows)//insert
  
  reloadTable(idx, table, rowsOfTable)
}
module.exports.insert_row = insert_row;

const updateRow = (idx, newRow, table, rowsOfTable) => {
  /**
  idx: int
  newRow: [{row:UITableRow}]
  */
  rowsOfTable.splice(idx, newRow.length, ...newRow)// replaces

  reloadTable(idx, table, rowsOfTable)
}
module.exports.updateRow = updateRow;

const deleteRows = (startIdx, 
                    endIdx, 
                    table, 
                    rowsOfTable,
                    exercise_name,
                    bodypart) => {
   /**
   startIdx: int
   endIdx: int
   newRow: [{row:UITableRow}]
   */
   
   // reset index of following sets
   // jump to next plus minus rows
   // update ALL rows in firstRowInTable 
   
   // update idx_of_set only in the array of the exercise
   for(let i = endIdx+1; i < rowsOfTable.length; i += 1){
      
      if(rowsOfTable[i].hasOwnProperty("exercise_name")
         && rowsOfTable[i].hasOwnProperty("bodypart")
         && rowsOfTable[i].hasOwnProperty("idx_of_set")
         && rowsOfTable[i].exercise_name === exercise_name
         && rowsOfTable[i].bodypart === bodypart){
         // decrase idx of set for following
         rowsOfTable[i].idx_of_set -= 1
      }
      if(rowsOfTable[i].hasOwnProperty("firstRowInTable")){
         rowsOfTable[i].firstRowInTable -= GlobalVariables.count_rows_of_ex
      }
   }
   
   // delte out of array 
   rowsOfTable.splice(startIdx, endIdx - startIdx + 1, ...[])

   reloadTable(startIdx, table, rowsOfTable)
}
module.exports.deleteRows = deleteRows;

const sortExercisesByDateAndCount = (allExercises,
                                     selectedBodyparts) => {
   
   const Time = importModule("gym_workout/helper/Time.js")
   // extract time, name and bodypart
   let exercisesNames = []

   selectedBodyparts.forEach(bodypart => {
      const exercises_names = Object.keys(allExercises[bodypart])

      let time = "2000.01.01 22-22-22"
      exercises_names.forEach(name => {
         
         const idx_last = allExercises[bodypart][name].lastWorkout.length - 1
         if(allExercises[bodypart][name].lastWorkout.length > 0
            && allExercises[bodypart][name].lastWorkout[idx_last].time != ""){
            // there is a last workout - > update time
            time = allExercises[bodypart][name].lastWorkout[idx_last].time
         }

         const info = {
            time: Time.toDate(time).getTime(),// converts to timestamp 
            bodypart: bodypart,
            name: name,
            count: allExercises[bodypart][name].count
         }
         
         exercisesNames.push(info)
      })
   })

   // sort by count:
   const sortByCount = GlobalVariables.sortByFrequency(exercisesNames)
   if(sortByCount.length == 0){
      return []
   }

   
   // put all counts with similar count in one array
   const sortedCount_exercisesNames = []
   let curCount = sortByCount[0].count
   let tmp_sameCount = []
   sortByCount.forEach(info => {
      if(curCount != info.count){
         sortedCount_exercisesNames.push(tmp_sameCount)
         curCount = info.count
         tmp_sameCount = []
      }
      tmp_sameCount.push(info)
   })
   // one last time to avoid last one wont be pushed
   sortedCount_exercisesNames.push(tmp_sameCount)

   
   exercisesNames = []
   // sort by date:
   sortedCount_exercisesNames.forEach(sameCount => {
      // expand to flat array
      exercisesNames.push(...GlobalVariables.sortByDate(sameCount))
   })
   
   return exercisesNames
}


// ------------------------------------------------------
// ---------------- Bodypart selection row --------------
// ------------------------------------------------------
const createFilterRow = (selectedBodyParts,
                         onSelectOnRow,
                         table,
                         rowsOfTable,
                         settings) => {
   /**
   selectedBodyParts: [string]
   selectedWorkout: (int) => {}, main funtion after pressing a row
   table: UITable
   rowsOfTable: [{bodypart: str, exercise: str}] , [bodypart, exerciseName]
   
   tapping on this row opens a selection to 
   select which body part should be trained
   */
   let rowHeader = new UITableRow()	
   rowHeader.dismissOnSelect = false
   rowHeader.onSelect = onSelectOnRow
   rowHeader.height = 80
   rowHeader.isHeader = true
   const cell = rowHeader.addText("selected workouts:","for   " + settings.selectedGym)
   cell.subtitleFont = new Font("Chalkduster",9)
   cell.titleFont = new Font("Avenir-Black",25)
   
   rowsOfTable.push({row: rowHeader, 
                     visible: true
                     })

   
   let rowPictures = new UITableRow()
   rowPictures.onSelect = onSelectOnRow
   rowPictures.dismissOnSelect = false
   rowPictures.height = 120

   if(selectedBodyParts.length === 0){
      // no workout was selected. Tell that the user...
      const noWorkout_cell = rowPictures.addText("No bodypart selected","tap to change")
      noWorkout_cell.subtitleFont = new Font("Chalkduster",9)
   }
   else{
      selectedBodyParts.forEach(bodypart => {
         // add pic of body part
         FileOperations.addPicToRow(rowPictures, bodypart)
      })
   }
   
   rowsOfTable.push({row: rowPictures,
                     visible: true})
   
};
module.exports.createFilterRow = createFilterRow;

// ------------------------------------------------------
// -------------------- settings row --------------------
// ------------------------------------------------------

const createSettingsRow = (table,
                           rowsOfTable) => {
   let row = new UITableRow()	
   row.dismissOnSelect = false

   const imageCell = row.addImage(SFSymbol.named("gear").image)
   imageCell.widthWeight = 30
   const textCell = row.addText("Open settings")
   textCell.titleFont = new Font("Avenir-Book",20)
   textCell.widthWeight = 70

   row.onSelect = SettingsModule.openSettings
   
   
   rowsOfTable.push({skip:true, 
                     row: row,
                     visible: true})
   // TODO change other row if they have dependencies to the
   // settings. like the first with the gym 
}
module.exports.createSettingsRow = createSettingsRow;

// ----------------------------------------------
// ----------------------------------------------
// ----------------------------------------------



const createInputRow = (row_title, 
                        amount,
                        row_id,
                        onSelect,
                        unit,
                        bodypart,
                        exercise_name,
                        idx_of_set,
                        workoutType,
                        firstRowInTable,
                        expanded) => {
   // this row is for inputting weight and reps
   const return_rows = []
   
   const amount_change = GlobalVariables.amount_change(row_id, unit)

   const plus_row = new UITableRow()
   plus_row.dismissOnSelect = false
   plus_row.onSelect = onSelect
   plus_row.height = 40
   plus_row.addText("+","")
   
   return_rows.push({row: plus_row, 
                     is_minus_plus_row: true,
                     is_reps_row: row_id == GlobalVariables.id_reps_row,
                     is_weight_row: row_id == GlobalVariables.id_weight_row,
                     amount_change: amount_change,
                     bodypart: bodypart,
                     exercise_name: exercise_name,
                     idx_of_set: idx_of_set,
                     workoutType: workoutType,
                     firstRowInTable: firstRowInTable,
                     visible: expanded
                     })

   const amount_row = new UITableRow()   
   amount_row.addText(`${row_title}`,"")
   amount_row.addText(`${amount}`,"")

   return_rows.push({row: amount_row,
                     skip: true,
                     visible: expanded
                     })
   
   const minus_row = new UITableRow()
   minus_row.dismissOnSelect = false
   minus_row.onSelect = onSelect
   minus_row.height = 40
   minus_row.addText("-","")
   
   return_rows.push({row: minus_row, 
                     is_minus_plus_row: true,
                     is_reps_row: row_id == GlobalVariables.id_reps_row,
                     is_weight_row: row_id == GlobalVariables.id_weight_row,
                     amount_change: -amount_change,
                     bodypart: bodypart,
                     exercise_name: exercise_name,
                     idx_of_set: idx_of_set,
                     workoutType: workoutType,
                     firstRowInTable: firstRowInTable,
                     visible: expanded
                     })



   const seperator_row = new UITableRow()
   seperator_row.height = 20

   return_rows.push({row: seperator_row, 
                     skip: true,
                     visible: expanded})

   return return_rows
}

const createOnlyRepsAndWeight_rows = (reps_amount,
                                      weight_amount,
                                      onSelectOnRow,
                                      unit,
                                      bodypart,
                                      exercise_name,
                                      idx_of_set,
                                      workoutType,
                                      firstRowInTable,
                                      expanded) => {
   
   const repsRows = createInputRow("Repetions:", 
                                    reps_amount,
                                    GlobalVariables.id_reps_row,
                                    onSelectOnRow,
                                    unit,
                                    bodypart,
                                    exercise_name,
                                    idx_of_set,
                                    workoutType,
                                    firstRowInTable,
                                    expanded)
   
   const weightRows = createInputRow("Weight:",
                                    weight_amount,
                                    GlobalVariables.id_weight_row,
                                    onSelectOnRow,
                                    unit,
                                    bodypart,
                                    exercise_name,
                                    idx_of_set,
                                    workoutType,
                                    firstRowInTable,
                                    expanded)
   // add the delte button
   const delte_row = new UITableRow()
   delte_row.dismissOnSelect = false
   delte_row.onSelect = onSelectOnRow
   delte_row.height = 30
   // new Color("#b81414", 0.3)
   delte_row.backgroundColor = new Color("#b81414", 0.3)// dark red
   const delte_cell = delte_row.addImage(SFSymbol.named("trash.circle").image)
   //delte_cell.widthWeight = 20
   const textCell = delte_row.addText("Delete set","")
   //textCell.widthWeight = 80
   
   const row_info =  {row: delte_row,
                      is_delte_row: true,
                      bodypart: bodypart,
                      exercise_name: exercise_name,
                      idx_of_set: idx_of_set,
                      firstRowInTable: firstRowInTable,
                      visible: expanded} 

   // combine the two arrays
   return [...repsRows, ...weightRows, row_info]
}
module.exports.createOnlyRepsAndWeight_rows = createOnlyRepsAndWeight_rows


const create_lastWorkout_rekords_row = (isLastWorkout,
                                        table,
                                        rowsOfTable,
                                        exercise) => {

   const row = new UITableRow()
   row.dismissOnSelect = false
   let rowHeight = 25
   //row.height = rowHeight //small row
   let rowName = "Rekords:"
   if(isLastWorkout){
      rowName = "Last Workout:"
   }
   const cellLastWorkout = row.addText(rowName,"")
   cellLastWorkout.titleFont = new Font("Avenir-BlackOblique",10)
   cellLastWorkout.widthWeight = 25
   let summery = ""

   if(isLastWorkout){
      // create summery for last workout
      if(exercise && exercise.hasOwnProperty("lastWorkout")){
         exercise.lastWorkout.forEach(workoutSet => {
            // increase row-height with every last workout
            rowHeight += 15
            summery += `${workoutSet.repetitions}x${workoutSet.weight.amount} ${workoutSet.weight.unit} (${workoutSet.type})\n`
         })
         
      }
      if(summery === "0x0 kg (maxWeight)" || summery === "0x0 kg (volume)"){
         summery = "no last workout\n"
      }
   }
   else {
      // is rekord summery creation
      if(exercise && exercise.hasOwnProperty("rekords")){
         const allTypesOfRekords = Object.keys(exercise.rekords).sort()
         allTypesOfRekords.forEach(rekordName => {
            const rekord = exercise.rekords[rekordName]
            // increase row-height with every last workout
            rowHeight += 15
            let tmp_string = `${rekordName}: ${rekord.reps}x${rekord.amount} ${rekord.unit}\n`
            
            if(tmp_string.includes(" 0x0 kg")){         
               tmp_string = `${rekordName}: no rekord yet\n`
            }
            summery += tmp_string
            
         })
      }
   }
   // add dummy cell for correct height
   row.height = rowHeight
   // delete last '\n'
   summery = summery.substring(0,summery.length-1)
   const summeryCell = row.addText(summery,"")
   summeryCell.widthWeight = 75
   summeryCell.titleFont = new Font("Avenir-LightOblique",10)
   
   rowsOfTable.push({skip:true, 
                     row: row,
                     visible: exercise.expanded})
}


const createRepsAndWeightInputRow =  async (exercise, 
                                          onSelectOnRow,
                                          allExercises,
                                          exercise_name,
                                          rowsOfTable,
                                          table,
                                          workoutOfToday,
                                          bodypart,
                                          settings) => {   
   // -------- create rows of rekords --------
   let isLastWorkout = false
   create_lastWorkout_rekords_row(isLastWorkout,
                                  table,
                                  rowsOfTable,
                                  exercise)
   // -------- create rows of last workout --------
   isLastWorkout = true
   create_lastWorkout_rekords_row(isLastWorkout,
                                  table,
                                  rowsOfTable,
                                  exercise)
   
   let lastIdxInSets = 0
   
   // -------- create rows of repetitions/weight --------
   if(workoutOfToday.hasOwnProperty(exercise_name)){
      // there is a workout for today
      // iterater throught the sets 
      workoutOfToday[exercise_name].forEach((oneSet, idx) => {
         
         const rows = createOnlyRepsAndWeight_rows(oneSet.repetitions,
                                                   oneSet.weight.amount,
                                                   onSelectOnRow,
                                                   oneSet.weight.unit,
                                                   bodypart,
                                                   exercise_name,
                                                   idx,
                                                   oneSet.type,
                                                   rowsOfTable.length,
                                                   exercise.expanded)
         rows.forEach(rowInfo => {
            
            rowsOfTable.push(rowInfo)
         })
      })
      lastIdxInSets = workoutOfToday[exercise_name].length
   }
   
   // --------- plus button for a new set ----------------
   const plusButtonRow = new UITableRow()
   plusButtonRow.dismissOnSelect = false
   plusButtonRow.onSelect = onSelectOnRow
   const plusCell = plusButtonRow.addImage(SFSymbol.named("plus.circle").image)
   //plusCell.widthWeight = 20
   const buttonCell = plusButtonRow.addText("Add new set", "")
   //buttonCell.widthWeight = 80
   
   
   rowsOfTable.push({row: plusButtonRow,
                     is_add_set_row: true,
                     bodypart: bodypart,
                     exercise_name: exercise_name,
                     idx_of_set: lastIdxInSets+1,
                     visible: exercise.expanded})
}
module.exports.createRepsAndWeightInputRow = createRepsAndWeightInputRow;


const createExpanderRow = (exercise, 
                           bodypart,
                           onSelectOnRow,
                           exercise_name) => {
   // ------------- create exercise row -----------------
   const expander_row = new UITableRow()
   expander_row.dismissOnSelect = false
   expander_row.height = 70
   expander_row.onSelect = onSelectOnRow
   const expandIconName = exercise.expanded ? "chevron.down" : "chevron.right"
   const expandIconCell = expander_row.addImage(SFSymbol.named(expandIconName).image)
   expandIconCell.widthWeight = 5
   const cellImage = FileOperations.addPicToRow(expander_row, exercise_name)
   cellImage.widthWeight = 20
   const cellText = expander_row.addText(exercise_name,"")
   cellText.titleFont = new Font("Avenir-Book",15)
   cellText.widthWeight = 75
   
   return {row: expander_row,
            bodypart: bodypart,
            exercise_name: exercise_name,
            isExpanderRow: true,
            visible: true,// set always true because otherwise hidden
            expanded: exercise.expanded// use other flag because of bug
            }
}
module.exports.createExpanderRow = createExpanderRow;


const createExerciseRow = async (exercise, 
                                 onSelectOnRow,
                                 allExercises,
                                 exercise_name,
                                 rowsOfTable,
                                 table,
                                 workoutOfToday,
                                 bodypart,
                                 settings) => {
   
   const expander_row = createExpanderRow(exercise, 
                                          bodypart,
                                          onSelectOnRow,
                                          exercise_name)

   
   rowsOfTable.push(expander_row)
   
   
   // add rows for weight and repition input
   createRepsAndWeightInputRow(exercise, 
                               onSelectOnRow,
                               allExercises,
                               exercise_name,
                               rowsOfTable,
                               table,
                               workoutOfToday,
                               bodypart,
                               settings)
}
module.exports.createExerciseRow = createExerciseRow;


const refillCompleteTable = async (table,
                                 onSelectOnRow,
                                 selectedBodyparts,
                                 rowsOfTable,
                                 allExercises,
                                 settings,
                                 workoutsOfToday) => {
   
   table.removeAllRows()
   rowsOfTable = []
   
   // only create it once
   // -------------------- create bodypart selection ----------------------
   createFilterRow(selectedBodyparts,
                  onSelectOnRow,
                  table,
                  rowsOfTable,
                  settings)
   // -------------------- create settings button ----------------------
   createSettingsRow(table, rowsOfTable)
   

   // -------------------- show exercise buttons ----------------------
   // load current workout
   
   // sort by date
   const exercises_names = sortExercisesByDateAndCount(allExercises, selectedBodyparts)

   exercises_names.forEach(info => {
      const workoutOfToday = workoutsOfToday[info.bodypart]
      const oneExercise = allExercises[info.bodypart][info.name]
      
      createExerciseRow(oneExercise, 
                        onSelectOnRow, 
                        allExercises,
                        info.name,
                        rowsOfTable,
                        table,
                        workoutOfToday,
                        info.bodypart,
                        settings)
   })
   
   reloadTable(-1, table, rowsOfTable)
   
   return rowsOfTable
}
module.exports.refillCompleteTable = refillCompleteTable;

const correctIdx = (touchedIdx, rowsOfTable) => {
   // tappedRow can be incorrect due to not added rows
   //  in the table
   // count the rows that are not visable before touchedIdx
   //  and add it on top
   let visCount = 0
   let correctionVal = 0
   for(let i = 0; i < rowsOfTable.length && visCount <= touchedIdx; i++){
      // check if it is an Expander row
      if(rowsOfTable[i].visible){
         visCount++
      }
      else{
         correctionVal++
      }
   }
   return touchedIdx + correctionVal
}
module.exports.correctIdx = correctIdx;