import React from 'react';

import { StyleSheet, View, Text } from 'react-native';

import getTheme from '../colors.js';

const colors = getTheme();

class Discover extends React.Component
{
  render()
  {
    return (
      <View tint='dark' intensity={ 50 } style={ styles.container }>
        <Text style={ {
          color: 'orange',
          fontSize: 22,
          transform: [
            { rotateZ: '120deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'red',
          fontSize: 22,
          transform: [
            { rotateZ: '90deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'crimson',
          fontSize: 22,
          transform: [
            { rotateZ: '180deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'blue',
          fontSize: 22,
          transform: [
            { rotateZ: '50deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'red',
          fontSize: 22,
          transform: [
            { rotateZ: '120deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'lime',
          fontSize: 22,
          transform: [
            { rotateZ: '90deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'purple',
          fontSize: 22,
          transform: [
            { rotateZ: '180deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'blue',
          fontSize: 22,
          transform: [
            { rotateZ: '50deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'orange',
          fontSize: 22,
          transform: [
            { rotateZ: '120deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'yellow',
          fontSize: 22,
          transform: [
            { rotateZ: '90deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'red',
          fontSize: 22,
          transform: [
            { rotateZ: '180deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'lime',
          fontSize: 22,
          transform: [
            { rotateZ: '50deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'lime',
          fontSize: 22,
          transform: [
            { rotateZ: '120deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'white',
          fontSize: 22,
          transform: [
            { rotateZ: '90deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'purple',
          fontSize: 22,
          transform: [
            { rotateZ: '180deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'lime',
          fontSize: 22,
          transform: [
            { rotateZ: '50deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'red',
          fontSize: 22,
          transform: [
            { rotateZ: '120deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'lime',
          fontSize: 22,
          transform: [
            { rotateZ: '90deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'red',
          fontSize: 22,
          transform: [
            { rotateZ: '180deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'orange',
          fontSize: 22,
          transform: [
            { rotateZ: '50deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
        <Text style={ {
          color: 'lime',
          fontSize: 22,
          transform: [
            { rotateZ: '120deg' }
          ]
        } }>{ 'P.J.S.y.c.a.c' }
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.blackBackground,

    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default Discover;
