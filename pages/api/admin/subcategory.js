import nc from "next-connect";
import db from "../../../utils/db";
import SubCategory from "../../../models/SubCategory";
import slugify from "slugify";
import { syncCategoryToMv } from "../../../utils/mvSync";

// import use(auth) middleware...
const handler = nc();

async function getSubCategoryList() {
    const subCategories = await SubCategory.find({}).lean();
    return subCategories.sort((a, b) => {
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

async function normalizeActiveSubCategoryOrder() {
    const subCategories = await SubCategory.find({}).lean();
    const active = subCategories
        .filter((s) => (s.status || "active") === "active")
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
            const subCategory = await SubCategory.findById(active[i]._id);
            if (subCategory) {
                subCategory.sortOrder = i;
                await subCategory.save();
                await syncCategoryToMv(subCategory);
            }
        }
    }
}

handler.post( async( req, res) => {
    try {
        const { name, parent, showInStore } = req.body;
        db.connectDb();
        const test = await SubCategory.findOne( { name, parent });
        if(test) {
           return res.status(400).json({ message: "SubCategory already exist, Try a different name."})
        }

        const subCategory = await new SubCategory({
            name,
            parent,
            slug: slugify(name),
            status: "active",
            showInStore: showInStore !== false,
            sortOrder: Number.MAX_SAFE_INTEGER,
        }).save();
        await normalizeActiveSubCategoryOrder();
        await syncCategoryToMv(subCategory);

        db.disconnectDb();
        res.json({
            message: `SubCategory ${name} has been created successfully.`,
            subCategory: await getSubCategoryList(),
            subCategories: await getSubCategoryList(),
        })

        
    } catch (error) {
        db.disconnectDb();
        res.status(500).json({ message: error.message })
    }
})

handler.put(async (req, res) => {
    try {
        const { id, name, parent, status, showInStore, action, direction } = req.body;
        if (!id) {
            return res.status(400).json({ message: "SubCategory id is required." });
        }

        db.connectDb();
        const subCategory = await SubCategory.findById(id);
        if (!subCategory) {
            db.disconnectDb();
            return res.status(404).json({ message: "SubCategory not found." });
        }

        if (action === "move") {
            const activeSubCategories = (await SubCategory.find({}).lean())
                .filter((s) => (s.status || "active") === "active")
                .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

            const index = activeSubCategories.findIndex((s) => String(s._id) === String(id));
            if (index !== -1) {
                const targetIndex = direction === "up" ? index - 1 : index + 1;
                if (targetIndex >= 0 && targetIndex < activeSubCategories.length) {
                    const current = activeSubCategories[index];
                    const target = activeSubCategories[targetIndex];
                    const currentDoc = await SubCategory.findById(current._id);
                    const targetDoc = await SubCategory.findById(target._id);
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

            await normalizeActiveSubCategoryOrder();
            db.disconnectDb();
            return res.json({
                message: "SubCategory position updated successfully.",
                subCategories: await getSubCategoryList(),
            });
        }

        if (name !== undefined) {
            subCategory.name = name;
            subCategory.slug = slugify(name);
        }
        if (parent !== undefined) {
            subCategory.parent = parent;
        }
        if (status !== undefined) {
            subCategory.status = status;
            if (status === "inactive") {
                subCategory.sortOrder = Number.MAX_SAFE_INTEGER;
            }
        }
        if (showInStore !== undefined) {
            subCategory.showInStore = !!showInStore;
        }

        await subCategory.save();
        await normalizeActiveSubCategoryOrder();
        await syncCategoryToMv(subCategory);

        db.disconnectDb();
        return res.json({
            message: "SubCategory updated successfully.",
            subCategories: await getSubCategoryList(),
        });
    } catch (error) {
        db.disconnectDb();
        return res.status(500).json({ message: error.message });
    }
});

handler.get( async(req, res) => {
    try {
        const { category } = req.query;
        
        if(!category) {
            return res.json([])
        }
        db.connectDb();
        const results = await SubCategory.find({ parent: category, status: "active" }).select("name sortOrder");
        db.disconnectDb();
        const ordered = [...results].sort((a, b) => {
            const aOrder = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : Number.MAX_SAFE_INTEGER;
            const bOrder = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : Number.MAX_SAFE_INTEGER;
            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }
            return String(a.name || "").localeCompare(String(b.name || ""));
        });
        return res.json(ordered);
    } catch (error) {
        db.disconnectDb();
        res.status(500).json({ message: error.message })
    }
})


export default handler;
