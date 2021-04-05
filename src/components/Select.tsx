import React, { useState } from 'react';

import { StyleSheet, View, ScrollView, TextInput } from 'react-native';

import getTheme from '../colors';

import { sizes } from '../sizes';

import Button from './Button';

const colors = getTheme();

const Select = ({ initial, data, searchable, required, multiple, onChange }: {
  initial?: string | string[],
  required?: boolean,
  searchable?: boolean,
  multiple?: number,
  data: string[],
  onChange?: (value: string | string[]) => void
}): JSX.Element =>
{
  const max = multiple ?? 1;
  
  initial = max > 1 ? initial as string[] : initial ? [ initial ] as string[] : [];

  const [ values, setValues ] = useState(initial);

  const [ active, setActive ] = useState(values.length <= 0);

  const [ query, setQuery ] = useState('');

  let queryData = data;

  if (searchable)
    queryData = data.filter(s => s.includes(query)).slice(0, 4);

  return <View>
    {
      !active ?
        <View style={ styles.wrap }>
          {
            values.map((v, i) =>
            {
              const margin = (i < values.length - 1) || (i === values.length - 1 && values.length !== max) ? sizes.windowMargin * 0.75 : 0;

              // eslint-disable-next-line react-native/no-inline-styles
              return <View key={ i } style={ {
                marginRight: margin,
                marginBottom: margin
              } }>
                <Button
                  text={ v }
                  useAlternative={ true }
                  buttonStyle={ styles.value }
                  textStyle={ styles.text }
                  icon={ { name: 'x', size: sizes.icon * 0.65, color: colors.greyText, style: styles.icon } }
                  onPress={ () =>
                  {
                    values.splice(i, 1);

                    setValues(values);

                    if (values.length === 0)
                      setActive(true);

                    if (!required && max === 1)
                      onChange?.('');
                    else if (max > 1)
                      onChange?.(values);
                  } }
                />
              </View>;
            })
          }

          {
            values.length !== max ? <Button
              useAlternative={ true }
              buttonStyle={ styles.multiple }
              icon={ { name: 'plus', size: sizes.icon * 0.65, color: colors.whiteText } }
              onPress={ () =>
              {
                setActive(true);
              } }
            /> : undefined
          }
        </View>
        :
        <View>
          <ScrollView horizontal={ true } overScrollMode={ 'never' }>
            {
              query || !searchable ?
                queryData
                  .map((item, i) =>
                  {
                    const margin = i < queryData.length - 1 ? sizes.windowMargin * 0.75 : 0;
                    
                    // eslint-disable-next-line react-native/no-inline-styles
                    return <View key={ i } style={ {
                      marginRight: margin
                    } }>
                      <Button
                        text={ item }
                        textStyle={ styles.text }
                        buttonStyle={ styles.option }
                        onPress={ () =>
                        {
                          setQuery('');

                          values.push(item);

                          setValues(values);

                          setActive(false);

                          onChange?.(max > 1 ? values : values[0]);
                        } }
                      />
                    </View>;
                  }) : undefined
            }
          </ScrollView>

          {
            searchable ?
              <TextInput
                value={ query }
                autoFocus={ true }
                multiline={ false }
                style={ styles.input }
                placeholder={ 'Search' }
                placeholderTextColor={ colors.placeholder }
                onChangeText={ (s: string) => setQuery(s) }
              /> : undefined
          }
        </View>
    }
  </View>;
};

const styles = StyleSheet.create({
  value: {
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

  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },

  multiple: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.rectangleBackground,

    borderRadius: 5,
    paddingHorizontal: sizes.windowMargin,
    paddingVertical: sizes.windowMargin * 0.75
  },

  option: {
    backgroundColor: colors.rectangleBackground,

    borderRadius: 5,
    paddingHorizontal: sizes.windowMargin,
    paddingVertical: sizes.windowMargin * 0.75
  }
});

export default Select;