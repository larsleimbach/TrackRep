// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: magic;

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

const update = async () => {
   /**
   Check if version of install TrackRep is higher than current.
   */
   let notification = new Notification()
   notification.body = "Looking for updates📰"
   await notification.schedule()
   
   const url_of_installer = "https://github.com/larsleimbach/TrackRep/raw/main/Install%20TrackRep%F0%9F%9B%A0%EF%B8%8F.js"

   const request = new Request(url_of_installer)
   const intstaller_content = await request.loadString()

   const version = read_version(intstaller_content)
   
   let settings = FileOperations.globalSettings()
   
   if(settings.version < version){
      // save to root of Scriptable app
      notification = new Notification()
      notification.body = "There is a new update🎉"
      await notification.schedule()

      const fm = FileManager.iCloud()

      // Global accessable paths
      const gymPath = fm.documentsDirectory()
      
      fm.writeString(gymPath+"/Install TrackRep🛠️.js", intstaller_content)


      // just importing that file will trigger the main of the file
      const Installer = await importModule("Install TrackRep🛠️.js")
   }


}
module.exports.update = update;


