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
  notes: Note[];          
  totalPages: number;
}


function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function arrProp(o: unknown, key: string): unknown[] | null {
  if (!isObj(o)) return null;
  const v = (o as Record<string, unknown>)[key];
  return Array.isArray(v) ? v : null;
}
function objProp(o: unknown, key: string): Record<string, unknown> | null {
  if (!isObj(o)) return null;
  const v = (o as Record<string, unknown>)[key];
  return isObj(v) ? (v as Record<string, unknown>) : null;
}
function pickTotalPages(scope: unknown): number {
  if (isObj(scope) && typeof scope["totalPages"] === "number") {
    return scope["totalPages"] as number;
  }
  const meta = objProp(scope, "meta");
  if (meta && typeof meta["totalPages"] === "number") {
    return meta["totalPages"] as number;
  }
  return 1;
}


type RespTopNotes    = { notes: Note[]; totalPages?: number; meta?: { totalPages?: number } };
type RespTopItems    = { items: Note[]; totalPages?: number; meta?: { totalPages?: number } };
type RespTopResults  = { results: Note[]; totalPages?: number; meta?: { totalPages?: number } };
type RespDataNotes   = { data: { notes: Note[]; totalPages?: number; meta?: { totalPages?: number } } };
type RespDataItems   = { data: { items: Note[]; totalPages?: number; meta?: { totalPages?: number } } };
type RespDataResults = { data: { results: Note[]; totalPages?: number; meta?: { totalPages?: number } } };
type RespDataArray   = { data: Note[] };
type ListResp =
  | RespTopNotes | RespTopItems | RespTopResults
  | RespDataNotes | RespDataItems | RespDataResults
  | RespDataArray | Note[];


export async function fetchNotes(params: FetchNotesParams): Promise<FetchNotesResult> {
  const { page = 1, perPage = 12, search = "" } = params;

  const res = await api.get<ListResp>("/notes", {
    params: { page, perPage, search: search || undefined },
  });

  const root = res.data as unknown;

  
  if (Array.isArray(root)) {
    const notes = root as Note[];
    const totalPages = Math.max(1, Math.ceil(notes.length / perPage));
    return { notes, totalPages };
  }

  if (isObj(root)) {
    const topNotes = arrProp(root, "notes");
    if (topNotes) return { notes: topNotes as Note[], totalPages: pickTotalPages(root) };

    const topItems = arrProp(root, "items");
    if (topItems) return { notes: topItems as Note[], totalPages: pickTotalPages(root) };

    const topResults = arrProp(root, "results");
    if (topResults) return { notes: topResults as Note[], totalPages: pickTotalPages(root) };

    const dataObj = objProp(root, "data");
    if (dataObj) {
      const nNotes = arrProp(dataObj, "notes");
      if (nNotes) return { notes: nNotes as Note[], totalPages: pickTotalPages(dataObj) };

      const nItems = arrProp(dataObj, "items");
      if (nItems) return { notes: nItems as Note[], totalPages: pickTotalPages(dataObj) };

      const nResults = arrProp(dataObj, "results");
      if (nResults) return { notes: nResults as Note[], totalPages: pickTotalPages(dataObj) };
    }

    
    const dataArray = arrProp(root, "data");
    if (dataArray) {
      const notes = dataArray as Note[];
      const totalPages = pickTotalPages(root);
      return { notes, totalPages };
    }
  }

  
  return { notes: [], totalPages: 1 };
}

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}


export async function createNote(payload: CreateNoteParams): Promise<Note> {
  const res = await api.post<Note>("/notes", payload);
  return res.data;
}


export async function deleteNote(id: string): Promise<Note> {
  const res = await api.delete<Note>(`/notes/${id}`);
  return res.data;
}
