import React from 'react';

import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';

import type { Profile } from '../types';

import { getStore } from '../store';

import getTheme from '../colors';

import { sizes } from '../sizes';

import { sharedInterests } from '../utils';

import Button from '../components/Button';

const colors = getTheme();

export default class Interests extends React.Component<{
  user: Profile,
  profiles: Profile[],
  buttonStyle?: StyleProp<ViewStyle>,
  children?: JSX.Element | JSX.Element[]
}>
{
  openInterests({ shared, mismatched }: { shared: string[], mismatched: string[] }): void
  {
    const store = getStore();

    // istanbul ignore next
    if (store.state.popup)
      return;

    const { user } = this.props;

    const [ profile ] = this.props.profiles;

    const editable = user.uuid === profile.uuid;

    const concat = shared.concat(mismatched);

    // open a popup containing the all interests
    store.set({
      popup: true,
      popupContent: () =>
      {
        return <View style={ styles.section }>
          <Text style={ styles.title }>
            { editable ? 'Your Interests' : `${profile.nickname} Is Interested In` }
          </Text>

          <View style={ styles.container }>
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
    const { user, profiles, buttonStyle, children } = this.props;

    const { shared, mismatched } = sharedInterests(user, ...profiles);

    return <Button
      testID={ 'bn-interests' }
      buttonStyle={ buttonStyle }
      disabled={ profiles.length > 1 }
      onPress={ () => this.openInterests({ shared, mismatched }) }
    >
      { children }

      {
        shared.length > 0 ?
          <View style={ styles.container }>
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
    </Button>;
  }
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: sizes.windowMargin
  },
  
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    marginTop: sizes.windowMargin * 0.5,
    marginHorizontal: sizes.windowMargin * 0.5
  },

  title: {
    fontSize: 11,
    color: colors.greyText,
    fontWeight: 'bold',

    textTransform: 'uppercase',

    marginHorizontal: sizes.windowMargin,
    marginTop: sizes.windowMargin * 0.5
  },

  rectangleSlim: {
    borderRadius: 10,
    backgroundColor: colors.rectangleBackground,

    marginBottom: sizes.windowMargin * 0.55,
    marginLeft: sizes.windowMargin * 0.5,

    paddingVertical: sizes.windowMargin * 0.5,
    paddingHorizontal: sizes.windowMargin * 0.75
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
  }
});