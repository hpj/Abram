import React from 'react';

import PropTypes from 'prop-types';

import { View, Text as NativeText } from 'react-native';

class Text extends React.Component
{
  render()
  {
    const { viewStyle, textStyle, text } = this.props;

    return (
      <View style={ viewStyle }>
        <NativeText style={ textStyle }>
          { text }
        </NativeText>
      </View>
    );
  }
}

Text.propTypes = {
  viewStyle: PropTypes.object,
  textStyle: PropTypes.object,
  text: PropTypes.string
};

export default Text;
