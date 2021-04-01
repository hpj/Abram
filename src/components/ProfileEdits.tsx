import React from 'react';

import { StyleSheet, View, Image, Text, TextInput } from 'react-native';

import { Feather as Icon } from '@expo/vector-icons';

import type { Profile } from '../types';

import { getStore } from '../store';

import getTheme from '../colors';

import { sizes } from '../sizes';

import Button from './Button';

const colors = getTheme();

interface BaseEditsProps {
  profile: Profile,
  deactivate?: (() => void)
}

// eslint-disable-next-line @typescript-eslint/ban-types
export class BaseEdits<P> extends React.Component<P & BaseEditsProps, {
  loading: boolean,
  current: Profile
}>
{
  constructor(props: P & BaseEditsProps)
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
      // update the profile in store
      getStore().set({
        profile: this.state.current,
        focusedProfile: this.state.current
      });

      // deactivate the edit popup
      this.props.deactivate?.();

      // await deactivation animation
      setTimeout(() =>
      {
        this.setState({
          loading: false
        });
      }, 200);
    }, 1000);
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
                text={ 'Save' }
                borderless={ true }
                useAlternative={ true }
                buttonStyle={ styles.button }
                textStyle={ styles.buttonText }
                onPress={ this.onApply }
              />

              <Button
                text={ 'Cancel' }
                borderless={ true }
                useAlternative={ true }
                buttonStyle={ styles.button }
                textStyle={ styles.buttonText }
                onPress={ this.props.deactivate }
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

export class BioEdits<P> extends BaseEdits<P & BaseEditsProps>
{
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
      onChangeText={ (s: string) => this.onChange(s) }
      placeholderTextColor={ colors.placeholder }
      placeholder={ 'Bio' }
      maxLength={ 255 }
    />);
  }
}

export class AvatarEdits<P> extends BaseEdits<P & BaseEditsProps>
{
  render(): JSX.Element
  {
    return super.render('Choose Your Avatar');
  }
}

export class TitlesEdits<P> extends BaseEdits<P & BaseEditsProps>
{
  onChange(obj: string, text: string): void
  {
    this.setState({ current: {
      ...this.state.current,
      [obj]: text
    } });
  }

  render(): JSX.Element
  {
    const { current } = this.state;

    return super.render('Choose Your Titles', <View>
      <TextInput
        testID={ 'in-display' }
        style={ styles.input }
        multiline={ false }
        value={ current?.fullName }
        onChangeText={ (s: string) => this.onChange('fullName', s) }
        placeholderTextColor={ colors.placeholder }
        placeholder={ 'Full Name' }
        maxLength={ 64 }
      />

      <TextInput
        testID={ 'in-nickname' }
        style={ styles.input }
        multiline={ false }
        value={ current?.nickname }
        onChangeText={ (s: string) => this.onChange('nickname', s) }
        placeholderTextColor={ colors.placeholder }
        placeholder={ 'Nickname' }
        maxLength={ 32 }
      />
    </View>);
  }
}

export class RomanticEdits<P> extends BaseEdits<P & BaseEditsProps>
{
  onChange(obj: string, text: string): void
  {
    this.setState({ current: {
      ...this.state.current,
      info: {
        ...this.state.current.info,
        [obj]: text
      }
    } });
  }

  render(): JSX.Element
  {
    const current = this.state.current?.info.romantically;

    return super.render('Choose Your Romantic Availability', <View>
      <View style={ styles.infoBox }>
        <Icon name={ 'alert-triangle' } size={ sizes.icon * 0.75 } color={ colors.whiteText } style={ styles.icon }/>
        <Text style={ styles.text } >While being Romantically Closed, Reporting any user for flirting will result in their account getting terminated.</Text>
      </View>
      
      <View style={ styles.space }/>

      <Button
        text={ 'Open' }
        buttonStyle={ styles.toggle }
        icon={ current === 'Open' ? { name: 'check', size: sizes.icon * 0.65, color: colors.whiteText } : undefined }
        textStyle={ { ...styles.toggleText, color: current === 'Open' ? colors.whiteText : colors.greyText } }
        onPress={ () => this.onChange('romantically', 'Open') }
      />

      <Button
        text={ 'Closed' }
        buttonStyle={ styles.toggle }
        icon={ current === 'Closed' ? { name: 'check', size: sizes.icon * 0.65, color: colors.whiteText } : undefined }
        textStyle={ { ...styles.toggleText, color: current === 'Closed' ? colors.whiteText : colors.greyText } }
        onPress={ () => this.onChange('romantically', 'Closed') }
      />
    </View>);
  }
}

export class SimpleDemographicEdits extends BaseEdits<{
  title: string,
  placeholder: string,
  field: keyof Profile['info']
} & BaseEditsProps>
{
  onChange(field: string, text: string): void
  {
    this.setState({ current: {
      ...this.state.current,
      info: {
        ...this.state.current.info,
        [field]: text
      }
    } });
  }

  render(): JSX.Element
  {
    const { title, field, placeholder } = this.props;

    const { current } = this.state;

    return super.render(title, <TextInput
      testID={ `in-${field}` }
      style={ styles.input }
      multiline={ false }
      // eslint-disable-next-line security/detect-object-injection
      value={ `${current?.info[field] ?? ''}` }
      onChangeText={ (s: string) => this.onChange(field, s) }
      placeholderTextColor={ colors.placeholder }
      placeholder={ placeholder }
      maxLength={ 24 }
    />);
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
    width: 250,
    height: 250
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

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: colors.rectangleBackground,
    padding: sizes.windowMargin * 0.75,
    borderRadius: 5
  },

  text: {
    flex: 1,
    color: colors.whiteText,
    opacity: 0.65,

    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },

  icon: {
    opacity: 0.65,
    marginRight: sizes.windowMargin * 0.75
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