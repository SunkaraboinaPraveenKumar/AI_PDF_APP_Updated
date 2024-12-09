// const { ocr } = require("llama-ocr");

// const apiKey=process.env.NEXT_PUBLIC_TOGETHER_API_KEY;
// const markdown = async () => {
//   return await ocr({
//     filePath: "C:/Users/sunka/Downloads/AI_Pdf_Notes_Taker_Modify/public/3.png",
//     apiKey: 'fcae42d55127788101f662b300aec4f2a4287b9541bc65a61bb024edd3a2b405',
//     model: 'Llama-3.2-11B-Vision'
//   });
// };

// (async () => {
//   try {
//     const result = await markdown();
//     console.log(result);
//   } catch (error) {
//     console.error("Error during OCR processing:", error);
//   }
// })();


const { ocr } = require("llama-ocr");

const apiKey = process.env.NEXT_PUBLIC_TOGETHER_API_KEY;

export const extractText = async (filePath) => {
  try {
    const result = await ocr({
      filePath: filePath,
      apiKey: apiKey || 'fcae42d55127788101f662b300aec4f2a4287b9541bc65a61bb024edd3a2b405',
      model: 'Llama-3.2-11B-Vision'
    });
    
    // Assuming the OCR response has the extracted text in a property like `text`
    const extractedText = result?.text || "No text extracted";
    
    return extractedText; // Return the extracted text

  } catch (error) {
    console.error("Error during OCR processing:", error);
    throw error; // Re-throw the error to allow the caller to handle it
  }
};
