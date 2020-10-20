import React from 'react';

import { StyleSheet, ScrollView, View, Text, Image } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

import type { Profile as TProfile } from '../types';

import { getStore } from '../store';

import getTheme from '../colors';

import { sizes } from '../sizes';

import { pronoun, sharedInterests } from '../utils';

import Button from '../components/Button';

import { AvatarEdits, RomanticEdits } from '../components/ProfileEdits';

const colors = getTheme();

class Profile extends React.Component<{
  user: TProfile,
  profile: TProfile
}>
{
  constructor(props: Profile['props'])
  {
    super(props);

    this.openAvatar = this.openAvatar.bind(this);
    this.openRomantic = this.openRomantic.bind(this);
  }

  sharedInterests(): { shared: string[], mismatched: string[] }
  {
    const { user, profile } = this.props;

    return sharedInterests(user, profile);
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

  openInterests({ shared, mismatched }: { shared: string[], mismatched: string[] }): void
  {
    const store = getStore();

    // istanbul ignore next
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
        return <View style={ styles.section }>
          <Text style={ styles.titleBig }>
            { editable ? 'Your Interests' : `Interests of ${profile.nickname}` }
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

  openRomantic(): void
  {
    const store = getStore();

    // istanbul ignore next
    if (store.state.popup)
      return;
      
    const { user, profile } = this.props;

    const editable = user.uuid === profile.uuid;

    // open a popup containing the all interests
    store.set({
      popup: true,
      popupContent: () =>
      {
        const { they, their, them } = pronoun(profile.info.gender);

        if (editable)
          return <RomanticEdits initial={ profile.info.romantically }/>;

        return <View>
          <Text style={ styles.titleBigger }>
            <Text>{ `${profile.nickname} is Romantically ` }</Text>
            {
              profile.info.romantically === 'Open' ?
                <Text style={ { color: colors.whiteText } }>Available.</Text> :
                <Text style={ { color: colors.brightRed } }>Unavailable.</Text>
            }
          </Text>

          {
            profile.info.romantically === 'Closed' ?

              // Closed
              <Text style={ styles.paragraph }>
                <Text>{ `If you attempt flirting with ${them},\nit can result in your account getting ` }</Text>
                <Text style={ { color: colors.brightRed } }>Terminated</Text>
                <Text>.</Text>
              </Text> :
              
              // Open
              <Text style={ styles.paragraph }>
                {/* Keep in mind age, sexuality, religion, gender do exist when flirting with someone. */}
                <Text>Keep in mind,</Text>
                <Text>
                  <Text style={ { color: colors.greyText } }>{`\n${profile.nickname} is a `}</Text>
                  <Text style={ { color: colors.whiteText } }>
                    {
                      profile.info.age && profile.info.age < 18 ?
                        <Text style={ { color: colors.brightRed } }>Minor </Text> : undefined
                    }
                    {
                      [
                        profile.info.sexuality === 'None' ? 'Asexual' : profile.info.sexuality,
                        profile.info.religion === 'None' ? 'Non-Religious' : profile.info.religion,
                        profile.info.gender
                      ].join(' ').trim()
                    }
                  </Text>
                </Text>
                {
                  !profile.info.age ? <Text>
                    <Text>{`,\n${they} did not specify ${their} `}</Text>
                    <Text style={ { color: colors.brightRed } }>Age</Text>
                  </Text> : undefined
                }
                {
                  !profile.info.sexuality ? <Text>
                    <Text>{`,\n${they} did not specify ${their} `}</Text>
                    <Text style={ { color: colors.brightRed } }>Sexuality</Text>
                  </Text> : undefined
                }
                <Text>.</Text>
              </Text>
          }
        </View>;
      }
    });
  }

  renderDemographic(): JSX.Element
  {
    const { profile, user } = this.props;

    const editable = profile.uuid == user.uuid;

    return <View style={ styles.info }>

      {/* Origin */}

      {
        profile.info.origin?.length || editable ?
          <Button
            testID={ 'bn-origin' }
            useAlternative={ true }
            borderless={ true }
            buttonStyle={ styles.rectangle }
            disabled={ !editable }
            icon={ editable ? { name: 'edit-2', size: sizes.icon * 0.5, color: colors.whiteText, style: styles.rectangleIcon } : undefined }
          >
            <View>
              <Text style={ styles.rectangleKey }>Origin</Text>
              {
                profile.info.origin?.length ?
                  <Text style={ styles.rectangleValue }>{ profile.info.origin }</Text> : undefined
              }
            </View>
          </Button> : undefined
      }

      {/* Speaks */}

      <Button
        testID={ 'bn-speaks' }
        useAlternative={ true }
        borderless={ true }
        buttonStyle={ styles.rectangle }
        disabled={ !editable }
        icon={ editable ? { name: 'edit-2', size: sizes.icon * 0.5, color: colors.whiteText, style: styles.rectangleIcon } : undefined }
      >
        <View>
          <Text style={ styles.rectangleKey }>Speaks</Text>
          <Text style={ styles.rectangleValue }>{ profile.info.speaks.join(', ') + '.' }</Text>
        </View>
      </Button>

      {/* Profession */}

      {
        profile.info.profession?.length || editable ?
          <Button
            testID={ 'bn-profession' }
            useAlternative={ true }
            borderless={ true }
            buttonStyle={ styles.rectangle }
            disabled={ !editable }
            icon={ editable ? { name: 'edit-2', size: sizes.icon * 0.5, color: colors.whiteText, style: styles.rectangleIcon } : undefined }
          >
            <View>
              <Text style={ styles.rectangleKey }>Profession</Text>
              {
                profile.info.profession?.length ?
                  <Text style={ styles.rectangleValue }>{ profile.info.profession }</Text> : undefined
              }
            </View>
          </Button> : undefined
      }

      {/* Romantically */}

      <Button
        testID={ 'bn-romantic' }
        useAlternative={ true }
        borderless={ true }
        buttonStyle={ styles.rectangle }
        icon={ editable ? { name: 'edit-2', size: sizes.icon * 0.5, color: colors.whiteText, style: styles.rectangleIcon } : undefined }
        onPress={ this.openRomantic }
      >
        {
          !editable ?
            <View style={ styles.rectangleIndicator }/> : undefined
        }

        <View>
          <Text style={ styles.rectangleKey }>Romantically</Text>
          <Text style={ styles.rectangleValue }>{ profile.info.romantically }</Text>
        </View>
      </Button>

      {/* Works At */}

      {
        profile.info.worksAt?.length || editable ?
          <Button
            testID={ 'bn-works' }
            useAlternative={ true }
            borderless={ true }
            buttonStyle={ styles.rectangle }
            disabled={ !editable }
            icon={ editable ? { name: 'edit-2', size: sizes.icon * 0.5, color: colors.whiteText, style: styles.rectangleIcon } : undefined }
          >
            <View>
              <Text style={ styles.rectangleKey }>Works At</Text>
              {
                profile.info.worksAt?.length ?
                  <Text style={ styles.rectangleValue }>{ profile.info.worksAt }</Text> : undefined
              }
            </View>
          </Button> : undefined
      }

      {/* Gender */}

      <Button
        testID={ 'bn-gender' }
        useAlternative={ true }
        borderless={ true }
        buttonStyle={ styles.rectangle }
        icon={ editable ? { name: 'edit-2', size: sizes.icon * 0.5, color: colors.whiteText, style: styles.rectangleIcon } : undefined }
        disabled={ !editable }
      >
        <View>
          <Text style={ styles.rectangleKey }>Gender</Text>
          <Text style={ styles.rectangleValue }>{ profile.info.gender }</Text>
        </View>
      </Button>

      {/* Sexuality */}

      {
        profile.info.sexuality?.length || editable ?
          <Button
            testID={ 'bn-sexuality' }
            useAlternative={ true }
            borderless={ true }
            buttonStyle={ styles.rectangle }
            disabled={ !editable }
            icon={ editable ? { name: 'edit-2', size: sizes.icon * 0.5, color: colors.whiteText, style: styles.rectangleIcon } : undefined }
          >
            <View>
              <Text style={ styles.rectangleKey }>Sexuality</Text>
              {
                profile.info.sexuality?.length ?
                  <Text style={ styles.rectangleValue }>{ profile.info.sexuality }</Text> : undefined
              }
            </View>
          </Button> : undefined
      }

      {/* Religion */}

      {
        profile.info.religion?.length || editable ?
          <Button
            testID={ 'bn-religion' }
            useAlternative={ true }
            borderless={ true }
            buttonStyle={ styles.rectangle }
            disabled={ !editable }
            icon={ editable ? { name: 'edit-2', size: sizes.icon * 0.5, color: colors.whiteText, style: styles.rectangleIcon } : undefined }
          >
            <View>
              <Text style={ styles.rectangleKey }>Religion</Text>
              {
                profile.info.religion?.length ?
                  <Text style={ styles.rectangleValue }>{ profile.info.religion }</Text> : undefined
              }
            </View>
          </Button> : undefined
      }

      {/* Age */}

      {
        profile.info.age || editable ?
          <Button
            testID={ 'bn-age' }
            useAlternative={ true }
            borderless={ true }
            buttonStyle={ styles.rectangle }
            disabled={ !editable }
            icon={ editable ? { name: 'edit-2', size: sizes.icon * 0.5, color: colors.whiteText, style: styles.rectangleIcon } : undefined }
          >
            <View>
              <Text style={ styles.rectangleKey }>Age</Text>
              {
                profile.info.age ?
                  <Text style={ styles.rectangleValue }>{ profile.info.age }</Text> : undefined
              }
            </View>
          </Button> : undefined
      }

    </View>;
  }

  render(): JSX.Element
  {
    const { profile, user } = this.props;

    if (!profile?.uuid || !user?.uuid)
      return <View/>;

    const editable = profile.uuid == user.uuid;

    const { shared, mismatched } = this.sharedInterests();

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

      { this.renderDemographic() }

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
                      profile.iceBreakers.map((question, i) =>
                        <Text key={ i } style={ styles.iceBreakersQuestion }>{ question }</Text>)
                    }
                  </View> : undefined
              }
            </Button>
          </View> : undefined
      }

      {/* Interests */}

      <View style={ styles.space } >
        <Button
          testID={ 'bn-interests' }
          buttonStyle={ styles.section }
          onPress={ () => this.openInterests({ shared, mismatched }) }
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

          {
            shared.length > 0 ?
              <View style={ styles.interests }>
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
              </View> : undefined
          }
        </Button>
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

  titleBig: {
    fontSize: 11,
    color: colors.greyText,
    fontWeight: 'bold',

    textTransform: 'uppercase',

    marginHorizontal: sizes.windowMargin,
    marginTop: sizes.windowMargin * 0.5
  },

  titleBigger: {
    fontSize: 13,
    color: colors.greyText,
    fontWeight: 'bold',

    textTransform: 'uppercase',

    marginHorizontal: sizes.windowMargin,
    marginTop: sizes.windowMargin * 1.5
  },

  paragraph: {
    fontSize: 14,
    color: colors.greyText,
    fontWeight: 'bold',
    lineHeight: 14 * 1.45,

    textTransform: 'capitalize',

    marginHorizontal: sizes.windowMargin,
    marginTop: sizes.windowMargin * 1.5,
    marginBottom: sizes.windowMargin * 2
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

  info: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    marginHorizontal: sizes.windowMargin * 0.6
  },

  rectangle: {
    alignItems: 'center',
    flexDirection: 'row-reverse',

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

    marginBottom: sizes.windowMargin * 0.55,
    marginLeft: sizes.windowMargin * 0.5,

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

  rectangleIndicator: {
    backgroundColor: colors.whiteText,

    width: 5,
    height: 5,
    borderRadius: 5,

    marginLeft: 10
  },

  rectangleIcon: {
    marginLeft: 10
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
  },

  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    marginTop: sizes.windowMargin * 0.5,
    marginHorizontal: sizes.windowMargin * 0.5
  }
});

export default Profile;
