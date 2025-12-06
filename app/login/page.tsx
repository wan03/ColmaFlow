'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Success')
    }
  }

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <input
        id="email"
        placeholder="Email"
        className="border p-2 block mb-2"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        id="password"
        type="password"
        placeholder="Password"
        className="border p-2 block mb-2"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button
        id="login-btn"
        className="bg-blue-500 text-white p-2"
        onClick={handleLogin}
      >
        Sign In
      </button>
      <div id="login-message" className="mt-4">{message}</div>
    </div>
  )
}
