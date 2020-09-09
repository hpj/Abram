import React from 'react';

import { StyleSheet, View, ScrollView, Image, Text } from 'react-native';

import { format, differenceInDays, isToday, isYesterday } from 'date-fns';

import { Profile, InboxEntry } from '../types';

import Button from '../components/Button';

import { StoreComponent } from '../store';

import { sizes, responsive } from '../sizes';

import getTheme from '../colors';

const colors = getTheme();

function relativeDate(date: Date): string
{
  const baseDate = new Date();

  if (isToday(date))
    return format(date, '\'Today, \'hh:mm a');
  else if (isYesterday(date))
    return format(date, '\'Yesterday, \'hh:mm a');
  else if (differenceInDays(baseDate, date) <= 6)
    return format(date, 'EEEE\', \'hh:mm a');
  else
    return format(date, 'd MMM yyyy');
}

class Inbox extends StoreComponent<{ snapTo?: ((index: number) => void) | undefined }, {
  profile: Profile,
  inbox: InboxEntry[]
}>
{
  responsive = responsive.bind(this);

  onPress(entry: InboxEntry): void
  {
    this.store.set({ activeChat: entry }, () => this.props.snapTo?.(0));
  }

  render(): JSX.Element
  {
    return (
      <ScrollView style={ styles.wrapper }>
        {
          this.state.inbox.map((entry, t) =>
          {
            const members = [ ...entry.members ];

            // remove self from array
            members.splice(members.indexOf(this.state.profile.username), 1);

            const lastMessage = entry.messages[entry.messages.length - 1];
            const lastMessageTime = relativeDate(lastMessage.timestamp);
            
            return <Button
              key={ t }
              testID='bn-chat'
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
                      // TODO show the most relevant avatars
                      members.splice(0, 4).map((id, i, array) =>
                      {
                        let size = this.responsive(sizes.inboxAvatar);

                        const border = (array.length > 1) ? 2 : 0;

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
                          width: size + border,
                          height: size + border
                        } }>
                          <Image
                            style={ {
                              ...styles.avatar,
                       
                              width: size + border,
                              height: size + border,
                              
                              borderWidth: border,
                              borderRadius: this.responsive(sizes.inboxAvatar)
                            } }
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            //@ts-ignore
                            // eslint-disable-next-line security/detect-object-injection
                            source={ entry.avatars[id] }
                            // source={ { uri: entry.avatars[id] } }
                          />

                          {/* eslint-disable-next-line react-native/no-inline-styles */}
                          <View style={ {
                            ...styles.badge,

                            width: this.responsive(23),
                            height: this.responsive(23),
                            borderRadius: this.responsive(23),

                            opacity: (t !== 2 && left === 0 && top === 0) ? 1 : 0
                          } }/>
                        </View>;
                      })
                    }
                  </View>

                  <View style={ styles.info }>
                    <Text style={ { ...styles.name, fontSize: this.responsive(22) } }>{ entry.displayName }</Text>
                    <Text style={ { ...styles.time, fontSize: this.responsive(20) } }>{ lastMessageTime }</Text>
                    <Text style={ { ...styles.preview, fontSize: this.responsive(22) } } numberOfLines={ 1 }>{ lastMessage.text }</Text>
                  </View>

                </View>
              </View>
            </Button>;
          })
        }
      </ScrollView>
    );
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

    backgroundColor: colors.iconBackground,

    borderColor: colors.blackText
  },

  badge: {
    position: 'absolute',

    backgroundColor: colors.whiteText,

    marginLeft: -10,

    borderWidth: 4,
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
    marginTop: 10
  }
});

export default Inbox;
