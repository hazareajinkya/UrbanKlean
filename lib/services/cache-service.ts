import { Redis } from "@upstash/redis";
import { IAgent } from "../types/agent";
import { IWorkflow } from "../types/workflow";
import { IAction } from "../types/actions";

// Only initialize Redis on server side
const isServer = typeof window === "undefined";
const redis = isServer ? Redis.fromEnv() : null;

const cachePrefix = {
  agent: "cache:agent:",
  workflows: "cache:workflows:",
  actions: "cache:actions:",
} as const;

// Default TTL: 24 hours (safety net if invalidation fails)
const DEFAULT_TTL = 60 * 60 * 24;

class CacheService {
  private log(action: string, key: string, details?: string) {
    const extra = details ? ` | ${details}` : "";
    console.log(`[Cache] ${action} | ${key}${extra}`);
  }

  // Generic cache operations (skip on client side)
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    return redis.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl = DEFAULT_TTL): Promise<void> {
    if (!redis) return;
    await redis.set(key, value, { ex: ttl });
  }

  async del(key: string): Promise<void> {
    if (!redis) return;
    await redis.del(key);
  }

  // Agent cache
  async getAgent(aid: string): Promise<IAgent | null> {
    const key = `${cachePrefix.agent}${aid}`;
    const cached = await this.get<IAgent>(key);
    if (cached) {
      this.log("HIT", key);
    } else if (redis) {
      this.log("MISS", key);
    }
    return cached;
  }

  async setAgent(aid: string, agent: IAgent): Promise<void> {
    const key = `${cachePrefix.agent}${aid}`;
    await this.set(key, agent);
    if (redis) this.log("SET", key);
  }

  async invalidateAgent(aid: string): Promise<void> {
    const key = `${cachePrefix.agent}${aid}`;
    await this.del(key);
    if (redis) this.log("INVALIDATE", key);
  }

  async getWorkflows(wid: string): Promise<IWorkflow[] | null> {
    const key = `${cachePrefix.workflows}${wid}`;
    const cached = await this.get<IWorkflow[]>(key);
    if (cached) {
      this.log("HIT", key, `${cached.length} workflows`);
    } else if (redis) {
      this.log("MISS", key);
    }
    return cached;
  }

  async setWorkflows(wid: string, workflows: IWorkflow[]): Promise<void> {
    const key = `${cachePrefix.workflows}${wid}`;
    await this.set(key, workflows);
    if (redis) this.log("SET", key, `${workflows.length} workflows`);
  }

  async invalidateWorkflows(wid: string): Promise<void> {
    const key = `${cachePrefix.workflows}${wid}`;
    await this.del(key);
    if (redis) this.log("INVALIDATE", key);
  }

  // Actions cache (keyed by workspace ID, stores all actions)
  async getActions(wid: string): Promise<IAction[] | null> {
    const key = `${cachePrefix.actions}${wid}`;
    const cached = await this.get<IAction[]>(key);
    if (cached) {
      this.log("HIT", key, `${cached.length} actions`);
    } else if (redis) {
      this.log("MISS", key);
    }
    return cached;
  }

  async setActions(wid: string, actions: IAction[]): Promise<void> {
    const key = `${cachePrefix.actions}${wid}`;
    await this.set(key, actions);
    if (redis) this.log("SET", key, `${actions.length} actions`);
  }

  async invalidateActions(wid: string): Promise<void> {
    const key = `${cachePrefix.actions}${wid}`;
    await this.del(key);
    if (redis) this.log("INVALIDATE", key);
  }
}

const cacheService = new CacheService();
export default cacheService;
