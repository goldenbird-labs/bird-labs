// Lets any button on the page open the Birdie chat window (optionally with a first question).
export function openChat(question) {
  window.dispatchEvent(new CustomEvent('birdie:open', { detail: { question } }))
}
