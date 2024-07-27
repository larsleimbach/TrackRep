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
const pathInstallerFile = "/Install TrackRep🛠️.js"

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
        const file = {
            path: newPath,
            content: Data.fromFile(root+newPath).toBase64String(),
            type: name.includes(".JPG") ? "photo" : "text"
        }
        tmp.push(file)
      }
    }
    return tmp
  }

  const main_folder = "/gym_workout"
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
  
  

  const path_to_settings = root + "/gym_workout/settings.json"
  const settings = JSON.parse(fm.readString(path_to_settings))
  const version = settings.version

  // treat these folders and files differently (while update) bc they can 
  // contain data created by the user...
  const blacklist_while_update = [
    "allExercises.json","settings.json", "pictures", "workouts"
  ]
  const blacklist_str = JSON.stringify(blacklist_while_update, null, 2)
  
  
  // here is the code what the blacklist files
  // should be treated, maybe you want to update certain things in the
  // file
  const treatment_blocklist_files = ``;

  const operations_after = ``;


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
// Don't change this and the following line!
//VERSION ${version}


const ask_to_install = async (isInstall) => {
  if(isInstall){
    const ask = new Alert()
    ask.title = "Do you really want to install? (everything will be overwritten)"
    ask.addAction("Yes")
    ask.addCancelAction("No")
    const pressedButton = await ask.present()
    
    if(pressedButton == -1){
      return true
    }
    return false
  }
}
function deleteFirstThreeRows(inputString) {
    // Split the string into an array of lines
    let lines = inputString.split('\n');
    
    // Remove the first three lines
    lines = lines.slice(3);
    
    // Join the remaining lines back into a string
    return lines.join('\n');
}

const install_or_update = async (isInstall) => {
  const bool = await ask_to_install(isInstall)
  if(bool){
    // installation was aborted
    return
  }

  const fm = FileManager.iCloud()
  const root = fm.documentsDirectory()
  // 
  const filesystem = ${filesystem_str}

  const blacklist_str = ${blacklist_str}

  // if you update look if folder exists
  const create_filesystem = (curLocation) => {
    if(curLocation.type === "folder"){
      if(isInstall){
        // only create folders if is install routine
        fm.createDirectory(root+curLocation.path)
      }
      for(let i = 0; i < curLocation.content.length; i++){
        create_filesystem(curLocation.content[i])
      }
    }
    else{
      // current location is a file
      if(!isInstall && blacklist_str.includes(curLocation.path)){
        // curLoc is on blocklist and it is update-mode
        ${treatment_blocklist_files}
      }
      // it is install or not blocklist file
      if(curLocation.type === "photo"){
        const pic_data = Data.fromBase64String(curLocation.content)
        const image = Image.fromData(pic_data)
        fm.writeImage(root+curLocation.path, image)
      }
      else if(curLocation.type === "text"){
        const text_data = Data.fromBase64String(curLocation.content)

        const final_str = ${copy_right} + deleteFirstThreeRows(text_data.toRawString())
        fm.writeString(root+curLocation.path, final_str)
      }
      else{
        console.error("No such type! Wrong data:")
        console.error(curLocation)
      }
    }

  }
  for(let i = 0; i < filesystem.length; i++){
    // the main folder is just an array
    create_filesystem(filesystem[i])
  }

  
  fm.remove(root+${pathInstallerFile})
  
  ${operations_after}

}

const install = true
install_or_update(install)
`;
  fm.writeString(root+pathInstallerFile, code)


}

createInstaller()