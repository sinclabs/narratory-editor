// Script run within the webview itself.
(function () {

	// Get a reference to the VS Code webview api.
	// We use this API to post messages back to our extension.

	// @ts-ignore
	const vscode = acquireVsCodeApi();

	const editorContainer = <HTMLDivElement>document.querySelector('.editor');

	// const addButtonContainer = document.querySelector('.add-button');
	// addButtonContainer?.querySelector('button')?.addEventListener('click', () => {
	// 	vscode.postMessage({
	// 		type: 'add'
	// 	});
	// });

	const errorContainer = document.createElement('div');
	document.body.appendChild(errorContainer);
	errorContainer.className = 'error';
	errorContainer.style.display = 'none';

	/**
	 * Render the document in the webview.
	 */
	function updateContent(text: string) {
		let agent: Agent;
		try {
			agent = (JSON.parse(text));
		} catch {
			editorContainer.style.display = 'none';
			errorContainer.innerText = 'Error: Document is not valid json';
			errorContainer.style.display = '';
			return;
		}
		editorContainer.style.display = '';
		errorContainer.style.display = 'none';

		// Render the scratches
		editorContainer.innerHTML = '';
		
		const agentName = document.createElement('p');
		agentName.innerText = `Agent Name: ${agent.agentName}`;
		editorContainer.append(agentName);
		
		function isAbstractBotTurn(arg: any): arg is AbstractBotTurn {
			return arg;
		}

		agent.narrative.forEach(value => {
			const ele = document.createElement('div');
			if(isAbstractBotTurn(value)) {
				ele.innerText = value.label ? value.label : "";
				
			} else if (typeof value === 'string') {
				ele.innerText = value;
			} else {
				ele.innerText = value[0];
			}

			editorContainer.append(ele);
		});

		// for (const note of json.scratches || []) {
		// 	const element = document.createElement('div');
		// 	element.className = 'note';
		// 	editorContainer.appendChild(element);

		// 	const text = document.createElement('div');
		// 	text.className = 'text';
		// 	const textContent = document.createElement('span');
		// 	textContent.innerText = note.text;
		// 	text.appendChild(textContent);
		// 	element.appendChild(text);

		// 	const created = document.createElement('div');
		// 	created.className = 'created';
		// 	created.innerText = new Date(note.created).toUTCString();
		// 	element.appendChild(created);

		// 	const deleteButton = document.createElement('button');
		// 	deleteButton.className = 'delete-button';
		// 	deleteButton.addEventListener('click', () => {
		// 		vscode.postMessage({ type: 'delete', id: note.id, });
		// 	});
		// 	element.appendChild(deleteButton);
		// }
	}

	// Handle messages sent from the extension to the webview
	window.addEventListener('message', event => {
		const message = event.data; // The json data that the extension sent
		switch (message.type) {
			case 'update':
				const text = message.text;

				// Update our webview's content
				updateContent(text);

				// Then persist state information.
				// This state is returned in the call to `vscode.getState` below when a webview is reloaded.
				vscode.setState({ text });

				return;
		}
	});

	// Webviews are normally torn down when not visible and re-created when they become visible again.
	// State lets us save information across these re-loads
	const state = vscode.getState();
	if (state) {
		updateContent(state.text);
	}
}());

// Interfaces ==> Index.ts
interface Agent {
	agentName: string
	language: Language
	narrative: Array<AbstractBotTurn | string | string[]>
	userInitiatives?: Array<UserTurn>
	botInitiatives?: Array<AbstractBotTurn>
	bridges?: string[] | BotTurn[]
	defaultFallbacks?: string[]
	narratoryKey: string
	googleCredentials: GoogleCredentials
	maxMessagesPerTurn?: 1 | 2
	allowGateway?: boolean
	skipQueryRepeat?: boolean
	logWebhook?: string
	logLevel?: "NONE" | "FALLBACKS" | "ALL"
}

interface GoogleCredentials {
	project_id: string
	private_key: string
	client_email: string
	[key: string]: any
}

interface Enum {
	name: string
	alts?: string[]
}

interface AbstractEntity {
	name: string
	default?: string
}

interface Entity extends AbstractEntity {
	enums: Enum[]
}

interface DynamicEntity extends Entity {
	url: string
	type: "BUILD" | "SESSION" | "TURN"
}

interface SystemEntity extends AbstractEntity {
	category: string
	description: string
	returns: string
	default: string
}

interface Intent {
	name?: string
	entities?: EntityMap
	examples: string[]
	priority?: number
	noEntityReset?: boolean
}

type EntityMap = {
	[key: string]: AbstractEntity | Entity | SystemEntity
};

interface UserTurn {
	id?: string
	intent: string[] | Intent
	bot:
	| BotTurn
	| DynamicBotTurn
	| OrderTurn
	| BridgeTurn
	| string
	| Array<BotTurn | DynamicBotTurn | OrderTurn | BridgeTurn | string>
}

interface Order {
	type: string
	confirmationText: string
	merchantName: string
	name: string
	description: string
}

type ConditionMap = {
	[key: string]: boolean | string | string[] | number | ConditionMap | undefined
	NOT?: ConditionMap
	OR?: ConditionMap
	AND?: ConditionMap
};

type VariableMap = {
	[key: string]: string | boolean | number | object | Array<string | boolean | number | object>
};

interface RichSay {
	text: string | string[]
	ssml?: string | string[]
	cond?: ConditionMap
	suggestions?: string[]
	content?: Content | any
	//| BasicCard | Image | BrowseCarousel | MediaObject | Table | List | Carousel
}

interface AbstractBotTurn {
	id?: string
	say?: string | RichSay | Array<string | RichSay>
	repair?: boolean | "PARENT"
	label?: string
	goto?: string
	cond?: ConditionMap
	set?: VariableMap
	expectShortAnswer?: boolean
}

interface BotTurn extends AbstractBotTurn {
	say: string | RichSay | Array<string | RichSay>
	user?: UserTurn[]
}

interface BridgeTurn extends AbstractBotTurn {
	url?: string
	params?: string[]
	bot:
	| BotTurn
	| DynamicBotTurn
	| OrderTurn
	| BridgeTurn
	| string
	| Array<BotTurn | DynamicBotTurn | OrderTurn | BridgeTurn | string>
	asyncWebhook?: boolean
}

interface DynamicBotTurn extends AbstractBotTurn {
	url: string
	user?: UserTurn[]
	params?: string[]
	asyncWebhook?: boolean
}

interface WebhookResponse {
	say?: string
	set?: VariableMap
}

interface OrderTurn extends AbstractBotTurn {
	orderType: "BOOK" | "RESERVE" | "BUY" | "PLACE_ORDER" | "PAY" | "SEND" | "RESERVE" | "SCHEDULE" | "SUBSCRIBE"
	name: string
	description: string
	imageUrl?: string
	merchantName?: string
	confirmationText: string
	onConfirmed: BotTurn | DynamicBotTurn
	onCancelled: BotTurn | DynamicBotTurn
}

function isOrderBotTurn(abstractTurn: AbstractBotTurn | BotTurn | DynamicBotTurn | OrderTurn | BridgeTurn) {
	return abstractTurn && (abstractTurn as OrderTurn).onConfirmed !== undefined;
}

function isDynamicBotTurn(abstractTurn: AbstractBotTurn | BotTurn | DynamicBotTurn | OrderTurn | BridgeTurn) {
	return (
		abstractTurn && (abstractTurn as DynamicBotTurn).url !== undefined && (abstractTurn as BridgeTurn).bot === undefined
	);
}

function isBridgeTurn(abstractTurn: AbstractBotTurn | BotTurn | DynamicBotTurn | OrderTurn | BridgeTurn) {
	return abstractTurn && (abstractTurn as BridgeTurn).bot !== undefined;
}

function isDynamicEntity(abstractEntity: AbstractEntity | Entity | DynamicEntity) {
	return abstractEntity && (abstractEntity as DynamicEntity).url !== undefined;
}

function isSystemEntity(abstractEntity: AbstractEntity | Entity | SystemEntity) {
	return abstractEntity && (abstractEntity as Entity).enums === undefined;
}

function turnHasWebhook(abstractTurn: AbstractBotTurn | BotTurn | DynamicBotTurn | OrderTurn | BridgeTurn) {
	return abstractTurn && (abstractTurn as DynamicBotTurn).url !== undefined;
}

interface LogTurn {
	id: string
	agentName: string
	userInput: string
	intentName: string
	parameters: { [key: string]: any }
	isFallback: boolean
	isEndOfConversation: boolean
	confidence: number
	botReplies: string[]
	timestamp: number
}

interface LogMessage {
	sessionId: string
	platform: string
	turn: LogTurn
	lastTurn?: LogTurn
	text: string
}

// Language.ts

enum Language {
	ChineseCantonese = "zh-HK",
	ChineseSimplified = "zh-CN",
	ChineseTraditional = "zh-TW",
	Danish = "da",
	Dutch = "nl",
	English = "en",
	EnglishAustralia = "en-AU",
	EnglishCanada = "en-CA",
	EnglishGreatBritain = "en-GB",
	EnglishIndia = "en-IN",
	EnglishUS = "en-US",
	French = "fr",
	FrenchCanada = "fr-CA",
	FrenchFrance = "fr-FR",
	German = "de",
	Hindi = "hi",
	Indonesian = "id",
	Italian = "it",
	Japanese = "ja",
	Korean = "ko",
	Norwegian = "no",
	Polish = "pl",
	PortugueseBrazil = "pt-BR",
	PortuguesePortugal = "pt",
	Russian = "ru",
	Spanish = "es",
	SpanishLatinAmerica = "es-419",
	SpanishSpain = "es-ES",
	Swedish = "sv",
	Thai = "th",
	Turkish = "tr",
	Ukranian = "uk",
}

// RichContent.ts

 class Content {
	type: string = "unknown";
}

// TODO: fix image any
 class Card extends Content {
	title: string;
	description?: string;
	subtitle?: string;
	image?: any;
	buttons?: Button[];
	type: string = "card";

	constructor({
		title,
		subtitle,
		description,
		image,
		buttons
	}: {
		title: string
		subtitle?: string
		description?: string
		image?: any
		buttons?: Button[]
	}) {
		super();
		this.title = title;
		this.subtitle = subtitle;
		this.description = description;
		this.image = image;
		this.buttons = buttons;
	}
}

 class Button extends Content {
	text: string;
	url: string;
	type: string = "button";

	constructor(text: string, url: string) {
		super();
		this.text = text;
		this.url = url;
	}
}

 class List extends Content {
	items: Item[];
	title?: string;
	image?: any;
	type: string = "list";

	constructor({ items, title, image }: { items: Item[]; title?: string; image?: any }) {
		super();
		this.items = items;
		this.title = title;
		this.image = image;
	}
}

 class CarouselSelect extends Content {
	items: Item[];
	type: string = "carousel";

	constructor(items: Item[]) {
		super();
		this.items = items;
	}
}

 class Item extends Content {
	title: string;
	url?: string;
	description?: string;
	image?: any;
	type: string = "item";

	constructor({
		url,
		title,
		description,
		image
	}: {
		title: string
		url?: string
		description?: string
		image?: any
	}) {
		super();
		this.url = url;
		this.title = title;
		this.description = description;
		this.image = image;
	}
}

/*
"info": {
	object (SelectItemInfo)
  },
  "title": string,
  "description": string,
  "image": {
	object (Image)
  }
  */
