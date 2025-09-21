import ReactPaginate from 'react-paginate'
import css from './Pagination.module.css'

interface PaginationProps {
  currentPage: number
  pageCount: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, pageCount, onPageChange }: PaginationProps) {
  return (
    <ReactPaginate
      className={css.pagination}
      pageClassName={css.pageItem}
      pageLinkClassName={css.pageLink}
      activeClassName={css.active}
      previousClassName={css.pageItem}
      nextClassName={css.pageItem}
      breakClassName={css.pageItem}
      previousLabel="<"
      nextLabel=">"
      breakLabel="..."
      pageCount={pageCount}
      forcePage={currentPage - 1}
      onPageChange={(sel) => onPageChange(sel.selected + 1)}
    />
  )
}
