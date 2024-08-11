import React from 'react'
import Image, { StaticImageData } from "next/image";

type ImageObject = {
    image: StaticImageData;
    height: number;
    width: number;
    padding?: string;
    alt?: string;
  };

const SymbolParagraphs = (props: {text: string; imageList: ImageObject[]; pgheight: string; pgwidth: string; textStyles?: {};}) => {
    let textArr: any[] = props.text.split('?')
    textArr = textArr.map((item, index) => {
        return (<><p style={props.textStyles}>{item}</p> 
        {index < props.imageList.length ? <Image src={props.imageList[index].image} 
        alt={`image ${props.imageList[index].alt ? props.imageList[index].alt : index}`} 
        height={props.imageList[index].height} 
        width={props.imageList[index].width} style={{padding: props.imageList[index].padding}}/> : ''}
        </>
        )
    })
  return (
    <div style={{height: `${props.pgheight}`, width: `${props.pgwidth}`, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      {textArr}
    </div>
  )
}

export default SymbolParagraphs
