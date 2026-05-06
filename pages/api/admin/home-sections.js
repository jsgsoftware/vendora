import nc from "next-connect";
import {
    createHomeSection,
    deleteHomeSection,
    getSectionPayloadTemplate,
    listHomeSections,
    moveHomeSection,
    updateHomeSection,
} from "@/utils/homeSections";

const handler = nc();

handler.get(async (req, res) => {
    try {
        const sections = await listHomeSections();
        res.status(200).json({ sections });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Failed to fetch home sections",
            hint: "If this is the first time using this feature, run InsForge migrations.",
        });
    }
});

handler.post(async (req, res) => {
    try {
        const type = req.body?.type === "hero_carousel"
            ? "hero_carousel"
            : req.body?.type === "sellers_carousel"
            ? "sellers_carousel"
            : "card_grid";
        const payload = req.body?.payload || getSectionPayloadTemplate(type);
        const sections = await createHomeSection({
            title: req.body?.title || "",
            type,
            enabled: req.body?.enabled !== false,
            payload,
        });

        res.status(200).json({ sections });
    } catch (error) {
        if (error.code === 400) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({
            message: error.message || "Failed to create home section",
            hint: "Run InsForge migrations if table home_sections is missing.",
        });
    }
});

handler.put(async (req, res) => {
    try {
        const id = req.body?.id;
        if (!id) {
            return res.status(400).json({ message: "Section id is required." });
        }

        if (req.body?.action === "move") {
            const direction = req.body?.direction === "up" ? "up" : "down";
            const sections = await moveHomeSection(id, direction);
            return res.status(200).json({ sections });
        }

        const updates = {
            title: req.body?.title,
            type: req.body?.type,
            enabled: req.body?.enabled,
            payload: req.body?.payload,
        };

        console.log("[home-sections PUT] updating id:", id, "updates:", JSON.stringify(updates, null, 2));

        const sections = await updateHomeSection(id, updates);
        console.log("[home-sections PUT] update success, sections count:", sections?.length);
        return res.status(200).json({ sections });
    } catch (error) {
        console.error("[home-sections PUT] error:", error?.message || error);
        if (error.code === 404) {
            return res.status(404).json({ message: error.message });
        }
        if (error.code === 400) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({
            message: error.message || "Failed to update section",
            hint: "Run InsForge migrations if table home_sections is missing.",
        });
    }
});

handler.delete(async (req, res) => {
    try {
        const id = req.query?.id;
        if (!id) {
            return res.status(400).json({ message: "Section id is required." });
        }

        const sections = await deleteHomeSection(id);
        return res.status(200).json({ sections });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Failed to delete section",
            hint: "Run InsForge migrations if table home_sections is missing.",
        });
    }
});

export default handler;
