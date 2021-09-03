import 'regenerator-runtime/runtime'
import React, { useState } from 'react'
import { login, logout } from './utils'
import './global.css'

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App () {
  const [question, setQuestion] = useState('')
  const [newQuestion, setNewQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [answers, setAnswers] = useState([])
  const [lastTransaction, setLastTransaction] = useState('')

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = useState(true)
  const [showNotification, setShowNotification] = useState(false)

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(() => {
    // in this case, we only care to query the contract when signed in
    if (window.walletConnection.isSignedIn()) {
      // window.contract is set by initContract in index.js
      window.contract
        .getQuestion({ accountId: window.accountId })
        .then(questionFromContract => {
          setQuestion(questionFromContract)
        })

      window.contract.getAnswers().then(answers => {
        setAnswers(answers)
      })
    }
  }, [])

  const saveQuestion = async event => {
    event.preventDefault()

    // get elements from the form using their id attribute
    const { fieldset } = event.target.elements
    fieldset.disabled = true

    try {
      // make an update call to the smart contract
      await window.contract.setQuestion({
        question: newQuestion
      })
      await window.contract.clearAnswers()
    } catch (e) {
      alert(
        'Something went wrong! ' +
          'Maybe you need to sign out and back in? ' +
          'Check your browser console for more info.'
      )
      throw e
    } finally {
      // re-enable the form, whether the call succeeded or failed
      fieldset.disabled = false
    }

    setLastTransaction('setQuestion + clearAnswers')
    setQuestion(newQuestion)
    setAnswers([])
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 11000)
  }
  const saveAnswer = async event => {
    event.preventDefault()
    const { fieldset } = event.target.elements
    fieldset.disabled = true

    try {
      // make an update call to the smart contract
      await window.contract.createAnswer({
        text: answer
      })

      window.contract.getAnswers().then(answers => {
        setAnswers(answers)
      })
    } catch (e) {
      alert(
        'Something went wrong! ' +
          'Maybe you need to sign out and back in? ' +
          'Check your browser console for more info.'
      )
      throw e
    } finally {
      fieldset.disabled = false
    }

    setLastTransaction('createAnswer + getAnswers')
    setAnswer('')
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 11000)
  }

  const handleOnChangeQuestion = event => {
    setButtonDisabled(false)
    setNewQuestion(event.target.value)
  }

  const handleOnChangeAnswer = event => {
    setButtonDisabled(false)
    setAnswer(event.target.value)
  }

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>Welcome to NEAR Poll Example!</h1>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    )
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <button className='link' style={{ float: 'right' }} onClick={logout}>
        Sign out
      </button>
      <main>
        <h1>
          <label
            htmlFor='question'
            style={{
              color: 'var(--secondary)',
              borderBottom: '2px solid var(--secondary)'
            }}
          >
            {question}
          </label>
          {
            ' ' /* React trims whitespace around tags; insert literal space character when needed */
          }
          {window.accountId}!
        </h1>
        <form onSubmit={saveQuestion}>
          <fieldset id='fieldset'>
            <label
              htmlFor='question'
              style={{
                display: 'block',
                color: 'var(--gray)',
                marginBottom: '0.5em'
              }}
            >
              Change question
            </label>
            <div style={{ display: 'flex' }}>
              <input
                autoComplete='off'
                value={newQuestion}
                id='question'
                onChange={handleOnChangeQuestion}
                style={{ flex: 1 }}
              />
              <button
                disabled={buttonDisabled}
                style={{ borderRadius: '0 5px 5px 0' }}
              >
                Set new question
              </button>
            </div>
          </fieldset>
        </form>
        <h2>Answers</h2>
        <form onSubmit={saveAnswer}>
          <fieldset id='fieldset'>
            <label
              htmlFor='question'
              style={{
                display: 'block',
                color: 'var(--gray)',
                marginBottom: '0.5em'
              }}
            >
              Add an answer
            </label>
            <div style={{ display: 'flex' }}>
              <input
                autoComplete='off'
                value={answer}
                id='question'
                onChange={handleOnChangeAnswer}
                style={{ flex: 1 }}
              />
              <button
                style={{ borderRadius: '0 5px 5px 0' }}
              >
                Save Answer
              </button>
            </div>
          </fieldset>
        </form>
        <ul>
          {answers.map((answer, index) => (
            <li key={index}>{answer}</li>
          ))}
        </ul>
      </main>
      {showNotification && <Notification transaction={lastTransaction} />}
    </>
  )
}

// this component gets rendered by App after the form is submitted
function Notification ({ transaction }) {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
  return (
    <aside>
      <a
        target='_blank'
        rel='noreferrer'
        href={`${urlPrefix}/${window.accountId}`}
      >
        {window.accountId}
      </a>
      {
        ' ' /* React trims whitespace around tags; insert literal space character when needed */
      }
      called method: {transaction} in contract:{' '}
      <a
        target='_blank'
        rel='noreferrer'
        href={`${urlPrefix}/${window.contract.contractId}`}
      >
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  )
}
