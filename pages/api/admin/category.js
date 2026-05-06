import nc from "next-connect";
import db from "../../../utils/db";
import Category from "../../../models/Category";
import slugify from "slugify";
import { syncCategoryToMv } from "../../../utils/mvSync";

// import use(auth) middleware...
const handler = nc();

async function getCategoryList() {
    const categories = await Category.find({}).lean();
    return categories.sort((a, b) => {
        const aActive = (a.status || "active") === "active";
        const bActive = (b.status || "active") === "active";
        if (aActive !== bActive) {
            return aActive ? -1 : 1;
        }
        const aOrder = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : Number.MAX_SAFE_INTEGER;
        const bOrder = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : Number.MAX_SAFE_INTEGER;
        if (aOrder !== bOrder) {
            return aOrder - bOrder;
        }
        return String(a.name || "").localeCompare(String(b.name || ""));
    });
}

async function normalizeActiveCategoryOrder() {
    const categories = await Category.find({}).lean();
    const active = categories
        .filter((c) => (c.status || "active") === "active")
        .sort((a, b) => {
            const aOrder = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : Number.MAX_SAFE_INTEGER;
            const bOrder = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : Number.MAX_SAFE_INTEGER;
            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }
            return String(a.name || "").localeCompare(String(b.name || ""));
        });

    for (let i = 0; i < active.length; i += 1) {
        if (Number(active[i].sortOrder) !== i) {
            const category = await Category.findById(active[i]._id);
            if (category) {
                category.sortOrder = i;
                await category.save();
                await syncCategoryToMv(category);
            }
        }
    }
}

handler.post( async( req, res) => {
    try {
        const { name, showInStore } = req.body;
        db.connectDb();
        const test = await Category.findOne( { name });
        if(test) {
           return res.status(400).json({ message: "Category already exist, Try a different name."})
        }

        const category = await new Category({
            name,
            slug: slugify(name),
            status: "active",
            showInStore: showInStore !== false,
            sortOrder: Number.MAX_SAFE_INTEGER,
        }).save();
        await normalizeActiveCategoryOrder();
        await syncCategoryToMv(category);

        db.disconnectDb();
        res.json({
            message: `Category ${name} has been created successfully.`,
            categories: await getCategoryList(),
        })

        
    } catch (error) {
        db.disconnectDb();
        res.status(500).json({ message: error.message })
    }
})

handler.put(async (req, res) => {
    try {
        const { id, name, status, showInStore, action, direction } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Category id is required." });
        }

        db.connectDb();
        const category = await Category.findById(id);
        if (!category) {
            db.disconnectDb();
            return res.status(404).json({ message: "Category not found." });
        }

        if (action === "move") {
            const activeCategories = (await Category.find({}).lean())
                .filter((c) => (c.status || "active") === "active")
                .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

            const index = activeCategories.findIndex((c) => String(c._id) === String(id));
            if (index !== -1) {
                const targetIndex = direction === "up" ? index - 1 : index + 1;
                if (targetIndex >= 0 && targetIndex < activeCategories.length) {
                    const current = activeCategories[index];
                    const target = activeCategories[targetIndex];
                    const currentDoc = await Category.findById(current._id);
                    const targetDoc = await Category.findById(target._id);
                    if (currentDoc && targetDoc) {
                        const tempOrder = Number(currentDoc.sortOrder || 0);
                        currentDoc.sortOrder = Number(targetDoc.sortOrder || 0);
                        targetDoc.sortOrder = tempOrder;
                        await currentDoc.save();
                        await targetDoc.save();
                        await syncCategoryToMv(currentDoc);
                        await syncCategoryToMv(targetDoc);
                    }
                }
            }

            await normalizeActiveCategoryOrder();
            db.disconnectDb();
            return res.json({
                message: "Category position updated successfully.",
                categories: await getCategoryList(),
            });
        }

        if (name !== undefined) {
            category.name = name;
            category.slug = slugify(name);
        }
        if (status !== undefined) {
            category.status = status;
            if (status === "inactive") {
                category.sortOrder = Number.MAX_SAFE_INTEGER;
            }
        }
        if (showInStore !== undefined) {
            category.showInStore = !!showInStore;
        }

        await category.save();
        await normalizeActiveCategoryOrder();
        await syncCategoryToMv(category);

        db.disconnectDb();
        return res.json({
            message: "Category updated successfully.",
            categories: await getCategoryList(),
        });
    } catch (error) {
        db.disconnectDb();
        return res.status(500).json({ message: error.message });
    }
});

handler.get(async (req, res) => {
    try {
        db.connectDb();
        const categories = await getCategoryList();
        db.disconnectDb();
        return res.json({ categories });
    } catch (error) {
        db.disconnectDb();
        return res.status(500).json({ message: error.message });
    }
});


export default handler;
