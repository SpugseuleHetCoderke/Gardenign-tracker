/**
 * Seed the five starter species and their care rules.
 *
 * ⚠️  DE INTERVALLEN EN ADVIEZEN HIERONDER ZIJN REDELIJKE STANDAARDWAARDEN,
 * GEEN WET. Ze gaan uit van een Belgisch klimaat en een mix van potten en
 * volle grond. De echte intervallen hangen af van je grond, je potten, hoe
 * zonnig de plek is en wat het weer doet. Pas ze gerust aan — dit bestand is
 * bedoeld om aangepast te worden. `npm run db:seed` opnieuw draaien werkt de
 * bestaande rijen bij zonder je planten of geschiedenis aan te raken.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  ActivityType,
  PlantCategory,
  Lifecycle,
} from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

type CareRuleSeed = {
  activityType: ActivityType;
  intervalDays: number;
  instructions: string;
};

type SpeciesSeed = {
  slug: string;
  name: string;
  emoji: string;
  category: PlantCategory;
  latinName: string;
  lifecycle: Lifecycle;
  sunlight: string;
  soil: string;
  waterNeeds: string;
  spacing: string;
  height: string;
  sowIndoorsFromMonth?: number;
  sowIndoorsToMonth?: number;
  sowOutdoorsFromMonth?: number;
  sowOutdoorsToMonth?: number;
  plantOutFromMonth?: number;
  plantOutToMonth?: number;
  harvestFromMonth?: number;
  harvestToMonth?: number;
  generalNotes: string;
  commonProblems: string;
  companionPlants: string;
  careRules: CareRuleSeed[];
};

const SPECIES: SpeciesSeed[] = [
  {
    slug: "sunflower",
    name: "Zonnebloem",
    emoji: "🌻",
    category: PlantCategory.FLOWER,
    latinName: "Helianthus annuus",
    lifecycle: Lifecycle.ANNUAL,
    sunlight: "Volle zon — minstens 6 à 8 uur direct zonlicht per dag.",
    soil: "Goed doorlatende grond. Verdraagt arme grond eens ze goed geworteld is, maar in pot heb je degelijke potgrond nodig.",
    waterNeeds: "Matig, maar diep",
    spacing: "30 – 60 cm tussen de planten, afhankelijk van de hoogte",
    height: "50 cm tot 3 m, afhankelijk van het ras",
    sowIndoorsFromMonth: 3,
    sowIndoorsToMonth: 4,
    sowOutdoorsFromMonth: 4,
    sowOutdoorsToMonth: 6,
    plantOutFromMonth: 5,
    plantOutToMonth: 6,
    harvestFromMonth: 9,
    harvestToMonth: 10,
    commonProblems:
      "Slakken vreten jonge zaailingen in één nacht op — bescherm ze de eerste weken. Hoge planten waaien om zonder steun. Meeldauw (witte poederlaag op het blad) komt voor bij droogte in combinatie met weinig luchtcirculatie.",
    companionPlants:
      "Goed samen met courgette en komkommer (de bloemen lokken bestuivers). Niet vlak naast aardappelen zetten.",
    generalNotes:
      "Een eenjarige: ze groeit, bloeit, zet zaad en sterft in één seizoen. Hoge variëteiten worden topzwaar en hebben meestal steun nodig voor ze heuphoogte bereiken. Na de bloei kan je de bloemkop laten staan voor de vogels, of drogen voor het zaad — archiveer de plant hier daarna. 'Oogsten' slaat hier op het zaad, niet op een doorlopende oogst.",
    careRules: [
      {
        activityType: ActivityType.WATERING,
        intervalDays: 3,
        instructions:
          "Geef water aan de voet tot de grond goed doorweekt is. Zonnebloemen wortelen diep en hebben liever om de paar dagen een stevige beurt dan elke dag een beetje. Zaailingen en planten in pot drogen sneller uit — controleer die dagelijks bij warm weer.",
      },
      {
        activityType: ActivityType.FERTILIZING,
        intervalDays: 21,
        instructions:
          "Geef verdunde universele vloeibare meststof zodra de plant kniehoog is. Wees zuinig met stikstofrijke mest later in het seizoen — dat geeft veel blad en weinig bloem.",
      },
    ],
  },
  {
    slug: "tomato",
    name: "Tomaat",
    emoji: "🍅",
    category: PlantCategory.VEGETABLE,
    latinName: "Solanum lycopersicum",
    lifecycle: Lifecycle.ANNUAL,
    sunlight:
      "Volle zon — minimaal 6 à 8 uur. Een warme, beschutte plek of een serre is ideaal in België.",
    soil: "Rijke, goed doorlatende potgrond. Gelijkmatig vochtig, nooit doorweekt.",
    waterNeeds: "Veel en vooral regelmatig",
    spacing: "45 – 60 cm tussen de planten",
    height: "Struiktomaat 50 – 80 cm, hoge rassen tot 2 m",
    sowIndoorsFromMonth: 2,
    sowIndoorsToMonth: 4,
    plantOutFromMonth: 5,
    plantOutToMonth: 6,
    harvestFromMonth: 7,
    harvestToMonth: 10,
    commonProblems:
      "Phytophthora (bruine vlekken op blad en vrucht) na een natte periode — hou blad droog. Neusrot (zwarte plek onderaan) komt door onregelmatig water geven, niet door ziekte. Gebarsten vruchten na een plotse plensbui op droge grond. Witte vlieg in de serre.",
    companionPlants:
      "Basilicum en Oost-Indische kers ernaast helpen tegen ongedierte. Hou ze weg bij aardappelen: dezelfde ziektes.",
    generalNotes:
      "Het belangrijkste wat je voor tomaten kan doen is gelijkmatig water geven. Afwisselend kletsnat en kurkdroog veroorzaakt gebarsten vruchten en neusrot (die zwarte leerachtige plek onderaan). Phytophthora is het andere risico in een natte Belgische zomer — hou het blad droog en zorg voor luchtcirculatie.",
    careRules: [
      {
        activityType: ActivityType.WATERING,
        intervalDays: 2,
        instructions:
          "Geef 's ochtends water aan de voet — nooit over het blad, want nat blad lokt phytophthora. Streef naar gelijkmatig vochtige grond. Planten in pot of groeizak hebben in volle zomer soms elke dag water nodig.",
      },
      {
        activityType: ActivityType.FERTILIZING,
        intervalDays: 7,
        instructions:
          "Zodra de eerste bloemen vrucht zetten, wekelijks bijmesten met kaliumrijke tomatenmest. Hou je aan de dosering op de fles — meer is niet beter en kan de wortels verbranden.",
      },
      {
        activityType: ActivityType.PRUNING,
        intervalDays: 7,
        instructions:
          "Bij hoge (stam)rassen: knijp de dieven uit die verschijnen in de 'V' waar een bladtak op de hoofdstengel zit. Struiktomaten laat je met rust. Verwijder in beide gevallen vergeelde onderste bladeren, zodat er lucht rond de voet blijft circuleren.",
      },
      {
        activityType: ActivityType.HARVESTING,
        intervalDays: 3,
        instructions:
          "Pluk wanneer de vrucht volledig gekleurd is en licht meegeeft als je er zachtjes in knijpt. Draai ze los zodat het groene kroontje eraan blijft. Regelmatig plukken zet de plant aan om meer te maken.",
      },
    ],
  },
  {
    slug: "chives",
    name: "Bieslook",
    emoji: "🧅",
    category: PlantCategory.HERB,
    latinName: "Allium schoenoprasum",
    lifecycle: Lifecycle.PERENNIAL,
    sunlight:
      "Volle zon tot lichte schaduw. Voelt zich thuis op de vensterbank én buiten.",
    soil: "Vochtig maar goed doorlatend. Erg vergevingsgezind.",
    waterNeeds: "Matig",
    spacing: "20 – 25 cm tussen de pollen",
    height: "20 – 30 cm",
    sowIndoorsFromMonth: 3,
    sowIndoorsToMonth: 4,
    sowOutdoorsFromMonth: 4,
    sowOutdoorsToMonth: 6,
    plantOutFromMonth: 4,
    plantOutToMonth: 9,
    harvestFromMonth: 4,
    harvestToMonth: 10,
    commonProblems:
      "Bijna probleemloos. Bij aanhoudende droogte wordt het blad taai en draderig. Roest (oranje stipjes) kan opduiken in een natte zomer — knip aangetast blad weg. Een te dichte oude pol vergrast; splits ze om de 2 à 3 jaar.",
    companionPlants:
      "Goed bij wortelen en tomaten. Naast bonen en erwten liever niet — uiachtigen remmen die.",
    generalNotes:
      "Een winterharde vaste plant — ze sterft in de winter bovengronds af en komt in de lente vanzelf terug, dus niet panikeren en niet archiveren. De paarse bloemen zijn eetbaar en lekker in salade, al wordt het blad taaier zodra ze bloeit. Om de paar jaar kan je de pol uitgraven en splitsen.",
    careRules: [
      {
        activityType: ActivityType.WATERING,
        intervalDays: 3,
        instructions:
          "Hou de grond licht vochtig. Bieslook is taai, maar het blad wordt slap en draderig als het volledig uitdroogt. Geef water aan de voet.",
      },
      {
        activityType: ActivityType.FERTILIZING,
        intervalDays: 42,
        instructions:
          "Een lichte vloeibare bemesting om de zes weken tijdens het groeiseizoen volstaat ruim. Te veel mest geeft slappe groei met veel minder smaak.",
      },
      {
        activityType: ActivityType.HARVESTING,
        intervalDays: 14,
        instructions:
          "Knip de buitenste sprieten met een schaar af tot zo'n 5 cm boven de grond. Scheer nooit de hele pol vlak — neem van de buitenkant en laat het hart doorgroeien. Regelmatig knippen houdt de aanwas op gang.",
      },
    ],
  },
  {
    slug: "parsley",
    name: "Peterselie",
    emoji: "🌿",
    category: PlantCategory.HERB,
    latinName: "Petroselinum crispum",
    lifecycle: Lifecycle.BIENNIAL,
    sunlight: "Volle zon tot halfschaduw. Verdraagt minder licht dan basilicum.",
    soil: "Rijk en vochthoudend, maar toch goed doorlatend.",
    waterNeeds: "Veel — mag niet uitdrogen",
    spacing: "20 – 25 cm tussen de planten",
    height: "25 – 40 cm",
    sowIndoorsFromMonth: 2,
    sowIndoorsToMonth: 4,
    sowOutdoorsFromMonth: 4,
    sowOutdoorsToMonth: 7,
    plantOutFromMonth: 4,
    plantOutToMonth: 8,
    harvestFromMonth: 5,
    harvestToMonth: 11,
    commonProblems:
      "Trage kieming (3 tot 5 weken) doet mensen te vroeg opgeven. Doorschieten (bloemstengel) in het tweede jaar maakt het blad bitter — dan opnieuw zaaien. Wortelvlieg kan de wortels aantasten; wissel elk jaar van plek.",
    companionPlants:
      "Goed bij tomaten, wortelen en asperges. Niet vlak naast sla zetten.",
    generalNotes:
      "Technisch gezien tweejarig: het eerste jaar blad, het tweede jaar bloei en zaad, waarna het blad bitter wordt. De meeste mensen behandelen ze als eenjarige en zaaien elk voorjaar opnieuw. Ze kiemt traag — dat is normaal, niet mislukt.",
    careRules: [
      {
        activityType: ActivityType.WATERING,
        intervalDays: 2,
        instructions:
          "Hou ze gelijkmatig vochtig. Peterselie verwelkt snel en blijft daarna een tijd mokken. Geef water aan de voet, en vaker in pot of bij warm weer.",
      },
      {
        activityType: ActivityType.FERTILIZING,
        intervalDays: 21,
        instructions:
          "Een evenwichtige vloeibare meststof om de drie weken houdt de bladproductie op gang.",
      },
      {
        activityType: ActivityType.HARVESTING,
        intervalDays: 10,
        instructions:
          "Snijd hele stengels aan de buitenkant van de plant helemaal onderaan af, in plaats van losse blaadjes van bovenaf te plukken. Zo blijft het groeiende hart intact en de plant productief.",
      },
    ],
  },
  {
    slug: "basil",
    name: "Basilicum",
    emoji: "🍃",
    category: PlantCategory.HERB,
    latinName: "Ocimum basilicum",
    lifecycle: Lifecycle.ANNUAL,
    sunlight:
      "Volle zon en warmte. Een lichte vensterbank binnen doet het meestal beter dan een Belgische tuin.",
    soil: "Lichte, goed doorlatende potgrond. Heeft een hekel aan natte voeten.",
    waterNeeds: "Matig — liever te droog dan te nat",
    spacing: "20 – 25 cm tussen de planten",
    height: "30 – 50 cm",
    sowIndoorsFromMonth: 3,
    sowIndoorsToMonth: 6,
    plantOutFromMonth: 6,
    plantOutToMonth: 7,
    harvestFromMonth: 6,
    harvestToMonth: 9,
    commonProblems:
      "Omvalziekte bij te nat en te koud staan — de stengel knijpt dicht bij de grond. Slappe, ijle planten door te weinig licht. Slakken zijn er dol op buiten. Onder de 10 °C stopt de groei helemaal.",
    companionPlants:
      "De klassieker naast tomaten, in de tuin én op het bord. Ook goed bij paprika. Niet naast rucola.",
    generalNotes:
      "Basilicum is een mediterrane plant die niet houdt van koude, natte voeten en koude nachten — onder een graad of 10 stopt ze met groeien en gaat ze mokken. Potjes uit de supermarkt zijn eigenlijk tientallen zaailingen op elkaar gepropt; die opsplitsen in kleinere plukjes geeft veel langer levende planten.",
    careRules: [
      {
        activityType: ActivityType.WATERING,
        intervalDays: 2,
        instructions:
          "Geef 's ochtends water aan de voet en laat de bovenlaag van de potgrond licht opdrogen tussen twee beurten. Natte wortels doden basilicum veel sneller dan droge — laat ze nooit in een volle schotel staan.",
      },
      {
        activityType: ActivityType.FERTILIZING,
        intervalDays: 21,
        instructions:
          "Een zwakke, evenwichtige bemesting om de drie weken. Veel stikstof geeft grote bladeren met flauwe smaak.",
      },
      {
        activityType: ActivityType.PRUNING,
        intervalDays: 10,
        instructions:
          "Knijp de groeitop uit net boven een bladpaar — zo vertakt de plant in plaats van lang en ijl te worden. Knijp bloemknoppen weg zodra je ze ziet, anders wordt het blad bitter.",
      },
      {
        activityType: ActivityType.HARVESTING,
        intervalDays: 7,
        instructions:
          "Pluk van boven naar beneden: neem de top en het bladpaar eronder. Stroop de grote onderste bladeren niet af — dat is de motor van de plant.",
      },
    ],
  },
];

async function main() {
  for (const s of SPECIES) {
    // careRules must not be spread onto the Species row — it's a relation, not a column.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { slug, careRules, ...fields } = s;

    const species = await prisma.species.upsert({
      where: { slug },
      create: { slug, ...fields, isBuiltIn: true },
      update: { ...fields, isBuiltIn: true },
    });

    for (const rule of s.careRules) {
      await prisma.careRule.upsert({
        where: {
          speciesId_activityType: {
            speciesId: species.id,
            activityType: rule.activityType,
          },
        },
        create: { speciesId: species.id, ...rule },
        update: {
          intervalDays: rule.intervalDays,
          instructions: rule.instructions,
        },
      });
    }

    // Drop rules that were removed from this file, so the DB always matches it.
    await prisma.careRule.deleteMany({
      where: {
        speciesId: species.id,
        activityType: { notIn: s.careRules.map((r) => r.activityType) },
      },
    });

    console.log(`  ${s.emoji} ${s.name} — ${s.careRules.length} verzorgingsregels`);
  }
}

main()
  .then(async () => {
    console.log("Seed klaar.");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
