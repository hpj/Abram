import React from 'react';

import { StyleSheet, View, Text } from 'react-native';

import type { Profile } from '../types';

import { getStore } from '../store';

import getTheme from '../colors';

import { sizes } from '../sizes';

import { pronoun } from '../utils';

import { RomanticEdits } from '../components/ProfileEdits';

import Button from '../components/Button';

const colors = getTheme();

export default class Demographic extends React.Component<{
  user: Profile,
  profile: Profile
}>
{
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
          <Text style={ styles.title }>
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

  render(): JSX.Element
  {
    const { user, profile } = this.props;

    const editable = user.uuid === profile.uuid;

    return <View style={ styles.container }>

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
        onPress={ () => this.openRomantic() }
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
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    marginVertical: sizes.windowMargin * 0.25,
    marginHorizontal: sizes.windowMargin * 0.5
  },

  title: {
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
  }
});