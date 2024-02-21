{
    let CANVAS_ID = "myCanvas"
    let RAD_CONST = 0.0175;

    let COLOR_OFF = "#222";

    let ledRows = 50;
    let ledColumns = 50;

    let ledMargin = 30;
    let ledPadding = 30;
    let ledRadio = 20;

    let width = 0;
    let height = 0;

    let lastRender = 0;

    let hue = 150;

    let lastPosY = null;
    let lastPosX = null;

    let canvas;
    let ctx;

    let ledScreen;

    class LedScreen {
        constructor() {
            this.leds = [];
            this.ledsBuffer = [];            
            this.generateLeds();
        }

        generateLeds = () => {
            for (let x = 0; x < ledColumns; x++) {
                this.leds[x] = new Array(ledRows);
                this.ledsBuffer[x] = new Array(ledRows);
            }

            for (let x = 0; x < ledColumns; x++) {
                for (let y = 0; y < ledRows; y++) {
                    let led = new Led(x, y);
                    this.leds[x][y] = led;
                    let ledBuffer = new Led(x, y);
                    this.ledsBuffer[x][y] = ledBuffer;
                }
            }
        }


        setPixel = (x, y) => {            
            let col = Math.round((x - ledMargin) / ((ledRadio) + ledPadding));
            let row = Math.round((y - ledMargin) / ((ledRadio) + ledPadding));
            this.leds[col][row].on = true;
        }

        draw = (ctx) => {
            for (let x = 0; x < ledColumns; x++) {
                for (let y = 0; y < ledRows; y++) {
                    this.ledsBuffer[x][y].draw(ctx);
                }
            }
        }

        update = () => {            
            for (let x = 0; x < ledColumns; x++) {
                for (let y = 0; y < ledRows; y++) {
                    this.ledsBuffer[x][y].on =  this.leds[x][y].on;
                }
            }           
        }
    }

    class Led {
        constructor(column, row) {
            this.radio = ledRadio;
            this.row = row;
            this.column = column;
            this.x = ledMargin + column * ledPadding + column * this.radio;
            this.y = ledMargin + row * ledPadding + row * this.radio;
            this.on = false;
            this.color = `hsl(${hue}, 100%, 50%)`;
        }

        draw = (ctx) => {
            if (this.on)
                Utils.drawCircle(ctx, this.x, this.y, this.radio, this.color, this.color)
            else            
                Utils.drawCircle(ctx, this.x, this.y, this.radio, COLOR_OFF, COLOR_OFF)

        }
    }

    class Utils {
        static scale = (number, inMin, inMax, outMin, outMax) => {
            return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        }

        static angleBetweenTwoPoints(x1, y1, x2, y2) {
            var angle = Math.atan2(y2 - y1, x2 - x1);
            angle *= 180 / Math.PI;
            if (angle < 0) angle = 360 + angle;
            return angle;
        }

        static getRandomFromArray = (array) => {
            return array[(Math.floor(Math.random() * array.length))];
        }

        static shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }

        static getRandomInt = (min, max) => {
            return Math.floor(Math.random() * max) + min;
        }

        static getRandomFloat = (min, max, decimals) => {
            const str = (Math.random() * (max - min) + min).toFixed(
                decimals,
            );

            return parseFloat(str);
        }

        static getRandomBool = () => {
            return Math.random() < 0.5;
        }

        static drawCircle = (ctx, x, y, radio, color = '#00FF00', fillColor = '#00FF00') => {
            ctx.strokeStyle = color;
            ctx.fillStyle = fillColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, radio, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }

        static drawRectangle = (ctx, x, y, width, height, color = '#FFF', fillColor = '#00FF00') => {
            ctx.strokeStyle = color;
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.fill();
            ctx.stroke();
        }

        static drawLine = (ctx, x1, y1, x2, y2, color = '#FFF') => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = "2"
            ctx.strokeStyle = color;
            ctx.stroke();
        }

        static drawDot = (ctx, x, y, color = '#FFF') => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
            ctx.fill();
        }
    }

    let init = () => {
        width = window.innerWidth;
        height = window.innerHeight;

        canvas = document.getElementById(CANVAS_ID);
        if (canvas.getContext)
            ctx = canvas.getContext('2d');

        randomize();

        ledRows = Math.floor(height / (ledRadio + ledPadding));
        ledColumns = Math.floor(width / (ledRadio + ledPadding));
        ledScreen = new LedScreen();
 
        addEvents();
    }

    let addEvents = () => {
        
		canvas.addEventListener('click', e => {
			ledScreen.setPixel(e.offsetX, e.offsetY);
		}, false);
    }

    let randomize = () => {
    
    }

    let drawBackground = (ctx, canvas) => {
        canvas.width = width;
        canvas.height = height;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(0, 0, width, height);
    }

    let draw = () => {
        drawBackground(ctx, canvas);
        ledScreen.draw(ctx);
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        ledScreen.update();

        draw();

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    init();

    window.requestAnimationFrame(loop);
}
