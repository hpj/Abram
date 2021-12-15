import { ExpoConfig } from '@expo/config';

import { withPlugins } from '@expo/config-plugins';

export default ({ config }: { config: ExpoConfig }): ExpoConfig => withPlugins(config, [
]);