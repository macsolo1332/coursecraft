import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { error } from "console";
import { createUploadthing, type FileRouter } from "uploadthing/next";

import { UploadThingError } from "uploadthing/server";

import {PDFLoader} from 'langchain/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from '@langchain/openai'
import { PineconeStore } from '@langchain/pinecone'
import { index } from '@/lib/pinecone'
// import { getPineconeClient } from '@/lib/pinecone'


 
const f = createUploadthing();
 


export const ourFileRouter = {
  
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    
    .middleware(async ({ req }) => {
        const { getUser } = getKindeServerSession()
        const user = await getUser()
        if (!user || !user.id ) throw new Error("Unauthorized")
      return {userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {

      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: `https://utfs.io/f/${file.key}`,
          uploadStatus: 'PROCESSING',
        },
      })
      try{
        const Response = await fetch(`https://utfs.io/f/${file.key}`)
        const blob = await  Response.blob()

        const Loader = new  PDFLoader( blob)
        const pageLevelDocs = await Loader.load()
        const pagesAmt = pageLevelDocs.length

      // vectorize and index entire document
      // const pinecone = await getPineconeClient()
      const pineconeIndex = index

      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      })

      await PineconeStore.fromDocuments(
        pageLevelDocs,
        embeddings,
        {
          pineconeIndex,
          namespace: createdFile.id,
        }
      )
      await db.file.update({
        data: {
          uploadStatus: 'SUCCESS',
        },
        where: {
          id: createdFile.id,
        },
      })
      console.log(embeddings)
      

      } catch (err){
        console.error(err)
        console.error('ERROR:: While uploading document to storage')
        await db.file.update({
          data: {
            uploadStatus: 'FAILED',
          },
          where: {
            id: createdFile.id,
          },
        })

      }
    
      
    
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;