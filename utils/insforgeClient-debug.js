async function request(pathname, options = {}) {
    const { baseUrl, apiKey } = getConfig();
    const isBrowser = typeof window !== 'undefined';
    const resolvedPath = isBrowser
        ? '/api/insforge' + pathname
        : baseUrl + pathname;

    const response = await fetch(resolvedPath, {
        ...options,
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    const isJson = (response.headers.get('content-type') || '').includes('application/json');
    const body = isJson ? await response.json() : await response.text();

    if (!response.ok) {
        const detail = typeof body === 'string' ? body : JSON.stringify(body);
        throw new Error(`InsForge ${response.status}: ${detail.slice(0,200)}`);
    }
    return { data: body, headers: response.headers };
}
