class Game{

	static Ended = false

	static ObamiumsCollected = 0

	static ResetGame(){

		canvas2.style.opacity = 0.5

		let resetbtn = document.createElement("button")
		resetbtn.style = "position: absolute; top:0; right: 0; left:0; bottom:0; margin: auto; background: none; color: white; border: none; text-align: center"
		resetbtn.innerHTML = "Retry"
		resetbtn.style.width = 200
		resetbtn.style.height = 100
		resetbtn.style.fontSize = 100 
		resetbtn.onclick=()=>window.location.reload()

		document.body.appendChild(resetbtn)
	}

	static StartGame(){

		document.body.removeChild(container)

		Game.Canvas = document.getElementById('canvas')
		Game.Canvas.width = document.documentElement.clientWidth
		Game.Canvas.height = document.documentElement.clientHeight

		Game.Map = map
		
		let engine = new BABYLON.Engine(Game.Canvas, true)

		Game.Scene = (()=>{
			var scene = new BABYLON.Scene(engine)

			scene.clearColor = new BABYLON.Color3.Black()

			scene.onPointerDown = (e)=>{
				if (e.button==0) engine.enterPointerlock()
				if (e.button==1) engine.exitPointerlock()
			}

			const gl = new BABYLON.GlowLayer("glow", Game.Scene)
			gl.customEmissiveColorSelector = function (mesh, subMesh, material, result) {
			  if (mesh.name === "obamium") {
			    result.set(1, 1, 1, 1);
			  } else {
			    result.set(0, 0, 0, 1);
			  }
			};
			gl.intensity = Game.Settings.ObamiumMinGlow
			gl._dir_ = "up"


			// enable physics
			scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0),new BABYLON.CannonJSPlugin())
			Game.PhysicsEngine = scene.getPhysicsEngine()


			Game.CreateCamera()	

			let light = new BABYLON.SpotLight("", new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, 1), Math.PI, 50, Game.Scene)
			let hlight = new BABYLON.HemisphericLight("", Game.Camera.position, Game.Scene)
			light.parent = hlight.parent = Game.Camera
			light.intensity = 0.5
			hlight.intensity = 0.2

			return scene
		})()

		Game.CreateGround()
		Game.CreateMap()
		Game.CreateUI()


		// create obama and start chase
		Obama = CreateObama()
		FindRoute()
		const CheckRay = setInterval(()=>{
			if (Game.Ended) {clearInterval(CheckRay); return}
			if (RayCast()){
				clearInterval(Travel)
				FindRoute()
			}
		}, 2000)


		// start beatbox
		SetBeatbox()
		document.getElementById("beatbox").play()

		// DrawMap()

		for (var i=0;i<Game.Settings.ObamiumSpawnCount;i++) Game.SpawnObamium()

		engine.runRenderLoop(()=>Main())	
	}

	static CreateCamera(){

		Game.Camera = new BABYLON.FreeCamera("", new BABYLON.Vector3(0, Game.Settings.POVHeight, -10), Game.Scene)
		Game.Camera.setTarget(new BABYLON.Vector3(0,Game.Settings.POVHeight,0))
		Game.SetCollision(Game.Camera)
		Game.Camera.ellipsoid = new BABYLON.Vector3(Game.Settings.POVWidth, Game.Settings.POVWidth, Game.Settings.POVWidth)

		Game.Camera.attachControl(Game.Canvas, true)
		Game.Camera.keysUp = [87]
		Game.Camera.keysDown = [83]
		Game.Camera.keysLeft = [65]
		Game.Camera.keysRight = [68]

		Game.Camera.speed = Game.Settings.POVSpeed
	}

	static CreateGround(){
		let ground = new BABYLON.MeshBuilder.CreateGround("ground", {
			width: Game.Settings.GridWidth*Game.Settings.WallWidth,
			height: Game.Settings.GridHeight*Game.Settings.WallWidth,
		}, Game.Scene)
		Game.SetCollision(ground)

		let material = new BABYLON.StandardMaterial("", Game.Scene)
		material.diffuseTexture = new BABYLON.Texture("assets/soil.jpg", Game.Scene)
		material.bumpTexture = new BABYLON.Texture("assets/soilmap.png", Game.Scene)
		ground.material = material
	}


	static CreateMap(){

		for (var i=0;i<Game.Settings.GridHeight;i++){
			for (var j=0;j<Game.Settings.GridWidth;j++){
				var tile = [j*Game.Settings.GridWidth+i]
				if (Game.Map[tile]==0) continue
				Game.CreateWall(j, i)
			}
		}
	}

	static CreateWall(x, z){
		let wall = new BABYLON.MeshBuilder.CreateBox("wall", {
			width: Game.Settings.WallWidth,
			depth: Game.Settings.WallWidth,
			height: Game.Settings.WallHeight,
			faceUV: Array(6).map(i=>[0,0,1,1]),
			wrap: true
		}, Game.Scene)
		wall.position.x = (x)*Game.Settings.WallWidth-(Game.Settings.GridWidth*Game.Settings.WallWidth)/2
		wall.position.z = (z)*Game.Settings.WallWidth-(Game.Settings.GridWidth*Game.Settings.WallWidth)/2
		wall.position.y = Game.Scene.getMeshByName("ground").position.y+Game.Settings.WallHeight/2

		let material = new BABYLON.StandardMaterial("", Game.Scene)
		material.diffuseTexture = new BABYLON.Texture("assets/wall.png")
		material.bumpTexture = new BABYLON.Texture("assets/wallmap.png")
		wall.material = material

		Game.SetCollision(wall)
	}

	static CreateUI(){

		let ObamiumCount = document.createElement("div")
		ObamiumCount.style = "position: absolute; margin: auto; color: white; text-align: right; user-select: none"
		ObamiumCount.style.width = document.documentElement.clientWidth/3
		ObamiumCount.style.height = document.documentElement.clientHeight/10
		ObamiumCount.style.fontSize = document.documentElement.clientHeight/10
		ObamiumCount.style.right = 0
		ObamiumCount.innerHTML = "Obamiums: 0&nbsp"

		Game.ObamiumCount = ObamiumCount

		document.body.insertBefore(ObamiumCount, canvas2)

	}


	static SetCollision(mesh){
		mesh.collisionsEnabled = true
		mesh.checkCollisions = true
	}


	static Obamiums = []
	static SpawnObamium(){

		let pos = Game.GenPosition()

		BABYLON.SceneLoader.ImportMesh("", "assets/", "obamium.glb", Game.Scene, (meshes)=>{
			meshes.forEach(mesh=>{
				mesh.name = "obamium"

				mesh.scaling.x = mesh.scaling.y = mesh.scaling.z = 4

				mesh.position.y = Game.Settings.ObamiumMinHeight

				mesh.rotationQuarternion = null
				mesh.rotation = BABYLON.Vector3.Zero();

				mesh._dir_ = "up"
			})
	
			meshes[0].position.x = pos[0]
			meshes[0].position.z = pos[1]
			meshes[0].position.y = Math.floor(Math.random()*Game.Settings.ObamiumMaxHeight+Game.Settings.ObamiumMinHeight)
			meshes[0].rotation.y = BABYLON.Tools.ToRadians(Math.floor(Math.random()*360))

			Game.SetCollision(meshes[0])

			Game.Obamiums.push(meshes[0])
		})
	}

	static GenPosition(){

		let x, z, tile

		do{

			x = Math.floor(Math.random()*Game.Settings.GridWidth)
			z = Math.floor(Math.random()*Game.Settings.GridWidth)

			tile = [x*Game.Settings.GridWidth+z]

		}while(Game.Map[tile]!=0 || Game.Map[tile]==undefined || Game.Obamiums.some(i=>i.position.x==x && i.position.z==z))

		let pos = Game.AdjustPosition(x, z)

		return [pos[0], pos[1]].map(i=>(i-Game.Settings.GridWidth/2)*Game.Settings.WallWidth)
	}

	static AdjustPosition(x, z){

		let new_x=x, new_z=z

		let utile = [x-1, z+0]
		let dtile = [x+1, z+0]
		let ltile = [x+0, z-1]
		let rtile = [x+0, z+1]

		let ultile = [x-1, z-1]
		let urtile = [x-1, z+1]
		let dltile = [x+1, z-1]
		let drtile = [x+1, z+1]

		let tiles = [utile, dtile, ltile, rtile, ultile, urtile, dltile, drtile]

		if (Game.Map[x*Game.Settings.GridWidth+z]){
			let pos = tiles.filter(i=>!Game.Map[i[0]*Game.Settings.GridWidth+i[1]])[0]
			new_x = pos[0]
			new_z = pos[1]
		}

		return [new_x, new_z]
	}

	static RotateObamiums(){
		Game.Obamiums.forEach(mesh=>{
			mesh.position.y += (mesh._dir_=="up" ? 1:-1)*Game.Settings.ObamiumBounce

			mesh.rotation.y+=Game.Settings.ObamiumRotation
			mesh.rotate(new BABYLON.Vector3(0,0.5,0), Game.Settings.ObamiumRotation)

			if (mesh.position.y>=Game.Settings.ObamiumMaxHeight) mesh._dir_ = "down"
			else if (mesh.position.y<=Game.Settings.ObamiumMinHeight) mesh._dir_ = "up"


			Game.Scene.getGlowLayerByName("glow").intensity+=(Game.Scene.getGlowLayerByName("glow")._dir_=="up" ? 1:-1)*Game.Settings.ObamiumGlow
			if (Game.Scene.getGlowLayerByName("glow").intensity<=Game.Settings.ObamiumMinGlow) Game.Scene.getGlowLayerByName("glow")._dir_="up"
			else if (Game.Scene.getGlowLayerByName("glow").intensity>=Game.Settings.ObamiumMaxGlow) Game.Scene.getGlowLayerByName("glow")._dir_="down"
		})
	}

	static GetCollision(mesh){

		let mpos = [mesh.position.x, mesh.position.z].map(i=>i+(Game.Settings.WallWidth*Game.Settings.GridWidth)/2)
		let cpos = [Game.Camera.position.x, Game.Camera.position.z].map(i=>i+(Game.Settings.WallWidth*Game.Settings.GridWidth)/2)

		let dx = Math.abs(mpos[0]-cpos[0])
		let dz = Math.abs(mpos[1]-cpos[1])

		let dist = Math.sqrt(dx*dx+dz*dz)

		if (dist<Game.Settings.POVCollision[mesh.name]) return true
		return false
	}

}