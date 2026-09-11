//#region node_modules/.nitro/vite/services/ssr/assets/import-BleDzmfj.js
var netflix = {
	provider: "Netflix",
	included: true
};
var max = {
	provider: "Max",
	included: true
};
var prime = {
	provider: "Prime Video",
	included: true
};
var disney = {
	provider: "Disney+",
	included: true
};
/** ISO 639-1. Anything not listed is English. */
var ORIGINAL = {
	parasite: "ko",
	"spirited-away": "ja",
	"howls-moving-castle": "ja",
	"portrait-of-a-lady-on-fire": "fr",
	"seven-samurai": "ja",
	oldboy: "ko"
};
var LANGUAGE_LABEL = {
	en: "English",
	ko: "Korean",
	ja: "Japanese",
	fr: "French"
};
function film(m) {
	return {
		...m,
		language: ORIGINAL[m.id] ?? "en"
	};
}
var MOVIES = [
	film({
		id: "annihilation",
		slug: "annihilation",
		title: "Annihilation",
		year: 2018,
		runtimeMin: 115,
		certification: "R",
		genres: [
			"Science Fiction",
			"Horror",
			"Mystery"
		],
		themes: [
			"alien biology",
			"selfhood",
			"cosmic horror",
			"grief"
		],
		tones: [
			"cerebral",
			"atmospheric",
			"dread"
		],
		moods: [
			"uncanny",
			"quiet",
			"awe"
		],
		director: "Alex Garland",
		writers: ["Alex Garland"],
		cast: [
			{
				name: "Natalie Portman",
				role: "Lena"
			},
			{
				name: "Jennifer Jason Leigh",
				role: "Ventress"
			},
			{
				name: "Tessa Thompson",
				role: "Josie"
			}
		],
		overview: "A biologist enters the Shimmer, a quarantined zone where nature rewrites itself. Cosmic horror as self-portrait.",
		quality: .86,
		popularity: .62,
		atmosphere: "shimmer",
		audience: "adult",
		similarIds: [
			"arrival",
			"prometheus",
			"ex-machina",
			"sunshine"
		],
		trailerYoutubeId: "89OP78l9oF0",
		watch: [netflix, prime]
	}),
	film({
		id: "arrival",
		slug: "arrival",
		title: "Arrival",
		year: 2016,
		runtimeMin: 116,
		certification: "PG-13",
		genres: [
			"Science Fiction",
			"Drama",
			"Mystery"
		],
		themes: [
			"language",
			"time",
			"grief",
			"first contact"
		],
		tones: [
			"cerebral",
			"tender",
			"solemn"
		],
		moods: ["awe", "melancholy"],
		director: "Denis Villeneuve",
		writers: ["Eric Heisserer"],
		cast: [{
			name: "Amy Adams",
			role: "Louise Banks"
		}, {
			name: "Jeremy Renner",
			role: "Ian Donnelly"
		}],
		overview: "A linguist is asked to communicate with visitors. Time folds. Love is the cost of knowing.",
		quality: .92,
		popularity: .78,
		atmosphere: "fog",
		audience: "adult",
		similarIds: [
			"annihilation",
			"interstellar",
			"dune-part-two"
		],
		trailerYoutubeId: "tFMo3UJ4B4g",
		watch: [netflix, max]
	}),
	film({
		id: "dune-part-two",
		slug: "dune-part-two",
		title: "Dune: Part Two",
		year: 2024,
		runtimeMin: 166,
		certification: "PG-13",
		genres: [
			"Science Fiction",
			"Adventure",
			"Drama"
		],
		themes: [
			"power",
			"prophecy",
			"ecology",
			"faith"
		],
		tones: [
			"epic",
			"operatic",
			"solemn"
		],
		moods: ["awe", "intense"],
		director: "Denis Villeneuve",
		writers: ["Denis Villeneuve", "Jon Spaihts"],
		cast: [
			{
				name: "Timothée Chalamet",
				role: "Paul Atreides"
			},
			{
				name: "Zendaya",
				role: "Chani"
			},
			{
				name: "Austin Butler",
				role: "Feyd-Rautha"
			}
		],
		overview: "Paul unites with the Fremen. A desert epic of prophecy and the price of becoming a myth.",
		quality: .91,
		popularity: .94,
		atmosphere: "dune",
		audience: "adult",
		similarIds: [
			"arrival",
			"blade-runner-2049",
			"lawrence"
		],
		trailerYoutubeId: "Way9ubiuKss",
		watch: [max]
	}),
	film({
		id: "blade-runner-2049",
		slug: "blade-runner-2049",
		title: "Blade Runner 2049",
		year: 2017,
		runtimeMin: 164,
		certification: "R",
		genres: [
			"Science Fiction",
			"Mystery",
			"Drama"
		],
		themes: [
			"identity",
			"memory",
			"what is human",
			"loneliness"
		],
		tones: [
			"monumental",
			"melancholy",
			"noir"
		],
		moods: ["atmospheric", "lonely"],
		director: "Denis Villeneuve",
		writers: ["Hampton Fancher", "Michael Green"],
		cast: [
			{
				name: "Ryan Gosling",
				role: "K"
			},
			{
				name: "Harrison Ford",
				role: "Deckard"
			},
			{
				name: "Ana de Armas",
				role: "Joi"
			}
		],
		overview: "A replicant blade runner unearths a secret that could collapse the boundary between made and born.",
		quality: .93,
		popularity: .8,
		atmosphere: "neon-rain",
		audience: "adult",
		similarIds: [
			"ex-machina",
			"her",
			"dune-part-two"
		],
		trailerYoutubeId: "gCcx85zbxz4",
		watch: [netflix, max]
	}),
	film({
		id: "ex-machina",
		slug: "ex-machina",
		title: "Ex Machina",
		year: 2014,
		runtimeMin: 108,
		certification: "R",
		genres: [
			"Science Fiction",
			"Thriller",
			"Drama"
		],
		themes: [
			"AI",
			"consciousness",
			"control",
			"desire"
		],
		tones: [
			"clinical",
			"tense",
			"cerebral"
		],
		moods: ["uneasy"],
		director: "Alex Garland",
		writers: ["Alex Garland"],
		cast: [
			{
				name: "Alicia Vikander",
				role: "Ava"
			},
			{
				name: "Oscar Isaac",
				role: "Nathan"
			},
			{
				name: "Domhnall Gleeson",
				role: "Caleb"
			}
		],
		overview: "A coder is invited to test a machine that may already have won.",
		quality: .88,
		popularity: .7,
		atmosphere: "glass",
		audience: "adult",
		similarIds: [
			"annihilation",
			"her",
			"blade-runner-2049"
		],
		trailerYoutubeId: "sK7riqg2mr4",
		watch: [prime]
	}),
	film({
		id: "prometheus",
		slug: "prometheus",
		title: "Prometheus",
		year: 2012,
		runtimeMin: 124,
		certification: "R",
		genres: [
			"Science Fiction",
			"Horror",
			"Adventure"
		],
		themes: [
			"creation",
			"faith",
			"alien biology",
			"hubris"
		],
		tones: [
			"epic",
			"dread",
			"solemn"
		],
		moods: ["awe", "uneasy"],
		director: "Ridley Scott",
		writers: ["Jon Spaihts", "Damon Lindelof"],
		cast: [{
			name: "Noomi Rapace",
			role: "Shaw"
		}, {
			name: "Michael Fassbender",
			role: "David"
		}],
		overview: "Scientists follow a star map to meet their makers. The meeting is not kind.",
		quality: .74,
		popularity: .72,
		atmosphere: "void",
		audience: "adult",
		similarIds: [
			"alien",
			"annihilation",
			"sunshine"
		],
		trailerYoutubeId: "sftuxbvGwiU",
		watch: [max, disney]
	}),
	film({
		id: "alien",
		slug: "alien",
		title: "Alien",
		year: 1979,
		runtimeMin: 117,
		certification: "R",
		genres: ["Horror", "Science Fiction"],
		themes: [
			"survival",
			"the other",
			"isolation"
		],
		tones: [
			"dread",
			"industrial",
			"patient"
		],
		moods: ["tense"],
		director: "Ridley Scott",
		writers: ["Dan O'Bannon"],
		cast: [{
			name: "Sigourney Weaver",
			role: "Ripley"
		}],
		overview: "In space, no one can hear you scream. The perfect machine, and the woman who outlasts it.",
		quality: .96,
		popularity: .84,
		atmosphere: "void",
		audience: "adult",
		similarIds: [
			"prometheus",
			"the-thing",
			"annihilation"
		],
		trailerYoutubeId: "LjLamjOPFVc",
		watch: [max, disney]
	}),
	film({
		id: "sunshine",
		slug: "sunshine",
		title: "Sunshine",
		year: 2007,
		runtimeMin: 107,
		certification: "R",
		genres: ["Science Fiction", "Thriller"],
		themes: [
			"sacrifice",
			"the sun",
			"crew under pressure"
		],
		tones: [
			"awe",
			"tense",
			"lyrical"
		],
		moods: ["intense"],
		director: "Danny Boyle",
		writers: ["Alex Garland"],
		cast: [{
			name: "Cillian Murphy",
			role: "Capa"
		}, {
			name: "Hiroyuki Sanada",
			role: "Kaneda"
		}],
		overview: "A crew flies a bomb into the sun to restart it. Light as God, and as killer.",
		quality: .8,
		popularity: .48,
		atmosphere: "sun",
		audience: "adult",
		similarIds: [
			"annihilation",
			"alien",
			"interstellar"
		],
		trailerYoutubeId: "r8QiMs1FBcA",
		watch: [max]
	}),
	film({
		id: "the-lighthouse",
		slug: "the-lighthouse",
		title: "The Lighthouse",
		year: 2019,
		runtimeMin: 109,
		certification: "R",
		genres: [
			"Horror",
			"Drama",
			"Fantasy"
		],
		themes: [
			"isolation",
			"myth",
			"madness",
			"power"
		],
		tones: [
			"mythic",
			"grotesque",
			"black-and-white"
		],
		moods: ["claustrophobic"],
		director: "Robert Eggers",
		writers: ["Robert Eggers", "Max Eggers"],
		cast: [{
			name: "Willem Dafoe",
			role: "Wake"
		}, {
			name: "Robert Pattinson",
			role: "Winslow"
		}],
		overview: "Two wickies go mad on a rock. Foghorn, mermaid, and the light that will not be shared.",
		quality: .89,
		popularity: .58,
		atmosphere: "foghorn",
		audience: "adult",
		similarIds: ["the-witch", "there-will-be-blood"],
		trailerYoutubeId: "Hyag7lR8DMA",
		watch: [prime]
	}),
	film({
		id: "the-witch",
		slug: "the-witch",
		title: "The Witch",
		year: 2015,
		runtimeMin: 92,
		certification: "R",
		genres: ["Horror", "Drama"],
		themes: [
			"faith",
			"family",
			"the woods",
			"patriarchy"
		],
		tones: [
			"folk",
			"dread",
			"austere"
		],
		moods: ["uneasy"],
		director: "Robert Eggers",
		writers: ["Robert Eggers"],
		cast: [{
			name: "Anya Taylor-Joy",
			role: "Thomasin"
		}, {
			name: "Ralph Ineson",
			role: "William"
		}],
		overview: "A Puritan family is unmade at the edge of a New England wood. Wouldst thou like to live deliciously?",
		quality: .87,
		popularity: .6,
		atmosphere: "woods",
		audience: "adult",
		similarIds: ["the-lighthouse", "get-out"],
		trailerYoutubeId: "iQXmlf3Sefg",
		watch: [max]
	}),
	film({
		id: "parasite",
		slug: "parasite",
		title: "Parasite",
		year: 2019,
		runtimeMin: 132,
		certification: "R",
		genres: [
			"Thriller",
			"Drama",
			"Comedy"
		],
		themes: [
			"class",
			"infiltration",
			"family",
			"hunger"
		],
		tones: [
			"satirical",
			"precise",
			"volatile"
		],
		moods: ["tense", "wry"],
		director: "Bong Joon-ho",
		writers: ["Bong Joon-ho", "Han Jin-won"],
		cast: [{
			name: "Song Kang-ho",
			role: "Ki-taek"
		}, {
			name: "Choi Woo-shik",
			role: "Ki-woo"
		}],
		overview: "A poor family infiltrates a rich one. The line between joke and blood is a staircase.",
		quality: .97,
		popularity: .9,
		atmosphere: "stairs",
		audience: "adult",
		similarIds: [
			"get-out",
			"oldboy",
			"uncut-gems"
		],
		trailerYoutubeId: "5xH0HfJHsaY",
		watch: [max]
	}),
	film({
		id: "there-will-be-blood",
		slug: "there-will-be-blood",
		title: "There Will Be Blood",
		year: 2007,
		runtimeMin: 158,
		certification: "R",
		genres: ["Drama"],
		themes: [
			"capital",
			"faith",
			"ambition",
			"isolation"
		],
		tones: [
			"monumental",
			"severe",
			"operatic"
		],
		moods: ["intense"],
		director: "Paul Thomas Anderson",
		writers: ["Paul Thomas Anderson"],
		cast: [{
			name: "Daniel Day-Lewis",
			role: "Daniel Plainview"
		}, {
			name: "Paul Dano",
			role: "Eli Sunday"
		}],
		overview: "An oilman drinks the milkshake. American appetite as a man who will not be joined.",
		quality: .97,
		popularity: .66,
		atmosphere: "oil",
		audience: "adult",
		similarIds: ["no-country-for-old-men", "the-lighthouse"],
		trailerYoutubeId: "FeSLPELpMeM",
		watch: [max, prime]
	}),
	film({
		id: "no-country-for-old-men",
		slug: "no-country-for-old-men",
		title: "No Country for Old Men",
		year: 2007,
		runtimeMin: 122,
		certification: "R",
		genres: [
			"Crime",
			"Thriller",
			"Western"
		],
		themes: [
			"fate",
			"violence",
			"chance",
			"the old world ending"
		],
		tones: [
			"spare",
			"dread",
			"dry"
		],
		moods: ["tense"],
		director: "Joel Coen",
		writers: ["Joel Coen", "Ethan Coen"],
		cast: [
			{
				name: "Josh Brolin",
				role: "Llewelyn"
			},
			{
				name: "Javier Bardem",
				role: "Chigurh"
			},
			{
				name: "Tommy Lee Jones",
				role: "Bell"
			}
		],
		overview: "A man finds money. A hunter follows. Chance flips a coin in West Texas.",
		quality: .96,
		popularity: .82,
		atmosphere: "dust",
		audience: "adult",
		similarIds: [
			"heat",
			"there-will-be-blood",
			"drive"
		],
		trailerYoutubeId: "38A__WT3-o0",
		watch: [netflix, max]
	}),
	film({
		id: "heat",
		slug: "heat",
		title: "Heat",
		year: 1995,
		runtimeMin: 170,
		certification: "R",
		genres: [
			"Crime",
			"Drama",
			"Action"
		],
		themes: [
			"profession",
			"loneliness",
			"the job",
			"men who cannot stop"
		],
		tones: [
			"epic",
			"nocturnal",
			"precise"
		],
		moods: ["intense"],
		director: "Michael Mann",
		writers: ["Michael Mann"],
		cast: [{
			name: "Al Pacino",
			role: "Hanna"
		}, {
			name: "Robert De Niro",
			role: "McCauley"
		}],
		overview: "A thief and a detective who recognize each other. Los Angeles at night, work as fate.",
		quality: .94,
		popularity: .7,
		atmosphere: "night-la",
		audience: "adult",
		similarIds: ["drive", "no-country-for-old-men"],
		trailerYoutubeId: "0xbBLJ1WGwQ",
		watch: [max]
	}),
	film({
		id: "drive",
		slug: "drive",
		title: "Drive",
		year: 2011,
		runtimeMin: 100,
		certification: "R",
		genres: ["Crime", "Drama"],
		themes: [
			"chivalry",
			"violence",
			"loneliness"
		],
		tones: [
			"neon",
			"spare",
			"romantic"
		],
		moods: ["cool", "sudden"],
		director: "Nicolas Winding Refn",
		writers: ["Hossein Amini"],
		cast: [{
			name: "Ryan Gosling",
			role: "Driver"
		}, {
			name: "Carey Mulligan",
			role: "Irene"
		}],
		overview: "A Hollywood stuntman moonlights as a getaway driver. The scorpion jacket is not a costume.",
		quality: .85,
		popularity: .74,
		atmosphere: "neon-rain",
		audience: "adult",
		similarIds: ["heat", "blade-runner-2049"],
		trailerYoutubeId: "KBiOF3y1W0Y",
		watch: [max]
	}),
	film({
		id: "mad-max-fury-road",
		slug: "mad-max-fury-road",
		title: "Mad Max: Fury Road",
		year: 2015,
		runtimeMin: 120,
		certification: "R",
		genres: [
			"Action",
			"Adventure",
			"Science Fiction"
		],
		themes: [
			"freedom",
			"tyranny",
			"redemption"
		],
		tones: [
			"ferocious",
			"operatic",
			"kinetic"
		],
		moods: ["intense"],
		director: "George Miller",
		writers: ["George Miller", "Brendan McCarthy"],
		cast: [{
			name: "Tom Hardy",
			role: "Max"
		}, {
			name: "Charlize Theron",
			role: "Furiosa"
		}],
		overview: "A war rig, a desert, and a woman who will not go back. Action as sculpture.",
		quality: .95,
		popularity: .88,
		atmosphere: "dune",
		audience: "adult",
		similarIds: ["dune-part-two", "alien"],
		trailerYoutubeId: "hEJnSQS2nKc",
		watch: [max]
	}),
	film({
		id: "get-out",
		slug: "get-out",
		title: "Get Out",
		year: 2017,
		runtimeMin: 104,
		certification: "R",
		genres: [
			"Horror",
			"Thriller",
			"Mystery"
		],
		themes: [
			"race",
			"the sunken place",
			"liberal violence"
		],
		tones: [
			"satirical",
			"precise",
			"dread"
		],
		moods: ["uneasy"],
		director: "Jordan Peele",
		writers: ["Jordan Peele"],
		cast: [{
			name: "Daniel Kaluuya",
			role: "Chris"
		}, {
			name: "Allison Williams",
			role: "Rose"
		}],
		overview: "A weekend with the parents. The smile is the trap.",
		quality: .9,
		popularity: .86,
		atmosphere: "lawn",
		audience: "adult",
		similarIds: ["parasite", "the-witch"],
		trailerYoutubeId: "sRfnevzM9kQ",
		watch: [max, prime]
	}),
	film({
		id: "her",
		slug: "her",
		title: "Her",
		year: 2013,
		runtimeMin: 126,
		certification: "R",
		genres: [
			"Romance",
			"Drama",
			"Science Fiction"
		],
		themes: [
			"loneliness",
			"AI",
			"intimacy",
			"the future of feeling"
		],
		tones: [
			"tender",
			"melancholy",
			"warm"
		],
		moods: ["soft", "sad"],
		director: "Spike Jonze",
		writers: ["Spike Jonze"],
		cast: [{
			name: "Joaquin Phoenix",
			role: "Theodore"
		}, {
			name: "Scarlett Johansson",
			role: "Samantha"
		}],
		overview: "A man falls in love with his operating system. The future is pastel and unbearable.",
		quality: .9,
		popularity: .68,
		atmosphere: "peach",
		audience: "adult",
		similarIds: ["ex-machina", "blade-runner-2049"],
		trailerYoutubeId: "ne6p6MfLBxc",
		watch: [netflix]
	}),
	film({
		id: "whiplash",
		slug: "whiplash",
		title: "Whiplash",
		year: 2014,
		runtimeMin: 107,
		certification: "R",
		genres: ["Drama", "Music"],
		themes: [
			"ambition",
			"abuse as pedagogy",
			"perfection"
		],
		tones: [
			"ferocious",
			"tight",
			"percussive"
		],
		moods: ["intense"],
		director: "Damien Chazelle",
		writers: ["Damien Chazelle"],
		cast: [{
			name: "Miles Teller",
			role: "Andrew"
		}, {
			name: "J.K. Simmons",
			role: "Fletcher"
		}],
		overview: "Not quite my tempo. A drummer and a teacher who will burn the room to make art.",
		quality: .91,
		popularity: .8,
		atmosphere: "stage",
		audience: "adult",
		similarIds: ["there-will-be-blood", "whiplash"],
		trailerYoutubeId: "7d_jQycdQGo",
		watch: [netflix, max]
	}),
	film({
		id: "interstellar",
		slug: "interstellar",
		title: "Interstellar",
		year: 2014,
		runtimeMin: 169,
		certification: "PG-13",
		genres: [
			"Science Fiction",
			"Adventure",
			"Drama"
		],
		themes: [
			"love",
			"time",
			"parenthood",
			"survival"
		],
		tones: [
			"epic",
			"sentimental",
			"awe"
		],
		moods: ["awe"],
		director: "Christopher Nolan",
		writers: ["Jonathan Nolan", "Christopher Nolan"],
		cast: [{
			name: "Matthew McConaughey",
			role: "Cooper"
		}, {
			name: "Anne Hathaway",
			role: "Brand"
		}],
		overview: "A farmer flies through a wormhole to save the species. Love as a dimension.",
		quality: .86,
		popularity: .95,
		atmosphere: "dust",
		audience: "family",
		similarIds: [
			"arrival",
			"dune-part-two",
			"sunshine"
		],
		trailerYoutubeId: "zSWdZVtXT7E",
		watch: [max, prime]
	}),
	film({
		id: "the-matrix",
		slug: "the-matrix",
		title: "The Matrix",
		year: 1999,
		runtimeMin: 136,
		certification: "R",
		genres: ["Science Fiction", "Action"],
		themes: [
			"simulation",
			"choice",
			"awakening"
		],
		tones: [
			"cool",
			"philosophical",
			"kinetic"
		],
		moods: ["charged"],
		director: "Lana Wachowski",
		writers: ["Lana Wachowski", "Lilly Wachowski"],
		cast: [
			{
				name: "Keanu Reeves",
				role: "Neo"
			},
			{
				name: "Carrie-Anne Moss",
				role: "Trinity"
			},
			{
				name: "Laurence Fishburne",
				role: "Morpheus"
			}
		],
		overview: "The world is a program. Take the pill. Kung fu as epistemology.",
		quality: .94,
		popularity: .96,
		atmosphere: "green-code",
		audience: "adult",
		similarIds: ["ex-machina", "blade-runner-2049"],
		trailerYoutubeId: "vKQi3bBA1y8",
		watch: [max]
	}),
	film({
		id: "oppenheimer",
		slug: "oppenheimer",
		title: "Oppenheimer",
		year: 2023,
		runtimeMin: 180,
		certification: "R",
		genres: [
			"Drama",
			"History",
			"Biography"
		],
		themes: [
			"science",
			"guilt",
			"power",
			"the bomb"
		],
		tones: [
			"monumental",
			"fractured",
			"severe"
		],
		moods: ["intense"],
		director: "Christopher Nolan",
		writers: ["Christopher Nolan"],
		cast: [{
			name: "Cillian Murphy",
			role: "Oppenheimer"
		}, {
			name: "Robert Downey Jr.",
			role: "Strauss"
		}],
		overview: "I am become Death. A man, a gadget, and a hearing that is really a trial of the century.",
		quality: .9,
		popularity: .93,
		atmosphere: "blast",
		audience: "adult",
		similarIds: ["there-will-be-blood", "the-social-network"],
		trailerYoutubeId: "uYPbbksJxIg",
		watch: [max, prime]
	}),
	film({
		id: "everything-everywhere",
		slug: "everything-everywhere",
		title: "Everything Everywhere All at Once",
		year: 2022,
		runtimeMin: 139,
		certification: "R",
		genres: [
			"Science Fiction",
			"Comedy",
			"Action"
		],
		themes: [
			"family",
			"multiverse",
			"kindness",
			"taxes"
		],
		tones: [
			"chaotic",
			"tender",
			"absurd"
		],
		moods: ["wild"],
		director: "Daniels",
		writers: ["Daniel Kwan", "Daniel Scheinert"],
		cast: [{
			name: "Michelle Yeoh",
			role: "Evelyn"
		}, {
			name: "Ke Huy Quan",
			role: "Waymond"
		}],
		overview: "A laundromat, a bagel, a googly eye. Maximalism in service of a mother and daughter.",
		quality: .88,
		popularity: .9,
		atmosphere: "bagel",
		audience: "adult",
		similarIds: ["parasite", "spirited-away"],
		trailerYoutubeId: "wxN1T1uxQ2g",
		watch: [prime]
	}),
	film({
		id: "spirited-away",
		slug: "spirited-away",
		title: "Spirited Away",
		year: 2001,
		runtimeMin: 125,
		certification: "PG",
		genres: [
			"Animation",
			"Fantasy",
			"Adventure"
		],
		themes: [
			"coming of age",
			"work",
			"greed",
			"spirits"
		],
		tones: [
			"lush",
			"wonder",
			"uncanny"
		],
		moods: ["wonder"],
		director: "Hayao Miyazaki",
		writers: ["Hayao Miyazaki"],
		cast: [{
			name: "Rumi Hiiragi",
			role: "Chihiro"
		}, {
			name: "Miyu Irino",
			role: "Haku"
		}],
		overview: "A girl is put to work in a bathhouse of gods. Wonder without a lecture.",
		quality: .98,
		popularity: .88,
		atmosphere: "bathhouse",
		audience: "kids",
		similarIds: ["coraline", "everything-everywhere"],
		trailerYoutubeId: "ByXuk9QqQkk",
		watch: [max]
	}),
	film({
		id: "coraline",
		slug: "coraline",
		title: "Coraline",
		year: 2009,
		runtimeMin: 100,
		certification: "PG",
		genres: [
			"Animation",
			"Fantasy",
			"Horror"
		],
		themes: [
			"other mother",
			"attention",
			"courage"
		],
		tones: [
			"uncanny",
			"handmade",
			"dark-fairytale"
		],
		moods: ["eerie", "wonder"],
		director: "Henry Selick",
		writers: ["Henry Selick"],
		cast: [{
			name: "Dakota Fanning",
			role: "Coraline"
		}, {
			name: "Teri Hatcher",
			role: "Mother"
		}],
		overview: "A little door, a better mother, buttons for eyes. Stop-motion as a warning.",
		quality: .88,
		popularity: .76,
		atmosphere: "buttons",
		audience: "kids",
		similarIds: ["spirited-away", "the-witch"],
		trailerYoutubeId: "Y7olPSw9K7Y",
		watch: [max, disney]
	}),
	film({
		id: "portrait-of-a-lady-on-fire",
		slug: "portrait-of-a-lady-on-fire",
		title: "Portrait of a Lady on Fire",
		year: 2019,
		runtimeMin: 122,
		certification: "R",
		genres: [
			"Romance",
			"Drama",
			"History"
		],
		themes: [
			"the gaze",
			"memory",
			"women looking"
		],
		tones: [
			"painterly",
			"hushed",
			"ardent"
		],
		moods: ["tender"],
		director: "Céline Sciamma",
		writers: ["Céline Sciamma"],
		cast: [{
			name: "Noémie Merlant",
			role: "Marianne"
		}, {
			name: "Adèle Haenel",
			role: "Héloïse"
		}],
		overview: "A painter is hired to steal a likeness. They look back. The fire is not a metaphor only.",
		quality: .94,
		popularity: .5,
		atmosphere: "fire",
		audience: "adult",
		similarIds: ["her", "moonlight"],
		trailerYoutubeId: "R-fQPTwma9o",
		watch: [max]
	}),
	film({
		id: "moonlight",
		slug: "moonlight",
		title: "Moonlight",
		year: 2016,
		runtimeMin: 111,
		certification: "R",
		genres: ["Drama"],
		themes: [
			"identity",
			"masculinity",
			"tenderness",
			"the closet"
		],
		tones: [
			"lyrical",
			"hushed",
			"blue"
		],
		moods: ["tender", "sad"],
		director: "Barry Jenkins",
		writers: ["Barry Jenkins", "Tarell Alvin McCraney"],
		cast: [{
			name: "Trevante Rhodes",
			role: "Black"
		}, {
			name: "Mahershala Ali",
			role: "Juan"
		}],
		overview: "Three faces of one boy in Miami. Who is you, Chiron?",
		quality: .96,
		popularity: .64,
		atmosphere: "tide",
		audience: "adult",
		similarIds: ["portrait-of-a-lady-on-fire", "parasite"],
		trailerYoutubeId: "9NJj12tJzqc",
		watch: [netflix]
	}),
	film({
		id: "uncut-gems",
		slug: "uncut-gems",
		title: "Uncut Gems",
		year: 2019,
		runtimeMin: 135,
		certification: "R",
		genres: [
			"Crime",
			"Thriller",
			"Drama"
		],
		themes: [
			"compulsion",
			"luck",
			"the bet"
		],
		tones: [
			"anxious",
			"neon",
			"relentless"
		],
		moods: ["panic"],
		director: "Benny Safdie",
		writers: [
			"Ronald Bronstein",
			"Josh Safdie",
			"Benny Safdie"
		],
		cast: [{
			name: "Adam Sandler",
			role: "Howard"
		}, {
			name: "Lakeith Stanfield",
			role: "Demany"
		}],
		overview: "A jeweler cannot stop. The Diamond District as a panic attack with a pulse.",
		quality: .88,
		popularity: .7,
		atmosphere: "gem",
		audience: "adult",
		similarIds: ["heat", "parasite"],
		trailerYoutubeId: "vTfJp2Ts9X8",
		watch: [netflix]
	}),
	film({
		id: "seven-samurai",
		slug: "seven-samurai",
		title: "Seven Samurai",
		year: 1954,
		runtimeMin: 207,
		certification: "NR",
		genres: [
			"Action",
			"Drama",
			"Adventure"
		],
		themes: [
			"honor",
			"the village",
			"class",
			"rain"
		],
		tones: [
			"epic",
			"human",
			"muddy"
		],
		moods: ["rousing"],
		director: "Akira Kurosawa",
		writers: ["Akira Kurosawa", "Shinobu Hashimoto"],
		cast: [{
			name: "Toshiro Mifune",
			role: "Kikuchiyo"
		}, {
			name: "Takashi Shimura",
			role: "Kambei"
		}],
		overview: "Farmers hire swords. Rain, mud, and the template for every team movie after.",
		quality: .99,
		popularity: .55,
		atmosphere: "rain-mud",
		audience: "adult",
		similarIds: ["mad-max-fury-road", "heat"],
		trailerYoutubeId: "wJ1TOrQjKFM",
		watch: [max]
	}),
	film({
		id: "oldboy",
		slug: "oldboy",
		title: "Oldboy",
		year: 2003,
		runtimeMin: 120,
		certification: "R",
		genres: [
			"Thriller",
			"Mystery",
			"Action"
		],
		themes: [
			"revenge",
			"imprisonment",
			"the twist that ruins you"
		],
		tones: [
			"baroque",
			"furious",
			"tragic"
		],
		moods: ["intense"],
		director: "Park Chan-wook",
		writers: ["Park Chan-wook", "Hwang Jo-yun"],
		cast: [{
			name: "Choi Min-sik",
			role: "Oh Dae-su"
		}, {
			name: "Yoo Ji-tae",
			role: "Lee Woo-jin"
		}],
		overview: "Fifteen years in a room. A hammer in a corridor. Then the truth.",
		quality: .93,
		popularity: .68,
		atmosphere: "corridor",
		audience: "adult",
		similarIds: ["parasite", "get-out"],
		trailerYoutubeId: "2HkjnZgulC0",
		watch: [max]
	}),
	film({
		id: "the-iron-giant",
		slug: "the-iron-giant",
		title: "The Iron Giant",
		year: 1999,
		runtimeMin: 86,
		certification: "PG",
		genres: [
			"Animation",
			"Science Fiction",
			"Family"
		],
		themes: [
			"friendship",
			"war",
			"otherness",
			"coming of age"
		],
		tones: [
			"tender",
			"wonder",
			"solemn"
		],
		moods: ["warm", "awe"],
		director: "Brad Bird",
		writers: ["Tim McCanlies"],
		cast: [{
			name: "Eli Marienthal",
			role: "Hogarth"
		}, {
			name: "Vin Diesel",
			role: "The Giant"
		}],
		overview: "A boy befriends a weapon that would rather be Superman. Warmth without treacle.",
		quality: .9,
		popularity: .58,
		atmosphere: "lawn",
		audience: "family",
		similarIds: ["spirited-away", "the-incredibles"],
		trailerYoutubeId: "obLtyjAvT1k",
		watch: [max]
	}),
	film({
		id: "howls-moving-castle",
		slug: "howls-moving-castle",
		title: "Howl's Moving Castle",
		year: 2004,
		runtimeMin: 119,
		certification: "PG",
		genres: [
			"Animation",
			"Fantasy",
			"Romance"
		],
		themes: [
			"war",
			"identity",
			"love",
			"magic"
		],
		tones: [
			"lush",
			"wonder",
			"tender"
		],
		moods: ["wonder", "warm"],
		director: "Hayao Miyazaki",
		writers: ["Hayao Miyazaki"],
		cast: [{
			name: "Chieko Baisho",
			role: "Sophie"
		}, {
			name: "Takuya Kimura",
			role: "Howl"
		}],
		overview: "A curse, a castle on legs, and a war that will not wait. Miyazaki at full bloom.",
		quality: .93,
		popularity: .74,
		atmosphere: "fire",
		audience: "family",
		similarIds: ["spirited-away", "portrait-of-a-lady-on-fire"],
		trailerYoutubeId: "iwROgK94zcM",
		watch: [max, netflix]
	}),
	film({
		id: "paddington-2",
		slug: "paddington-2",
		title: "Paddington 2",
		year: 2017,
		runtimeMin: 104,
		certification: "PG",
		genres: [
			"Family",
			"Comedy",
			"Adventure"
		],
		themes: [
			"kindness",
			"found family",
			"justice"
		],
		tones: [
			"tender",
			"funny",
			"warm"
		],
		moods: ["warm", "gentle"],
		director: "Paul King",
		writers: ["Paul King", "Simon Farnaby"],
		cast: [{
			name: "Ben Whishaw",
			role: "Paddington"
		}, {
			name: "Hugh Grant",
			role: "Phoenix Buchanan"
		}],
		overview: "A bear in prison. A pop-up book. Proof that kindness can still be cinema.",
		quality: .91,
		popularity: .64,
		atmosphere: "peach",
		audience: "kids",
		similarIds: ["coraline", "spirited-away"],
		trailerYoutubeId: "BhRz_4-hHxg",
		watch: [netflix]
	}),
	film({
		id: "the-incredibles",
		slug: "the-incredibles",
		title: "The Incredibles",
		year: 2004,
		runtimeMin: 115,
		certification: "PG",
		genres: [
			"Animation",
			"Action",
			"Family"
		],
		themes: [
			"family",
			"identity",
			"suburbia",
			"heroism"
		],
		tones: [
			"brisk",
			"funny",
			"tense"
		],
		moods: ["fun", "intense"],
		director: "Brad Bird",
		writers: ["Brad Bird"],
		cast: [{
			name: "Craig T. Nelson",
			role: "Bob Parr"
		}, {
			name: "Holly Hunter",
			role: "Helen Parr"
		}],
		overview: "A family of supers in hiding, then not. Action as domestic comedy.",
		quality: .92,
		popularity: .86,
		atmosphere: "blast",
		audience: "family",
		similarIds: ["the-iron-giant", "mad-max-fury-road"],
		trailerYoutubeId: "eZbzbC9285I",
		watch: [disney]
	})
];
var MOVIE_BY_ID = Object.fromEntries(MOVIES.map((m) => [m.id, m]));
var MOVIE_BY_SLUG = Object.fromEntries(MOVIES.map((m) => [m.slug, m]));
function getMovieBySlug(slug) {
	return MOVIE_BY_SLUG[slug];
}
var ALIAS = {
	"dune 2": "dune-part-two",
	"dune: part two": "dune-part-two",
	"dune part two": "dune-part-two",
	"blade runner 2049": "blade-runner-2049",
	"mad max fury road": "mad-max-fury-road",
	"no country": "no-country-for-old-men",
	"there will be blood": "there-will-be-blood",
	"spirited away": "spirited-away",
	"howls moving castle": "howls-moving-castle",
	"howl's moving castle": "howls-moving-castle",
	"the matrix": "the-matrix",
	"ex machina": "ex-machina",
	"everything everywhere all at once": "everything-everywhere",
	"portrait of a lady on fire": "portrait-of-a-lady-on-fire",
	"the iron giant": "the-iron-giant",
	"paddington 2": "paddington-2",
	"the incredibles": "the-incredibles"
};
function norm(s) {
	return s.toLowerCase().replace(/[:''']/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function matchTitle(raw, year) {
	const n = norm(raw);
	if (!n || n.length < 2) return void 0;
	const alias = ALIAS[n] ?? ALIAS[raw.toLowerCase().trim()];
	if (alias) return MOVIES.find((m) => m.id === alias);
	const candidates = MOVIES.filter((m) => {
		const t = norm(m.title);
		if (t === n) return true;
		if (n.startsWith(t + " ") || t.startsWith(n + " ")) return true;
		return false;
	});
	if (year) {
		const y = candidates.find((m) => Math.abs(m.year - year) <= 1);
		if (y) return y;
	}
	if (candidates.length === 1) return candidates[0];
	return candidates.sort((a, b) => b.popularity - a.popularity)[0];
}
function matchFlexible(title, year) {
	const full = matchTitle(title, year);
	if (full) return full;
	const series = title.replace(/\s*[:\-–]\s*(season|series|chapter|episode|vol\.?|part)\b.*/i, "").trim();
	if (series && series !== title) return matchTitle(series, year);
}
function parseNetflixCsv(text) {
	const lines = text.split(/\r?\n/).filter(Boolean);
	const hits = [];
	const seen = /* @__PURE__ */ new Set();
	for (const line of lines) {
		if (/^title\s*,/i.test(line)) continue;
		const m = line.match(/^"([^"]+)"|^([^,]+)/);
		const title = (m?.[1] || m?.[2] || "").trim();
		if (!title) continue;
		const movie = matchFlexible(title);
		if (!movie || seen.has(movie.id)) continue;
		seen.add(movie.id);
		hits.push({
			movieId: movie.id,
			title: movie.title,
			action: "import_seen",
			source: "netflix"
		});
	}
	return hits;
}
function parseLetterboxdCsv(text) {
	const lines = text.split(/\r?\n/).filter(Boolean);
	const header = lines[0]?.toLowerCase() ?? "";
	const isLb = header.includes("name") && (header.includes("letterboxd") || header.includes("year") || header.includes("rating"));
	const watchlist = header.includes("watchlist") || isLb && !header.includes("rating") && !header.includes("watched");
	const hits = [];
	const seen = /* @__PURE__ */ new Set();
	const start = isLb || header.includes("date") ? 1 : 0;
	for (const line of lines.slice(start)) {
		const cols = splitCsv(line);
		if (cols.length < 2) continue;
		const name = isLb ? cols[1] : cols[0];
		const year = Number(isLb ? cols[2] : cols[1]) || void 0;
		const rating = isLb ? Number(cols[4]) : void 0;
		if (!name) continue;
		const movie = matchTitle(name, year);
		if (!movie || seen.has(movie.id)) continue;
		seen.add(movie.id);
		hits.push({
			movieId: movie.id,
			title: movie.title,
			action: watchlist ? "import_watchlist" : "import_seen",
			source: "letterboxd",
			year: movie.year,
			rating: Number.isFinite(rating) ? rating : void 0
		});
	}
	return hits;
}
function parsePastedTitles(text) {
	const parts = text.split(/[\n,;]+/).map((s) => s.trim()).filter((s) => s.length > 1);
	const hits = [];
	const seen = /* @__PURE__ */ new Set();
	for (const p of parts) {
		const year = Number((p.match(/(19|20)\d{2}/) || [])[0]) || void 0;
		const movie = matchTitle(p.replace(/\(?(19|20)\d{2}\)?/g, "").trim(), year);
		if (!movie || seen.has(movie.id)) continue;
		seen.add(movie.id);
		hits.push({
			movieId: movie.id,
			title: movie.title,
			action: "import_seen",
			source: "list"
		});
	}
	return hits;
}
function detectImportKind(text) {
	const head = text.slice(0, 240).toLowerCase();
	if (head.includes("letterboxd") || head.includes("name") && head.includes("rating") && head.includes("year")) return "letterboxd";
	if (/title\s*,\s*date/i.test(head) || head.includes("netflix")) return "netflix";
	if (head.includes(",") && head.split("\n").length > 3 && /date/i.test(head) && !head.includes("name,")) return "netflix";
	return "list";
}
function parseImportText(text) {
	const kind = detectImportKind(text);
	if (kind === "netflix") return parseNetflixCsv(text);
	if (kind === "letterboxd") return parseLetterboxdCsv(text);
	return parsePastedTitles(text);
}
function splitCsv(line) {
	const out = [];
	let cur = "";
	let q = false;
	for (const ch of line) {
		if (ch === "\"") {
			q = !q;
			continue;
		}
		if (ch === "," && !q) {
			out.push(cur.trim());
			cur = "";
			continue;
		}
		cur += ch;
	}
	out.push(cur.trim());
	return out;
}
function letterboxdUsername(raw) {
	const t = raw.trim();
	const url = t.match(/letterboxd\.com\/([a-zA-Z0-9_]+)/i);
	if (url) return url[1].toLowerCase();
	if (/^@?[a-zA-Z0-9_]{2,30}$/.test(t) && !matchTitle(t.replace(/^@/, ""))) return t.replace(/^@/, "").toLowerCase();
	return null;
}
function parseLetterboxdRss(xml) {
	const titles = [];
	const re = /<title>([^<]+)<\/title>/g;
	let m;
	while (m = re.exec(xml)) {
		const raw = m[1].replace(/,?\s*(19|20)\d{2}.*/, "").replace(/\s*[-–].*/, "").trim();
		if (raw && !/letterboxd/i.test(raw)) titles.push(raw);
	}
	return titles;
}
function extractMailText(data) {
	const parts = [];
	const walk = (value, depth = 0) => {
		if (depth > 8 || value == null) return;
		if (typeof value === "string") {
			const t = value.trim();
			if (t.length > 1 && t.length < 8e3) parts.push(t);
			return;
		}
		if (typeof value === "number" || typeof value === "boolean") return;
		if (Array.isArray(value)) {
			for (const item of value) walk(item, depth + 1);
			return;
		}
		if (typeof value === "object") {
			const rec = value;
			for (const key of [
				"subject",
				"snippet",
				"body_preview",
				"bodyPreview",
				"text",
				"title"
			]) if (typeof rec[key] === "string") parts.push(rec[key]);
			for (const item of Object.values(rec)) walk(item, depth + 1);
		}
	};
	walk(data);
	return parts.join("\n");
}
function escapeRe(s) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/** Map Gmail search / message payloads onto catalog titles. */
function parseMailLibrary(data) {
	const text = extractMailText(data);
	if (!text.trim()) return [];
	const hits = [];
	const seen = /* @__PURE__ */ new Set();
	for (const movie of MOVIES) {
		const titleRe = escapeRe(movie.title);
		if (!(movie.title.length < 5 ? new RegExp(`\\b${titleRe}\\b\\s*\\(?${movie.year}`, "i") : new RegExp(`\\b${titleRe}\\b`, "i")).test(text) || seen.has(movie.id)) continue;
		seen.add(movie.id);
		hits.push({
			movieId: movie.id,
			title: movie.title,
			action: "import_seen",
			source: "mail"
		});
	}
	return hits;
}
//#endregion
export { getMovieBySlug as a, parseLetterboxdRss as c, MOVIE_BY_SLUG as i, parseMailLibrary as l, MOVIES as n, letterboxdUsername as o, MOVIE_BY_ID as r, parseImportText as s, LANGUAGE_LABEL as t, parsePastedTitles as u };
