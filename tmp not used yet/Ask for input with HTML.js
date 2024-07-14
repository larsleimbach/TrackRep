// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;
	async function getRepsAndWeight(){
	// create html for asking for input 

	const html = `<!DOCTYPE html>
		<html>
 		<body>
		<h1>Close window AFTER typing in reps and weight</h1>
		
		<form action="/action_page.php">
		  <label for="weight">Weight:</label><br>
  		<input type="number" id="weight" name="weight"><br>
  		<label for="reps">Repition:</label><br>
  		<input type="number" id="reps" name="reps"><br>
		</form>

  		</body>;
		</html>`

	const wv = new WebView();

	const js = `
  		const weight = document.getElementsByName("weight")[0].value;
			const reps = document.getElementsByName("reps")[0].value;
  		completion({ weight: Number(weight), reps: Number(reps) });`;
	await wv.loadHTML(html);
	await wv.present();
	const result = await wv.evaluateJavaScript(js,true);
  
  const repitions = result.reps;
  const weight = result.weight;
  

}