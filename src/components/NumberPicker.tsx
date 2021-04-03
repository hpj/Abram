import React from 'react';

import { StyleSheet, View, Text } from 'react-native';

import Button from './Button';

import getTheme from '../colors';

import { sizes } from '../sizes';

const colors = getTheme();

class NumberPicker extends React.Component<{
  min?: number,
  max?: number,
  initial?: number,
  placeholder?: string,
  onChange?: (value: number) => void
}, {
  value?: number
}>
{
  constructor(props: NumberPicker['props'])
  {
    super(props);

    this.state = {
      value: undefined
    };
  }

  onPress(step: number, fmin?: number, fmax?: number): void
  {
    const { min, max, initial, onChange } = this.props;

    const { value } = this.state;

    let n = (value ?? initial ?? 0) + step;

    n = Math.max(fmin ?? min ?? n, Math.min(n, fmax ?? max ?? n));

    if (step < 0 && (value === undefined || n === value))
      n = fmax ?? max ?? n;

    this.setState({
      value: n
    });

    onChange?.(n);
  }

  render(): JSX.Element
  {
    const { placeholder } = this.props;

    const { value } = this.state;

    return <View style={ styles.container }>
      <Button
        icon={ { name: 'minus', size: sizes.icon * 0.85, color: colors.greyText } }
        wrapperStyle={ styles.button }
        onPress={ () => this.onPress(-1) }
      />
   
      {
        value === undefined && placeholder?.length ?
          <Text numberOfLines={ 1 } adjustsFontSizeToFit minimumFontScale={ 0.85 } style={ styles.placeholder }>{ placeholder }</Text> :
          <Text numberOfLines={ 1 } adjustsFontSizeToFit minimumFontScale={ 0.85 } style={ styles.text }>{ value }</Text>
      }

      <Button
        icon={ { name: 'plus', size: sizes.icon * 0.85, color: colors.greyText } }
        wrapperStyle={ styles.button }
        onPress={ () => this.onPress(1) }
      />
    </View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.rectangleBackground,
    
    borderRadius: 5
  },

  placeholder: {
    flex: 1,
    color: colors.greyText,

    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',

    padding: sizes.windowMargin
  },

  text: {
    flex: 1,
    color: colors.whiteText,

    fontSize: 15,
    textAlign: 'center',
    padding: sizes.windowMargin
  },

  button: {
    paddingHorizontal: sizes.windowMargin * 0.85,
    paddingVertical: sizes.windowMargin
  }
});

export default NumberPicker;
