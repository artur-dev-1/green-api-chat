import { useState } from 'react'
import type { FormEvent } from 'react'
import { greenApi } from '../../api/greenApi'
import type { Credentials } from '../../types'
import { ChatIcon } from '../Icons'
import styles from './LoginScreen.module.scss'

const FIELDS: { name: keyof Credentials; label: string; placeholder: string }[] = [
  { name: 'apiUrl', label: 'apiUrl', placeholder: 'https://7103.api.green-api.com' },
  { name: 'idInstance', label: 'idInstance', placeholder: '7103000000' },
  { name: 'apiTokenInstance', label: 'apiTokenInstance', placeholder: 'd75b3a66374942c5b3c019c698abc2067e151558acbd412345' },
]

interface LoginScreenProps {
  onLogin: (credentials: Credentials) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [values, setValues] = useState<Credentials>({ apiUrl: '', idInstance: '', apiTokenInstance: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isFilled = Object.values(values).every((value) => value.trim())

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!isFilled || loading) return

    const credentials: Credentials = {
      apiUrl: values.apiUrl.trim().replace(/\/+$/, ''),
      idInstance: values.idInstance.trim(),
      apiTokenInstance: values.apiTokenInstance.trim(),
    }

    setLoading(true)
    setError(null)
    try {
      const { stateInstance } = await greenApi.getStateInstance(credentials)
      if (stateInstance !== 'authorized') {
        setError(`Инстанс не авторизован (статус: ${stateInstance}). Отсканируйте QR-код в личном кабинете GREEN-API`)
        return
      }
      onLogin(credentials)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось войти')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.screen}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.logo}>
          <ChatIcon width={32} height={32} />
        </div>
        <h1 className={styles.title}>Вход в чат</h1>
        <p className={styles.subtitle}>
          Введите параметры инстанса из{' '}
          <a href="https://console.green-api.com" target="_blank" rel="noreferrer">
            личного кабинета GREEN-API
          </a>
        </p>

        {FIELDS.map(({ name, label, placeholder }) => (
          <label key={name} className={styles.field}>
            <span className={styles.label}>{label}</span>
            <input
              className={styles.input}
              name={name}
              value={values[name]}
              placeholder={placeholder}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => setValues((prev) => ({ ...prev, [name]: event.target.value }))}
            />
          </label>
        ))}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button className={styles.submit} type="submit" disabled={!isFilled || loading}>
          {loading ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </main>
  )
}
