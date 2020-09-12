export type InboxEntry = {
  id: string,
  displayName: string,
  members: Profile[],
  messages: Message[]
}

export type Message = {
  owner: string,
  text: string,
  timestamp: Date
}

export type Profile = {
  uuid: string,
  displayName: string,
  username: string,
  avatar: string | number
}

export type Size = {
  width: number,
  height: number,
}

export type Keyboard = {
  width: number,
  height: number,
}