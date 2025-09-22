import axios, { AxiosInstance } from "axios";
import { Note, NoteTag } from "../types/note";

const token = import.meta.env.VITE_NOTEHUB_TOKEN as string;

const api: AxiosInstance = axios.create({
  baseURL: "https://notehub-public.goit.study/api",
});

api.interceptors.request.use((config) => {
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface FetchNotesResult {
  items: Note[];
  totalPages: number;
}

/* ————— helpers без any ————— */
function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function arrProp(o: unknown, key: string): unknown[] | null {
  if (!isObj(o)) return null;
  const v = o[key];
  return Array.isArray(v) ? v : null;
}
function objProp(o: unknown, key: string): Record<string, unknown> | null {
  if (!isObj(o)) return null;
  const v = o[key];
  return isObj(v) ? (v as Record<string, unknown>) : null;
}

export async function fetchNotes(params: FetchNotesParams): Promise<FetchNotesResult> {
  const { page = 1, perPage = 12, search = "" } = params;

  const res = await api.get<unknown>("/notes", {
    params: { page, perPage, search: search || undefined },
  });

  const root = res.data;

  const items: Note[] =
    (arrProp(root, "items") as Note[] | null) ??
    (arrProp(root, "results") as Note[] | null) ??
    (arrProp(root, "data") as Note[] | null) ??
    (arrProp(root, "notes") as Note[] | null) ??
    (Array.isArray(root) ? (root as Note[]) : []);

  
  let totalPages =
    (isObj(root) && typeof root["totalPages"] === "number"
      ? (root["totalPages"] as number)
      : undefined) ??
    (isObj(root) && isObj(root["meta"]) && typeof (root["meta"] as Record<string, unknown>)["totalPages"] === "number"
      ? ((root["meta"] as Record<string, unknown>)["totalPages"] as number)
      : undefined) ??
    (isObj(root) && isObj(root["pagination"]) && typeof (root["pagination"] as Record<string, unknown>)["totalPages"] === "number"
      ? ((root["pagination"] as Record<string, unknown>)["totalPages"] as number)
      : undefined);

  if (totalPages === undefined) {
    const totalItems =
      (isObj(root) && typeof root["totalItems"] === "number" ? (root["totalItems"] as number) : undefined) ?? items.length;
    totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  }

  return { items, totalPages };
}

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}

interface ItemResponse {
  item: Note;
}

export async function createNote(payload: CreateNoteParams): Promise<Note> {
  const res = await api.post<ItemResponse>("/notes", payload);
  return res.data.item;
}

export async function deleteNote(id: string): Promise<void> {
  await api.delete<void>(`/notes/${id}`);
}
