import nc from "next-connect";
import { fetchAllRows } from "@/utils/insforgeClient";

const handler = nc();

handler.get(async (req, res) => {
    try {
        const rows = await fetchAllRows("mv_categories");
        const activeRows = rows.filter(
            (row) =>
                (row.status || "active") === "active" &&
                (row?.metadata?.showInStore !== false)
        );

        const byParent = new Map();
        const byOrder = (a, b) => {
            const aOrder = Number(a.sortOrder ?? Number.MAX_SAFE_INTEGER);
            const bOrder = Number(b.sortOrder ?? Number.MAX_SAFE_INTEGER);
            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }
            return String(a.name || "").localeCompare(String(b.name || ""));
        };

        activeRows.forEach((row) => {
            const parentKey = row.parent_id ? String(row.parent_id) : "root";
            if (!byParent.has(parentKey)) {
                byParent.set(parentKey, []);
            }
            byParent.get(parentKey).push({
                id: row.id,
                name: row.name,
                slug: row.slug,
                sortOrder: row?.metadata?.sortOrder,
            });
        });

        const categories = (byParent.get("root") || [])
            .sort(byOrder)
            .map((category) => ({
                ...category,
                children: (byParent.get(String(category.id)) || []).sort(byOrder),
            }));

        res.status(200).json({ categories });
    } catch (error) {
        res.status(500).json({ message: error.message || "Failed to fetch categories" });
    }
});

export default handler;
