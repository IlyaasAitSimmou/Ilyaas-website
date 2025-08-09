import { useState, ChangeEvent } from 'react'
// import DrawingCanvas from './Canvas'
import { useRouter } from 'next/navigation';
import { SessionData } from '@/lib';


const NewPostForm = (props: {session: SessionData}) => {
    const router = useRouter()
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    // const [drawings, setDrawings] = useState<any[]>([])
    // const [images, setImages] = useState<any[]>([])
    // const [drawingName, setDrawingName] = useState('')
    const [errorMessage, setErrorMessage] = useState('')


    const createPost = async () => {
        const postData = {
            userId: props.session.userId, 
            subject,
            message,
        };

        try {
            const response = await fetch('/api/new_post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });
            const result = await response.json();
            console.log(result);
        } catch (error) {
            setErrorMessage('Failed to create post.');
        }
    };

    return (
        <>
            <form onSubmit={(e) => {
                e.preventDefault()
                createPost()
                }}>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)}/>
                <input type="text" value={message} onChange={e => setMessage(e.target.value)}/>
                <button type='submit'>Post</button>
            </form>
        </>
    )
}

export default NewPostForm


    // // INSIDE CREATE POST FUNCTION
    // const newImages = await handleFileChange(images)
        // console.log('newimages:', newImages)
        // newImages?.forEach(item => console.log(item))
        // const base64Drawings = await Promise.all(drawings.map((item, _) => blobToBase64(item)))
        // console.log('drawings: ', base64Drawings)
        // base64Drawings?.forEach(item => console.log(item))



    // // INSIDE CREATE POST FUNCTION
    // drawings: base64Drawings,
            // images: newImages


    // // FORM FUNCTION
    // const delImage = (index: number) => {
    //     setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    //     router.refresh();
    // }

    // const delDrawing = (index: number) => {
    //     setDrawings(prevDrawings => prevDrawings.filter((_, i) => i !== index))
    //     router.refresh();
    // }

    // const blobToBase64 = (blob: Blob): Promise<string> => {
    //     return new Promise((resolve, _) => {
    //         console.log('BLOBBLOBBLOB:', blob)
    //         const reader = new FileReader();
    //         reader.onloadend = () => resolve(reader.result);
    //         reader.readAsDataURL(blob);
    //     });
    //   }

    // const addDrawing = async () => {
    //     const canvas: any = document.querySelector('.DrawingCanvas')
    //     if (canvas && canvas.getContext) {              
    //         canvas.toBlob(async (blob: Blob) => {
    //             setDrawings((prevDrawings) => [...prevDrawings, blob]);;
    //         })
    //         setDrawingName('')
    //         router.refresh();
    //         console.log(drawings)
    //     }
    // }

    // const handleFileChange = async (imagesList: Blob[]) => {
    //     if (imagesList.length > 0) {
    //         return await Promise.all(imagesList.map((item) => blobToBase64(item)));
    //     }
    // };


    // // AFTER FORM
{/* <input type="file" name="file" onChange={
                    (e) => {
                    if (e.target.files) {
                        const newImages = Array.from(e.target.files);
                        setImages((prevImages) => [...prevImages, ...newImages]);
                        router.refresh();
                        console.log(images)
                    }
                }
            } multiple/> */}
                {/* <DrawingCanvas/> */}
                {/* <input type="text" value={drawingName} onChange={e => setDrawingName(e.target.value)}/>
                <button onClick={(e) => {
                    e.preventDefault()
                    addDrawing()
                    }}> Add Drawing </button>

                }


{/* {
            drawings.length > 0 && drawings.map((item, index) => {
                const url = URL.createObjectURL(item);
                return (
                    <div key={index}>
                        <img id={`drawing-${index}`} width={400} src={url} alt={`uploaded-${index}`} />
                        <button id={`drawing-del-${index}`} onClick={() => delDrawing(index)}>Delete</button>
                    </div>
                );
            })
        
        
            }

            {
            images.length > 0 && images.map((item, index) => {
                const url = URL.createObjectURL(item);
                return (
                    <div key={index}>
                        <img id={`image-${index}`} width={400} src={url} alt={`uploaded-${index}`} />
                        <button id={`image-del-${index}`} onClick={() => delImage(index)}>Delete</button>
                    </div>
                );
            })
            } */}