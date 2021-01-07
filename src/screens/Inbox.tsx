import React from 'react';

import { StyleSheet, View, ScrollView, Image, Text } from 'react-native';

import type { Size, Profile, InboxEntry } from '../types';

import Button from '../components/Button';

import { StoreComponent } from '../store';

import { relativeDate } from '../utils';

import { sizes, responsive } from '../sizes';

import getTheme from '../colors';

const colors = getTheme();

class Inbox extends StoreComponent<{
  snapTo?: ((index: number) => void) | undefined
}, {
  size: Size,
  profile: Profile,
  chat: boolean,
  activeChat: InboxEntry,
  inbox: InboxEntry[]
}>
{
  responsive = responsive.bind(this);

  stateWillChange({ inbox }: Inbox['state']): Partial<Inbox['state']>
  {
    // TODO limit entries using the backend, so this won't slow performance much

    // sort the inbox every time the user sends a new messages or receives one
    return {
      inbox: inbox.sort((a, b) =>
      {
        const tA = a.updatedAt;
        const tB = b.updatedAt;

        // istanbul ignore else
        if (tA.getTime() > tB.getTime())
          return -1;
        else if (tA.getTime() < tB.getTime())
          return 1;
        else
          return 0;
      })
    };
  }

  stateWhitelist(changes: Inbox['state']): boolean
  {
    if (
      changes.size ||
      changes.profile ||
      changes.chat ||
      changes.activeChat ||
      changes.inbox
    )
      return true;
    
    return false;
  }

  onPress(entry: InboxEntry): void
  {
    this.store.set({
      chat: true,
      activeChat: entry
    }, () => this.props.snapTo?.(0));
  }

  render(): JSX.Element
  {
    const { inbox, chat, profile } = this.state;

    return <ScrollView testID={ 'v-inbox' } style={ styles.wrapper }>
      {
        inbox.map((entry, t) =>
        {
          const members = [ ...entry.members ];

          // remove self from array
          members.splice(
            members.findIndex(member => member.uuid === profile.uuid), 1);

          const lastUpdated = relativeDate(entry.updatedAt);
            
          const lastMessage = entry.messages[entry.messages.length - 1];

          const badge = entry.messages.length <= 0 || lastMessage.owner !== profile.uuid;

          return <Button
            key={ t }
            testID={ 'bn-chat' }
            disabled={ chat }
            useAlternative={ true }
            borderless={ false }
            onPress={ () => this.onPress(entry) }
          >
            <View style={ styles.container }>
              <View style={ styles.entry }>

                <View style={ {
                  ...styles.avatars,

                  width: this.responsive(sizes.inboxAvatar),
                  height: this.responsive(sizes.inboxAvatar)
                } }>
                  {
                    members.splice(0, 4).map((member, i, array) =>
                    {
                      let size = this.responsive(sizes.inboxAvatar);

                      let left = 0;
                      let top = 0;

                      if (array.length === 2)
                      {
                        size = size * 0.75;
                          
                        if (i === 0)
                        {
                          top = size * 0.5;
                          left = size * 0.35;
                        }
                      }
                      else if (array.length === 3)
                      {
                        size = size * 0.65;

                        if (i === 0)
                        {
                          top = size - 10;
                          left = (size / 2) - 15;
                        }
                        else if (i === 2)
                        {
                          top = 10;
                          left = size - 15;
                        }
                      }
                      else if (array.length === 4)
                      {
                        size = size * 0.5;

                        if (i === 0)
                        {
                          top = size - 5;
                          left = 0;
                        }
                        else if (i === 2)
                        {
                          top = size + 5;
                          left = size - 5;
                        }
                        else if (i === 3)
                        {
                          top = 8;
                          left = size - 5;
                        }
                      }

                      return <View key={ i } style={ {
                        ...styles.avatarContainer,

                        top: top,
                        left: left,
                        width: size,
                        height: size
                      } }>
                        <Image
                          style={ {
                            ...styles.avatar,
                       
                            width: size,
                            height: size,
                              
                            borderRadius: this.responsive(sizes.inboxAvatar)
                          } }
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          //@ts-ignore
                          source={ member.avatar }
                          // source={ { uri: member.avatar } }
                        />

                        {/* eslint-disable-next-line react-native/no-inline-styles */}
                        <View style={ {
                          ...styles.badge,

                          width: this.responsive(23),
                          height: this.responsive(23),

                          borderRadius: this.responsive(23),

                          opacity: (badge && left === 0 && top === 0) ? 1 : 0
                        } }/>
                      </View>;
                    })
                  }
                </View>

                <View style={ styles.info }>
                  <Text style={ { ...styles.name, fontSize: this.responsive(22) } }>{ entry.displayName }</Text>
                  <Text style={ { ...styles.time, fontSize: this.responsive(20) } }>{ lastUpdated }</Text>

                  {
                    lastMessage?.text ?
                      <Text style={ { ...styles.preview, fontSize: this.responsive(22) } } numberOfLines={ 1 }>
                        { lastMessage.text }
                      </Text> : <View style={ styles.newBadge }>
                        <Text style={ styles.newBadgeText }>
                          New Match
                        </Text>
                      </View>
                  }
                </View>

              </View>
            </View>
          </Button>;
        })
      }
    </ScrollView>;
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  },

  container: {
    marginTop: sizes.windowMargin,
    marginBottom: sizes.windowMargin
  },

  entry: {
    flexDirection: 'row',
    marginLeft: sizes.windowMargin,
    marginRight: sizes.windowMargin
  },

  avatars: {
    marginLeft: 5
  },

  avatarContainer: {
    position: 'absolute',
    justifyContent: 'center'
  },

  avatar: {
    position: 'absolute',

    backgroundColor: colors.iconBackground
  },

  badge: {
    position: 'absolute',

    backgroundColor: colors.whiteText,

    marginLeft: -10,

    borderWidth: 3,
    borderColor: colors.blackText
  },

  info: {
    flex: 1,
    marginLeft: 20
  },

  name: {
    color: colors.whiteText,
    fontWeight: 'bold'
  },

  time: {
    color: colors.greyText
  },

  preview: {
    color: colors.greyText,
    fontSize: 13,

    alignSelf: 'flex-start',

    marginTop: sizes.windowMargin * 0.5
  },

  newBadge: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.whiteText,

    alignSelf: 'flex-start',

    paddingHorizontal: sizes.windowMargin * 0.5,
    paddingVertical: sizes.windowMargin * 0.25,
    
    marginTop: sizes.windowMargin * 0.5
  },
  
  newBadgeText: {
    color: colors.whiteText,
    textTransform: 'uppercase',
    fontSize: 11
  }
});

export default Inbox;
