/*
 * This is an example of an AssemblyScript smart contract with two simple,
 * symmetric functions:
 *
 * 1. setGreeting: accepts a greeting, such as "howdy", and records it for the
 *    user (account_id) who sent the request
 * 2. getGreeting: accepts an account_id and returns the greeting saved for it,
 *    defaulting to "Hello"
 *
 * Learn more about writing NEAR smart contracts with AssemblyScript:
 * https://docs.near.org/docs/develop/contracts/as/intro
 *
 */

import { Context, logging, storage, PersistentVector } from 'near-sdk-as'
export const answers = new PersistentVector<string>('answers')

const DEFAULT_MESSAGE = 'What is NEAR?'

// Exported functions will be part of the public interface for your smart contract.
// Feel free to extract behavior to non-exported functions!
export function getQuestion (): string | null {
  // This uses raw `storage.get`, a low-level way to interact with on-chain
  // storage for simple contracts.
  // If you have something more complex, check out persistent collections:
  // https://docs.near.org/docs/concepts/data-storage#assemblyscript-collection-types
  return storage.get<string>('question', DEFAULT_MESSAGE)
}

export function setQuestion (question: string): void {
  logging.log('Saving question "' + question)
  storage.set('question', question)
}

export function createAnswer (text: string): void {
  answers.push(Context.sender + ' says: ' + text)
}

export function getAnswers (): string[] {
  const results = new Array<string>()
  for (let i = 0; i < answers.length; i++) {
    results.push(answers[i])
  }
  return results
}

export function clearAnswers(): void {
  while (answers.length) {
    answers.pop()
  }
}
