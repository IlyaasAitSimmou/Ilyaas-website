import { FC } from "react";
import { useDraw } from "../hooks/useDraw";

interface pageProps {}

const DrawingCanvas: FC<pageProps> = () => {

    const { canvasRef } = useDraw()
    
    return (<canvas ref={canvasRef} width={400} height={300} style={{
        borderStyle: 'solid',
        borderColor: 'black',
        borderWidth: 5,
        borderRadius: 20
    }}/>)
}

export default DrawingCanvas