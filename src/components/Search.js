import React from 'react';

import { StyleSheet, View } from 'react-native';

import Button from './Button.js';

import { getStore } from '../store.js';

import getTheme from '../colors.js';

/**
* @type { import('../store.js').default }
*/
let store;

const colors = getTheme();

class Search extends React.Component
{
  constructor()
  {
    super();

    // get store
    store = getStore('app');

    this.state = {
      maximized: false,
      ...store.mount(this)
    };

    // bind functions to use as callbacks

    this.minimizeSearch = this.minimizeSearch.bind(this);
    this.maximizeSearch = this.maximizeSearch.bind(this);
  }
  
  componentDidMount()
  {
    store.subscribe(this);
  }

  componentWillUnmount()
  {
    store.unsubscribe(this);
  }

  minimizeSearch()
  {
    this.setState({
      maximized: false
    });
  }

  maximizeSearch()
  {
    this.setState({
      maximized: true
    });
  }

  render()
  {
    return (
      <View style={ styles.container }>

        <View style={ styles.controlBackground }/>

        <Button
          testID={ 'tb-search-maximize' }
          buttonStyle={ styles.control }
          icon={ { name: 'search', size: 24, color: colors.whiteText } }
        />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'purple',

    minWidth: 38,
    height: 38,

    marginLeft: 15,
    marginRight: 15
  },

  control: {
    alignItems: 'center',
    justifyContent: 'center',

    width: 38,
    height: 38
  },

  controlBackground: {
    position: 'absolute',

    backgroundColor: colors.roundIconBackground,
    
    width: 38,
    height: 38,
    borderRadius: 38
  }
});

export default Search;
