import { use, useEffect, useRef, useState } from "react"

export type Draw = {
    context: CanvasRenderingContext2D
    currentPoint: Point
    prevPoint: Point | null

}

export type Point = {
    x: number
    y: number
}


export const useDraw = (onDraw: ({context, currentPoint, prevPoint}: Draw) => void) => {
    const [mouseDown, setMouseDown] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const prevPoint = useRef<null | Point>(null)

    const onMouseDown = () => setMouseDown(true)

    const clear = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const context = canvas.getContext('2d')
        if (!context) return
        context.clearRect(0, 0, canvas.width, canvas.height)
    }

    useEffect(() => {

        const handler = (e: MouseEvent) => {
            if (!mouseDown) return

            console.log({x: e.clientX, y: e.clientY})
            const currentPoint = computePointInCanvas(e)

            const context = canvasRef.current?.getContext('2d')
            if (!context || !currentPoint) return

            onDraw({context, currentPoint, prevPoint: prevPoint.current})
            prevPoint.current = currentPoint

        }

        const computePointInCanvas = (e: MouseEvent) => {
            const canvas = canvasRef.current
            if (!canvas) return

            const rect = canvas.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            return {x, y}
        }

        const mouseUpHandler = () => {
            setMouseDown(false)
            prevPoint.current = null
        }

        canvasRef.current?.addEventListener('mousemove', handler)
        window.addEventListener('mouseup', mouseUpHandler)

        return () => {
            canvasRef.current?.removeEventListener('mousemove', handler)
            canvasRef.current?.removeEventListener('mouseup', mouseUpHandler)
        }

    }, [onDraw])

    return { canvasRef, onMouseDown, clear }

}