import { unlink } from "fs/promises";


export const deleteFile = async (filePath) => {
    try {
        await unlink(filePath);
    } catch (err) {
        console.log(err);
    }
}