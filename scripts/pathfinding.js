let Travel

function FindRoute(){
	defineNodes({
		position:{
			x: Obama.position.x+(Game.Settings.WallWidth*Game.Settings.GridWidth)/2,
			z: Obama.position.z+(Game.Settings.WallWidth*Game.Settings.GridWidth)/2,
		}
	},{
		position:{
			x: Game.Camera.position.x+(Game.Settings.WallWidth*Game.Settings.GridWidth)/2,
			z: Game.Camera.position.z+(Game.Settings.WallWidth*Game.Settings.GridWidth)/2,
		}
	})

	let nodes = Solve_AStar()
	nodes.forEach(i=>{
		i.x = i.x*Game.Settings.WallWidth-(Game.Settings.WallWidth*Game.Settings.GridWidth)/2
		i.y = i.y*Game.Settings.WallWidth-(Game.Settings.WallWidth*Game.Settings.GridWidth)/2
	})

	Chase(nodes)
}


function Chase(nodes, index=0){

	if (index>=nodes.length) return FindRoute()

	Travel = setInterval(()=>{

		if (Game.Ended) return

		let angle = Math.atan2(
			nodes[index].y-Obama.position.x,
			nodes[index].x-Obama.position.z,
		)

		let velocity = {
			x: Math.cos(angle)*Game.Settings.ObamaSpeed,
			z: Math.sin(angle)*Game.Settings.ObamaSpeed
		}

		Obama.rotation.y = angle
		Obama.position.x+=velocity.z
		Obama.position.z+=velocity.x


		if (
			Math.abs(nodes[index].y-Obama.position.x)<=Game.Settings.ObamaSpeed &&
			Math.abs(nodes[index].x-Obama.position.z)<=Game.Settings.ObamaSpeed 
		){
			clearInterval(Travel)
			Chase(nodes, index+1)
		}

	}, 50)

}


function RayCast(){
	// use in minecraft return Game.Scene.pick(Game.Scene.pointerX, Game.Scene.pointerY).pickedMesh.name=="Obama"
	let direction = Obama.position.subtract(Game.Camera.position)
	let ray = new BABYLON.Ray(Game.Camera.position, direction, Game.Settings.GridWidth*Game.Settings.WallWidth)
	let hit = Game.Scene.pickWithRay(ray)
	return hit.pickedMesh.name="obama"
}