function Victory(){
	Game.Ended = true
	FadeIn()
}

function FadeIn(){
	canvas2.style.display = "block"
	canvas2.style.background = "black"
	canvas2.style.opacity = 0

	const Fade = setInterval(()=>{
		
		canvas2.style.opacity = parseFloat(canvas2.style.opacity)+0.05

		if (parseFloat(canvas2.style.opacity)>1) {
			document.body.removeChild(canvas)
			document.body.removeChild(Game.ObamiumCount)
			clearInterval(Fade)
			setTimeout(EndText, 1000)
		}
	}, 100)
}


function EndText(){
	EndDialogue = document.createElement("div")
	EndDialogue.style = "position: absolute;top:0; right:0; left:0; bottom:0;  margin: auto;  color: white; text-align: center; user-select: none;"
	EndDialogue.style.width = document.documentElement.clientWidth/3
	EndDialogue.style.height = document.documentElement.clientHeight/2
	document.body.appendChild(EndDialogue)

	Type(Text[0], Text, 0, 0, false)
}

function Type(string, text, textindex,index, _new){
	if (textindex>=text.length) return

	if (_new) EndDialogue.innerHTML = ""

	if (index>=string.length) {
		setTimeout(()=>Type(text[textindex+1], text, textindex+1, 0, true), 1000)
		return
	}
	EndDialogue.innerHTML += string[index]
	FitText(EndDialogue, 100)
	setTimeout(()=>Type(string, text, textindex, index+1, false), 40)
}

function FitText(div, size){
    if (size) div.style.fontSize = size

    div.style.fontSize = parseFloat(div.style.fontSize)-1
    
    if (div.scrollHeight > div.clientHeight) FitText(div)
}