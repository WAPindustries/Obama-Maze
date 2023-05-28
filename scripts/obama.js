let Obama

function CreateObama(){
	var plane = new BABYLON.MeshBuilder.CreatePlane("obama", {
		width: Game.Settings.ObamaWidth,
		height: Game.Settings.ObamaHeight,
		sideOrientation: BABYLON.Mesh.DOUBLESIDE
	}, Game.Scene)

	var material = new BABYLON.StandardMaterial("", Game.Scene)
	material.diffuseTexture = new BABYLON.Texture("assets/obama.png", Game.Scene)
	material.emissiveColor = new BABYLON.Color3.White()
	material.specularColor = new BABYLON.Color3(0, 0, 0);
	material.diffuseTexture.hasAlpha = true
	material.useAlphaFromDiffuseTexture = true

	plane.material = material

	plane.position.y = Game.Scene.getMeshByName("ground").position.y+Game.Settings.ObamaHeight/2
	plane.position.x = Game.Settings.ObamaStart.x*Game.Settings.WallWidth-Game.Settings.GridWidth/2*Game.Settings.WallWidth
	plane.position.z = Game.Settings.ObamaStart.z*Game.Settings.WallWidth-Game.Settings.GridWidth/2*Game.Settings.WallWidth

	Game.Scene.lights[0].excludeMeshes = [plane]

	Game.SetCollision(plane)

	return plane
}

function SetBeatbox(){

	window.requestAnimationFrame(SetBeatbox)

	let dist = Math.sqrt(
		Math.pow(Math.abs(Obama.position.z-Game.Camera.position.z), 2)+
		Math.pow(Math.abs(Obama.position.x-Game.Camera.position.x), 2)
	)

	// let maxdist = Math.sqrt(Math.pow(Game.Settings.ObamaSoundMaxDist*Game.Settings.WallWidth, 2)*2)/10

	dist/=Game.Settings.WallWidth*10

	dist = dist>1 ? 1:dist

	let volume = 1-dist

	document.getElementById("beatbox").volume = volume
}


function JumpScare(){
	canvas2.style.display = "block"
	document.body.removeChild(canvas)
	document.body.removeChild(Game.ObamiumCount)

	document.getElementById("beatbox").pause()
	document.getElementById("jumpscare").play()
}