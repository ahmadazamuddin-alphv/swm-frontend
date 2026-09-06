import { Container } from "@cloudflare/containers";

export class SiagaAdmin extends Container {
  defaultPort = 8080;
  requiredPorts = [8080];
  sleepAfter = "2h";
  envVars = {
    APP_URL: "https://siaga-selangor-demo.daniel-syauqi.workers.dev",
  };
}

interface AdminInstance {
  startAndWaitForPorts(): Promise<void>;
  fetch(request: Request): Promise<Response>;
}

interface Env {
  ADMIN: {
    getByName(name: string): AdminInstance;
  };
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

const adminPaths = ["/admin", "/build/", "/css/", "/js/", "/livewire/", "/storage/", "/demo/"];

function isAdminRequest(pathname: string): boolean {
  return adminPaths.some((path) => pathname === path || pathname.startsWith(path));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (isAdminRequest(new URL(request.url).pathname)) {
      const admin = env.ADMIN.getByName("siaga-admin-demo");
      await admin.startAndWaitForPorts();

      return admin.fetch(request);
    }

    return env.ASSETS.fetch(request);
  },
};
