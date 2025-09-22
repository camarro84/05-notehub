import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import styles from "./App.module.css";
import SearchBox from "../SearchBox/SearchBox";
import Pagination from "../Pagination/Pagination";
import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";
import NoteList from "../NoteList/NoteList";
import { fetchNotes } from "../../services/noteService";

const PER_PAGE = 10;

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function App() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notes", { page, perPage: PER_PAGE, search: debouncedSearch }],
    queryFn: () =>
      fetchNotes({ page, perPage: PER_PAGE, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  const items = useMemo(() => data?.notes ?? [], [data]);
  const pageCount = useMemo(() => data?.totalPages ?? 0, [data]);

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <div className={styles.app}>
      <div className={styles.toolbar}>
        <SearchBox value={search} onChange={handleSearchChange} />
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          {pageCount > 1 && (
            <Pagination
              currentPage={page}
              pageCount={pageCount}
              onPageChange={(p: number) => setPage(p)}
            />
          )}
        </div>
        <button className={styles.button} onClick={() => setIsOpen(true)}>
          Create
        </button>
      </div>

      {isLoading && <div>Loading…</div>}
      {isError && <div>Error loading notes</div>}

      {!isLoading && !isError && (
        <>
          {items.length === 0 ? <p>No notes found</p> : <NoteList items={items} />}
        </>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <NoteForm onClose={() => setIsOpen(false)} />
      </Modal>
    </div>
  );
}
