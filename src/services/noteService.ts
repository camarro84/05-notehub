// src/services/noteService.ts
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

type KnownListShape =
  | { items: unknown[]; totalPages?: number; meta?: { totalPages?: number } }
  | { results: unknown[]; totalPages?: number; meta?: { totalPages?: number } }
  | { data: unknown[]; totalPages?: number; meta?: { totalPages?: number } }
  | { notes: unknown[]; totalPages?: number; meta?: { totalPages?: number } }
  | unknown[];

function toISO(x: any): string {
  const v = x ?? new Date().toISOString();
  const s = typeof v === "string" ? v : String(v);
  return isNaN(Date.parse(s)) ? new Date().toISOString() : s;
}

function toNote(x: any, idx: number): Note {
  const id = String(x?.id ?? x?._id ?? x?.noteId ?? x?.uuid ?? `tmp-${idx}`);
  const title = String(x?.title ?? x?.name ?? x?.header ?? "");
  const content = String(x?.content ?? x?.text ?? x?.body ?? "");
  const rawTag = String(x?.tag ?? x?.label ?? x?.category ?? "Todo");
  const allowed = ["Todo", "Work", "Personal", "Meeting", "Shopping"] as const;
  const tag: NoteTag = (allowed as readonly string[]).includes(rawTag) ? (rawTag as NoteTag) : "Todo";
  const createdAt = toISO(x?.createdAt);
  const updatedAt = toISO(x?.updatedAt ?? x?.modifiedAt ?? x?.updated_at);
  return { id, title, content, tag, createdAt, updatedAt };
}

function parseList(data: KnownListShape, perPage: number): FetchNotesResult {
  let arr: unknown[] = [];
  let totalPages = 1;

  const pick = (k: "items" | "results" | "data" | "notes") => (data as any)?.[k];

  if (Array.isArray(data)) {
    arr = data;
  } else if (Array.isArray(pick("items"))) {
    arr = pick("items");
    totalPages = (data as any)?.totalPages ?? (data as any)?.meta?.totalPages ?? 1;
  } else if (Array.isArray(pick("results"))) {
    arr = pick("results");
    totalPages = (data as any)?.totalPages ?? (data as any)?.meta?.totalPages ?? 1;
  } else if (Array.isArray(pick("data"))) {
    arr = pick("data");
    totalPages = (data as any)?.totalPages ?? (data as any)?.meta?.totalPages ?? 1;
  } else if (Array.isArray(pick("notes"))) {
    arr = pick("notes");
    totalPages = (data as any)?.totalPages ?? (data as any)?.meta?.totalPages ?? 1;
  } else {
    arr = [];
    totalPages = 1;
  }

  const items = (arr as any[]).map(toNote);
  return { items, totalPages };
}

export async function fetchNotes(params: FetchNotesParams): Promise<FetchNotesResult> {
  const { page = 1, perPage = 12, search = "" } = params;
  const res = await api.get<KnownListShape>("/notes", {
    params: { page, perPage, search: search || undefined },
  });
  return parseList(res.data, perPage);
}

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}

type ItemResponse = { item: any } | any;

export async function createNote(payload: CreateNoteParams): Promise<Note> {
  const res = await api.post<ItemResponse>("/notes", payload);
  const raw = (res as any)?.data?.item ?? (res as any)?.data ?? res;
  return toNote(raw, 0);
}

export async function deleteNote(id: string): Promise<void> {
  await api.delete(`/notes/${id}`);
}
