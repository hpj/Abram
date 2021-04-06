import React from 'react';

import { StyleSheet, View, Image, Text, TextInput, Switch } from 'react-native';

import { countries, languages } from 'countries-list';

import type { Profile } from '../types';

import { getStore } from '../store';

import getTheme from '../colors';

import { sizes } from '../sizes';

import Button from './Button';

import InfoBox from './InfoBox';

import NumberPicker from './NumberPicker';

import Select from './Select';

const colors = getTheme();

interface BaseEditsProps {
  profile: Profile,
  deactivate?: (() => void)
}

interface BaseEditsState {
  loading: boolean,
  current: Profile
}

export class BaseEdits<P> extends React.Component<P & BaseEditsProps, BaseEditsState>
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
      }, () =>
      {
        // deactivate the edit popup
        this.props.deactivate?.();
  
        // await deactivation animation
        setTimeout(() =>
        {
          this.setState({
            loading: false
          });
        }, 200);
      });
    }, 1000);
  }

  render(title?: string, children?: React.ReactNode): JSX.Element
  {
    const { loading } = this.state;

    if (!loading)
    {
      return <View style={ styles.section }>
        <Text style={ styles.title }>{ title }</Text>

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
    this.setState({
      current: {
        ...this.state.current,
        bio: text
      }
    });
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
    this.setState({
      current: {
        ...this.state.current,
        [obj]: text
      }
    });
  }

  render(): JSX.Element
  {
    const { current } = this.state;

    return super.render('Choose Your Titles', <View>
      <TextInput
        testID={ 'in-display' }
        autoCompleteType={ 'name' }
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
        autoCompleteType={ 'username' }
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

export class SimpleDemographicEdits extends BaseEdits<{
  title: string,
  placeholder: string,
  field: keyof Profile['info']
} & BaseEditsProps>
{
  onChange(text: string): void
  {
    const { field } = this.props;

    this.setState({
      current: {
        ...this.state.current,
        info: {
          ...this.state.current.info,
          [field]: text
        }
      }
    });
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
      onChangeText={ (s: string) => this.onChange(s) }
      placeholderTextColor={ colors.placeholder }
      placeholder={ placeholder }
      maxLength={ 24 }
    />);
  }
}

export class RomanticEdits<P> extends BaseEdits<P & BaseEditsProps>
{
  onChange(state: Profile['info']['romantically']): void
  {
    this.setState({
      current: {
        ...this.state.current,
        info: {
          ...this.state.current.info,
          romantically: state
        }
      }
    });
  }

  render(): JSX.Element
  {
    const enabled = this.state.current?.info.romantically === 'Open';

    return super.render('Choose Your Romantic Availability', <View>
      <InfoBox style={ { marginBottom: sizes.windowMargin * 0.5 } } fontSize={ 11 } text={ 'While being Romantically Closed, Reporting any user for flirting will result in their account getting terminated.' }/>

      <View style={ styles.switch }>
        <Text style={ {
          ...styles.switchText,
          color: enabled ? colors.whiteText : colors.placeholder
        } }>{ this.state.current?.info.romantically }</Text>

        <Switch
          style={ styles.switch }
          trackColor={ { false: colors.menuBackground, true: colors.menuBackground } }
          thumbColor={ enabled ? colors.whiteText : colors.placeholder }
          onValueChange={ (value) => this.onChange(value ? 'Open' : 'Closed') }
          value={ enabled }
        />
      </View>
    </View>);
  }
}

export class OriginEdits<P> extends BaseEdits<P & BaseEditsProps>
{
  data: string[] = Object.values(countries).map(c => c.name);

  onChange(text: string): void
  {
    this.setState({
      current: {
        ...this.state.current,
        info: {
          ...this.state.current.info,
          origin: text
        }
      }
    });
  }

  render(): JSX.Element
  {
    const { current } = this.state;

    return super.render('The Origin of Your Traditions and Culture',
      <Select
        data={ this.data }
        initial={ current.info.origin }
        searchable={ true }
        onChange={ (s) => this.onChange(s as string) }
      />);
  }
}

export class AgeEdits<P> extends BaseEdits<P & BaseEditsProps>
{
  daysRef: React.RefObject<NumberPicker>;

  constructor(props: P & BaseEditsProps)
  {
    super(props);

    this.daysRef = React.createRef();

    this.state = {
      ...this.state
    };
  }

  onChange(type: 'year' | 'month' | 'day', n: number): void
  {
    const { current } = this.state;

    this.setState({
      current: {
        ...current,
        info: {
          ...current.info,
          birthday: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            year: current.info.birthday?.year ?? undefined,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            month: current.info.birthday?.month ?? undefined,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            day: current.info.birthday?.day ?? undefined,

            [type]: n
          }
        }
      }
    });
  }

  render(): JSX.Element
  {
    const { current } = this.state;

    const now = new Date();
    const maxDays = new Date(current.info.birthday?.year ?? now.getFullYear(), current.info.birthday?.month ?? now.getMonth(), 0).getDate();

    return super.render('Change Your Birthday', <View>
      <NumberPicker
        min={ 1 }
        max={ now.getFullYear() }
        initial={ now.getFullYear() }
        placeholder={ 'Year' }
        onChange={ (n) => this.onChange('year', n) }
      />

      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <View style={ {
        flexDirection: 'row',
        marginVertical: sizes.windowMargin * 0.65
      } }>
        <NumberPicker
          min={ 1 }
          max={ 12 }
          placeholder={ 'Mo' }
          onChange={
            (n) =>
            {
              this.onChange('month', n);

              if (this.daysRef.current?.state.value !== undefined)
                this.daysRef.current?.onPress(0, undefined, new Date(current.info.birthday?.year ?? now.getFullYear(), n, 0).getDate());
            }
          }
        />

        <View style={ { marginHorizontal: sizes.windowMargin * 0.5 } }/>

        <NumberPicker ref={ this.daysRef }
          min={ 1 }
          max={ maxDays }
          placeholder={ 'Da' }
          onChange={ (n) => this.onChange('day', n) }
        />
      </View>
    </View>);
  }
}

export class SimpleSelectEdits extends BaseEdits<{
  title: string,
  field: keyof Profile['info'],
  required?: boolean,
  data: string[]
} & BaseEditsProps>
{
  onChange(text: string): void
  {
    const { field } = this.props;

    this.setState({
      current: {
        ...this.state.current,
        info: {
          ...this.state.current.info,
          [field]: text
        }
      }
    });
  }

  render(): JSX.Element
  {
    const { title, field, required, data } = this.props;

    const { current } = this.state;

    return super.render(title,
      <Select
        data={ data }
        required={ required }
        // eslint-disable-next-line security/detect-object-injection
        initial={ current?.info[field] as string ?? ''  }
        onChange={ (s) => this.onChange(s as string) }
      />);
  }
}

export class SpeaksEdits<P> extends BaseEdits<P & BaseEditsProps>
{
  data: string[] = Object.values(languages).map(l => l.name);

  onChange(values: string[]): void
  {
    this.setState({
      current: {
        ...this.state.current,
        info: {
          ...this.state.current.info,
          speaks: values
        }
      }
    });
  }

  render(): JSX.Element
  {
    const { current } = this.state;

    return super.render('The Bunch Of Languages You Speak',
      <Select
        data={ this.data }
        initial={ current.info.speaks }
        multiple={ 3 }
        searchable={ true }
        onChange={ (s) => this.onChange(s as string[]) }
      />);
  }
}

const styles = StyleSheet.create({
  section: {
    margin: sizes.windowMargin
  },

  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: colors.blackBackground,

    width: '100%',
    height: '100%'
  },

  loader: {
    width: 250,
    height: 250
  },

  title: {
    fontSize: 12,
    color: colors.greyText,
    fontWeight: 'bold',

    textTransform: 'uppercase',
    marginBottom: sizes.windowMargin * 0.5
  },

  switch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: sizes.windowMargin * 1.25,
    marginRight: sizes.windowMargin * 0.5,
    marginVertical: sizes.windowMargin * 0.25
  },

  switchText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },

  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',

    marginTop: sizes.windowMargin * 0.25
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