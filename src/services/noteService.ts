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

export async function fetchNotes(params: FetchNotesParams): Promise<FetchNotesResult> {
  const { page = 1, perPage = 12, search = "" } = params;
  const res = await api.get("/notes", { params: { page, perPage, search: search || undefined } });
  const d = res.data;
  const items: Note[] =
    d?.items ??
    d?.results ??
    d?.data ??
    d?.notes ??
    (Array.isArray(d) ? d : []);
  const totalPages: number =
    d?.totalPages ??
    d?.meta?.totalPages ??
    d?.pagination?.totalPages ??
    Math.max(1, Math.ceil((d?.totalItems ?? items.length) / perPage));
  return { items, totalPages };
}

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}

export async function createNote(payload: CreateNoteParams): Promise<Note> {
  const res = await api.post("/notes", payload);
  return res.data?.item ?? res.data;
}

export async function deleteNote(id: string): Promise<Note> {
  const res = await api.delete(`/notes/${id}`);
  return res.data?.item ?? res.data;
}
