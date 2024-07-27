// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: magic;


const read_version = (installer_str) => {
   /**
      installer_str: string, the whole installer file as a string (size > 10MB).
      return: number
      This function returns the version of the current TrackRep app.
    */
   // efficient way to search for version
   for(let i = 0; i < installer_str.length; i++){
      if(installer_str.slice(i,i+2) === "VE" ){
         //&& installer_str.slice(i,i+8) === "VERSION "){
            QuickLook.present(installer_str.slice(i,i+8))
            // find end index
            const begin_idx = i+8
            i = i+8 
            let end_idx = 0
            for(; i < installer_str.length; i++){
               if(installer_str[i] === "\\"){
                  end_idx = i
                  break
               }
            }
            
            QuickLook.present(installer_str.slice(begin_idx,end_idx))
            return 3

      }
   }
}

const update = async () => {
   /**
   Check if version of install TrackRep is higher than current.
   */
   const url_of_installer = "https://github.com/larsleimbach/TrackRep/raw/main/Install%20TrackRep%F0%9F%9B%A0%EF%B8%8F.js"

   const request = new Request(url_of_installer)
   const intstaller_content = await request.loadString()

   const verstion = read_version(intstaller_content)
   return 
   // save to root of Scriptable app
   const fm = FileManager.iCloud()

   // Global accessable paths
   const gymPath = fm.documentsDirectory()
   
   fm.writeString(gymPath+"/Install TrackRep🛠️.js", intstaller_content)


}
module.exports.update = update;

