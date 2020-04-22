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

}