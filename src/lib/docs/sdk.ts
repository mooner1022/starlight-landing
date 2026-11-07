// The SDK release shown on the docs' SDK page.
// Downloads aren't hosted yet, so every `url` is null and the page shows the cards as a preview.

export interface SdkArtifact {
	id: 'plugincore' | 'configdsl';
	name: string;
	file: string;
	url: string | null;
}

export const SDK_RELEASE = {
	version: '1.1.0',
	date: '2026-11-07',
	/** PluginCore 1.1.0 is a preview on StarLight's nightly branch; the released StarLight 1.0.1 ships 1.0.1. */
	channel: 'nightly' as const,
	artifacts: [
		{ id: 'plugincore', name: 'PluginCore', file: 'PluginCore-release.aar', url: null },
		{ id: 'configdsl', name: 'ConfigDSL', file: 'ConfigDSL-release.aar', url: null }
	] satisfies SdkArtifact[]
};

export const SDK_BUILD_COMMAND = './gradlew :PluginCore:assembleRelease :ConfigDSL:assembleRelease';
