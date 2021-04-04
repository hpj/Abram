import React, { useState } from 'react';

import { StyleSheet, View, ScrollView, TextInput } from 'react-native';

import getTheme from '../colors';

import { sizes } from '../sizes';

import Button from './Button';

const colors = getTheme();

const Searchable = ({ initial, data, onChange }:
  { initial?: string, data: string[], onChange?: (value: string) => void }): JSX.Element =>
{
  const [ value, setValue ] = useState(initial ?? '');

  const [ query, setQuery ] = useState('');

  return <View>
    {
      value ?
        <Button
          text={ value }
          useAlternative={ true }
          buttonStyle={ styles.value }
          textStyle={ styles.text }
          icon={ { name: 'x', size: sizes.icon * 0.65, color: colors.greyText, style: styles.icon } }
          onPress={ () =>
          {
            setValue('');
            onChange?.('');
          } }
        /> :
        <View>
          <ScrollView horizontal={ true } overScrollMode={ 'never' }>
            {
              query ?
                data
                  .filter(s => s.includes(query))
                  .slice(0, 4)
                  .map((item, i) =>
                    // eslint-disable-next-line react-native/no-inline-styles
                    <View key={ i } style={ { marginRight: i < 3 ?sizes.windowMargin * 0.75 : 0 } }>
                      <Button
                        text={ item }
                        textStyle={ styles.text }
                        buttonStyle={ styles.option }
                        onPress={ () =>
                        {
                          setQuery('');
                          setValue(item);
                          onChange?.(item);
                        } }
                      />
                    </View>) : undefined
            }
          </ScrollView>

          <TextInput
            value={ query }
            autoFocus={ true }
            multiline={ false }
            style={ styles.input }
            placeholder={ 'Search' }
            placeholderTextColor={ colors.placeholder }
            onChangeText={ (s: string) => setQuery(s) }
          />
        </View>
    }
  </View>;
};

const styles = StyleSheet.create({
  value: {
    alignSelf: 'flex-start',

    alignItems: 'center',
    flexDirection: 'row-reverse',
    backgroundColor: colors.rectangleBackground,

    borderRadius: 5,
    paddingHorizontal: sizes.windowMargin * 1.5,
    paddingVertical: sizes.windowMargin * 0.75
  },
  
  icon: {
    marginLeft: sizes.windowMargin * 0.75
  },

  input: {
    fontSize: 12,
    fontWeight: 'bold',

    color: colors.greyText,
    textTransform: 'capitalize',

    marginTop: sizes.windowMargin * 0.5
  },

  text: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: colors.whiteText
  },

  option: {
    backgroundColor: colors.rectangleBackground,

    borderRadius: 5,
    paddingHorizontal: sizes.windowMargin,
    paddingVertical: sizes.windowMargin * 0.75
  }
});

export default Searchable;