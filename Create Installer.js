// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: magic;


/**
This file garthers all content from the developer folders
in Base64 or string format in one file.
After this by running the script it will copy the folder structure and 
file to the iCloud file system.
 */ 
const fm = FileManager.iCloud()
const root = fm.documentsDirectory()
const project_name = "TrackRep!💪"
const main_folder = "/gym_workout"
const pathInstallerFile = "/Install TrackRep🛠️.js"
const path_to_settings = "/gym_workout/settings.json"
const version = 0.3

// treat these folders and files differently (while update) bc they can 
// contain data created by the user...
const blacklist = [
  "allExercises.json","settings.json", "workouts"
]
const load_diff_location = {
  "allExercises.json" : main_folder+"/build/allExercises.json",
  "settings.json" : main_folder+"/build/settings.json"
}

// to detect copy_right ->  hardcoded string....
const copy_right = `// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: dumbbell;

/**
 * Author: Lars Leimbach
 * License: MIT
 *
 * This file is part of ${project_name}.
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
`;

const readFilesystem = () => {
  /**
  filessystem = [file] see below for definiton

  const file = {
    path: ,// from main_folder
    content: ,// base64 string or array if folder
    type: ""// text, photo, folder
  }
  */
  // just do the 
  const runTrackRep_file = {
    path: `/${project_name}.js`,
    content: Data.fromFile(root + `/${project_name}.js`).toBase64String(),
    type: "text"
  }
  
  // rekursiv function to read the filesystem
  const read_fs = (curPath) => {
    const files_and_folders =  fm.listContents(root+curPath)
    
    const tmp = []
    for(let i = 0; i < files_and_folders.length; i++){
      const name = files_and_folders[i]
      const newPath = curPath + "/" + name
      if(fm.isDirectory(root+newPath)){
        // do only the rekursiv step for folders not called workouts
        tmp.push({
          path: newPath,
          content: name !== "workouts" ? read_fs(newPath) : [],
          type: "folder"
        })
      }
      else {
        // it's a file
        let filePath = root+newPath
        const buildFiles = Object.keys(load_diff_location)
        if(buildFiles.includes(name)){
          // some files should not be loaded from the build folder
          filePath = root+load_diff_location[name]
        }

        const file = {
            path: newPath,
            content: Data.fromFile(filePath).toBase64String(),
            type: name.includes(".JPG") ? "photo" : "text"
        }
        tmp.push(file)
      }
    }
    return tmp
  }

  
  const filesystem = [
    runTrackRep_file, 
    {
      path: main_folder,
      content: read_fs(main_folder),
      type: "folder"
    }
  ]
  
  return filesystem
}


 const createInstaller = () => {

  const filesystem = readFilesystem()
  const filesystem_str = JSON.stringify(filesystem, null, 2)
  

  const blacklist_str = JSON.stringify(blacklist, null, 2)


  /**
  the install has to differentare between an 
  update:
  -> no install of private data (photos, allExercise, settings)
  install: 
  ->  install everything
  */ 
  const code = `// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: dumbbell;

// Don't change this and the following two lines!
//VERSION ${version}
const version_of_installer = ${version}


const fm = FileManager.iCloud()
const root = fm.documentsDirectory()


const ask_to_install = async (shouldOverwrite) => {
  if(!shouldOverwrite){
    // no overwrite
    return false
  }
  let ask = new Alert()
  ask.title = "Do you really want to reinstall? (everything will be OVERWRITTEN. That means everything (photos, saved workouts) will be delted.)"
  ask.addAction("Yes")
  ask.addCancelAction("No")
  const pressedButton = await ask.present()
  
  if(pressedButton > -1){
    ask = new Alert()
    ask.addAction("Yes")
    ask.addCancelAction("No")
    ask.title = "Are you sure to overwrite everything? This operation can not be undone."
    const pressedButton2 = await ask.present()

    return pressedButton2 > -1
  }
  // no overwrite
  return false
}

const check_existenz_of_app = (filesystem) => {
  /**
    filesystem: object, selfconstructed object that 
      represents the filesystem
    This function determines if the user intetntion was to overwrite
      the app and reinstall it or if it is a normal update
  */
  let app_exists = false
  // check if folders or main file exists
  for(let i = 0; i < filesystem.length; i++){
    const path = filesystem[i].path
    if(fm.fileExists(root+path) || fm.isDirectory(root+path)){
      app_exists = true
      break
    }
  }

  if(app_exists){
    // check if called from update routine
    // get settings version of current app
    
    let askForOverwrite = false

    if(fm.fileExists(root+"${path_to_settings}")){
      const settings = JSON.parse(fm.readString(root+"${path_to_settings}"))
      const cur_version = settings.version

      // give a toleraz due to float comparision
      if(Math.abs(cur_version - version_of_installer) < 0.0001){
        // if version is equal -> ask for overwrite
        // version are the same did the user wants to overwrite?
        askForOverwrite = true
      }
    }
    else {
      if(fm.isDirectory(root+"${main_folder}")){
        // if main folder exist main installation was incorrect...
        askForOverwrite = true
      }
    }
    return askForOverwrite
  }
  // no overwrite
  return false
}

function addLicense(inputString) {
  /**
    inputString: string
    This function adds only the license if it is not added yet
  */
    let returnText = inputString
      
    const license = \`${copy_right}\`

    if(!inputString.includes(license)){
      
      // Split the string into an array of lines
      let lines = inputString.split('\\n');

      // Remove the first three lines
      lines = lines.slice(3);
      
      returnText  = license + lines.join('\\n')
    }

    
    // Join the remaining lines back into a string
    return returnText;
}

const install_or_update = async () => {

  const filesystem = ${filesystem_str}

  const blacklist = ${blacklist_str}
  
  // --------------------------------------------
  // --------------- recursiv funciton ----------
  // --------------------------------------------

  const create_filesystem = (curLocation, overwrite) => {

    if(curLocation.type === "folder"){
      // create only if folder does not exists
      let folder_exists = fm.isDirectory(root+curLocation.path)
      
      if(overwrite && folder_exists){
        // delte folder 
        fm.remove(root+curLocation.path)
        // little hack to trigger folder creation
        folder_exists = false
      }

      if(!folder_exists){
        // only create folders if folder doesn't existed before
        fm.createDirectory(root+curLocation.path)
      }
      
      
      for(let i = 0; i < curLocation.content.length; i++){
        create_filesystem(curLocation.content[i], overwrite)
      }
    }
    else{
      const file_exists = fm.fileExists(root+curLocation.path)

      if(curLocation.type === "photo"){
        // policy: always overwrite photos -> user should not create
        //  photos. The author of this app maybe wants to replace 
        //  photos. That's why always replace         

        const pic_data = Data.fromBase64String(curLocation.content)
        const image = Image.fromData(pic_data)
        fm.writeImage(root+curLocation.path, image)
      }
      else if(curLocation.type === "text"){
        
        const name = fm.fileName(root+curLocation.path, true)
        
        if(file_exists){
          // check if file is on black list
          
          if(!overwrite && blacklist.includes(name)){
            console.log("return because blacklist")
            console.log(root+curLocation.path)
            // don't overwrite sensible file
            return
          }
        }

        const text_data = Data.fromBase64String(curLocation.content)
        let final_str = text_data.toRawString()
        if(!blacklist.includes(name)){
          // only if files are not on black list add license
          final_str = addLicense(final_str)
        }
        fm.writeString(root+curLocation.path, final_str)
      }
      else{
        console.error("No such type! Wrong data:")
        console.error(curLocation)
      }
    }
  }
  // check if app was already installed
  console.log("before check exitenz")
  let overwrite = check_existenz_of_app(filesystem)
  console.log("before ask to install")
  // be sure and ask user for overwriting
  overwrite = await ask_to_install(overwrite)
  
  
  
  let notification = new Notification()
  if(overwrite){
    notification.body = "App Reinstall (overwrite: active)...🔧"
  }
  else{
    notification.body = "Normal Update/Installation...🔄"
  }
  await notification.schedule()

  // the main folder is just an array
  for(let i = 0; i < filesystem.length; i++){
      create_filesystem(filesystem[i], overwrite)
  }

  
  fm.remove(root+"${pathInstallerFile}")
  
  notification = new Notification()
  notification.body = "Done!🏁 Please Restart Application"
  await notification.schedule()
}

install_or_update()

`;
  fm.writeString(root+pathInstallerFile, code)


}

createInstaller()
