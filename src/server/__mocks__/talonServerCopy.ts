export async function createServer(options: object, proxyConfig: any = {}) {
    return {
        start: jest.fn(),
        use: jest.fn()
    };
}

export async function startServer(app: any, basePath: string, port = 3000) {}
