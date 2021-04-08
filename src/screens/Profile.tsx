import React from 'react';

import { StyleSheet, ScrollView, View, Text, Image } from 'react-native';

import { Feather as Icon } from '@expo/vector-icons';

import type { Profile as TProfile } from '../types';

import { getStore } from '../store';

import getTheme from '../colors';

import { sizes } from '../sizes';

import { sharedInterests, incompleteProfile, getName } from '../utils';

import Interests from '../components/Interests';

import Demographic from '../components/Demographic';

import Button from '../components/Button';

import { BioEdits, AvatarEdits, TitlesEdits, IceBreakersEdits } from '../components/ProfileEdits';

import type { BaseEdits } from '../components/ProfileEdits';

const colors = getTheme();

class Profile extends React.Component<{
  user: TProfile,
  profile: TProfile
}>
{
  constructor(props: Profile['props'])
  {
    super(props);

    this.openEdits = this.openEdits.bind(this);
  }

  openEdits(Component: typeof BaseEdits): void
  {
    const store = getStore();

    // istanbul ignore next
    if (store.state.popup)
      return;

    const { profile } = this.props;

    store.set({
      popup: true,
      popupContent: () => <Component profile={ profile }/>
    });
  }

  render(): JSX.Element
  {
    const { profile, user } = this.props;

    if (!profile?.uuid || !user?.uuid)
      return <View/>;

    const editable = profile.uuid == user.uuid;

    const { shared } = sharedInterests(user, profile);

    const missing = incompleteProfile(profile);

    return <ScrollView style={ styles.container }>

      {/* Bio */}

      {
        profile.bio?.length || editable ?
          <View style={ { ...styles.space, marginTop: sizes.windowMargin * 1.25 } }>
            <Button
              testID={ 'bn-bio' }
              // eslint-disable-next-line react-native/no-inline-styles
              buttonStyle={ { ...styles.section, flexDirection: 'row', paddingVertical: sizes.windowMargin * 0.5 } }
              disabled={ !editable }
              onPress={ () => this.openEdits(BioEdits) }
            >
              {
                profile.bio?.length ?
                  <Text style={ styles.bio }>{ `"${profile.bio}"` }</Text> :
                  // eslint-disable-next-line react-native/no-inline-styles
                  <Text style={ { ...styles.bio, color: colors.greyText, fontStyle: 'italic' } }>This is a Random Bio...</Text>
              }

              {
                editable ?
                  <Icon name={ 'tool' } size={ sizes.icon * 0.5 } color={ colors.greyText } style={ styles.sectionIcon }/>
                  : undefined
              }
              
            </Button>
          </View> : undefined
      }

      {/* Avatar */}

      <View style={ styles.space }>
        <Button
          testID={ 'bn-avatar' }
          buttonStyle={ styles.section }
          disabled={ !editable }
          onPress={ () => this.openEdits(AvatarEdits) }
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
                <Icon name={ 'tool' } size={ sizes.icon * 0.5 } color={ colors.greyText } style={ styles.sectionIcon }/> : undefined
            }
          </View>

        </Button>

      </View>

      {/* Titles and Names */}

      <View style={ styles.space }>
        <Button
          testID={ 'bn-titles' }
          buttonStyle={ styles.section }
          disabled={ !editable }
          onPress={ () => this.openEdits(TitlesEdits) }
        >
          <View style={ styles.sectionEditable }>
            {/* eslint-disable-next-line react-native/no-inline-styles */}
            <View style={ { flexGrow: 1 } }>
              {
                profile.fullName ?
                  <Text style={ styles.fullName }>{ profile.fullName }</Text> :
                  <Text style={ styles.placeholder }>Name</Text>
              }
              { profile.nickname ? <Text style={ styles.nickname }>{ profile.nickname }</Text> : undefined }
            </View>

            {
              missing.includes('name') ?
                <View style={ {
                  ...styles.indicator,
                  backgroundColor: colors.brightRed
                } }/> : undefined
            }

            {
              editable && !missing.includes('name') ?
                <Icon name={ 'tool' } size={ sizes.icon * 0.5 } color={ colors.greyText } style={ styles.sectionIcon }/> : undefined
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
              disabled={ !editable }
              onPress={ () => this.openEdits(IceBreakersEdits) }
            >
              <View style={ styles.sectionEditable }>
                <Text style={ styles.title }>
                  { editable ? 'Your Ice Breakers' : `Questions ${getName(profile)} Likes` }
                </Text>
                {
                  editable ?
                    <Icon name={ 'tool' } size={ sizes.icon * 0.5 } color={ colors.greyText } style={ styles.sectionIcon }/> : undefined
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
              missing.includes('interests') ?
                <View style={ {
                  ...styles.indicator,
                  backgroundColor: colors.brightRed
                } }/> : undefined
            }

            {
              editable && !missing.includes('interests') ?
                <Icon name={ 'tool' } size={ sizes.icon * 0.5 } color={ colors.greyText } style={ styles.sectionIcon }/> : undefined
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
    flex: 1,
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

  indicator: {
    backgroundColor: colors.whiteText,

    width: 5,
    height: 5,
    borderRadius: 5,

    alignSelf: 'center',
    marginHorizontal: sizes.windowMargin
  },

  fullName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.whiteText,

    marginHorizontal: sizes.windowMargin
  },

  placeholder: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',

    color: colors.greyText,
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
