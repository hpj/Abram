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

export type ProfileInfo = {
  origin: string,
  speaks: string[],
  profession: string,
  romantically: 'Open' | 'Closed',
  sex: 'Woman' | 'Man' | 'Other',
  sexuality: 'Straight' | 'Gay' | 'Lesbian' | 'Bi',
  religion: string,
  age: number
}

export type Profile = {
  uuid: string,
  avatar: string | number,
  
  bio: string,
  displayName: string,
  nickname: string,

  info: ProfileInfo,
  interests: string[],
  iceBreakers: string[]
}

export type Size = {
  width: number,
  height: number
}

export type Keyboard = {
  height: number
}