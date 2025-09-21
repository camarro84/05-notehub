export interface NoteTag {
  _id: string;
  name: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  tag: NoteTag;
  createdAt: string;
  updatedAt: string;
}