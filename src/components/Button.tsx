import React from 'react';

import {
  Platform, View,
  TouchableNativeFeedback, TouchableOpacity,
  Text
} from 'react-native';

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
  borderless?: boolean,
  activeOpacity?: number,
  onPress?: () => void
}>
{
  render(): JSX.Element
  {
    /* istanbul ignore next */
    const TouchableComponent:
      React.ComponentType<TouchableOpacityProps | TouchableNativeFeedbackProps>
      = (Platform.OS === 'android') ? TouchableNativeFeedback : TouchableOpacity;

    const {
      backgroundStyle, badgeStyle, buttonStyle,
      textStyle, testID, text, icon, borderless,
      activeOpacity, onPress
    } = this.props;

    return (
      <TouchableComponent
        testID={ testID }
        background={ TouchableNativeFeedback.Ripple(colors.ripple, borderless) }
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
            (text) ?  <Text style={ textStyle }>{ text }</Text> : undefined
          }

          {
            this.props.children
          }
         
        </View>
      </TouchableComponent>
    );
  }
}

export default Button;
