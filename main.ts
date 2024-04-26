import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, ItemView, WorkspaceLeaf } from 'obsidian';

interface ContributionCalendarSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: ContributionCalendarSettings = {
	mySetting: 'default'
}

export default class ContributionCalendar extends Plugin {
	settings: ContributionCalendarSettings;

	async onload() {
		await this.loadSettings();
		
		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	
		this.registerView(
			CONTRIBUTION_CALENDAR_VIEW_TYPE,
			(leaf) => new ContributionCalendarView(leaf)
		);

		const ribbonIconEl = this.addRibbonIcon("dice", "Contribution Calendar", () => {
			this.activateView();
		})
		ribbonIconEl.addClass('contribution-calendar-ribbon-class');
	}

	onunload() {

	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(CONTRIBUTION_CALENDAR_VIEW_TYPE);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getRightLeaf(false);
			await leaf?.setViewState({
				type: CONTRIBUTION_CALENDAR_VIEW_TYPE,
				active: true
			});
		}

		if (leaf !== null) {
			workspace.revealLeaf(leaf);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

export const CONTRIBUTION_CALENDAR_VIEW_TYPE = "contributioncalendar-view";

export class ContributionCalendarView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return CONTRIBUTION_CALENDAR_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Contribution Calendar";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.createEl("h1", { text: "Contribution Calendar" });
	}

	async onClose() {
		// Nothing to do
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: ContributionCalendar;

	constructor(app: App, plugin: ContributionCalendar) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}