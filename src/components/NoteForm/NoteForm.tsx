import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { NoteTag } from '../../types/note'
import { createNote, type CreateNoteParams } from '../../services/noteService'
import css from './NoteForm.module.css'

interface NoteFormProps {
  onClose: () => void
}

interface NoteFormValues {
  title: string
  content: string
  tag: NoteTag
}

const schema = Yup.object({
  title: Yup.string().min(3).max(50).required(),
  content: Yup.string().max(500),
  tag: Yup.mixed<NoteTag>().oneOf(['Todo', 'Work', 'Personal', 'Meeting', 'Shopping']).required()
})

const initialValues: NoteFormValues = { title: '', content: '', tag: 'Todo' }

export default function NoteForm({ onClose }: NoteFormProps) {
  const qc = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: CreateNoteParams) => createNote(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] })
    }
  })

  const handleSubmit = async (values: NoteFormValues, actions: FormikHelpers<NoteFormValues>) => {
    await mutateAsync(values)
    actions.resetForm()
    actions.setSubmitting(false)
    onClose()
  }

  return (
    <Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit}>
      {({ isSubmitting, isValid }) => (
        <Form className={css.form}>
          <div className={css.formGroup}>
            <label htmlFor="title">Title</label>
            <Field id="title" type="text" name="title" className={css.input} />
            <ErrorMessage name="title" component="span" className={css.error} />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="content">Content</label>
            <Field as="textarea" id="content" name="content" rows={8} className={css.textarea} />
            <ErrorMessage name="content" component="span" className={css.error} />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="tag">Tag</label>
            <Field as="select" id="tag" name="tag" className={css.select}>
              <option value="Todo">Todo</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Meeting">Meeting</option>
              <option value="Shopping">Shopping</option>
            </Field>
            <ErrorMessage name="tag" component="span" className={css.error} />
          </div>

          <div className={css.actions}>
            <button type="button" className={css.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={css.submitButton} disabled={!isValid || isSubmitting || isPending}>
              Create note
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
