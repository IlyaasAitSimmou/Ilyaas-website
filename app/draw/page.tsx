"use client"
import React, { useState } from 'react'
import DrawingCanvas from '../components/Canvas'
import { saveAs } from 'file-saver';

const Page = () => {
    const [drawingName, setDrawingName] = useState('')

    const saveDrawing = () => {
        if (typeof document === 'undefined') return
        const canvas = document.querySelector<HTMLCanvasElement>('canvas.DrawingCanvas')
        if (!canvas) return
        if (canvas.toBlob) {
            canvas.toBlob((blob) => {
                if (blob) saveAs(blob, `${drawingName || 'drawing'}.png`)
            }, 'image/png')
        } else {
            const dataUrl = canvas.toDataURL('image/png')
            fetch(dataUrl).then(res => res.blob()).then(blob => saveAs(blob, `${drawingName || 'drawing'}.png`))
        }
    }

    return (
        <>  
            <input type="text" placeholder='Drawing name' value={drawingName} onChange={e => setDrawingName(e.target.value)}/>
            <DrawingCanvas/>
            <button onClick={saveDrawing}>Save</button>
        </>

    )
}

export default Page