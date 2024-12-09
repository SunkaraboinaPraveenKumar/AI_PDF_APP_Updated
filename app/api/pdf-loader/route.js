import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// const PdfUrl='https://polished-marlin-789.convex.cloud/api/storage/fc2b4cd2-7f36-4cc9-95e2-a84d6e3650aa'

export async  function GET(req){
    const reqUrl=req.url;
    const {searchParams}=new URL(reqUrl);
    const PdfUrl=searchParams.get('pdfUrl');
    // 1 . Load PDF file
    const response=await fetch(PdfUrl);
    const data=await response.blob();
    const loader=new WebPDFLoader(data);

    const docs=await loader.load();
    
    let pdfTextContent=''
    docs.forEach(doc=>{
        pdfTextContent+=doc.pageContent;
    })

    //2. Splitting Text into Smaller Chunks
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 100,
        chunkOverlap: 20,
      });

      const output=await splitter.createDocuments([pdfTextContent]);

      let splitterList=[];
      output.forEach(doc=>{
        splitterList.push(doc.pageContent)
      })

    return NextResponse.json({result:splitterList})
}