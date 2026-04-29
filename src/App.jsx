import React from 'react'
import FormMode from './components/FormModeLight'
import GiftExperience from './components/GiftExperience'
import Admin from './components/Admin'

export default function App() {
  const path   = window.location.pathname
  const params = new URLSearchParams(window.location.search)
  const id     = params.get('id')

  if (path === '/admin') return <Admin />
  if (id)                return <GiftExperience id={id} />
  return <FormMode />
}
