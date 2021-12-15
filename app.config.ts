/* eslint-disable @typescript-eslint/ban-ts-comment */

import { ExpoConfig } from '@expo/config';

import { ensureDir, writeFile } from 'fs-extra';

import { withPlugins, withAndroidManifest, withAppBuildGradle, withSettingsGradle, withDangerousMod } from '@expo/config-plugins';

import type { ConfigPlugin } from '@expo/config-plugins';

const insert = (text: string, target: string, value: string) =>
{
  if (!text.includes(target))
    throw new Error(`the text provided doesn't include the target: "${target}"`);

  return text.replace(target, target + value);
};

const withAccountManagerBuildGradle: ConfigPlugin = config =>
{
  return withAppBuildGradle(config, async config =>
  {
    config.modResults.contents = insert(config.modResults.contents, 'dependencies {', 'implementation project(\':react-native-account-manager\')');
      
    return config;
  });
};

const withAccountManagerSettingsGradle: ConfigPlugin = config =>
{
  return withSettingsGradle(config, async config =>
  {
    config.modResults.contents += 'include \':react-native-account-manager\'\n';
    config.modResults.contents += 'project(\':react-native-account-manager\').projectDir = new File(rootProject.projectDir, \'../node_modules/react-native-account-manager/android\')\n';
      
    return config;
  });
};

const withAccountManagerAndroidManifest: ConfigPlugin = config =>
{
  return withAndroidManifest(config, async config =>
  {
    const { application: [ application ], 'uses-permission': permission } = config.modResults.manifest;

    if (!application.service)
      application.service = [];

    permission.push({
      $: {
        'android:name': 'android.permission.MANAGE_ACCOUNTS'
      }
    });

    permission.push({
      $: {
        'android:name': 'android.permission.AUTHENTICATE_ACCOUNTS'
      }
    });

    permission.push({
      $: {
        'android:name': 'android.permission.GET_ACCOUNTS'
      }
    });

    permission.push({
      $: {
        'android:name': 'android.permission.USE_CREDENTIALS'
      }
    });

    application.service.push({
      $: {
        'android:name': 'com.gointegro.accountmanager.AuthenticatorService'
      },
      //@ts-ignore
      'meta-data': {
        $: {
          'android:resource': '@xml/authenticator',
          'android:name': 'android.accounts.AccountAuthenticator'
        }
      },
      'intent-filter': [ {
        action: [ {
          $: {
            'android:name': 'android.accounts.AccountAuthenticator'
          }
        } ]
      } ]
    });

    return config;
  });
};

const withAccountManagerAuthenticatorXML: ConfigPlugin = config =>
{
  return withDangerousMod(config, [
    'android',
    async config =>
    {
      const dir = config.modRequest.platformProjectRoot + '/app/src/main/res/xml';

      await ensureDir(dir);

      await writeFile(dir + '/authenticator.xml', `<?xml version="1.0" encoding="utf-8"?>
      <account-authenticator
          xmlns:android="http://schemas.android.com/apk/res/android"
          android:accountType="${config.android.package}"
          android:icon="@mipmap/ic_launcher_round"
          android:smallIcon="@mipmap/ic_launcher_round"
          android:label="@string/app_name"/>`);

      return config;
    }
  ]);
};

// const withAccountManagerMainApplication: ConfigPlugin = config =>
// {
//   return withMainApplication(config, async config =>
//   {
//     config.modResults.contents = insert(config.modResults.contents, 'package me.hpj.abram;', 'import com.gointegro.accountmanager.AccountManagerPackage;');
//     config.modResults.contents = insert(config.modResults.contents, 'List<ReactPackage> packages = new PackageList(this).getPackages();', 'packages.add(new AccountManagerPackage());');
      
//     return config;
//   });
// };

export default ({ config }: { config: ExpoConfig }): ExpoConfig => withPlugins(config, [
  withAccountManagerBuildGradle,
  withAccountManagerSettingsGradle,
  withAccountManagerAndroidManifest,
  withAccountManagerAuthenticatorXML
  // withAccountManagerMainApplication
]);