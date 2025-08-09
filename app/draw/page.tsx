"use client"
import React, { useState } from 'react'
import DrawingCanvas from '../components/Canvas'
import { saveAs } from 'file-saver';

const Page = () => {
    const [drawingName, setDrawingName] = useState('')
    const saveDrawing = () => {
        const canvas = document.querySelector(".DrawingCanvas");
        if (canvas) {canvas.toBlob(function(blob: Blob) {
            saveAs(blob, `${drawingName}.png`);
        })}
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