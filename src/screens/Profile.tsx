import React from 'react';

import { StyleSheet, ScrollView, View, Text, Image } from 'react-native';

import type { Profile as TProfile } from '../types';

import { getStore } from '../store';

import getTheme from '../colors';

import { sizes } from '../sizes';

import Button from '../components/Button';

const colors = getTheme();

class Profile extends React.Component<{
  user: TProfile,
  profile: TProfile
}>
{
  sharedInterests(): { shared: string[], mismatched: string[] }
  {
    const { user, profile } = this.props;

    const shared: string[] = [];
    const mismatched: string[] = [];

    profile.interests.forEach((value) =>
    {
      if (user.interests.includes(value))
        shared.push(value);
      else
        mismatched.push(value);
    });

    profile.interests.filter(value => user.interests.includes(value));

    return {
      shared,
      mismatched
    };
  }

  openInterests({ shared, mismatched }: { shared: string[], mismatched: string[] }): void
  {
    const store = getStore();

    if (store.state.popup)
      return;
    
    const { user, profile } = this.props;

    const editable = user.uuid === profile.uuid;

    const concat = shared.concat(mismatched);

    // open a popup containing the all interests
    store.set({
      popup: true,
      popupContent: () =>
      {
        return <View>
          <Text style={ styles.title }>
            { editable ? 'Your Interests' : `Interests of ${profile.displayName}` }
          </Text>

          <View style={ styles.interests }>
            {
              concat.map((value, i) =>
              {
                const isShared = i < shared.length;

                return <View key={ i } style={ {
                  ...styles.rectangleSlim,
                  backgroundColor: isShared ? colors.green : colors.red
                } }>
                  <Text style={ styles.rectangleValue }>{ value }</Text>
                </View>;
              })
            }
          </View>
        </View>;
      }
    });
  }

  render(): JSX.Element
  {
    const { user, profile } = this.props;

    if (!profile?.uuid || !user?.uuid)
      return <View/>;

    const editable = user.uuid === profile.uuid;

    const infoKeys = Object.keys(profile.info);

    const { shared, mismatched } = this.sharedInterests();

    return <ScrollView style={ styles.container }>

      {/* Bio */}

      {
        // bio is optional
        profile.bio?.length ?
          <Text style={ styles.bio }>{ `"${profile.bio}"` }</Text>
          : undefined
      }

      {/* Avatar */}

      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <View style={ { alignItems: 'center' } }>
        {/* @ts-ignore */}
        <Image style={ styles.avatar } source={ profile.avatar }/>
        {/* <Image style={ styles.avatar } source={ { uri: avatar } }/> */}
      </View>

      {/* Titles and Names */}

      <View style={ styles.titles }>
        <Text style={ styles.displayName }>{ profile.displayName }</Text>
        <Text style={ styles.nickname }>{ profile.nickname }</Text>
      </View>

      {/* Demographics and Info */}

      <View style={ styles.info }>
        {
          // TODO add a comment to sexuality to leave it empty if Asexual or questioning
          infoKeys.map((key, i) =>
          {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            // eslint-disable-next-line security/detect-object-injection
            let value = profile.info[key];

            // handle formatting arrays
            if (Array.isArray(value))
              value = value.join(', ') + '.';

            return <View key={ i } style={ styles.rectangle }>
              {/* eslint-disable-next-line react-native/no-inline-styles */}
              <View style={ { alignSelf: 'center' } }>
                <Text style={ styles.rectangleKey }>{ key }</Text>
                <Text style={ styles.rectangleValue }>{ value }</Text>
              </View>
            </View>;
          })
        }
      </View>

      {/* Questions and Ice Breakers */}

      {
        // ice breakers are optional
        profile.iceBreakers?.length ?
          <Text style={ styles.title }>
            {`Questions ${editable ? 'You' : profile.nickname} Likes` }
          </Text> : undefined
      }

      {
        profile.iceBreakers?.length ?
          <View style={ styles.iceBreakers }>
            {
              profile.iceBreakers.map((question, i) =>
                <Text key={ i } style={ styles.iceBreakersQuestion }>{ question }</Text>)
            }
          </View> : undefined
      }

      {/* Interests */}

      <Text style={ styles.title }>
        { editable ? 'Your Interests' : 'Shared Interests' }
      </Text>

      <Button buttonStyle={ styles.interests } onPress={ () => this.openInterests({ shared, mismatched }) }>
        {
          shared.slice(0, 6).map((value, i) =>
          {

            return <View key={ i } style={ styles.rectangleSlim }>
              <Text style={ styles.rectangleValue }>{ value }</Text>
            </View>;
          })

        }
        
        {
          (shared.length - 6 > 0) ? <View key={ 6 } style={ styles.rectangleSlim }>
            <Text style={ styles.rectangleExtend }>{ `${shared.length - 6}+` }</Text>
          </View> : undefined
        }
      </Button>

    </ScrollView>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.blackBackground
  },

  bio: {
    color: colors.whiteText,

    fontSize: 22,
    fontWeight: 'bold',

    textAlign: 'center',

    marginHorizontal: sizes.windowMargin,
    marginTop: sizes.windowMargin * 2,
    marginBottom: sizes.windowMargin
  },

  avatar: {
    width: 256,
    height: 256,

    borderRadius: 10,

    marginHorizontal: sizes.windowMargin,
    marginTop: sizes.windowMargin,
    marginBottom: sizes.windowMargin * 1.25
  },

  title: {
    fontSize: 11,
    color: colors.greyText,
    fontWeight: 'bold',

    textTransform: 'uppercase',

    marginHorizontal: sizes.windowMargin,
    marginTop: sizes.windowMargin * 1.5
  },

  titles: {
    marginHorizontal: sizes.windowMargin,
    marginTop: sizes.windowMargin * 0.15,
    marginBottom: sizes.windowMargin * 0.65
  },

  displayName: {
    color: colors.whiteText,

    fontSize: 18,
    fontWeight: 'bold'
  },

  nickname: {
    fontSize: 13,
    color: colors.greyText
  },

  info: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    marginHorizontal: sizes.windowMargin * 0.6
  },

  rectangle: {
    borderRadius: 10,
    backgroundColor: colors.rectangleBackground,

    minWidth: 65,

    marginVertical: sizes.windowMargin * 0.35,
    marginHorizontal: sizes.windowMargin * 0.35,

    paddingVertical: sizes.windowMargin * 0.5,
    paddingHorizontal: sizes.windowMargin
  },

  rectangleSlim: {
    borderRadius: 10,
    backgroundColor: colors.rectangleBackground,

    marginVertical: sizes.windowMargin * 0.35,
    marginHorizontal: sizes.windowMargin * 0.35,

    paddingVertical: sizes.windowMargin * 0.5,
    paddingHorizontal: sizes.windowMargin * 0.75
  },

  rectangleKey: {
    fontSize: 12,
    color: colors.greyText,

    textTransform: 'uppercase',
    fontWeight: 'bold'
  },

  rectangleValue: {
    fontSize: 13,
    color: colors.whiteText,

    textTransform: 'capitalize'
  },

  rectangleExtend: {
    fontSize: 13,
    color: colors.greyText,
    fontWeight: 'bold'
  },

  iceBreakers: {
    marginHorizontal: sizes.windowMargin,
    marginTop: sizes.windowMargin * 0.5
  },

  iceBreakersQuestion: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.whiteText,
    marginTop: sizes.windowMargin * 0.35
  },

  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    marginHorizontal: sizes.windowMargin * 0.6,
    marginTop: sizes.windowMargin * 0.5,
    marginBottom: sizes.windowMargin * 0.5
  }
});

export default Profile;
