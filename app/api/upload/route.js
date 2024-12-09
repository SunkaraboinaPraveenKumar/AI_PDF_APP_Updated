import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

export const config = {
    api: {
        bodyParser: false, // Disable body parsing to handle file uploads manually
    },
};

// Named export for POST method
export async function POST(req) {
    return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm();
        
        // Set the upload directory for the files
        const tempDir = path.join(process.cwd(), "temp");

        // Ensure the temporary directory exists
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        // Set the upload directory for the file
        form.uploadDir = tempDir;

        // Parse the incoming form data
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error("Error parsing form:", err);
                return reject(new Response(JSON.stringify({ error: "Failed to upload file." }), { status: 500 }));
            }

            // Get the file info from the parsed data
            const uploadedFile = files.file[0];

            if (!uploadedFile) {
                return reject(new Response(JSON.stringify({ error: "No file uploaded." }), { status: 400 }));
            }

            const filePath = uploadedFile.filepath;

            // Respond with the file path
            resolve(new Response(JSON.stringify({ filePath }), { status: 200 }));
        });
    });
}
