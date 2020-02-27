import React from 'react';

import PropTypes from 'prop-types';

import { StyleSheet, View, Image, Text } from 'react-native';

import Button from '../components/Button.js';

import { StoreComponent } from '../store.js';

import { sizes } from '../sizes';

import getTheme from '../colors.js';

const colors = getTheme();

class Inbox extends StoreComponent
{
  scale(size, standardHeight)
  {
    standardHeight = standardHeight || sizes.standardHeight;

    size = (size * this.state.size.height) / standardHeight;

    return Math.round(size);
  }

  onPress(entry)
  {
    this.store.set({ activeEntry: entry }, () => this.props.bottomSheetSnapTo(1));
  }

  render()
  {
    return (
      <View style={ styles.container }>
        {
          this.state.inbox.map((entry, t) =>
          {
            const avatars = Object.keys(entry.avatars);
            
            return <Button
              key={ t }
              borderless={ false }
              onPress={ () => this.onPress(entry) }
            >
              <View style={ styles.wrapper }>
                <View style={ styles.entry }>

                  <View style={ styles.avatars }>
                    {
                      // TODO show the most relevant avatars
                      avatars.splice(0, 4).map((id, i, array) =>
                      {
                        const size = sizes.inboxAvatar / Math.min(array.length, 2);

                        const border = (array.length > 1) ? 3 : 0;

                        let left = 0;
                        let top = 0;

                        if (array.length === 2)
                        {
                          if (i === 0)
                          {
                            top = size - border - 10;
                            left = size - border - 5;
                          }
                          else if (i === 1)
                          {
                            top = 5;
                            left = 5;
                          }
                        }
                        else if (array.length === 3)
                        {
                          if (i === 0)
                          {
                            top = size - border - 5;
                            left = (size / 2) - 5;
                          }
                          else if (i === 2)
                          {
                            top = border + 5;
                            left = size - border;
                          }
                        }
                        else if (array.length === 4)
                        {
                          if (i === 0)
                          {
                            top = size - border - 5;
                            left = 0;
                          }
                          else if (i === 2)
                          {
                            top = size - border + 8;
                            left = size - border;
                          }
                          else if (i === 3)
                          {
                            top = 8;
                            left = size - border;
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
                              borderWidth: border
                            } }
                            // eslint-disable-next-line security/detect-object-injection
                            source={ entry.avatars[id] }
                          />

                          {/* eslint-disable-next-line react-native/no-inline-styles */}
                          <View style={ {
                            ...styles.badge,
                            opacity: (t !== 3 && left === 0 && top === 0) ? 1 : 0
                          } }/>
                        </View>;
                      })
                    }
                  </View>

                  <View style={ styles.info }>
                    
                  </View>

                </View>
              </View>
            </Button>;
          })
        }
      </View>
    );
  }
}

Inbox.propTypes = {
  bottomSheetSnapTo: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  wrapper: {
    height: 123,

    backgroundColor: 'red',
    
    marginBottom: sizes.windowMargin,
    marginTop: sizes.windowMargin
  },

  entry: {
    flex: 1,
    flexDirection: 'row',

    backgroundColor: 'green',
    
    marginLeft: sizes.windowMargin,
    marginRight: sizes.windowMargin
  },

  avatars: {
    width: sizes.inboxAvatar,
    height: sizes.inboxAvatar,

    // based on badge width
    marginLeft: 10,

    backgroundColor: 'purple'
  },

  avatarContainer: {
    position: 'absolute',
    justifyContent: 'center'
  },

  avatar: {
    position: 'absolute',

    backgroundColor: colors.roundIconBackground,

    width: sizes.inboxAvatar,
    height: sizes.inboxAvatar,
    borderRadius: sizes.inboxAvatar,

    borderColor: colors.blackBackground
  },

  badge: {
    position: 'absolute',

    backgroundColor: colors.whiteText,

    width: 23,
    height: 23,
    borderRadius: 23,

    marginLeft: -10,

    borderWidth: 3,
    borderColor: colors.blackBackground
  },

  info: {
    flex: 1,
    backgroundColor: 'yellow'
  }
});

export default Inbox;
