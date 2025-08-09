import { sql } from '@vercel/postgres';
import { NextResponse, NextRequest } from 'next/server';

// function sanitizeInput(input: string) {
//     return input.replace(/\0/g, ''); // Removes null bytes
//   }

// const base64ToBytea = (b64: string): Buffer => {
//     if (typeof b64 !== 'string') {
//         throw new Error('Expected base64 string but got ' + typeof b64);
//     }
//     const base64Data = b64.split(',')[1];
//     if (!base64Data) {
//         throw new Error('Invalid base64 data');
//     }
//     return Buffer.from(base64Data, 'base64');
// };
  
// export async function POST(request: Request) {
//     try {
//       // Parse JSON request body
//       const reqJson = await request.json();
//       console.log('reqJson:', reqJson);
//       const { userId, subject, message, drawings = [], images = [] } = reqJson;
  
//       // Validate required fields
//       if (!userId || !subject || !message) {
//         throw new Error('Missing required fields');
//       }
  
//       // Convert base64 data to bytea
//       const drawingsBytea = drawings.length
//         ? drawings.map((d: string) => base64ToBytea(sanitizeInput(d)))
//         : null;
  
//       const imagesBytea = images.length
//         ? images.map((i: string) => base64ToBytea(sanitizeInput(i)))
//         : null;
//       console.log('drawingbytea: ',drawingsBytea)
//       console.log('imagesbytea: ',imagesBytea)
  
//       // Insert data into the database
//       await sql`
//         INSERT INTO posts (user_id, subject, message, drawings, images)
//         VALUES (
//           ${userId},
//           ${subject},
//           ${message},
//           ${drawingsBytea && drawingsBytea.length ?`ARRAY[${drawingsBytea}]` : null},
//           ${imagesBytea && imagesBytea.length ? `ARRAY[${imagesBytea}]` : null}
//         );
//       `;
  
//       return NextResponse.json({ message: 'Data inserted successfully' }, { status: 200 });
//     } catch (error: any) {
//       console.error('Error:', error);
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }
//   }


export async function POST(req: NextRequest) {
    try {
        const { userId, subject, message } = await req.json();  // , drawings, images

        const result = await sql`
            INSERT INTO posts (user_id, subject, message)
            VALUES (${userId}, ${subject}, ${message})
            RETURNING *
        `;  // , ${imagesBufferArray}, ${drawingsBufferArray}

        const insertedRow = result;
        console.log(insertedRow)
        return NextResponse.json({ message: 'Post created successfully', postId: insertedRow });
    } catch (error: any) {
        console.error('Error creating post:', error);
        return NextResponse.json({ message: 'Failed to create post', error: error.message }, { status: 500 });
    }
}

// // Convert base64 strings to buffers
// const drawingsBufferArray = drawings?.map((drawing: string) =>
// Buffer.from(drawing.split(',')[1], 'base64')
// ) || [];

// const imagesBufferArray = images?.map((image: string) =>
// Buffer.from(image.split(',')[1], 'base64')
// ) || [];

// // Insert the post into the database