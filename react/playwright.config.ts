import { defineConfig, devices } from "@playwright/test";

//  Own ports so the tests never reuse a dev server that may be running stale code
const API_PORT = 3100;
const WEB_PORT = 5174;

export default defineConfig( {
    testDir: "./e2e",
    fullyParallel: false,
    workers: 1,
    retries: 0,
    reporter: [ [ "list" ] ],
    globalSetup: "./e2e/global-setup.ts",
    globalTeardown: "./e2e/global-teardown.ts",
    use: {
        baseURL: `http://localhost:${ WEB_PORT }`,
        permissions: [ "geolocation" ],
        geolocation: { latitude: 14.6349, longitude: -90.5069 },
        locale: "es-GT",
        trace: "retain-on-failure"
    },
    projects: [
        { name: "chromium", use: { ...devices[ "Desktop Chrome" ] } }
    ],
    webServer: [
        {
            //  Backend (development env, local DB)
            command: "node server.js",
            cwd: "..",
            env: { APP_PORT: String( API_PORT ) },
            url: `http://localhost:${ API_PORT }/ping`,
            reuseExistingServer: false,
            timeout: 30_000
        },
        {
            command: `npx vite --port ${ WEB_PORT } --strictPort`,
            url: `http://localhost:${ WEB_PORT }`,
            env: { VITE_API_HOST: `http://localhost:${ API_PORT }` },
            reuseExistingServer: false,
            timeout: 30_000
        }
    ]
} );
