import React from 'react';

// import PropTypes from 'prop-types';

import { StyleSheet, View } from 'react-native';

import Piece from './Piece.js';

// import getTheme from '../colors.js';

// const colors = getTheme();

class Avatar extends React.Component
{
  render()
  {
    return (
      <View>
        {/* <Piece pieceType='mouth' pieceSize='100' mouthType='Eating'/> */}
        
        <Piece pieceType='eyes' pieceSize='200' eyeType='Dizzy'/>

        {/* <Piece pieceType='eyebrows' pieceSize='100' eyebrowType='RaisedExcited'/> */}

        {/* <Piece pieceType='accessories' pieceSize='100' accessoriesType='Round'/> */}

        {/* <Piece pieceType='top' pieceSize='100' topType='LongHairFro' hairColor='Red'/> */}

        {/* <Piece pieceType='facialHair' pieceSize='100' facialHairType='BeardMajestic'/> */}

        {/* <Piece pieceType='clothe' pieceSize='100' clotheType='Hoodie' clotheColor='Red'/> */}

        {/* <Piece pieceType='graphics' pieceSize='100' graphicType='Skull' /> */}

        {/* <Piece pieceType='skin' pieceSize='100' skinColor='Brown' /> */}
      </View>
    );
  }
}

// Avatar.propTypes = {};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: colors.whiteBackground
//   }
// });

export default Avatar;
