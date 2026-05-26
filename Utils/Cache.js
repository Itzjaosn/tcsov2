class MemStore {
  constructor(opts = {}) {
    this.max = Number(opts.max ?? 5000);
    this.map = new Map();

    const cleanMs = Number(opts.cleanMs ?? 30000);
    this.timer = setInterval(() => this.sweep(), cleanMs);
    this.timer.unref?.();
  }

  get(key) {
    const item = this.map.get(key);
    if (!item) return undefined;

    if (item.exp && item.exp <= Date.now()) {
      this.map.delete(key);
      return undefined;
    }

    return item.val;
  }

  set(key, val, ttl) {
    if (this.map.has(key)) this.map.delete(key);

    const exp = ttl > 0 ? Date.now() + ttl * 1000 : 0;
    this.map.set(key, { val, exp });
    this.trim();
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  del(key) {
    return this.map.delete(key);
  }

  clear(prefix) {
    if (!prefix) {
      this.map.clear();
      return;
    }

    for (const key of this.map.keys()) {
      if (key.startsWith(prefix)) this.map.delete(key);
    }
  }

  sweep() {
    const now = Date.now();
    for (const [key, item] of this.map.entries()) {
      if (item.exp && item.exp <= now) this.map.delete(key);
    }
    this.trim();
  }

  trim() {
    if (!this.max || this.max < 1) return;
    while (this.map.size > this.max) {
      const key = this.map.keys().next().value;
      this.map.delete(key);
    }
  }

  stop() {
    clearInterval(this.timer);
  }
}

class Cache {
  constructor(cfg = {}, log = console) {
    this.cfg = {
      prefix: String(cfg.CACHE_PREFIX || "handler"),
      ttl: Number(cfg.CACHE_TTL ?? 60),
      max: Number(cfg.CACHE_MAX_ITEMS ?? 5000),
      cleanMs: Number(cfg.CACHE_CLEAN_MS ?? 30000),
      redisUrl: String(cfg.REDIS_URL || ""),
      redis: cfg.CACHE_REDIS !== false,
      logging: cfg.CACHE_LOGGING !== false,
    };

    this.log = log;
    this.mem = new MemStore({ max: this.cfg.max, cleanMs: this.cfg.cleanMs });
    this.rds = null;
    this.rdsReady = false;
    this.hit = 0;
    this.miss = 0;
  }

  async connect() {
    if (!this.cfg.redis || !this.cfg.redisUrl) {
      this.say("debug", "[CACHE] using memory");
      return this;
    }

    let createClient;
    try {
      ({ createClient } = require("redis"));
    } catch (err) {
      this.say("warn", `[CACHE] redis pkg missing, using memory: ${msg(err)}`);
      return this;
    }

    try {
      this.rds = createClient({
        url: this.cfg.redisUrl,
        socket: {
          reconnectStrategy: (tries) => Math.min(tries * 250, 5000),
        },
      });

      this.rds.on("error", (err) => {
        this.rdsReady = false;
        this.say("warn", `[CACHE] redis error: ${msg(err)}`);
      });
      this.rds.on("ready", () => {
        this.rdsReady = true;
        this.say("success", "[CACHE] redis ready");
      });
      this.rds.on("end", () => {
        this.rdsReady = false;
        this.say("warn", "[CACHE] redis closed, memory still works");
      });

      await this.rds.connect();
      await this.rds.ping();
      this.rdsReady = true;
      this.say("success", "[CACHE] redis connected");
    } catch (err) {
      this.rdsReady = false;
      this.say("warn", `[CACHE] redis unavailable, using memory: ${msg(err)}`);
      await this.closeRedis();
    }

    return this;
  }

  ns(name) {
    const ns = String(name || "app");

    return {
      get: (key) => this.get(key, { ns }),
      set: (key, val, opts) => this.set(key, val, addNs(opts, ns)),
      has: (key) => this.has(key, { ns }),
      del: (key) => this.del(key, { ns }),
      delete: (key) => this.del(key, { ns }),
      clear: () => this.clear(ns),
      remember: (key, ttl, fn) => this.remember(key, ttl, fn, { ns }),
      wrap: (key, ttl, fn) => this.remember(key, ttl, fn, { ns }),
    };
  }

  async get(key, opts) {
    const cfg = this.opts(opts);
    const full = this.key(cfg.ns, key);
    const memVal = this.mem.get(full);
    if (memVal !== undefined) {
      this.hit++;
      return memVal;
    }

    if (!this.rdsReady) {
      this.miss++;
      return undefined;
    }

    try {
      const raw = await this.rds.get(full);
      if (raw == null) {
        this.miss++;
        return undefined;
      }

      let val;
      try {
        val = decode(raw);
      } catch (err) {
        await this.rds.del(full).catch(() => {});
        this.miss++;
        this.say("warn", `[CACHE] dropped bad redis value: ${msg(err)}`);
        return undefined;
      }

      const ttl = await this.redisTtl(full);
      this.mem.set(full, val, ttl);
      this.hit++;
      return val;
    } catch (err) {
      this.rdsReady = false;
      this.say("warn", `[CACHE] redis read failed, using memory: ${msg(err)}`);
      this.miss++;
      return undefined;
    }
  }

  async set(key, val, opts) {
    const cfg = this.opts(opts);
    const full = this.key(cfg.ns, key);
    this.mem.set(full, val, cfg.ttl);

    if (!this.rdsReady) return true;

    try {
      const body = encode(val);
      if (cfg.ttl > 0) {
        await this.rds.set(full, body, { EX: Math.ceil(cfg.ttl) });
      } else {
        await this.rds.set(full, body);
      }
    } catch (err) {
      this.rdsReady = false;
      this.say("warn", `[CACHE] redis write failed, using memory: ${msg(err)}`);
    }

    return true;
  }

  async has(key, opts) {
    return (await this.get(key, opts)) !== undefined;
  }

  async del(key, opts) {
    const cfg = this.opts(opts);
    const full = this.key(cfg.ns, key);
    this.mem.del(full);

    if (!this.rdsReady) return true;

    try {
      await this.rds.del(full);
    } catch (err) {
      this.rdsReady = false;
      this.say("warn", `[CACHE] redis delete failed: ${msg(err)}`);
    }

    return true;
  }

  async clear(ns) {
    const prefix = this.prefix(ns);
    this.mem.clear(prefix);

    if (!this.rdsReady) return true;

    try {
      if (typeof this.rds.scanIterator === "function") {
        const batch = [];
        for await (const key of this.rds.scanIterator({
          MATCH: `${prefix}*`,
          COUNT: 100,
        })) {
          batch.push(key);
          if (batch.length >= 100) await this.flushBatch(batch);
        }
        await this.flushBatch(batch);
      } else {
        const keys = await this.rds.keys(`${prefix}*`);
        if (keys.length) await this.rds.del(keys);
      }
    } catch (err) {
      this.rdsReady = false;
      this.say("warn", `[CACHE] redis clear failed: ${msg(err)}`);
    }

    return true;
  }

  async remember(key, ttl, fn, opts) {
    if (typeof ttl === "function") {
      opts = opts || fn;
      fn = ttl;
      ttl = undefined;
    }

    const hit = await this.get(key, opts);
    if (hit !== undefined) return hit;

    if (typeof fn !== "function") {
      throw new TypeError("Cache remember needs a function");
    }

    const val = await fn();
    const cfg = this.opts(opts);
    await this.set(key, val, { ...cfg, ttl: ttl ?? cfg.ttl });
    return val;
  }

  stats() {
    return {
      mode: this.rdsReady ? "redis" : "memory",
      size: this.mem.map.size,
      hits: this.hit,
      misses: this.miss,
      prefix: this.cfg.prefix,
    };
  }

  async close() {
    this.mem.stop();
    await this.closeRedis();
  }

  opts(opts) {
    if (typeof opts === "number") return { ns: "app", ttl: opts };
    return {
      ns: String(opts?.ns || "app"),
      ttl: Number(opts?.ttl ?? this.cfg.ttl),
    };
  }

  key(ns, key) {
    return `${this.prefix(ns)}${String(key)}`;
  }

  prefix(ns) {
    if (!ns) return `${this.cfg.prefix}:`;
    return `${this.cfg.prefix}:${String(ns)}:`;
  }

  async redisTtl(key) {
    try {
      const ttl = await this.rds.ttl(key);
      if (ttl > 0) return ttl;
    } catch {}
    return this.cfg.ttl;
  }

  async flushBatch(keys) {
    if (!keys.length) return;
    const del = keys.splice(0, keys.length);
    await this.rds.del(del);
  }

  async closeRedis() {
    if (!this.rds) return;

    try {
      if (this.rds.isOpen) await this.rds.quit();
    } catch {
      try {
        await this.rds.disconnect();
      } catch {}
    }

    this.rds = null;
    this.rdsReady = false;
  }

  say(type, text) {
    if (!this.cfg.logging) return;
    const fn = this.log?.[type] || this.log?.info || console.log;
    fn.call(this.log, text);
  }
}

function addNs(opts, ns) {
  if (typeof opts === "number") return { ns, ttl: opts };
  return { ...(opts || {}), ns };
}

function encode(val) {
  return JSON.stringify({ val });
}

function decode(raw) {
  return JSON.parse(raw).val;
}

function msg(err) {
  return err?.message || String(err);
}

module.exports = Cache;
