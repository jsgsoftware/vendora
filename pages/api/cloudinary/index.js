import nc from "next-connect";
import fileUpload from "express-fileupload";
import { imgMiddleware } from "../../../middleware/imgMiddleware";
import fs from "fs";
import path from "path";

function readInsforgeProjectConfig() {
    try {
        const projectPath = path.join(process.cwd(), ".insforge", "project.json");
        if (!fs.existsSync(projectPath)) {
            return {};
        }
        const raw = fs.readFileSync(projectPath, "utf8");
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

function getStorageConfig() {
    const project = readInsforgeProjectConfig();
    const baseUrl = (process.env.INSFORGE_STORAGE_BASE_URL || process.env.INSFORGE_BASE_URL || project.oss_host || "").replace(/\/$/, "");
    const apiKey = process.env.INSFORGE_STORAGE_API_KEY || process.env.INSFORGE_API_KEY || project.api_key;
    const bucket = process.env.INSFORGE_STORAGE_BUCKET || "images";

    if (!baseUrl || !apiKey) {
        throw new Error("Missing InsForge storage config. Set INSFORGE_BASE_URL/INSFORGE_API_KEY (or link project) and INSFORGE_STORAGE_BUCKET.");
    }

    return {
        baseUrl,
        apiKey,
        bucket,
        objectBaseUrl: process.env.INSFORGE_STORAGE_UPLOAD_BASE_URL || `${baseUrl}/api/storage/buckets/${bucket}/objects`,
        publicBaseUrl: process.env.INSFORGE_STORAGE_PUBLIC_BASE_URL || `${baseUrl}/api/storage/buckets/${bucket}/objects`,
    };
}

function buildObjectPath(folder, fileName) {
    const safeFolder = String(folder || "uploads")
        .replace(/\\+/g, "/")
        .replace(/^\/+|\/+$/g, "")
        .replace(/\s+/g, "-");
    const timestamp = Date.now();
    const safeName = String(fileName || "image")
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9._-]/g, "");
    return `${safeFolder}/${timestamp}-${safeName}`;
}

function encodeObjectPath(objectPath) {
    return objectPath
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");
}

const handler = nc()
    .use(
        fileUpload({
            useTempFiles: true
        })
    )
    .use(imgMiddleware);

export const config = {
    api: {
        bodyParser: false,
    },
};

handler.post(async (req, res) => {
    try {
        const { path: folder } = req.body;
        let files = Object.values(req.files).flat();
        let images = [];
        const storage = getStorageConfig();

        for (const file of files) {
            try {
                const img = await uploadToInsforgeStorage(file, folder, storage);
                images.push(img);
            } finally {
                removeTmp(file.tempFilePath);
            }
        }

        res.json(images);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

export default handler;

handler.delete(async (req, res) => {
    try {
        const imageId = String(req.body.public_id || "").trim();
        if (!imageId) {
            return res.status(400).json({ message: "public_id is required" });
        }

        const storage = getStorageConfig();
        const objectPath = encodeObjectPath(imageId);
        const response = await fetch(`${storage.objectBaseUrl}/${objectPath}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${storage.apiKey}`,
                apikey: storage.apiKey,
            },
        });

        if (!response.ok) {
            const text = await response.text();
            return res.status(400).json({ success: false, message: text || "Failed to delete image" });
        }

        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

const uploadToInsforgeStorage = async (file, folder, storage) => {
    const objectPath = buildObjectPath(folder, file.name);
    const encodedPath = encodeObjectPath(objectPath);
    const fileBuffer = await fs.promises.readFile(file.tempFilePath);
    const formData = new FormData();
    const fileBlob = new Blob([fileBuffer], {
        type: file.mimetype || "application/octet-stream",
    });
    formData.append("file", fileBlob, file.name || "upload.bin");

    const response = await fetch(`${storage.objectBaseUrl}/${encodedPath}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${storage.apiKey}`,
            apikey: storage.apiKey,
        },
        body: formData,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Upload image failed.");
    }

    let uploadData = {};
    try {
        uploadData = await response.json();
    } catch {
        uploadData = {};
    }

    const finalUrl = uploadData?.url || `${storage.publicBaseUrl}/${encodedPath}`;

    return {
        url: finalUrl,
        public_url: objectPath,
    };
};

const removeTmp = (filePath) => {
    if (!filePath) {
        return;
    }
    fs.unlink(filePath, () => {});
};
