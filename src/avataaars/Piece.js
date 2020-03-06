import React from 'react';

import PropTypes from 'prop-types';

// import { StyleSheet, View, Image } from 'react-native';

import Svg from 'react-native-svg';

// import getTheme from '../colors.js';

// const colors = getTheme();

import Dizzy from './face/eyes/Dizzy.js';

class Piece extends React.Component
{
  render()
  {
    return (
      <Svg
        // style={ this.props.style }
        width={ this.props.pieceSize }
        height={ this.props.pieceSize }
        viewBox={ this.props.viewBox || '0 0 264 280' }
      >
        <Dizzy/>
        
        {/* { this.props.pieceType === 'top' && <Top/> } */}
        
        {/* { this.props.pieceType === 'clothe' && <Clothe/> } */}

        {/* { this.props.pieceType === 'graphics' && <Graphics maskID="1234"/> } */}

        {/* { this.props.pieceType === 'accessories' && <Accessories/> } */}

        {/* { this.props.pieceType === 'facialHair' && <FacialHair/> } */}

        {/* { this.props.pieceType === 'eyes' && <Eyes/> } */}

        {/* { this.props.pieceType === 'eyebrows' && <Eyebrows/> } */}

        {/* { this.props.pieceType === 'mouth' && <Mouth/> } */}

        {/* { this.props.pieceType === 'nose' && <Nose/> } */}

        {/* { this.props.pieceType === 'skin' && <Skin maskID="5678"/> } */}
      </Svg>
    );
  }
}

Piece.propTypes = {
  pieceSize: PropTypes.string,
  pieceType: PropTypes.string,
  style: PropTypes.object,
  viewBox: PropTypes.string
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: colors.whiteBackground
//   }
// });

export default Piece;
