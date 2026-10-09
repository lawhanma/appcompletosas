// Banco de Dados Interno Robusto (ShopNext Internal Database)
// Utiliza arquitetura multicamada com IndexedDB nativo + LocalStorage espelhado
// Mantém sessão persistente de longa duração (30 dias) e tabela interna de usuários cadastrados

export interface DbUser {
  id: string;
  email: string;
  name: string;
  purchaseCode: string;
  isVip: boolean;
  password?: string;
  createdAt: number;
  lastLogin: number;
}

export interface DbSession {
  sessionId: string;
  userEmail: string;
  purchaseCode: string;
  isVip: boolean;
  name: string;
  authenticated: boolean;
  createdAt: number;
  lastActive: number;
  expiresAt: number; // 30 dias de validade contínua
}

const DB_NAME = "ShopNext_InternalDB";
const DB_VERSION = 1;
const SESSION_STORAGE_KEY = "shopnext_db_session_v2";
const USERS_STORAGE_KEY = "shopnext_db_users_v2";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Validador de códigos autorizados
export const ALLOWED_CODES = ["101190", "123456", "12456"];

export const isVipCode = (code: string): boolean => {
  const clean = code.trim();
  return clean === "123456" || clean === "12456";
};

// Gerenciador IndexedDB nativo
function openIndexedDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("sessions")) {
          db.createObjectStore("sessions", { keyPath: "sessionId" });
        }
        if (!db.objectStoreNames.contains("users")) {
          db.createObjectStore("users", { keyPath: "email" });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

// Escrita assíncrona no IndexedDB
async function idbSet(storeName: "sessions" | "users", value: any): Promise<void> {
  const db = await openIndexedDB();
  if (!db) return;
  try {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.put(value);
  } catch {
    // fallback silencioso para LocalStorage
  }
}

// Leitura assíncrona no IndexedDB
async function idbGet<T>(storeName: "sessions" | "users", key: IDBValidKey): Promise<T | null> {
  const db = await openIndexedDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// Remoção assíncrona no IndexedDB
async function idbDelete(storeName: "sessions" | "users", key: IDBValidKey): Promise<void> {
  const db = await openIndexedDB();
  if (!db) return;
  try {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.delete(key);
  } catch {
    // ignore
  }
}

// Cache em memória para sincronização imediata
let inMemorySession: DbSession | null = null;

export const internalDb = {
  // Retorna a sessão ativa síncrona com verificação de expiração
  getActiveSession(): DbSession | null {
    if (inMemorySession && inMemorySession.expiresAt > Date.now()) {
      return inMemorySession;
    }

    try {
      // 1. Tenta recuperar do LocalStorage
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const parsed: DbSession = JSON.parse(raw);
        if (parsed && parsed.authenticated && parsed.expiresAt > Date.now()) {
          inMemorySession = parsed;
          return parsed;
        } else if (parsed && parsed.expiresAt <= Date.now()) {
          // Expirada
          this.clearSession();
          return null;
        }
      }

      // 2. Fallback para chave legada shopnext_auth se existir
      const legacyRaw = localStorage.getItem("shopnext_auth");
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        if (legacy && legacy.authenticated && legacy.purchaseCode) {
          const migratedSession = this.saveSession({
            userEmail: legacy.email || "afiliado@shopgo.com",
            purchaseCode: legacy.purchaseCode,
            name: legacy.name || "Afiliado Shop GO",
            isVip: isVipCode(legacy.purchaseCode),
            authenticated: true
          });
          return migratedSession;
        }
      }
    } catch (e) {
      console.warn("Erro ao ler sessão do banco interno:", e);
    }

    return null;
  },

  // Inicialização assíncrona para garantir sincronia com IndexedDB
  async initAsyncSession(): Promise<DbSession | null> {
    const current = this.getActiveSession();
    if (current) {
      // Mantém IndexedDB atualizado
      idbSet("sessions", current);
      return current;
    }

    // Se LocalStorage estava vazio, tenta buscar do IndexedDB
    const fromIdb = await idbGet<DbSession>("sessions", "active_current_session");
    if (fromIdb && fromIdb.authenticated && fromIdb.expiresAt > Date.now()) {
      inMemorySession = fromIdb;
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fromIdb));
      } catch {}
      return fromIdb;
    }

    return null;
  },

  // Salva uma nova sessão persistente (30 dias de vida contínua)
  saveSession(data: {
    userEmail: string;
    purchaseCode: string;
    name?: string;
    isVip?: boolean;
    authenticated?: boolean;
  }): DbSession {
    const now = Date.now();
    const cleanCode = data.purchaseCode.trim();
    const isVip = typeof data.isVip === "boolean" ? data.isVip : isVipCode(cleanCode);

    const session: DbSession = {
      sessionId: "active_current_session",
      userEmail: data.userEmail.trim(),
      purchaseCode: cleanCode,
      isVip,
      name: data.name?.trim() || "Afiliado Shop GO",
      authenticated: data.authenticated !== false,
      createdAt: now,
      lastActive: now,
      expiresAt: now + THIRTY_DAYS_MS
    };

    inMemorySession = session;

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      // Mantém compatibilidade com módulos legados
      localStorage.setItem(
        "shopnext_auth",
        JSON.stringify({
          email: session.userEmail,
          authenticated: true,
          purchaseCode: session.purchaseCode,
          name: session.name
        })
      );
    } catch (e) {
      console.warn("Erro ao salvar no LocalStorage:", e);
    }

    // Grava também no IndexedDB para redundância ultra-resistente
    idbSet("sessions", session);

    // Também registra ou atualiza o usuário no banco de dados interno
    this.saveUser({
      email: session.userEmail,
      name: session.name,
      purchaseCode: session.purchaseCode,
      isVip: session.isVip
    });

    return session;
  },

  // Mantém a sessão ativa estendendo a validade conforme o usuário interage
  touchSession(): void {
    const session = this.getActiveSession();
    if (!session) return;

    session.lastActive = Date.now();
    session.expiresAt = Date.now() + THIRTY_DAYS_MS;
    inMemorySession = session;

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {}

    idbSet("sessions", session);
  },

  // Encerra sessão apenas quando o usuário clica expressamente em 'Sair da conta'
  clearSession(): void {
    inMemorySession = null;
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem("shopnext_auth");
    } catch {}
    idbDelete("sessions", "active_current_session");
  },

  // Salva / Atualiza usuário na tabela interna de usuários
  saveUser(user: {
    email: string;
    name: string;
    purchaseCode: string;
    password?: string;
    isVip?: boolean;
  }): DbUser {
    const cleanEmail = user.email.toLowerCase().trim();
    const cleanCode = user.purchaseCode.trim();
    const isVip = typeof user.isVip === "boolean" ? user.isVip : isVipCode(cleanCode);

    const users = this.getAllUsers();
    const existing = users.find((u) => u.email === cleanEmail);

    const dbUser: DbUser = {
      id: existing?.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      name: user.name.trim() || existing?.name || "Afiliado Shop GO",
      purchaseCode: cleanCode,
      isVip,
      password: user.password || existing?.password || "",
      createdAt: existing?.createdAt || Date.now(),
      lastLogin: Date.now()
    };

    const updatedUsers = users.filter((u) => u.email !== cleanEmail);
    updatedUsers.push(dbUser);

    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    } catch {}

    idbSet("users", dbUser);

    return dbUser;
  },

  // Retorna todos os usuários do banco interno
  getAllUsers(): DbUser[] {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return [];
  },

  // Busca usuário por e-mail no banco interno
  getUserByEmail(email: string): DbUser | null {
    const clean = email.toLowerCase().trim();
    const users = this.getAllUsers();
    return users.find((u) => u.email === clean) || null;
  }
};
