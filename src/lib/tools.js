import { tool } from "@langchain/core/tools";
import { z } from "zod";

const SCHEMA = {
    listFiles: {
        name: 'listFiles',
        description: 'Returns array of file names',
    },
    readFile: {
        name: 'readFile',
        description: 'Reads file content and returns it as a string',
        schema: z.object({
            name: z.string().describe('File name'),
        })
    },
    writeFile: {
        name: 'writeFile',
        description: 'Writes text to file',
        schema: z.object({
            name: z.string().describe('File name'),
            contents: z.string().describe('Text content to be written'),
        })
    },
    deleteFile: {
        name: 'deleteFile',
        description: 'Deletes file',
        schema: z.object({
            name: z.string().describe('File name'),
        })
    }
};

export const tools = (dbx) => [
    tool(dbx.listFiles.bind(dbx), SCHEMA.listFiles),
    tool(dbx.readFile.bind(dbx), SCHEMA.readFile),
    tool(dbx.writeFile.bind(dbx), SCHEMA.writeFile),
    tool(dbx.deleteFile.bind(dbx), SCHEMA.deleteFile),
];
