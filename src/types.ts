export type InboxEntry = {
  displayName: string,
  members: string[],
  avatars: Record<string, string>,
  messages: Message[]
}

export type Message = {
  owner: string,
  text: string,
  timestamp: Date
}

export type Profile = {
  displayName: string,
  username: string,
  avatar: string
}

export type Size = {
  width: number,
  height: number,
}

export type Keyboard = {
  width: number,
  height: number,
}