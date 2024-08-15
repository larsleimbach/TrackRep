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

const read_version = (installer_str) => {
   /**
      installer_str: string, the whole installer file as a string (size > 10MB).
      return: number
      This function returns the version of the current TrackRep app.
    */
   // efficient way to search for version
   for(let i = 0; i < installer_str.length; i++){
      if(installer_str[i] === "V"
         && installer_str.slice(i,i+8) === "VERSION "){
            //QuickLook.present(installer_str.slice(i,i+8))
            // find end index
            const begin_idx = i+8
            i += 8 
            let end_idx = 0
            for(; i < installer_str.length; i++){
               if(installer_str[i] === "\n"){
                  end_idx = i
                  break
               }
            }
            
            //QuickLook.present(`${begin_idx} ${end_idx}`)
            //QuickLook.present(installer_str.slice(begin_idx,end_idx))
            return Number(installer_str.slice(begin_idx,end_idx))

      }
   }
}


const internet_conntection = async() => {
   /**
      return: bool
      Tests if there is an internet connection
    */
   try {
      //const url_of_installer = "https://github.com/larsleimbach/TrackRep"
      // load README for faster check
      const url_of_installer = "https://raw.githubusercontent.com/larsleimbach/TrackRep/main/README.md"

      const request = new Request(url_of_installer)
      const intstaller_content = await request.loadString()
   } catch (error) {
      return false
   }
   // no error -> could load website
   return true
}
module.exports.internet_conntection = internet_conntection;

const update = async () => {
   /**
   Check if version of install TrackRep is higher than current.
   */
   const internet_available = await internet_conntection()
   if(!internet_available){
      // don't try to update if there is no internt
      return
   }
   notification = new Notification()
   notification.body = "Checking for updates...🔎"
   await notification.schedule()

   const url_of_installer = "https://github.com/larsleimbach/TrackRep/raw/main/Install%20TrackRep%F0%9F%9B%A0%EF%B8%8F.js"

   const request = new Request(url_of_installer)
   const intstaller_content = await request.loadString()

   const version = read_version(intstaller_content)
   
   let settings = FileOperations.globalSettings()
   
   if(settings.version < version){
      // save to root of Scriptable app
      notification = new Notification()
      notification.body = "There is a new update🎉 Plase wait..."
      await notification.schedule()

      const fm = FileManager.iCloud()

      // Global accessable paths
      const gymPath = fm.documentsDirectory()
      
      fm.writeString(gymPath+"/Install TrackRep🛠️.js", intstaller_content)


      // just importing that file will trigger the main of the file
      const Installer = await importModule("Install TrackRep🛠️.js")

      // set new version:
      settings.version = version
      FileOperations.save_settings(settings)
   }


}
module.exports.update = update;

const sync_iCloud = async () => {
  /**
    Downloads all files from icloud if internet is acitve
  */   
   const internet_available = await internet_conntection()
   if(!internet_available){
      // don't try to update if there is no internt
      return
   }
   notification = new Notification()
   notification.body = "Sync with iCloud...🛜🔄 "
   await notification.schedule()

   const allFiles = FileOperations.read_filesystem("", [])
   const fm = FileManager.iCloud()
   for(let i = 0; i < allFiles.length; i++){
    if(!fm.isFileDownloaded(FileOperations.root+"/"+allFiles[i])){
      await fm.downloadFileFromiCloud(FileOperations.root+"/"+allFiles[i])
    }
   } 
} 
module.exports.sync_iCloud = sync_iCloud;