{
	let width = 0;
	let height = 0;
	let lastPosY = 0;
	let lastPosX = 0;
	let angle;
	let CANVAS_ID = "myCanvas"
	let ENTROPY_1 = 2;
	let BUILDINGS_COUNT = 0;
	let MINIMUM_HEIGHT = 40;
	let MAXIMUM_HEIGHT = 360;
	let RAD_CONST = 0.0175;
	let FIRST_FLOOR_HEIGHT = 20;

	let lastRender = 0

	let objects = [];

	const CWHues = [232, 203, 189, 173, 162];
	
	const WindowTypes = Object.freeze({
		Regular: Symbol("regular"),
		Split: Symbol("split"),		
		SplitV: Symbol("splitV"),
		MiniWindow: Symbol("miniWindow"),
		Triangular: Symbol("triangular"),
		Interlaced: Symbol("interlaced"),
		MiniWindowCenter: Symbol("miniWindowCenter")
	});

	class Building{
		constructor(x, y){
			this.x = x;
			this.y = y;
			this.modules = [];			
		}		

		randomize = () => {
			this.height = getRandomInt(MINIMUM_HEIGHT, MAXIMUM_HEIGHT);
			this.rows = this.getRowsNumber();
			this.cols = getRandomInt(1, 5);		
			this.margin = getRandomInt(0, 15);
			this.width = getRandomInt(40, 60);
			this.CWHue = CWHues[(Math.floor(Math.random() * CWHues.length))];
			this.CWLight= getRandomInt(10,50);
			this.CWSaturation = getRandomInt(0,100);
			this.hue = getRandomInt(1, 360);
			this.saturation = getRandomInt(0, 100);
			this.light = getRandomInt(20, 80);	
			this.firstFloorHeight = FIRST_FLOOR_HEIGHT;
			this.multipleModules = getRandomBool();

			this.calculateProps();
					
			var rand = getRandomInt(0, Object.keys(WindowTypes).length);
			this.windowType = WindowTypes[Object.keys(WindowTypes)[rand]];
			
			let numberOfModules =  3; //this.multipleModules ? this.getNumberOfModules() : 1; 

			let lastModule = this;
		
			if (numberOfModules > 1){
				
				for (let i=1; i <= numberOfModules; i++){				
					let widthDecrement = lastModule.width * getRandomFloat(0.05, 0.3, 2); 							
					
					let newModule = new Building(lastModule.x, lastModule.y - lastModule.height - widthDecrement / 3);

					let heightDecrement = lastModule.height * getRandomFloat(0, 0.7, 2); 
					newModule.width = lastModule.width - widthDecrement;
					newModule.height = lastModule.height - heightDecrement;
					newModule.firstFloorHeight = 0;
					
					if (newModule.height >= 20)
						newModule.rows = lastModule.rows > 1 ? lastModule.rows - 1 : 1;
					else 
						newModule.rows = 0;

					if (newModule.width >= 20)
						newModule.cols = lastModule.cols > 1 ? lastModule.cols - 1 : 1; 		
					else
						newModule.cols = 0;

					newModule.windowType = lastModule.windowType;
					newModule.margin = lastModule.margin;
					newModule.CWHue = lastModule.CWHue;
					newModule.CWLight = lastModule.CWLight;
					newModule.CWSaturation = lastModule.CWSaturation;
					newModule.hue = lastModule.hue;
					newModule.saturation = lastModule.saturation;
					newModule.light = lastModule.light;		

					newModule.calculateProps();
					
					this.modules.push(newModule);

					lastModule = newModule;
				}			
			}
		}

		calculateProps = () => {				
			this.windowWidth = ((this.width - (this.margin * (this.cols + 1))) / this.cols);
			this.windowHeight = ((this.height -  this.firstFloorHeight - (this.margin * (this.rows + 1))) / this.rows);
			this.windowWidthFactor = Math.cos(angle * RAD_CONST) * this.windowWidth;
			this.windowHeightFactor = Math.sin(angle * RAD_CONST) * this.windowWidth;
		}
		
		drawBuilding = (ctx) => {
			this.drawModule(ctx, true);
			
			if (this.modules.length > 1){				
				this.modules.forEach((module) => module.drawModule(ctx, false));
			}
		}
			
		drawModule = (ctx, firstModule) => {
			let color = `hsl(${this.hue}, ${this.saturation}%, ${this.light}%)`; 
			let colorLight = `hsl(${this.hue}, ${this.saturation}%, ${this.light - 20}%)`; 
			let color3 = `hsl(${this.hue}, ${this.saturation}%, ${this.light + 20}%)`; 

			this.widthFactor = Math.cos(angle * RAD_CONST) * this.width;
			this.heightFactor = Math.sin(angle * RAD_CONST) * this.width;

			this.drawLeftFace(ctx, color);
			this.drawRightFace(ctx, colorLight);
			this.drawTopFace(ctx, color3);
		
			this.drawWindows(ctx, this);
			
			if (firstModule) this.drawDoor(ctx, this);		
		}

		drawLeftFace = (ctx, color) => {	
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.moveTo(this.x, this.y); 
			ctx.lineTo(this.x - this.widthFactor, this.y - this.heightFactor);  
			ctx.lineTo(this.x - this.widthFactor, this.y - (this.heightFactor + this.height)); 
			ctx.lineTo(this.x, this.y - this.height); 
			ctx.lineTo(this.x, this.y); 
			ctx.fill();		
		}
				
		drawRightFace = (ctx, color) => {
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.moveTo(this.x, this.y); 
			ctx.lineTo(this.x + this.widthFactor, this.y - this.heightFactor);  
			ctx.lineTo(this.x + this.widthFactor, this.y - (this.heightFactor + this.height)); 
			ctx.lineTo(this.x, this.y - this.height);
			ctx.lineTo(this.x, this.y); 
			ctx.fill();
		}

		drawTopFace = (ctx, color) => {
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.moveTo(this.x, this.y - this.height);
			ctx.lineTo(this.x - this.widthFactor, this.y - (this.heightFactor + this.height));  
			ctx.lineTo(this.x, this.y -  ((this.heightFactor * 2) + this.height)); 
			ctx.lineTo(this.x + this.widthFactor, this.y - (this.heightFactor + this.height)); 
			ctx.lineTo(this.x, this.y - this.height); 
			ctx.fill();		
		}
			
		drawDoor = (ctx) => {
			let halfWidthFactor = this.widthFactor / 2;
			let halfHeightFactor = this.heightFactor / 2;
			let doorHeight = 10;
			let doorWidth = 10;
			let doorWidthFactor = Math.cos(angle * RAD_CONST) * (doorWidth);
			let doorHeightFactor = Math.sin(angle * RAD_CONST) * (doorHeight);

			ctx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.light - 40}%)`; 
			ctx.beginPath();
			let wx = this.x - Math.cos(angle * RAD_CONST) * (this.width / 2 - doorWidth / 2);
			let wy = this.y - Math.sin(angle * RAD_CONST) * (this.width / 2 - doorWidth / 2);
			ctx.moveTo(wx, wy); 
			ctx.lineTo(wx, wy - doorHeight);  
			ctx.lineTo(wx - doorWidthFactor, wy - doorHeightFactor - doorHeight); 
			ctx.lineTo(wx - doorWidthFactor, wy - doorHeightFactor); 
			ctx.lineTo(wx, wy); 
			ctx.fill();

			ctx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.light - 60}%)`; 
			ctx.beginPath();
			let wx1 = this.x + Math.cos(angle * RAD_CONST) * (this.width / 2 - doorWidth / 2);
			ctx.moveTo(wx1, wy); 
			ctx.lineTo(wx1, wy - doorHeight);  
			ctx.lineTo(wx1 + doorWidthFactor, wy - doorHeightFactor - doorHeight); 
			ctx.lineTo(wx1 + doorWidthFactor, wy - doorHeightFactor); 
			ctx.lineTo(wx1, wy); 
			ctx.fill();
		}

		drawLeftWindow = (ctx, color, wx, wy) => {
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.moveTo(wx, wy); 
			ctx.lineTo(wx - this.windowWidthFactor, wy - this.windowHeightFactor);  
			ctx.lineTo(wx - this.windowWidthFactor, wy - (this.windowHeightFactor + this.windowHeight)); 
			ctx.lineTo(wx, wy - this.windowHeight); 
			ctx.lineTo(wx, wy); 
			ctx.fill();
		}

		drawRightWindow = (ctx, color, wx, wy) => {
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.moveTo(wx, wy); 
			ctx.lineTo(wx + this.windowWidthFactor, wy - this.windowHeightFactor);  
			ctx.lineTo(wx + this.windowWidthFactor, wy - (this.windowHeightFactor + this.windowHeight)); 
			ctx.lineTo(wx, wy - this.windowHeight);
			ctx.lineTo(wx, wy); 
			ctx.fill();		
		}

		drawWindows = (ctx) => {		
			let colorLight = `hsl(${this.CWHue}, ${this.CWSaturation}%, ${this.CWLight + 20}%)`; 				
			let colorDark = `hsl(${this.CWHue}, ${this.CWSaturation}%, ${this.CWLight}%)`; 
			let colorLighter = `hsl(${this.CWHue}, ${this.CWSaturation}%, ${this.CWLight + 40}%)`;
			let colorDarker = `hsl(${this.CWHue}, ${this.CWSaturation}%, ${this.CWLight - 20}%)`;
			
			for (let ix = 0; ix < this.cols; ix++){
				for (let iy = 0; iy < this.rows; iy++){
					let wx = this.x - (Math.cos(angle * RAD_CONST) * (this.margin + ((this.margin + this.windowWidth) * ix)));
					let wy = this.y - this.firstFloorHeight - (Math.sin(angle * RAD_CONST) * (this.margin + ((this.margin + this.windowWidth) * ix))) - (this.margin + ((this.margin + this.windowHeight) * iy));
					let wx1 = this.x + (Math.cos(angle * RAD_CONST) * (this.margin + ((this.margin + this.windowWidth) * ix)));
					let wy1 = this.y -  this.firstFloorHeight - (Math.sin(angle * RAD_CONST) * (this.margin + ((this.margin + this.windowWidth) * ix))) - (this.margin + ((this.margin + this.windowHeight) * iy));
			
					this.drawLeftWindow(ctx, colorLight, wx, wy);
					this.drawRightWindow(ctx, colorDark, wx1, wy1);	

					switch(this.windowType){
						case WindowTypes.MiniWindow:
							this.drawMiniWindow(ctx, wx, wy, wx1, wy1, colorDark, colorLight);
							break;
						case WindowTypes.Split:
							this.drawSplitWindow(ctx, wx, wy, wx1, wy1, colorDark, colorLight);
							break;
						case WindowTypes.Triangular:
							this.drawTriangularWindow(ctx, wx, wy, wx1, wy1, colorDark, colorLight, colorDarker, colorLighter);
							break;
						case WindowTypes.SplitV:
							this.drawSplitVWindow(ctx, wx, wy, wx1, wy1, colorDark, colorLight);
							break;
						case WindowTypes.Interlaced:
							this.drawInterlacedWindow(ctx, wx, wy, wx1, wy1, colorDark, colorLight, colorDarker, colorLighter);
							break;
						case WindowTypes.MiniWindowCenter:
							this.drawMiniWindowCenter(ctx, wx, wy, wx1, wy1, colorDark, colorLight);
							break;
					}
					
					//Draw lights and shadows
					ctx.strokeStyle = colorLighter;
					ctx.beginPath();		
					ctx.moveTo(wx, wy); 
					ctx.lineTo(wx - this.windowWidthFactor, wy - this.windowHeightFactor);	
					ctx.stroke();
					ctx.strokeStyle = colorLight;
					ctx.beginPath();		
					ctx.moveTo(wx1, wy1); 
					ctx.lineTo(wx1 + this.windowWidthFactor, wy1 - this.windowHeightFactor);	
					ctx.stroke();
					ctx.strokeStyle = colorDark;
					ctx.beginPath();		
					ctx.moveTo(wx - this.windowWidthFactor, wy - this.windowHeightFactor); 
					ctx.lineTo(wx - this.windowWidthFactor, wy - this.windowHeightFactor - this.windowHeight);	
					ctx.stroke();
					ctx.strokeStyle = colorDarker;
					ctx.beginPath();		
					ctx.moveTo(wx1 + this.windowWidthFactor, wy1 - this.windowHeightFactor); 
					ctx.lineTo(wx1 + this.windowWidthFactor, wy1 - this.windowHeightFactor - this.windowHeight);	
					ctx.stroke();
				}
			}
		}	
		
		drawMiniWindow = (ctx, wx, wy, wx1, wy1, colorDark, colorLight) => {
			let halfWindowHeight = (this.windowHeight / 2);
			let halfWindowWidth = (this.windowWidth / 2);
			let halfWidthFactor = this.windowWidthFactor / 2;
			let halfHeightFactor = this.windowHeightFactor / 2 
			ctx.strokeStyle = colorDark;
			ctx.beginPath();
			ctx.moveTo(wx, wy - halfWindowHeight); 
			ctx.lineTo(wx - halfWidthFactor, wy - halfHeightFactor - halfWindowHeight);					
			ctx.lineTo(wx - halfWidthFactor, wy - halfHeightFactor);  
			ctx.stroke();

			ctx.strokeStyle = colorLight;
			ctx.beginPath();
			ctx.moveTo(wx1 + this.windowWidthFactor, wy1 - this.windowHeightFactor - halfWindowHeight);
			ctx.lineTo(wx1 + halfWidthFactor, wy1 - halfHeightFactor - halfWindowHeight);  
			ctx.lineTo(wx1 + halfWidthFactor, wy1 - halfHeightFactor);  
			ctx.stroke();
		}
		
		drawSplitWindow = (ctx, wx, wy, wx1, wy1, colorDark, colorLight) => {
			let halfWindowHeight = (this.windowHeight / 2);
			ctx.strokeStyle = colorDark;
			ctx.beginPath();
			ctx.moveTo(wx, wy - halfWindowHeight); 
			ctx.lineTo(wx - this.windowWidthFactor, wy - this.windowHeightFactor - halfWindowHeight);  				
			ctx.stroke();

			ctx.strokeStyle = colorLight;
			ctx.beginPath();
			ctx.moveTo(wx1, wy1 - halfWindowHeight); 
			ctx.lineTo(wx1 + this.windowWidthFactor, wy1 - this.windowHeightFactor - halfWindowHeight);  
			ctx.stroke();
		}

		drawSplitVWindow = (ctx, wx, wy, wx1, wy1, colorDark, colorLight) => {		
			let halfHeightFactor = this.windowHeightFactor / 2 
			let halfWindowWidth = (this.windowWidth / 2);
			ctx.strokeStyle = colorDark;
			ctx.beginPath();
			ctx.moveTo(wx - halfWindowWidth, wy - halfHeightFactor); 
			ctx.lineTo(wx - halfWindowWidth, wy - halfHeightFactor - this.windowHeight);  				
			ctx.stroke();

			ctx.strokeStyle = colorLight;
			ctx.beginPath();
			ctx.moveTo(wx1 + halfWindowWidth, wy1 - halfHeightFactor); 
			ctx.lineTo(wx1 + halfWindowWidth, wy1 - halfHeightFactor - this.windowHeight);  
			ctx.stroke();
		}
		
		drawInterlacedWindow = (ctx, wx, wy, wx1, wy1, colorDark, colorLight, colorDarker, colorLighter) => {		
			let thirdHeightFactor = this.windowHeightFactor / 3;
			let thirdWidthFactor = this.windowWidthFactor / 3;
			let thirdWindowWidth = (this.windowWidth / 3);
			let thirdWindowHeight = (this.windowHeight / 3);

			ctx.fillStyle = colorDark;
			ctx.beginPath();
			ctx.moveTo(wx - thirdWidthFactor, wy - thirdHeightFactor); 
			ctx.lineTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight);		
			ctx.lineTo(wx - thirdWidthFactor * 2, wy - thirdHeightFactor * 2 - thirdWindowHeight); 			
			ctx.lineTo(wx - thirdWidthFactor * 2, wy - thirdHeightFactor * 2); 					
			ctx.lineTo(wx - thirdWidthFactor, wy - thirdHeightFactor);		
			ctx.fill();

			ctx.fillStyle = colorDark;
			ctx.beginPath();
			ctx.moveTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight * 2); 
			ctx.lineTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight * 3);		
			ctx.lineTo(wx - thirdWidthFactor * 2, wy - thirdHeightFactor * 2 - thirdWindowHeight * 3); 			
			ctx.lineTo(wx - thirdWidthFactor * 2, wy - thirdHeightFactor * 2 - thirdWindowHeight * 2); 					
			ctx.lineTo(wx - thirdWidthFactor,  wy - thirdHeightFactor - thirdWindowHeight * 2);		
			ctx.fill();
			
			ctx.fillStyle = colorDarker;
			ctx.beginPath();
			ctx.moveTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor); 
			ctx.lineTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight);		
			ctx.lineTo(wx1 + thirdWidthFactor * 2, wy1 - thirdHeightFactor * 2 - thirdWindowHeight); 			
			ctx.lineTo(wx1 + thirdWidthFactor * 2, wy1 - thirdHeightFactor * 2); 					
			ctx.lineTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor);		
			ctx.fill();

			ctx.fillStyle = colorDarker;
			ctx.beginPath();
			ctx.moveTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight * 2); 
			ctx.lineTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight * 3);		
			ctx.lineTo(wx1 + thirdWidthFactor * 2, wy1 - thirdHeightFactor * 2 - thirdWindowHeight * 3); 			
			ctx.lineTo(wx1 + thirdWidthFactor * 2, wy1 - thirdHeightFactor * 2 - thirdWindowHeight * 2); 					
			ctx.lineTo(wx1 + thirdWidthFactor,  wy1 - thirdHeightFactor - thirdWindowHeight * 2);		
			ctx.fill();
		}
		
		drawMiniWindowCenter = (ctx, wx, wy, wx1, wy1, colorDark, colorLight, colorDarker, colorLighter) => {		
			let thirdHeightFactor = this.windowHeightFactor / 3;
			let thirdWidthFactor = this.windowWidthFactor / 3;
			let thirdWindowWidth = (this.windowWidth / 3);
			let thirdWindowHeight = (this.windowHeight / 3);

			ctx.strokeStyle = colorDark;
			ctx.beginPath();
			ctx.moveTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight); 
			ctx.lineTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight * 2);		
			ctx.lineTo(wx - thirdWidthFactor * 2, wy - thirdHeightFactor * 2 - thirdWindowHeight * 2); 			
			ctx.lineTo(wx - thirdWidthFactor * 2, wy - thirdHeightFactor * 2 - thirdWindowHeight); 					
			ctx.lineTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight);		
			ctx.stroke();	
			
			ctx.strokeStyle = colorLight;
			ctx.beginPath();
			ctx.moveTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight); 
			ctx.lineTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight * 2);		
			ctx.lineTo(wx1 + thirdWidthFactor * 2, wy1 - thirdHeightFactor * 2 - thirdWindowHeight * 2); 			
			ctx.lineTo(wx1 + thirdWidthFactor * 2, wy1 - thirdHeightFactor * 2 - thirdWindowHeight); 					
			ctx.lineTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight);		
			ctx.stroke();
		}

		drawTriangularWindow = (ctx, wx, wy, wx1, wy1, colorDark, colorLight, colorDarker, colorLighter) => {
			ctx.fillStyle = colorLighter;
			ctx.beginPath();
			ctx.moveTo(wx, wy - this.windowHeight);				
			ctx.lineTo(wx -  this.windowWidthFactor, wy - this.windowHeight - this.windowHeightFactor); 
			ctx.lineTo(wx -  this.windowWidthFactor, wy - this.windowHeightFactor); 		
			ctx.fill();

			ctx.fillStyle = colorDarker;
			ctx.beginPath();		
			ctx.moveTo(wx1, wy1); 
			ctx.lineTo(wx1 + this.windowWidthFactor, wy1 - this.windowHeightFactor);		
			ctx.lineTo(wx1 + this.windowWidthFactor, wy1 - this.windowHeightFactor - this.windowHeight); 		
			ctx.lineTo(wx1, wy1); 
			ctx.fill();
		}
		
		getRowsNumber = () => {
			return getRandomInt(1, Math.floor(this.height / 20)); 
		}

		getNumberOfModules = () => {
			let dice = getRandomInt(1, 6);

			if (dice > 4)
				return getRandomInt(1, 3);
			else 
				return getRandomInt(1, 10);
		}

	}

	init = () => {
		randomize();
		addEvents();
		drawFrame();
	}

	getRandomInt = (min, max) => {
		return Math.floor(Math.random() * max) + min;
	}

	getRandomFloat = (min, max, decimals) => {
		const str = (Math.random() * (max - min) + min).toFixed(
		  decimals,
		);
	  
		return parseFloat(str);
	  }
	  

	getRandomBool = () => {
		return Math.random() < 0.5;
	}

	addEvents = () => {
		let canvas = document.getElementById(CANVAS_ID);

		canvas.addEventListener('click', e => {
			addBuilding(e.offsetX, e.offsetY);
		}, false);
	}

	randomize = () => {	
		angle = getRandomInt(0, 40);
	}

	drawFrame = () => {
		let canvas = document.getElementById(CANVAS_ID);
		if (canvas.getContext){
			canvas.width = width;
	  		canvas.height = height;
			let ctx = canvas.getContext('2d')
			ctx.fillStyle = "#000";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000000';
			ctx.strokeRect(0, 0, width, height);
		}
	}	

	addBuilding = (x, y) => {	
		let building = new Building(x, y);	
		building.randomize();	
		objects.push(building);
		BUILDINGS_COUNT++; 
	}			
			
	draw = () => {	
		drawFrame();

		if (BUILDINGS_COUNT > 0)
			for (let i = 0; i < BUILDINGS_COUNT; i++){
				let canvas = document.getElementById(CANVAS_ID);
				if (canvas.getContext){
					let ctx = canvas.getContext('2d');
					ctx.strokeStyle = '#000000';
					objects[i].drawBuilding(ctx);
				}			
			}				
	}

	width = window.innerWidth;
	height = window.innerHeight;
	lastPosY = 0;
	lastPosX = 0;			

	loop = (timestamp) => {
		let progress = timestamp - lastRender;

		draw();

		lastRender = timestamp;
		window.requestAnimationFrame(loop);
	}

	init();

	window.requestAnimationFrame(loop);

}
