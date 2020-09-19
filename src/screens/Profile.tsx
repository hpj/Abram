import React from 'react';

import { StyleSheet, View } from 'react-native';

import getTheme from '../colors';

const colors = getTheme();

class Profile extends React.Component
{
  render(): JSX.Element
  {
    return (
      <View style={ styles.container }>
        
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

export default Profile;
