export default class CanvasUtils {

    static drawLine(ctx, width = 1, color, x1, y1, x2, y2) {
        //console.log('drawLine', ctx, color, x1, y1, x2, y2);
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = width,
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    static drawSquare(ctx, color, x1, y1, x2, y2) {
        //console.log('drawSquare', ctx, color, x1, y1, x2, y2);
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.fillRect(x1, y1, x2-x1, y2-y1);
    }

    static drawStrokeRect(ctx, color, x1, y1, x2, y2) {
        //console.log('drawSquare', ctx, color, x1, y1, x2, y2);
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.strokeRect(x1, y1, x2-x1, y2-y1);
    }

    static mousePos(event) {
        var totalOffsetX = 0;
        var totalOffsetY = 0;
        var canvasX = 0;
        var canvasY = 0;
        var currentElement = event.target;

        do {
            totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
            totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
        }
        while(currentElement = currentElement.offsetParent)

        canvasX = event.pageX - totalOffsetX;
        canvasY = event.pageY - totalOffsetY;

        return { x: canvasX, y: canvasY };
    }

    static ww() {
        return window.innerWidth; //document.body.clientWidth;
    }

    static wh() {
        return window.innerHeight; //document.body.clientHeight;
    }

}