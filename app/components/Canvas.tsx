"use client"

import { FC, useState } from "react";
import { Draw, useDraw } from "../hooks/useDraw";
import { ChromePicker } from "react-color"

interface pageProps {}

const DrawingCanvas: FC<pageProps> = () => {
    const [color, setColor] = useState('#000')
    const { canvasRef, onMouseDown, clear } = useDraw(drawLine)

    function drawLine({prevPoint, currentPoint, context}: Draw) {
        const {x: currX, y: currY} = currentPoint
        const lineColor = color
        const lineWidth = 5

        let startPoint = prevPoint ?? currentPoint
        context.beginPath()
        context.lineWidth = lineWidth
        context.strokeStyle = lineColor
        context.moveTo(startPoint.x, startPoint.y)
        context.lineTo(currX, currY)
        context.stroke()

        context.fillStyle = lineColor
        context.beginPath()
        context.arc(startPoint.x, startPoint.y, 2, 0, 2*Math.PI)
        context.fill()
    }
    
    return (
        <div>
            <ChromePicker color={color} onChange={(e) => setColor(e.hex)}/>
            <button type="button" onClick={clear}>Clear</button>
            <canvas onMouseDown={onMouseDown} ref={canvasRef} width={400} height={300} style={{
                borderStyle: 'solid',
                borderColor: 'black',
                borderWidth: 5,
                borderRadius: 20
            }}/>
        </div>
        )
}

export default DrawingCanvas