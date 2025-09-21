import css from "./NoteList.module.css";
import type { Note } from "../../types/note";

interface NoteListProps {
  items: Note[];
  onDelete: (id: string) => void;
}

export default function NoteList({ items, onDelete }: NoteListProps) {
  return (
    <ul className={css.list}>
      {items.map((n) => (
        <li key={n.id} className={css.listItem}>
          <h2 className={css.title}>{n.title}</h2>
          <p className={css.content}>{n.content}</p>
          <div className={css.footer}>
            <span className={css.tag}>{n.tag}</span>
            <button className={css.button} onClick={() => onDelete(n.id)}>
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
