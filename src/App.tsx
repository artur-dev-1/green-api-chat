import { useState } from 'react'
import { LoginScreen } from './components/LoginScreen/LoginScreen'
import { Messenger } from './components/Messenger/Messenger'
import { loadJson, removeKey, saveJson } from './lib/storage'
import type { Credentials } from './types'

const CREDENTIALS_KEY = 'green-api-chat:credentials'

export default function App() {
  const [credentials, setCredentials] = useState(() => loadJson<Credentials>(CREDENTIALS_KEY))

  function handleLogin(value: Credentials) {
    saveJson(CREDENTIALS_KEY, value)
    setCredentials(value)
  }

  function handleLogout() {
    removeKey(CREDENTIALS_KEY)
    setCredentials(null)
  }

  if (!credentials) return <LoginScreen onLogin={handleLogin} />

  // key resets the chat state when another instance logs in
  return <Messenger key={credentials.idInstance} credentials={credentials} onLogout={handleLogout} />
}
