import React from 'react';

import { StyleSheet, ScrollView, View, Text, Image } from 'react-native';

import { Feather as Icon } from '@expo/vector-icons';

import type { Profile as TProfile } from '../types';

import { getStore } from '../store';

import getTheme from '../colors';

import { sizes } from '../sizes';

import { pronoun, sharedInterests } from '../utils';

import Interests from '../components/Interests';

import Demographic from '../components/Demographic';

import Button from '../components/Button';

import { BioEdits, AvatarEdits, RomanticEdits } from '../components/ProfileEdits';

const colors = getTheme();

class Profile extends React.Component<{
  user: TProfile,
  profile: TProfile
}>
{
  constructor(props: Profile['props'])
  {
    super(props);

    this.openBio = this.openBio.bind(this);
    this.openAvatar = this.openAvatar.bind(this);
  }

  openBio(): void
  {
    const store = getStore();

    // istanbul ignore next
    if (store.state.popup)
      return;

    const { profile } = this.props;

    store.set({
      popup: true,
      popupContent: () => <BioEdits initial={ profile.bio }/>
    });
  }

  openAvatar(): void
  {
    const store = getStore();

    // istanbul ignore next
    if (store.state.popup)
      return;

    store.set({
      popup: true,
      popupContent: () => <AvatarEdits/>
    });
  }

  render(): JSX.Element
  {
    const { profile, user } = this.props;

    if (!profile?.uuid || !user?.uuid)
      return <View/>;

    const editable = profile.uuid == user.uuid;

    const { shared } = sharedInterests(user, profile);

    return <ScrollView style={ styles.container }>

      {/* Bio */}

      {
        profile.bio?.length || editable ?
          <View style={ { ...styles.space, marginTop: sizes.windowMargin * 1.25 } }>
            <Button
              testID={ 'bn-bio' }
              buttonStyle={ { ...styles.section, paddingVertical: sizes.windowMargin * 0.5 } }
              useAlternative={ true }
              disabled={ !editable }
              onPress={ this.openBio }
            >
              {
                editable ?
                  // eslint-disable-next-line react-native/no-inline-styles
                  <View style={ { ...styles.sectionEditable, flexDirection: 'row-reverse' } }>
                    <Icon name={ 'edit-2' } size={ sizes.icon * 0.5 } color={ colors.whiteText } style={ styles.sectionIcon }/>
                  </View> : undefined
              }

              {
                profile.bio?.length ?
                  <Text style={ styles.bio }>{ `"${profile.bio}"` }</Text> :
                // eslint-disable-next-line react-native/no-inline-styles
                  <Text style={ { ...styles.bio, color: colors.greyText, fontStyle: 'italic' } }>{ 'What\'s... a bio?' }</Text>
              }
              
            </Button>
          </View> : undefined
      }

      {/* Avatar */}

      <View style={ styles.space }>
        <Button
          testID={ 'bn-avatar' }
          buttonStyle={ styles.section }
          useAlternative={ true }
          disabled={ !editable }
          onPress={ this.openAvatar }
        >
          <View style={ styles.sectionEditable }>
            {/* eslint-disable-next-line react-native/no-inline-styles */}
            <View style={ { flexGrow: 1 } }>
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <Image style={ styles.avatar } source={ profile.avatar }/>
              {/* <Image style={ styles.avatar } source={ { uri: avatar } }/> */}
            </View>
            {
              editable ?
                <Icon name={ 'edit-2' } size={ sizes.icon * 0.5 } color={ colors.whiteText } style={ styles.sectionIcon }/> : undefined
            }
          </View>

        </Button>

      </View>

      {/* Titles and Names */}

      <View style={ styles.space }>
        <Button
          testID={ 'bn-titles' }
          buttonStyle={ styles.section }
          useAlternative={ true }
          disabled={ !editable }
        >
          <View style={ styles.sectionEditable }>
            {/* eslint-disable-next-line react-native/no-inline-styles */}
            <View style={ { flexGrow: 1 } }>
              <Text style={ styles.displayName }>{ profile.fullName }</Text>
              <Text style={ styles.nickname }>{ profile.nickname }</Text>
            </View>
            {
              editable ?
                <Icon name={ 'edit-2' } size={ sizes.icon * 0.5 } color={ colors.whiteText } style={ styles.sectionIcon }/> : undefined
            }
          </View>
        </Button>
      </View>

      {/* Demographics and Info */}

      <Demographic user={ user } profile={ profile }/>

      {/* Questions and Ice Breakers */}

      {
        profile.iceBreakers?.length || editable ?
          <View style={ styles.space }>
            <Button
              testID={ 'bn-ice-breakers' }
              buttonStyle={ styles.section }
              useAlternative={ true }
              disabled={ !editable }
            >
              <View style={ styles.sectionEditable }>
                <Text style={ styles.title }>
                  { editable ? 'Your Ice Breakers' : `Questions ${profile.nickname} Likes` }
                </Text>
                {
                  editable ?
                    <Icon name={ 'edit-2' } size={ sizes.icon * 0.5 } color={ colors.whiteText } style={ styles.sectionIcon }/> : undefined
                }
              </View>

              {
                profile.iceBreakers?.length ?
                  <View style={ styles.iceBreakers }>
                    {
                      profile.iceBreakers.slice(0, 3).map((question, i) =>
                        <Text key={ i } style={ styles.iceBreakersQuestion }>{ question }</Text>)
                    }
                  </View> : undefined
              }
            </Button>
          </View> : undefined
      }

      {/* Interests */}

      <View style={ styles.space } >
        <Interests
          user={ user }
          profiles={ [ profile ] }
          buttonStyle={ styles.section }
        >
          <View style={ styles.sectionEditable }>
            <Text style={ styles.title }>
              { editable ?
                'Your Interests' :
                shared.length <= 0 ?
                  'No Shared Interests' :
                  shared.length === 1 ?
                    '1 Shared Interest' :
                    `${shared.length} Shared Interests`
              }
            </Text>

            {
              editable ?
                <Icon name={ 'edit-2' } size={ sizes.icon * 0.5 } color={ colors.whiteText } style={ styles.sectionIcon }/> : undefined
            }
          </View>
        </Interests>
      </View>

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

    marginHorizontal: sizes.windowMargin
  },

  avatar: {
    alignSelf: 'center',

    backgroundColor: colors.greyText,

    width: 256,
    height: 256,

    borderRadius: 10
  },

  title: {
    flexGrow: 1,
    
    fontSize: 11,
    color: colors.greyText,
    fontWeight: 'bold',

    textTransform: 'uppercase',

    marginHorizontal: sizes.windowMargin
  },

  displayName: {
    color: colors.whiteText,

    fontSize: 18,
    fontWeight: 'bold',

    marginHorizontal: sizes.windowMargin
  },

  nickname: {
    fontSize: 13,
    color: colors.greyText,

    marginHorizontal: sizes.windowMargin
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

  space: {
    marginTop: sizes.windowMargin * 0.65
  },

  section: {
    paddingVertical: sizes.windowMargin
  },

  sectionEditable: {
    flexDirection: 'row'
  },

  sectionIcon: {
    alignSelf: 'center',
    marginHorizontal: sizes.windowMargin
  }
});

export default Profile;
