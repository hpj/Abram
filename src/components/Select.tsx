import React, { useState } from 'react';

import { StyleSheet, View, ScrollView, TextInput } from 'react-native';

import getTheme from '../colors';

import { sizes } from '../sizes';

import Button from './Button';

const colors = getTheme();

const Select = ({ initial, data, searchable, required, multiple, custom, onChange }: {
  initial?: string | string[],
  required?: boolean,
  searchable?: boolean,
  multiple?: number,
  custom?: string,
  data?: string[],
  onChange?: (value: string | string[]) => void
}): JSX.Element =>
{
  const max = multiple ?? 1;

  initial =
    max > 1 && initial ? initial as string[] :
      initial ? [ initial ] as string[]
        : [];

  const [ values, setValues ] = useState(initial);

  const [ active, setActive ] = useState(values.length <= 0 && !custom);

  const [ query, setQuery ] = useState('');

  let queryData = data ?? [];

  if (searchable)
    queryData = queryData.filter(s => !values.includes(s) && s.includes(query)).slice(0, 4);

  return <View>
    {
      !active ?
        <View style={ styles.wrap }>
          {
            values.map((item, i) =>
            {
              return <View key={ i } style={ styles.space }>
                <Button
                  text={ item }
                  useAlternative={ true }
                  textStyle={ styles.text }
                  buttonStyle={ { ...styles.option, ...styles.value } }
                  icon={ { name: 'x', size: sizes.icon * 0.65, color: colors.greyText, style: styles.icon } }
                  onPress={ () =>
                  {
                    values.splice(i, 1);

                    setValues(values);

                    if (values.length === 0 && !custom)
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
            values.length !== max ?
              <View style={ styles.space }>
                <Button
                  useAlternative={ true }
                  buttonStyle={ styles.multiple }
                  icon={ { name: 'plus', size: sizes.icon * 0.65, color: colors.whiteText } }
                  onPress={ () =>
                  {
                    setActive(true);
                  } }
                />
              </View>: undefined
          }
        </View>
        :
        <View>
          <ScrollView horizontal={ searchable } overScrollMode={ 'never' }>
            <View style={ !searchable ? styles.wrap : styles.row }>
              {
                (query || !searchable) && !custom?
                  queryData
                    .map((item, i) =>
                    {
                      return <View key={ i } style={ styles.space }>
                        <Button
                          text={ item }
                          textStyle={ styles.text }
                          buttonStyle={ styles.option }
                          onPress={ () =>
                          {
                            setActive(false);

                            values.push(item);
                            
                            setQuery('');

                            setValues(values);

                            onChange?.(max > 1 ? values : values[0]);
                          } }
                        />
                      </View>;
                    }) : undefined
              }
            </View>
          </ScrollView>

          {
            searchable ? <TextInput
              value={ query }
              autoFocus={ true }
              multiline={ false }
              style={ styles.input }
              placeholder={ 'Search' }
              placeholderTextColor={ colors.placeholder }
              onChangeText={ (s: string) => setQuery(s) }
              onSubmitEditing={ () => setActive(false) }
            /> :
              custom ? <TextInput
                value={ query }
                maxLength={ 265 }
                autoFocus={ true }
                multiline={ false }
                style={ styles.custom }
                placeholder={ custom }
                placeholderTextColor={ colors.placeholder }
                onChangeText={ (s: string) => setQuery(s) }
                onSubmitEditing={ () =>
                {
                  setActive(false);

                  if (query.length <= 0)
                    return;
                  
                  values.push(query);
                    
                  setQuery('');

                  setValues(values);

                  onChange?.(max > 1 ? values : values[0]);
                } }
              /> : undefined
          }
        </View>
    }
  </View>;
};

const styles = StyleSheet.create({
  value: {
    alignItems: 'center',
    flexDirection: 'row-reverse'
  },

  space: {
    marginRight: sizes.windowMargin * 0.75,
    marginBottom: sizes.windowMargin * 0.75
  },

  icon: {
    marginLeft: sizes.windowMargin * 0.75
  },

  input: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    color: colors.greyText
  },

  text: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: colors.whiteText
  },

  custom: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.whiteText
  },

  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },

  row: {
    flexDirection: 'row'
  },

  multiple: {
    flex: 1,

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