import React from 'react';

import {
  Platform, View,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity
} from 'react-native';

import { TouchableNativeFeedback as GHTouchableNativeFeedback, TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler';

import type {
  StyleProp, ViewStyle, TextStyle,
  TouchableOpacityProps, TouchableNativeFeedbackProps
} from 'react-native';

import type { IconProps } from 'react-native-vector-icons/Icon';

import Icon from 'react-native-vector-icons/Feather';

import getTheme from '../colors';

const colors = getTheme();

class Button extends React.Component<{
  backgroundStyle?: StyleProp<ViewStyle>,
  badgeStyle?: StyleProp<ViewStyle>,
  buttonStyle?: StyleProp<ViewStyle>,
  textStyle?: StyleProp<TextStyle>,
  testID?: string,
  text?: string,
  icon?: IconProps,
  useAlternative?: boolean,
  borderless?: boolean,
  activeOpacity?: number,
  onPress?: () => void
}>
{
  render(): JSX.Element
  {
    const {
      useAlternative,
      backgroundStyle, badgeStyle, buttonStyle,
      textStyle, testID, text, icon, borderless,
      activeOpacity, onPress
    } = this.props;

    /* istanbul ignore next */
    const TouchableComponent:
      React.ComponentType<TouchableOpacityProps | TouchableNativeFeedbackProps>
      = (Platform.OS === 'android') ? TouchableNativeFeedback : TouchableOpacity;

    /* istanbul ignore next */
    const GHTouchableComponent:
      React.ComponentType<TouchableOpacityProps | TouchableNativeFeedbackProps>
      = (Platform.OS === 'android') ? GHTouchableNativeFeedback : GHTouchableNativeFeedback;

    const Component = !useAlternative ? GHTouchableComponent : TouchableComponent;

    return (
      <Component
        testID={ testID }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        background={ (!useAlternative ? GHTouchableNativeFeedback : TouchableNativeFeedback).Ripple(colors.ripple, borderless) }
        activeOpacity={ activeOpacity }
        onPress={ onPress }
      >
        <View style={ buttonStyle }>

          <View style={ backgroundStyle }>
            <View style={ badgeStyle }/>
          </View>

          {
            (icon) ? <Icon { ...icon }/> : undefined
          }

          {
            (text) ? <Text style={ textStyle }>{ text }</Text> : undefined
          }

          {
            this.props.children
          }
         
        </View>
      </Component>
    );
  }
}

export default Button;
