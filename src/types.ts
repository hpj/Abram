export type InboxEntry = {
  id: string,
  createdAt: Date,
  updatedAt: Date,
  displayName: string,
  members: Profile[],
  messages: Message[]
}

export type Message = {
  createdAt: Date,
  owner: string,
  text: string
}

export type Profile = {
  uuid: string,
  avatar: string | number,
  
  bio?: string,
  fullName: string,
  nickname: string,

  info: ProfileInfo,
  interests: string[],
  iceBreakers?: string[]
}

export type ProfileInfo = {
  origin?: string,
  speaks: string[],
  profession?: string,
  romantically: 'Open' | 'Closed',
  worksAt?: string,
  gender: 'Woman' | 'Man' | 'Non-binary',
  sexuality?: 'Straight' | 'Gay' | 'Lesbian' | 'Bi',
  religion?: string,
  age?: number
}

export type Size = {
  width: number,
  height: number
}

export type Keyboard = {
  height: number
}