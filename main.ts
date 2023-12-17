import { App, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { spawn } from 'child_process';

interface PythonScriptRunnerSettings {
	scriptPath: string;
}

const DEFAULT_SETTINGS: PythonScriptRunnerSettings = {
	scriptPath: ''
}

export default class PythonScriptRunnerPlugin extends Plugin {
	settings: PythonScriptRunnerSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'run-python-script',
			name: 'Run Python Script',
			callback: () => {
				this.runPythonScript();
			},
		});

		this.addRibbonIcon('play', 'Run Python Script', (evt: MouseEvent) => {
			this.runPythonScript();
		}).addClass('python-script-runner-ribbon-class');

		this.addSettingTab(new PythonScriptRunnerSettingTab(this.app, this));
	}

	onunload() { }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	runPythonScript() {
		if (this.settings.scriptPath.trim() === '') {
			new Notice('No Python script path set.');
			return;
		}

		console.log('Running Python script:', this.settings.scriptPath);

		const command = 'cmd.exe';
		const args = ['/C', 'start', 'cmd', '/K', `C:/Python311/python.exe "${this.settings.scriptPath}"`];

		console.log(`Running command: ${command} ${args.join(' ')}`);

		const process = spawn(command, args, { shell: true });

		process.on('error', (error) => {
			console.error('Error running Python script:', error);
			new Notice('Error running Python script.');
		});
	}
}

class PythonScriptRunnerSettingTab extends PluginSettingTab {
	plugin: PythonScriptRunnerPlugin;

	constructor(app: App, plugin: PythonScriptRunnerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Python Script Path')
			.setDesc('The path to the Python script you want to run.')
			.addText(text => text
				.setPlaceholder('Enter the full path to your script')
				.setValue(this.plugin.settings.scriptPath)
				.onChange(async (value) => {
					this.plugin.settings.scriptPath = value;
					await this.plugin.saveSettings();
				}));
	}
}
