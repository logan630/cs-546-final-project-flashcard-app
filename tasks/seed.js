const dbConnection = require('../config/mongoConnection');
const data=require('../data')
const users=data.users
const decks=data.decks
const folders=data.folders
const validation=require('../validation')
//warning: This file contains several corny refrences to things that I (Daniel) like. It was also written between 4 amd 8 am the day the project was due
async function main() {
    const db=await dbConnection.dbConnection()
    await db.dropDatabase();
    console.log("Login credentials are given in the seed file. In the 'createUser' function, the first parameter is the username, and the second parameter is the password")
    //users
    let user1=undefined; let user2=undefined; let Daniel=undefined; let Moxxie=undefined; let Restuko=undefined; let Chidi=undefined;
    try{user1=await users.createUser("user1","1ASSword!")}catch(e){console.log(e)}
    try{user2=await users.createUser("UseR2","Pass9(")}catch(e){console.log(e)}
    try{Daniel=await users.createUser("Daniel","Class0)")}catch(e){console.log(e)}
    try{Moxxie=await users.createUser("Moxxie","Imps9(")}catch(e){console.log(e)}
    //try{Millie=await users.createUser("Millie","Sheimp0)")}catch(e){console.log(e)}
    try{Retsuko=await users.createUser("Retsuko","Ha1da!")}catch(e){console.log(e)}
    try{Chidi=await users.createUser("Chidi","Anagony3!")} catch(e){console.log(e)}
    let user1id=await users.getUserIdFromName("user1");
    let user2id=await users.getUserIdFromName("user2");
    let Danielid=await users.getUserIdFromName("Daniel");
    let Moxxieid=await users.getUserIdFromName("Moxxie");
    let Retsukoid=await users.getUserIdFromName("Retsuko");
    let Chidiid=await users.getUserIdFromName("chidi");

    //decks
    try{await decks.createDeck("user1","My first deck","Nothing",true,[
        {front:"I am a new user",back:"How may I help you?"},
        {front:"What is my favorite color?",back:"Blue!"},
        {front:"What is ChatGPT",back:"A chatbot that can answer questions with good prompts"},
        {front:"What does the fox say?",back:"Go back to 2013"},
        {front:"What is 2+2+2+2?",back:"It is 8"},
        {front:"How many raw eggs do I consume on a daily basis?",back:"More than 0"},
        {front:"Who is the best professor",back:"Patrick Hill"},
        {front:"What CPU powered the Samsung Galaxy S6",back:"Samsung Exynos 7420"},
        {front:"Jesse",back:"Pinkman"}
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("user1","Song lyrics","Songs I like",true,[
        {front:"Everything you say to me",back:"Takes me one step closer to the edge, and I'm about to break"},
        {front:"Shot down in daylight",back:"My bullets are songs on the radio"},
        {front:"So thank you, for coming to my birthday party",back:"I'm one minute old today"},
        {front:"The voices in my head keep on telling me I'm cursed",back:"I'm paranoid, I don't wanna make it any worse"},
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("user1","An","Rhymes",false,[
        {front:"Man",back:"Woman"},
        {front:"Bran",back:"Muffin"},
        {front:"Toucan",back:"Sam"},
        {front:"Tan",back:"sine/cosine"},
        {front:"Dan",back:"Craig"},
        {front:"Gan",back:"356 M"},
        {front:"Pan",back:"Potts"},
        {front:"Jan",back:"uary"},
        {front:"NaN",back:"Not a number"},
        {front:"Iran",back:"A country in the middle east"}
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("USeR1","Another first deck","shorts",false,[
        {front:"Heat waves",back:"Be fakin me out"},
        {front:"Wellsley farms",back:"Tavern blend"},
        {front:"Water freezes at: ",back:"32 degrees F"},
        {front:"What is a segmentation fault",back:"When you do something illegal with pointers"}
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("user2","User2 private dek","more stuff",false,[
        {front:"Are ionic or colavent bonds stronger?",back:"covalent"},
        {front:"What is the best programming language?",back:"Javascript"},
        {front:"Who is my idol",back:"The American one"},
        {front:"What will the Turing machine do?",back:"M1 will"},
        {front:"What is the composiiton of water?",back:"H20"},
        {front:"What is John's favorite color",back:"purple"},
        {front:"To be?",back:"Or not to be?"},
        {front:"What is the meaning of life?",back:"Being happy (?)"},
        {front:"Who is the best web developer?",back:"A spider. They've been doing it for years"}
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("user2","Science things","Science",true,[
        {front:"Wax, grease, fat",back:"Lipids"},
        {front:"Hypothesis",back:"Something that you want to test for if it's true"},
        {front:"What was Albert's last name?",back:"Einstein"},
        {front:"What country did a lot of cool math stuff?",back:"Greece, probably"},
        {front:"Safest way to smell chemicals in a lab?",back:"Waft the fumes from over the beaker. Do not sniff directly"}
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("Daniel","About Daniel","Random Trivia",true,[
        {front:"What phone do I have?",back:"Samsung Galaxy S10 plus"},
        {front:"What is my favorite car and color?",back:"Subaru WRX. World rally blue"},
        {front:"What is my favorite programming language?",back:"Python"},
        {front:"What month was I born in",back:"January"},
        {front:"I have been out of the country before",back:"True"},
        {front:"What is my favorite show?",back:"Helluva Boss"},
        {front:"How tall am I?",back:"6 big ol' American feet tall"},
        {front:"What is my best time for solving a rubik's cube?",back:"31 seconds"},
        {front:"What day did I get my Eagle Scout Award?",back:"January 17, 2019"},
        {front:"Programming languages I know",back:"Java, Python, Javascript, C, C++, C#, Bash, SQL, OCaml, HTML, Scheme, LaTeX"},
        {front:"Favorite obscure band",back:"New Politics"},
        {front:"Game with most hours",back:"Terraria"},
        {front:"My smash bros main",back:"ROB"}
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("Daniel","Songs 1","Songs I like",true,[
        {front:"New Politics",back:"CIA, One of Us"},
        {front:"Falling in Reverse",back:"Popular Monster, Voices in my head, Zombified"},
        {front:"All Time Low",back:"A Love Like War"},
        {front:"Fall Out Boy",back:"Centuries, Thnks fr th Mmrs, Light Em Up"},
        {front:"The Offspring",back:"Let The Bad Times Roll, The Kids Aren't Alright, Self Esteem"}
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("Daniel","Songs 2","Songs I like",true,[
        {front:"Panic! At the Disco",back:"High Hopes, Saturday Night"},
        {front:"Fister the People",back:"Sit Next to me"},
        {front:"Twenty One Pilots",back:"Stressed Out, Lane Boy"},
        {front:"AJR",back:"100 Bad Days, Birthday Party"},
        {front:"Glass Animals",back:"Heat Waves"}
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("Daniel","Stevens Classes","Academics",false,[
        {front:"CS 115",back:"Intro to Computer Science"},
        {front:"CS 284",back:"Data Structures"},
        {front:"CS 385",back:"Algorithms"},
        {front:"CS 392",back:"Systems Programming"},
        {front:"CS 334",back:"Theory of Computation"},
        {front:"CS 516",back:"Compiler Design and Implementation"},
        {front:"CS 492",back:"Operating Systems"},
        {front:"CS 677",back:"Parallel Programming for many-core processors"}
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("Daniel","Long deck 1","pants",false,[
        {front:"01",back:"AB"},
        {front:"CD",back:"EF"},
        {front:"GH",back:"IJ"},
        {front:"KL",back:"MN"},
        {front:"OP",back:"QR"},
        {front:"ST",back:"UV"},
        {front:"WX",back:"YZ"},
        {front:"Hydrogen peroxide",back:"H2O2"},
        {front:"Yankees",back:"Baseball"},
        {front:"Owen Wilson",back:"Lightning McQueen"},
        {front:"Edward Norton",back:"Deranged, disturbed character"},
        {front:"Daniel Craig",back:"James Bond, Knives Out"},
        {front:"Acorn",back:"Oak tree"},
        {front:"Engine in 4th gen WRX",back:"FA20DIT turbocharged 2.0L Boxer 4 cylinder"},
        {front:"Best snake",back:"Python"},
        {front:"Am I an enthusiast?",back:"True"},
        {front:"Do I watch anime?",back:"No"},
        {front:"Favorite cheap food",back:"Spicy ramen"},
        {front:"Amdahl's law",back:"The amount of gain you can get from parallelizing a workload where a certain percentage is parallelizable"},
        {front:"What is my code for a one line leetcode solution?",back:"return len(list(filter(lambda x:x=='1',str(format(n,'b')))))"}
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("Daniel","Short deck 1","shorts",false,[
        {front:"Batman",back:"Robin"},
        {front:"Rubik's",back:"cube"},
        {front:"Peanut Butter",back:"Jelly"}
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("Daniel","Car facts","Random Trivia",true,[
        {front:"Is the Honda V6 a single or dual overhead cam?",back:"Single overhead camshaft"},
        {front:"What was the first model year of the mustang?",back:"1964"},
        {front:"Displacement of the Gm 5 cylinder?",back:"3.7 Liters"},
        {front:"What engine layout is used in FWD cars?",back:"Transverse. The engine is turned sideways to spin the front wheels."},
        {front:"Name the 4 engine strokes",back:"Intake, compression, power, exhaust"},
        {front:"What is the redline on the Honda S2000?",back:"9000 RPM for the first generation, and 8300 RPM for the second"}
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("Daniel","Places I've been","About me",false,[
        {front:"United States",back:"NJ, NY, FL, UT, CA, PA, MD"},
        {front:"Europe",back:"Italy, France, Spain"},
        {front:"Caribbean",back:"Jamaica, Puerto Rico, St. Thomas, St. Maarten, St. Lucia, Barbados, Bermuda"},
        {front:"Mexico",back:"Cozumel, Xcaret"}
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("Moxxie","Helluva Nonsense","Random Trivia",false,[
        {front:"Moxxie's wife",back:"Millie"},
        {front:"Who does Stolas hate the most?",back:"Stella"},
        {front:"Is Moxxie and Millie's relationship healthy?",back:"YES"},
        {front:"What episode did Moxxie wear a dress?",back:"Episode 6"},
        {front:"What is one thing Moxxie likes?",back:"Musical theater"}
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("Moxxie","Helluva Boss Members","Random Trivia",true,[
        {front:"Vivienne Medrano",back:"Producer"},
        {front:"Brandon Rogers",back:"Blitzo"},
        {front:"Erica Lindbeck",back:"Loona"},
        {front:"Richard Horvitz",back:"Moxxie"},
        {front:"Norman Reedus",back:"Striker"},
        {front:"Vivian Nixon",back:"Millie"},
        {front:"Bryce Pinkham",back:"Stolas"}
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("Retsuko","Aggretsuko facts","Random Trivia",true,[
        {front:"What does Aggretsuko mean?",back:"It means aggresive Retsuko. Rage"},
        {front:"Who is Retsuko's boss?",back:"Mr. Ton"},
        {front:"What device does Mr. Ton use?",back:"Abacus"},
        {front:"How many boyfriends has Retsuko had?",back:"Two boyfriends"},
        {front:"Who is Retsuko's not-so-secret admirer?",back:"Haida"},
        {front:"What is Retsuko's 'secret' trait?",back:"Being a hardcore rockstar"}
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("Retsuko","Other stuff","Misc",false,[
        {front:"Main plot of first episode?",back:"She wore crocs to work"},
        {front:"What company made Aggretsuko?",back:"Sanrio"},
        {front:"How old is Retsuko?",back:"25 years old"},
        {front:"Is Retsuko okay with being unmarried?",back:"False"}
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("Chidi","I can't decide","Nothing",false,[
        {front:"Muffin",back:"Blueberry or chocolate chip?"},
        {front:"Soulmate",back:"Eleanor Shellstrop"},
        {front:"Air conditioner",back:"Falls from second story window"},
        {front:"Trolley problem",back:"Could not decide"},
        {front:"The Good Place",back:"The Bad Place"}
    ])}catch(e){console.log(e)}
    try{await decks.createDeck("Chidi","Empty Deck","Nothing",true,[])}catch(e){console.log(e)}
    //folders
    try{await folders.createFolder("My stuff",Danielid) }catch(e){console.log(e)}
    try{await folders.createFolder("My stuff2",Danielid) }catch(e){console.log(e)}

    console.log("Done seeding database")
    await dbConnection.closeConnection();
}

main();