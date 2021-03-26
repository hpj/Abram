import React from 'react';

import { StyleSheet, View, Text } from 'react-native';

import type { Profile } from '../types';

import { getStore } from '../store';

import getTheme from '../colors';

import { sizes } from '../sizes';

import { RomanticEdits } from '../components/ProfileEdits';

import Button from '../components/Button';

const colors = getTheme();

export default class Demographic extends React.Component<{
  user: Profile,
  profile: Profile,
  romanceShowcase?: boolean
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
        if (editable)
          return <RomanticEdits profile={ profile }/>;

        return <View>

          {
            profile.info.romantically === 'Closed' ?

              // Closed
              <View>
                <Text style={ styles.title }>
                  <Text>{ `${profile.nickname} is ` }</Text>
                  <Text style={ { color: colors.brightRed } }>Unavailable</Text>
                </Text>

                <Text style={ styles.paragraph }>
                  <Text>{ `Any attempt to flirt with ${profile.nickname} can result in your account getting terminated.` }</Text>
                </Text>
              </View> :
              
              // Open
              <View>
                <Text style={ styles.title }>
                  <Text>{ `${profile.nickname} is Open For Romance` }</Text>
                </Text>

                <View style={ {
                  marginVertical: sizes.windowMargin * 0.75
                } }>
                  <Demographic romanceShowcase user={ user } profile={ profile }/>
                </View>
              </View>
          }
        </View>;
      }
    });
  }

  render(): JSX.Element
  {
    const { romanceShowcase, user, profile } = this.props;

    const editable = user.uuid === profile.uuid;

    return <View style={ styles.container }>

      {/* Origin */}

      {
        profile.info.origin?.length || editable || romanceShowcase ?
          <Button
            testID={ 'bn-origin' }
            useAlternative={ true }
            borderless={ true }
            buttonStyle={ styles.rectangle }
            disabled={ !editable }
            icon={ editable ? { name: 'tool', size: sizes.icon * 0.5, color: colors.whiteText, style: styles.rectangleIcon } : undefined }
          >
            <View>
              {
                profile.info.origin?.length ?
                  <View>
                    <Text style={ styles.rectangleKey }>Origin</Text>
                    <Text style={ styles.rectangleValue }>{ profile.info.origin }</Text>
                  </View> :
                  editable ?
                    <Text style={ styles.rectangleKey }>Origin</Text> :
                    <Text style={ styles.rectangleNull }>Unspecified Origin</Text>
              }
            </View>
          </Button> : undefined
      }

      {/* Speaks */}

      {
        !romanceShowcase ?
          <Button
            testID={ 'bn-speaks' }
            useAlternative={ true }
            borderless={ true }
            buttonStyle={ styles.rectangle }
            disabled={ !editable }
            icon={ editable ? { name: 'tool', size: sizes.icon * 0.5, color: colors.whiteText, style: styles.rectangleIcon } : undefined }
          >
            <View>
              <Text style={ styles.rectangleKey }>Speaks</Text>
              <Text style={ styles.rectangleValue }>{ profile.info.speaks.join(', ') + '.' }</Text>
            </View>
          </Button> : undefined
      }

      {/* Profession */}

      {
        (profile.info.profession?.length || editable) && (!romanceShowcase) ?
          <Button
            testID={ 'bn-profession' }
            useAlternative={ true }
            borderless={ true }
            buttonStyle={ styles.rectangle }
            disabled={ !editable }
            icon={ editable ? { name: 'tool', size: sizes.icon * 0.5, color: colors.whiteText, style: styles.rectangleIcon } : undefined }
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

      {
        !romanceShowcase ?
          <Button
            testID={ 'bn-romantic' }
            useAlternative={ true }
            borderless={ true }
            buttonStyle={ styles.rectangle }
            icon={ editable ? { name: 'tool', size: sizes.icon * 0.5, color: colors.whiteText, style: styles.rectangleIcon } : undefined }
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
          </Button> : undefined
      }

      {/* Works At */}

      {
        (profile.info.worksAt?.length || editable) && (!romanceShowcase)?
          <Button
            testID={ 'bn-works' }
            useAlternative={ true }
            borderless={ true }
            buttonStyle={ styles.rectangle }
            disabled={ !editable }
            icon={ editable ? { name: 'tool', size: sizes.icon * 0.5, color: colors.whiteText, style: styles.rectangleIcon } : undefined }
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
        icon={ editable ? { name: 'tool', size: sizes.icon * 0.5, color: colors.whiteText, style: styles.rectangleIcon } : undefined }
        disabled={ !editable }
      >
        <View>
          <Text style={ styles.rectangleKey }>Gender</Text>
          <Text style={ styles.rectangleValue }>{ profile.info.gender }</Text>
        </View>
      </Button>

      {/* Sexuality */}

      {
        profile.info.sexuality?.length || editable || romanceShowcase ?
          <Button
            testID={ 'bn-sexuality' }
            useAlternative={ true }
            borderless={ true }
            buttonStyle={ styles.rectangle }
            disabled={ !editable }
            icon={ editable ? { name: 'tool', size: sizes.icon * 0.5, color: colors.whiteText, style: styles.rectangleIcon } : undefined }
          >
            <View>
              {
                profile.info.sexuality?.length ?
                  <View>
                    <Text style={ styles.rectangleKey }>Sexuality</Text>
                    <Text style={ styles.rectangleValue }>{ profile.info.sexuality }</Text>
                  </View> :
                  editable ?
                    <Text style={ styles.rectangleKey }>Sexuality</Text> :
                    <Text style={ styles.rectangleNullHighlighted }>Unspecified Sexuality</Text>
              }
            </View>
          </Button> : undefined
      }

      {/* Religion */}

      {
        profile.info.religion?.length || editable || romanceShowcase ?
          <Button
            testID={ 'bn-religion' }
            useAlternative={ true }
            borderless={ true }
            buttonStyle={ styles.rectangle }
            disabled={ !editable }
            icon={ editable ? { name: 'tool', size: sizes.icon * 0.5, color: colors.whiteText, style: styles.rectangleIcon } : undefined }
          >
            <View>
              {
                profile.info.religion?.length ?
                  <View>
                    <Text style={ styles.rectangleKey }>Religion</Text>
                    <Text style={ styles.rectangleValue }>{ profile.info.religion }</Text>
                  </View> :
                  editable ?
                    <Text style={ styles.rectangleKey }>Religion</Text> :
                    <Text style={ styles.rectangleNull }>Non-Religious</Text>
              }
            </View>
          </Button> : undefined
      }

      {/* Age */}

      {
        profile.info.age || editable || romanceShowcase ?
          <Button
            testID={ 'bn-age' }
            useAlternative={ true }
            borderless={ true }
            buttonStyle={ styles.rectangle }
            disabled={ !editable }
            icon={ editable ? { name: 'tool', size: sizes.icon * 0.5, color: colors.whiteText, style: styles.rectangleIcon } : undefined }
          >
            <View>
              {
                romanceShowcase && profile.info.age && profile.info.age < 18 ?
                  <Text style={ styles.rectangleNullHighlighted }>{ `${profile.nickname} Is A Minor` }</Text> :
                  profile.info.age ?
                    <View>
                      <Text style={ styles.rectangleKey }>Age</Text>
                      <Text style={ styles.rectangleValue }>{ profile.info.age }</Text>
                    </View> :
                    editable ?
                      <Text style={ styles.rectangleKey }>Age</Text> :
                      <Text style={ styles.rectangleNullHighlighted }>Unspecified Age</Text>
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
    color: colors.whiteText,
    fontWeight: 'bold',
    lineHeight: 14 * 1.45,

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

  rectangleNull: {
    fontSize: 13,
    color: colors.greyText,

    textTransform: 'uppercase',
    fontWeight: 'bold'
  },

  rectangleNullHighlighted: {
    fontSize: 13,
    color: colors.brightRed,

    textTransform: 'uppercase',
    fontWeight: 'bold'
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