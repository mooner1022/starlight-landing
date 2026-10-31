// The SDK release shown on the docs' SDK page.
// Downloads aren't hosted yet, so every `url` is null and the page shows the cards as a preview.

export interface SdkArtifact {
	id: 'plugincore' | 'configdsl';
	name: string;
	file: string;
	url: string | null;
}

export const SDK_RELEASE = {
	version: '1.0.0',
	date: '2026-10-30',
	/** PluginCore 1.0.0 is only on StarLight's nightly branch so far; StarLight 0.3.4b ships 0.3.2. */
	channel: 'nightly' as const,
	artifacts: [
		{ id: 'plugincore', name: 'PluginCore', file: 'PluginCore-release.aar', url: null },
		{ id: 'configdsl', name: 'ConfigDSL', file: 'ConfigDSL-release.aar', url: null }
	] satisfies SdkArtifact[]
};

export const SDK_BUILD_COMMAND = './gradlew :PluginCore:assembleRelease :ConfigDSL:assembleRelease';
