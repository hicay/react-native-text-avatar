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

    if (type == 'circle') containerStyle.borderRadius = size / 2

    return (
      <View style={[ style , containerStyle]}>
        <Text style={textStyle} 
        adjustsFontSizeToFit={true}>{abbr}</Text>
      </View>
    );
  }
}

export default TextAvatar;
