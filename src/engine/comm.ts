export type Message<Data = any> = {
  timeSend: number
  content: Data
}

/** Communication channel. Accept messages and let read them through history. */
export class Channel<Data = any> {
  #id: string
  #history: Array<Message<Data>> = []

  constructor(id: string) {
    this.#id = id
  }

  /** Send a message on the channel, providing the payload. */
  sendMessage = (message: Message<Data>) => {
    this.#history.push(message)
  }

  /** Get the messages since the requested time. */
  messagesSince = (time: number) => {
    return this.#history.filter(message => {
      return message.timeSend > time
    })
  }

  /** The ID of a channel is an UUID. */
  get id() {
    return this.#id
  }

  /** history can be explored in a readonly way. */
  get history() {
    return this.#history
  }
}
