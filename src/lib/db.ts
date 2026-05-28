import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Task } from '@/types';

interface TaskDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: {
      'by-status': string;
      'by-project': string;
      'by-dueDate': Date;
    };
  };
  projects: {
    key: string;
    value: {
      id: string;
      name: string;
      description?: string;
      color: string;
      createdAt: Date;
    };
  };
}

const DB_NAME = 'taskpwa-db';
const DB_VERSION = 1;

let db: IDBPDatabase<TaskDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<TaskDB>> {
  if (db) return db;

  db = await openDB<TaskDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Tasks store
      const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
      taskStore.createIndex('by-status', 'status');
      taskStore.createIndex('by-project', 'project');
      taskStore.createIndex('by-dueDate', 'dueDate');

      // Projects store
      db.createObjectStore('projects', { keyPath: 'id' });
    },
  });

  // Seed default projects if empty
  const projectCount = await db.count('projects');
  if (projectCount === 0) {
    const defaultProjects = [
      { id: 'work', name: '工作', color: '#3b82f6', createdAt: new Date() },
      { id: 'personal', name: '个人', color: '#10b981', createdAt: new Date() },
      { id: 'study', name: '学习', color: '#f59e0b', createdAt: new Date() },
      { id: 'health', name: '健康', color: '#ef4444', createdAt: new Date() },
    ];
    for (const project of defaultProjects) {
      await db.add('projects', project);
    }
  }

  return db;
}

// Tasks API
export async function getAllTasks(): Promise<Task[]> {
  const db = await initDB();
  return db.getAll('tasks');
}

export async function getTasksByStatus(status: string): Promise<Task[]> {
  const db = await initDB();
  return db.getAllFromIndex('tasks', 'by-status', status);
}

export async function getTasksByProject(project: string): Promise<Task[]> {
  const db = await initDB();
  return db.getAllFromIndex('tasks', 'by-project', project);
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  const db = await initDB();
  return db.get('tasks', id);
}

export async function createTask(task: Task): Promise<void> {
  const db = await initDB();
  await db.add('tasks', task);
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const db = await initDB();
  const existing = await db.get('tasks', id);
  if (existing) {
    await db.put('tasks', { ...existing, ...updates, updatedAt: new Date() });
  }
}

export async function deleteTask(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('tasks', id);
}

// Projects API
export async function getAllProjects() {
  const db = await initDB();
  return db.getAll('projects');
}

export async function createProject(project: { id: string; name: string; color: string }) {
  const db = await initDB();
  await db.add('projects', { ...project, createdAt: new Date() });
}
