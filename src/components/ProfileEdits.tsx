import React from 'react';

import { StyleSheet, View, Image, Text, TextInput } from 'react-native';

import type { Profile } from '../types';

import getTheme from '../colors';

import { sizes } from '../sizes';

import Button from './Button';

const colors = getTheme();

export class BaseEdits extends React.Component<{
  profile: Profile,
  deactivate?: (() => void)
}, {
  loading: boolean,
  current: Profile
}>
{
  constructor(props: BioEdits['props'])
  {
    super(props);

    this.state = {
      loading: false,
      current: props.profile
    };

    this.onApply = this.onApply.bind(this);
  }

  onApply(): void
  {
    this.setState({
      loading: true
    });

    // TODO change the code to actually send the apply request to the backend
    setTimeout(() =>
    {
      this.props.deactivate?.();

      // await deactivation animation
      setTimeout(() =>
      {
        this.setState({
          loading: false
        });
      }, 200);
    }, 2000);
  }

  render(title?: string, children?: React.ReactNode): JSX.Element
  {
    const { loading } = this.state;

    if (!loading)
    {
      return <View style={ styles.section }>
        <Text style={ styles.title }>{ title }</Text>

        <View style={ styles.space }/>

        {
          children
        }

        {
          !loading ?
            <View style={ styles.buttons }>
              <Button
                text={ 'Cancel' }
                borderless={ true }
                useAlternative={ true }
                buttonStyle={ styles.button }
                textStyle={ styles.buttonText }
                onPress={ this.props.deactivate }
              />

              <Button
                text={ 'Save' }
                borderless={ true }
                useAlternative={ true }
                buttonStyle={ styles.button }
                textStyle={ styles.buttonText }
                onPress={ this.onApply }
              />
            </View> : undefined
        }
      </View>;
    }
    else
    {
      return <View style={ styles.section }>
        <View style={ styles.loaderContainer }>
          <Image style={ styles.loader } source={ require('../../assets/loader.gif') }/>
        </View>
      </View>;
    }
  }
}

export class BioEdits extends BaseEdits
{
  constructor(props: BioEdits['props'])
  {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  onChange(text: string): void
  {
    this.setState({ current: {
      ...this.state.current,
      bio: text
    } });
  }

  render(): JSX.Element
  {
    const { current } = this.state;

    return super.render('Choose Your Bio', <TextInput
      testID={ 'in-bio' }
      style={ styles.input }
      multiline={ false }
      value={ current?.bio }
      onChangeText={ this.onChange }
      placeholderTextColor={ colors.placeholder }
      placeholder={ 'Bio' }
      maxLength={ 255 }
    />);
  }
}

export class AvatarEdits extends BaseEdits
{
  render(): JSX.Element
  {
    return super.render('Choose Your Avatar');
  }
}

export class RomanticEdits extends BaseEdits
{
  onChange(romantically: BaseEdits['props']['profile']['info']['romantically']): void
  {
    this.setState({ current: {
      ...this.state.current,
      info: {
        ...this.state.current.info,
        romantically
      }
    } });
  }

  render(): JSX.Element
  {
    const current = this.state.current?.info.romantically;

    return super.render('wChoose Your Romantic Availability', <View>
      <Text style={ styles.text }>
        <Text>While being </Text>
        <Text style={ { color: colors.whiteText } }>Romantically Closed, </Text>
        <Text>Reporting any user for flirting will result in their account getting terminated.</Text>
      </Text>
      
      <View style={ styles.space }/>

      <Button
        text={ 'Open' }
        buttonStyle={ styles.toggle }
        icon={ current === 'Open' ? { name: 'check', size: sizes.icon * 0.65, color: colors.whiteText } : undefined }
        textStyle={ { ...styles.toggleText, color: current === 'Open' ? colors.whiteText : colors.greyText } }
        onPress={ () => this.onChange('Open') }
      />

      <Button
        text={ 'Closed' }
        buttonStyle={ styles.toggle }
        icon={ current === 'Closed' ? { name: 'check', size: sizes.icon * 0.65, color: colors.whiteText } : undefined }
        textStyle={ { ...styles.toggleText, color: current === 'Closed' ? colors.whiteText : colors.greyText } }
        onPress={ () => this.onChange('Closed') }
      />
    </View>);
  }
}

const styles = StyleSheet.create({
  section: {
    margin: sizes.windowMargin
  },

  loaderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.blackBackground
  },

  loader: {
    width: 200,
    height: 200
  },

  title: {
    fontSize: 12,
    color: colors.greyText,
    fontWeight: 'bold',

    textTransform: 'uppercase'
  },

  space: {
    margin: sizes.windowMargin * 0.5
  },

  text: {
    fontSize: 12,
    color: colors.greyText,
    fontWeight: 'bold',

    marginVertical: sizes.windowMargin * 0.5
  },

  toggle: {
    flexDirection: 'row-reverse',
    alignItems: 'center',

    padding: sizes.windowMargin * 0.75
  },

  toggleText: {
    flexGrow: 1,
    fontSize: 14,
    fontWeight: 'bold'
  },

  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },

  button: {
    paddingHorizontal: sizes.windowMargin * 1.25,
    paddingVertical: sizes.windowMargin * 0.5
  },

  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.greyText
  },

  input: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.whiteText,

    paddingVertical: sizes.windowMargin * 0.25
  }
});