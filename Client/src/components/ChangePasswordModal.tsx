import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { changePasswordApi } from '../api/authApi'
import { adminStyles, managerStyles } from '../styles'
import { saveAuth } from '../utils/auth'

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

const defaultLabels = {
  changePassword: 'Change password',
  currentPassword: 'Current password',
  newPassword: 'New password',
  confirmPassword: 'Confirm new password',
  cancel: 'Cancel',
  save: 'Save',
  loading: 'Loading...',
  passwordChanged: 'Password changed successfully.',
  passwordMismatch: 'New passwords do not match.',
  passwordRequired: 'All password fields are required.',
  passwordInvalid:
    'Password must contain uppercase, lowercase, number and special symbol.',
  apiError: 'Could not change password.',
}

type PasswordForm = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const emptyPasswordForm: PasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export type ChangePasswordLabels = Partial<typeof defaultLabels>

export type ChangePasswordModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
  variant?: 'admin' | 'manager'
  labels?: ChangePasswordLabels
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
  variant = 'admin',
  labels,
}: ChangePasswordModalProps) {
  const styles = variant === 'admin' ? adminStyles : managerStyles
  const t = { ...defaultLabels, ...labels }
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(emptyPasswordForm)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setPasswordForm(emptyPasswordForm)
    }
  }, [isOpen])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      onError(t.passwordRequired)
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      onError(t.passwordMismatch)
      return
    }

    if (!passwordRegex.test(passwordForm.newPassword)) {
      onError(t.passwordInvalid)
      return
    }

    setIsSaving(true)

    try {
      const tokens = await changePasswordApi({
        password: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      saveAuth(tokens)
      setPasswordForm(emptyPasswordForm)
      onSuccess(t.passwordChanged)
    } catch (error) {
      onError(error instanceof Error ? error.message : t.apiError)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className={styles.modalBackdrop} role="presentation">
      <form
        className={styles.modal}
        aria-label={t.changePassword}
        onSubmit={(event) => {
          void handleSubmit(event)
        }}
      >
        <h2>{t.changePassword}</h2>

        <label>
          <span>{t.currentPassword}</span>
          <input
            type="password"
            autoComplete="current-password"
            value={passwordForm.currentPassword}
            onChange={(event) =>
              setPasswordForm((current) => ({
                ...current,
                currentPassword: event.target.value,
              }))
            }
          />
        </label>

        <label>
          <span>{t.newPassword}</span>
          <input
            type="password"
            autoComplete="new-password"
            value={passwordForm.newPassword}
            onChange={(event) =>
              setPasswordForm((current) => ({
                ...current,
                newPassword: event.target.value,
              }))
            }
          />
        </label>

        <label>
          <span>{t.confirmPassword}</span>
          <input
            type="password"
            autoComplete="new-password"
            value={passwordForm.confirmPassword}
            onChange={(event) =>
              setPasswordForm((current) => ({
                ...current,
                confirmPassword: event.target.value,
              }))
            }
          />
        </label>

        <div className={styles.modalActions}>
          <button
            className={styles.modalCancel}
            type="button"
            disabled={isSaving}
            onClick={onClose}
          >
            {t.cancel}
          </button>
          <button className={styles.modalSave} type="submit" disabled={isSaving}>
            {isSaving ? t.loading : t.save}
          </button>
        </div>
      </form>
    </div>
  )
}
