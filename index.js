import React, { Component } from 'react'
import { View, Text } from 'react-native'
import initials from 'initials'

// Copied from https://stackoverflow.com/a/1026087
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

class TextAvatar extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    let {
        children,
        size = 60,
        backgroundColor = '#333',
        textColor = '#fff',
        type,
        style
    } = this.props

    if (typeof children !== 'string') throw new Error('Children must be only a string \n Ex: Technology')
    let abbr = initials(capitalizeFirstLetter(children))

    if (typeof size !== 'number') throw new Error('Size must be an integer')

    let containerStyle = {
        width: size,
        height: size,
        backgroundColor: backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    }
    let textStyle = {
      color: textColor,
      fontSize: size / 3.14,
      fontWeight: 'bold',
      letterSpacing: 1
  }

    // Hexagon style inspired from https://codedaily.io/tutorials/22/The-Shapes-of-React-Native
    let hexagon = {
      height: size / 2
    }

    let hexagonAfter = {
      position: 'absolute',
      bottom: - size / 3,
      left: 0,
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderLeftWidth: size / 2,
      borderLeftColor: 'transparent',
      borderRightWidth: size / 2,
      borderRightColor: 'transparent',
      borderTopWidth: size / 3,
      borderTopColor: backgroundColor
    }
    let  hexagonBefore = {
      position: 'absolute',
      top: -size / 3,
      left: 0,
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderLeftWidth: size / 2,
      borderLeftColor: 'transparent',
      borderRightWidth: size / 2,
      borderRightColor: 'transparent',
      borderBottomWidth: size / 3,
      borderBottomColor: backgroundColor
    }
    if (type == 'circle'){
      containerStyle.borderRadius = size / 2
      return (
        <View style={[ style , containerStyle]}>
          <Text style={textStyle} 
          adjustsFontSizeToFit={true}>{abbr}</Text>
        </View>
      );
    }
    else if(type == 'hexagon'){
      return (
         <View style={[ style, containerStyle, hexagon ]}>
          <View style={hexagonBefore} />
          <View style={hexagonAfter} />   
          <Text style={textStyle}>{abbr}</Text>
        </View>
      );
    } 
    else {
      return (
        <View style={[ style , containerStyle]}>
          <Text style={textStyle} 
          adjustsFontSizeToFit={true}>{abbr}</Text>
        </View>
      );
    }
  }
}

export default TextAvatar;
