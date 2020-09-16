import React from 'react';

import { StyleSheet, View } from 'react-native';

import type { Profile, InboxEntry } from '../types';

import Button from './Button';

import { StoreComponent } from '../store';

import { sizes } from '../sizes';

import getTheme from '../colors';

const colors = getTheme();

class BottomNavigation extends StoreComponent<unknown, {
  profile: Profile,
  activeChat: InboxEntry[],
  inbox: InboxEntry[],
  index: number
}>
{
  constructor()
  {
    super();

    this.stateWillChange(this.state);
  }

  inboxBadge = false;
  discoverBadge = false;

  stateWillChange({ profile, inbox }: BottomNavigation['state']): void
  {
    // turn badge on if inbox has any entries with unanswered messages
    this.inboxBadge = inbox.some(entry => entry.messages[entry.messages.length - 1].owner !== profile.uuid);
  }

  stateWhitelist(changes: BottomNavigation['state']): boolean
  {
    if (
      changes.profile ||
      changes.activeChat ||
      changes.inbox ||
      changes.index
    )
      return true;

    return false;
  }

  setIndex(value: number): void
  {
    this.store.set({
      index: value
    });
  }

  render(): JSX.Element
  {
    return (
      <View style={ styles.container }>
        <Button
          testID={ 'bn-inbox' }
          badgeStyle={ this.inboxBadge ? styles.badge : undefined }
          backgroundStyle={  (this.state.index === 0) ? styles.background : styles.backgroundInactive }
          borderless={ true }
          buttonStyle={ styles.entry }
          icon={ { name: 'inbox', size: sizes.icon, color: (this.state.index === 0) ? colors.whiteText : colors.inactiveWhiteText } }
          onPress={ () => this.setIndex(0) }
        />

        <Button
          testID={ 'bn-discover' }
          badgeStyle={ this.discoverBadge ? styles.badge : undefined }
          backgroundStyle={  (this.state.index === 1) ? styles.background : styles.backgroundInactive }
          borderless={ true }
          buttonStyle={ styles.entry }
          icon={ { name: 'compass', size: sizes.icon, color: (this.state.index === 1) ? colors.whiteText : colors.inactiveWhiteText } }
          onPress={ () => this.setIndex(1) }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: sizes.navigationBar,

    flexDirection: 'row',
    justifyContent: 'center',

    backgroundColor: colors.blackBackground
  },

  badge: {
    backgroundColor: colors.whiteText,

    width: sizes.badge,
    height: sizes.badge,

    borderRadius: sizes.badge
  },

  background: {
    position: 'absolute',
    alignItems: 'flex-end',

    backgroundColor: colors.iconBackground,
    
    width: sizes.navigationBarButton,
    height: sizes.navigationBarButton,
    borderRadius: sizes.navigationBarButton
  },

  backgroundInactive: {
    position: 'absolute',
    alignItems: 'flex-end',

    backgroundColor: colors.iconBackgroundInactive,
    
    width: sizes.navigationBarButton,
    height: sizes.navigationBarButton,
    borderRadius: sizes.navigationBarButton
  },

  entry: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    minWidth: 80,
    maxWidth: 168
  }
});

export default BottomNavigation;