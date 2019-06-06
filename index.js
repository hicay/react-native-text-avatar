import React, { Component } from 'react'
import { View, Text } from 'react-native'
import initials from 'initials'

// Cpoied from https://stackoverflow.com/a/1026087
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

    let text = {
      paddingTop:size/4,
      textAlign: 'center',
      fontWeight: 'bold',
      backgroundColor:backgroundColor,
      color:textColor
    }
    // Hexagon style copied from https://codedaily.io/tutorials/22/The-Shapes-of-React-Native
    let hexagon = {
      width: size*2,
      height: size+5
    }

    let hexagonInner = {
      flex:1,
      width: size*2,
      height: size,
      backgroundColor: backgroundColor
    }

    let hexagonAfter = {
      position: 'absolute',
      bottom: -size/2,
      left: 0,
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderLeftWidth: size,
      borderLeftColor: 'transparent',
      borderRightWidth: size,
      borderRightColor: 'transparent',
      borderTopWidth: size/2,
      borderTopColor: backgroundColor
    }
    let  hexagonBefore = {
      position: 'absolute',
      top: -size/2,
      left: 0,
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderLeftWidth: size,
      borderLeftColor: 'transparent',
      borderRightWidth: size,
      borderRightColor: 'transparent',
      borderBottomWidth: size/2,
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
         <View style={hexagon}>
          <Text style={text}>{abbr}</Text>
          <View style={hexagonInner} />  
          <View style={hexagonBefore} />
          <View style={hexagonAfter} />   
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
