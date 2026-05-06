import crypto from "crypto";
import { deleteRows, fetchAllRows, fetchRows, insertRows, patchRows } from "./insforgeClient";

const modelToTable = {
    User: "vendora_users",
    Category: "vendora_categories",
    SubCategory: "vendora_sub_categories",
    Product: "vendora_products",
    Cart: "vendora_carts",
    Coupon: "vendora_coupons",
    Order: "vendora_orders",
};

function objectIdLike() {
    return crypto.randomBytes(12).toString("hex");
}

function toPlain(value) {
    return JSON.parse(JSON.stringify(value));
}

function setByPath(target, path, value) {
    const keys = path.split(".");
    let current = target;
    for (let i = 0; i < keys.length - 1; i += 1) {
        const key = keys[i];
        if (current[key] === undefined || current[key] === null) {
            current[key] = {};
        }
        current = current[key];
    }
    current[keys[keys.length - 1]] = value;
}

function normalizeArraySubDocs(node) {
    if (Array.isArray(node)) {
        return node.map((item) => {
            if (item && typeof item === "object") {
                if (!item._id) {
                    item._id = objectIdLike();
                }
                normalizeArraySubDocs(item);
            }
            return item;
        });
    }

    if (node && typeof node === "object") {
        Object.keys(node).forEach((key) => {
            const value = node[key];
            if (Array.isArray(value)) {
                node[key] = normalizeArraySubDocs(value);
            } else if (value && typeof value === "object") {
                normalizeArraySubDocs(value);
            }
        });
    }

    return node;
}

function getValuesByPath(obj, pathParts) {
    if (obj === null || obj === undefined) {
        return [];
    }
    if (!pathParts.length) {
        return [obj];
    }

    const [head, ...rest] = pathParts;

    if (Array.isArray(obj)) {
        return obj.flatMap((item) => getValuesByPath(item, pathParts));
    }

    return getValuesByPath(obj[head], rest);
}

function matchOperator(value, operator, expected) {
    if (operator === "$in") {
        return expected.includes(value);
    }
    if (operator === "$gte") {
        return Number(value) >= Number(expected);
    }
    if (operator === "$lte") {
        return Number(value) <= Number(expected);
    }
    if (operator === "$gt") {
        return Number(value) > Number(expected);
    }
    if (operator === "$lt") {
        return Number(value) < Number(expected);
    }
    if (operator === "$regex") {
        const flags = expected?.$options || "";
        const regex = new RegExp(expected, flags);
        return regex.test(String(value || ""));
    }
    return false;
}

function matchesCondition(value, condition) {
    if (condition && typeof condition === "object" && !Array.isArray(condition)) {
        const keys = Object.keys(condition);
        const usesOperators = keys.some((key) => key.startsWith("$"));
        if (usesOperators) {
            return keys.every((operator) => {
                if (operator === "$options") {
                    return true;
                }
                const expected = operator === "$regex" ? { ...condition, value: condition[operator] } : condition[operator];
                if (operator === "$regex") {
                    const regex = new RegExp(condition.$regex, condition.$options || "");
                    return regex.test(String(value || ""));
                }
                return matchOperator(value, operator, expected);
            });
        }
    }

    if (Array.isArray(value)) {
        return value.some((item) => String(item) === String(condition));
    }

    return String(value) === String(condition);
}

function matchesFilter(doc, filter = {}) {
    const entries = Object.entries(filter || {});
    if (!entries.length) {
        return true;
    }

    return entries.every(([key, condition]) => {
        if (key === "$and" && Array.isArray(condition)) {
            return condition.every((sub) => matchesFilter(doc, sub));
        }
        if (key === "$or" && Array.isArray(condition)) {
            return condition.some((sub) => matchesFilter(doc, sub));
        }

        const path = key === "_id" ? "id" : key;
        const values = getValuesByPath(doc, path.split("."));
        return values.some((value) => matchesCondition(value, condition));
    });
}

function applySelection(doc, selection) {
    if (!selection) {
        return doc;
    }

    const fields = selection.split(" ").map((f) => f.trim()).filter(Boolean);
    const picked = {
        _id: doc._id,
        id: doc.id,
    };

    fields.forEach((field) => {
        const values = getValuesByPath(doc, field.split("."));
        if (values.length === 1) {
            setByPath(picked, field, values[0]);
        } else if (values.length > 1) {
            setByPath(picked, field, values);
        }
    });

    return picked;
}

function sortDocs(docs, sort = {}) {
    const entries = Object.entries(sort || {});
    if (!entries.length) {
        return docs;
    }

    return [...docs].sort((a, b) => {
        for (const [field, direction] of entries) {
            const aValue = getValuesByPath(a, field.split("."))[0];
            const bValue = getValuesByPath(b, field.split("."))[0];
            if (aValue === bValue) {
                continue;
            }
            if (aValue === undefined || aValue === null) {
                return 1;
            }
            if (bValue === undefined || bValue === null) {
                return -1;
            }
            if (aValue > bValue) {
                return direction < 0 ? -1 : 1;
            }
            if (aValue < bValue) {
                return direction < 0 ? 1 : -1;
            }
        }
        return 0;
    });
}

async function getDocsByTable(tableName) {
    const rows = await fetchAllRows(tableName);
    return rows.map((row) => {
        const data = row.data || {};
        return {
            ...toPlain(data),
            _id: row.id,
            id: row.id,
        };
    });
}

async function applyPopulate(docs, populatePaths = []) {
    for (const item of populatePaths) {
        const path = typeof item === "string" ? item : item.path;
        if (!path) {
            continue;
        }

        if (path === "category") {
            const categories = await getDocsByTable("vendora_categories");
            const byId = new Map(categories.map((c) => [String(c._id), c]));
            docs.forEach((doc) => {
                const key = doc.category;
                if (key && byId.has(String(key))) {
                    doc.category = byId.get(String(key));
                }
            });
            continue;
        }

        if (path === "subCategories") {
            const subCategories = await getDocsByTable("vendora_sub_categories");
            const byId = new Map(subCategories.map((c) => [String(c._id), c]));
            docs.forEach((doc) => {
                const ids = Array.isArray(doc.subCategories) ? doc.subCategories : [];
                doc.subCategories = ids
                    .map((id) => byId.get(String(id)))
                    .filter(Boolean);
            });
            continue;
        }

        if (path === "parent") {
            const categories = await getDocsByTable("vendora_categories");
            const byId = new Map(categories.map((c) => [String(c._id), c]));
            docs.forEach((doc) => {
                if (doc.parent && byId.has(String(doc.parent))) {
                    doc.parent = byId.get(String(doc.parent));
                }
            });
            continue;
        }

        if (path === "user") {
            const users = await getDocsByTable("vendora_users");
            const byId = new Map(users.map((u) => [String(u._id), u]));
            docs.forEach((doc) => {
                if (doc.user && byId.has(String(doc.user))) {
                    doc.user = byId.get(String(doc.user));
                }
            });
            continue;
        }

        if (path === "reviews.reviewBy") {
            const users = await getDocsByTable("users");
            const byId = new Map(users.map((u) => [String(u._id), u]));
            docs.forEach((doc) => {
                if (!Array.isArray(doc.reviews)) {
                    return;
                }
                doc.reviews = doc.reviews.map((review) => {
                    const reviewBy = review.reviewBy;
                    if (reviewBy && byId.has(String(reviewBy))) {
                        return { ...review, reviewBy: byId.get(String(reviewBy)) };
                    }
                    return review;
                });
            });
        }
    }
}

class Query {
    constructor(model, options = {}) {
        this.model = model;
        this.filter = options.filter || {};
        this.byId = options.byId;
        this.one = options.one || false;
        this.selection = null;
        this.sorting = null;
        this.offset = 0;
        this.max = null;
        this.populatePaths = [];
        this.leanMode = false;
        this.distinctPath = null;
    }

    select(fields) {
        this.selection = fields;
        return this;
    }

    sort(sortObject) {
        this.sorting = sortObject;
        return this;
    }

    skip(count) {
        this.offset = Number(count || 0);
        return this;
    }

    limit(count) {
        this.max = Number(count);
        return this;
    }

    populate(pathOrConfig) {
        this.populatePaths.push(pathOrConfig);
        return this;
    }

    lean() {
        this.leanMode = true;
        return this;
    }

    distinct(path) {
        this.distinctPath = path;
        return this;
    }

    async exec() {
        let docs;

        if (this.byId) {
            const row = await this.model._findRowById(this.byId);
            docs = row ? [this.model._hydrateFromRow(row)] : [];
        } else {
            const rows = await fetchAllRows(this.model.tableName);
            docs = rows.map((row) => this.model._hydrateFromRow(row));
            docs = docs.filter((doc) => matchesFilter(doc, this.filter));
        }

        if (this.sorting) {
            docs = sortDocs(docs, this.sorting);
        }
        if (this.offset) {
            docs = docs.slice(this.offset);
        }
        if (Number.isFinite(this.max) && this.max >= 0) {
            docs = docs.slice(0, this.max);
        }

        if (this.populatePaths.length) {
            await applyPopulate(docs, this.populatePaths);
        }

        if (this.distinctPath) {
            const allValues = docs.flatMap((doc) => getValuesByPath(doc, this.distinctPath.split(".")));
            const unique = new Map();
            allValues.forEach((value) => {
                const key = typeof value === "object" ? JSON.stringify(value) : String(value);
                if (!unique.has(key)) {
                    unique.set(key, value);
                }
            });
            return Array.from(unique.values());
        }

        let selected = docs;
        if (this.selection) {
            selected = docs.map((doc) => applySelection(doc, this.selection));
        }

        if (this.one) {
            const single = selected[0] || null;
            if (!single) {
                return null;
            }
            if (this.leanMode || this.selection) {
                return toPlain(single);
            }
            return this.model._toInstance(single);
        }

        if (this.leanMode || this.selection) {
            return selected.map((doc) => toPlain(doc));
        }
        return selected.map((doc) => this.model._toInstance(doc));
    }

    then(resolve, reject) {
        return this.exec().then(resolve, reject);
    }

    catch(reject) {
        return this.exec().catch(reject);
    }

    finally(handler) {
        return this.exec().finally(handler);
    }
}

export function createModel(modelName) {
    const tableName = modelToTable[modelName];

    if (!tableName) {
        throw new Error(`Unknown model '${modelName}'.`);
    }

    return class InsforgeModel {
        static tableName = tableName;

        constructor(data = {}) {
            const payload = toPlain(data);
            payload._id = payload._id || payload.id || objectIdLike();
            payload.id = payload._id;
            normalizeArraySubDocs(payload);
            Object.assign(this, payload);
        }

        static _hydrateFromRow(row) {
            const data = toPlain(row.data || {});
            data._id = row.id;
            data.id = row.id;
            normalizeArraySubDocs(data);
            return data;
        }

        static _toInstance(doc) {
            const instance = new this(doc);
            instance.toObject = () => toPlain(instance);
            return instance;
        }

        static async _findRowById(id) {
            if (!id) {
                return null;
            }
            const { rows } = await fetchRows(this.tableName, {
                id: `eq.${id}`,
                limit: 1,
            });
            return rows[0] || null;
        }

        static find(filter = {}) {
            return new Query(this, { filter });
        }

        static findOne(filter = {}) {
            return new Query(this, { filter, one: true });
        }

        static findById(id) {
            return new Query(this, { byId: id, one: true });
        }

        static async countDocuments(filter = {}) {
            const docs = await this.find(filter).lean();
            return docs.length;
        }

        static async updateOne(filter = {}, update = {}) {
            const doc = await this.findOne(filter);
            if (!doc) {
                return { matchedCount: 0, modifiedCount: 0 };
            }
            await doc.updateOne(update);
            return { matchedCount: 1, modifiedCount: 1 };
        }

        static async findOneAndUpdate(filter = {}, update = {}) {
            const doc = await this.findOne(filter);
            if (!doc) {
                return null;
            }
            await doc.updateOne(update);
            return doc;
        }

        async save() {
            const id = this._id || this.id || objectIdLike();
            this._id = id;
            this.id = id;
            const now = new Date().toISOString();
            const payload = toPlain(this);
            payload.createdAt = payload.createdAt || now;
            payload.updatedAt = now;
            normalizeArraySubDocs(payload);

            const [savedRow] = await insertRows(this.constructor.tableName, [
                {
                    id,
                    data: payload,
                },
            ]);

            const saved = this.constructor._hydrateFromRow(savedRow);
            Object.assign(this, saved);
            return this;
        }

        async deleteOne() {
            await deleteRows(this.constructor.tableName, { id: `eq.${this._id}` });
            return { deletedCount: 1 };
        }

        async updateOne(update = {}) {
            const doc = toPlain(this);

            const applyRawUpdate = (payload) => {
                Object.entries(payload).forEach(([key, value]) => {
                    setByPath(doc, key, value);
                });
            };

            if (update.$set) {
                applyRawUpdate(update.$set);
            }

            if (update.$push) {
                Object.entries(update.$push).forEach(([field, value]) => {
                    if (!Array.isArray(doc[field])) {
                        doc[field] = [];
                    }
                    const valueToPush = toPlain(value);
                    if (valueToPush && typeof valueToPush === "object" && !valueToPush._id) {
                        valueToPush._id = objectIdLike();
                    }
                    doc[field].push(valueToPush);
                });
            }

            if (update.$pull) {
                Object.entries(update.$pull).forEach(([field, matcher]) => {
                    if (!Array.isArray(doc[field])) {
                        return;
                    }
                    doc[field] = doc[field].filter((item) => !matchesFilter(item, matcher));
                });
            }

            const hasOperators = Object.keys(update).some((key) => key.startsWith("$"));
            if (!hasOperators) {
                applyRawUpdate(update);
            }

            doc.updatedAt = new Date().toISOString();
            normalizeArraySubDocs(doc);

            const [row] = await patchRows(this.constructor.tableName, { id: `eq.${this._id}` }, { data: doc });
            const saved = this.constructor._hydrateFromRow(row);
            Object.assign(this, saved);
            return this;
        }

        async populate(pathOrConfig) {
            const path = typeof pathOrConfig === "string" ? pathOrConfig : pathOrConfig.path;
            const docs = [toPlain(this)];
            await applyPopulate(docs, [path]);
            Object.assign(this, docs[0]);
            return this;
        }
    };
}
