import fs from "fs";
import path from "path";

let cachedConfig = null;

function readProjectConfig() {
    try {
        const projectFile = path.join(process.cwd(), ".insforge", "project.json");
        if (!fs.existsSync(projectFile)) {
            return {};
        }
        const raw = fs.readFileSync(projectFile, "utf8");
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

function getConfig() {
    if (cachedConfig) {
        return cachedConfig;
    }

    const projectConfig = readProjectConfig();

    // Browser-safe: never leak docker internal URLs to the client.
    // Instead, hit the Next.js API proxy (/api/insforge/*).
    const isBrowser = typeof window !== "undefined";
    const baseUrl = isBrowser
        ? ""
        : (process.env.INSFORGE_BASE_URL || projectConfig.oss_host || "");

    const apiKey = process.env.INSFORGE_API_KEY || projectConfig.api_key;

    if (!baseUrl && !isBrowser) {
        throw new Error(
            "Missing InsForge configuration. Set INSFORGE_BASE_URL and INSFORGE_API_KEY or run 'npx @insforge/cli link'."
        );
    }

    cachedConfig = {
        baseUrl: baseUrl.replace(/\/$/, ""),
        postgrestUrl: (process.env.POSTGREST_BASE_URL || "").replace(/\/$/, ""),
        apiKey,
    };
    return cachedConfig;
}

function buildQuery(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
            return;
        }
        searchParams.set(key, String(value));
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
}

async function request(pathname, options = {}) {
    const { baseUrl, postgrestUrl, apiKey } = getConfig();
    // In the browser, every API call is prefixed with /api/insforge so it goes
    // through the Next.js proxy, avoiding CORS and hardcoded docker URLs.
    const isBrowser = typeof window !== "undefined";

    // Database routes bypass InsForge proxy on server to avoid auth rewriting
    const isDbRoute = pathname.startsWith("/api/database/");
    const usePostgrest = !isBrowser && isDbRoute && postgrestUrl;

    const resolvedPath = isBrowser
        ? "/api/insforge" + pathname
        : usePostgrest
            ? postgrestUrl + pathname.replace("/api/database/records", "")
            : baseUrl + pathname;

    const response = await fetch(resolvedPath, {
        ...options,
        headers: {
            ...(usePostgrest
                ? { apikey: apiKey }
                : { Authorization: `Bearer ${apiKey}` }),
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });

    const isJson = (response.headers.get("content-type") || "").includes("application/json");
    const body = isJson ? await response.json() : await response.text();

    if (!response.ok) {
        const message = typeof body === "string" ? body : body?.message || `InsForge request failed (${response.status})`;
        throw new Error(message);
    }

    return {
        data: body,
        headers: response.headers,
    };
}

export async function fetchRows(tableName, params = {}) {
    const query = buildQuery(params);
    const { data, headers } = await request(`/api/database/records/${tableName}${query}`);
    return {
        rows: Array.isArray(data) ? data : [],
        totalCount: Number(headers.get("X-Total-Count") || 0),
    };
}

export async function fetchAllRows(tableName, batchSize = 1000) {
    let offset = 0;
    let done = false;
    const rows = [];

    while (!done) {
        const { rows: chunk } = await fetchRows(tableName, {
            limit: batchSize,
            offset,
        });

        rows.push(...chunk);
        offset += chunk.length;

        if (chunk.length < batchSize) {
            done = true;
        }
    }

    return rows;
}

export async function insertRows(tableName, records, { upsert = true } = {}) {
    const headers = {
        Prefer: upsert
            ? "resolution=merge-duplicates,return=representation"
            : "return=representation",
    };

    const { data } = await request(`/api/database/records/${tableName}`, {
        method: "POST",
        headers,
        body: JSON.stringify(records),
    });

    return Array.isArray(data) ? data : [];
}

export async function patchRows(tableName, filters, payload) {
    const query = buildQuery(filters);
    console.log(`[patchRows] table=${tableName} query=${query} payload=`, JSON.stringify(payload, null, 2));
    const response = await request(`/api/database/records/${tableName}${query}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation", Accept: "application/vnd.pgrst.object+json,*/*" },
        parseJson: true,
        body: JSON.stringify(payload),
    });
    const data = response?.data;
    const rows = Array.isArray(data) ? data : [];
    console.log(`[patchRows] response rows=${rows.length} status=${response?.headers?.get('status') || 'unknown'}`);
    if (!rows.length) {
        const err = new Error(`PATCH on ${tableName} returned 0 rows. Check that the row exists and the service role has UPDATE permission (or RLS allows updates).`);
        err.code = 404;
        throw err;
    }
    return rows;
}

export async function deleteRows(tableName, filters) {
    const query = buildQuery(filters);
    await request(`/api/database/records/${tableName}${query}`, {
        method: "DELETE",
    });
}
