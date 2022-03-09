export type Message = {
  timeSend: number
  content: any
}

export class Channel {
  id: string
  history: Array<Message> = []

  constructor(id: string) {
    this.id = id
  }

  sendMessage(message: Message) {
    this.history.push(message)
  }

  getNewMessages(time: number): Array<Message> {
    return this.history.filter(m => m.timeSend > time)
  }
}
