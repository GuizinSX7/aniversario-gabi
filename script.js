const player = document.getElementById("player");
const lyricsDiv = document.getElementById("lyrics");

// Conteúdo do seu LRC com estrofes
const lrc = `
[00:12.85]And now, I don't know why she wouldn't say goodbye
[00:18.36]But then, it seems that I had seen it in her eyes
[00:23.51]Though it might not be wise, I'd still have to try
[00:28.18]With all the love I have inside, I can't deny
[00:33.88]I just can't let it die, 'cause her heart's just like mine
[0m:39.99]And she holds her pain inside

[00:44.01]So, if you ask me why she wouldn't say goodbye
[00:50.30]I know somewhere inside
[00:54.42]There is a special light still shining bright
[00:59.09]And even on the darkest night, she can't deny

[01:05.86]So, if she's somewhere near me, I hope to God she hears me
[01:11.02]There's no one else could ever make me feel I'm so alive
[01:16.13]I hoped she'd never leave me, please, God, you must believe me
[01:21.15]I've searched the universe and found myself within her eyes

[01:48.10]No matter how I try, you say it's all a lie
[01:53.41]So what's the use of my confessions to a crime
[01:58.64]Of passions that won't die, in my heart?

[02:10.00]So, if she's somewhere near me, I hope to God she hears me
[02:15.15]There's no one else could ever make me feel I'm so alive
[02:20.42]I hoped she'd never leave me, please, God, you must believe me
[02:25.37]I've searched the universe and found myself within her eyes

[03:51.11]So, if she's somewhere near me, I hope to God she hears me
[03:56.03]There's no one else could ever make me feel I'm so alive
[04:03.52]I hoped she'd never leave me, please, God, you must believe me
[04:08.63]I've searched the universe and found myself within her eyes

[04:36.21]So, now I don't know why she wouldn't say goodbye
[04:41.65]It just might be that I had seen it in her eyes
[04:46.69]And now, it seems that I gave up my ghost of pride
[04:53.10]I'll never say goodbye
`;

// Função para processar o LRC e dividir por estrofes
const createLyrics = (lrcContent) => {
    // Separa o texto em estrofes usando linhas em branco
    const stanzas = lrcContent.trim().split(/\n\s*\n/);
    
    return stanzas.map(stanza => {
        // Para cada estrofe, separa as linhas e processa cada uma
        const lines = stanza.trim().split("\n");
        const parsedLines = lines.map(line => {
            const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
            if (match) {
                const time = parseInt(match[1]) * 60 + parseFloat(match[2]);
                const text = match[3].trim();
                return { time, text };
            }
            return null;
        }).filter(line => line !== null);
        
        // Retorna a estrofe com seu tempo de início e as linhas
        return {
            startTime: parsedLines[0] ? parsedLines[0].time : null,
            lines: parsedLines
        };
    });
};

const lyrics = createLyrics(lrc);

// Variável para rastrear a estrofe ativa e a linha ativa
let currentStanzaIndex = -1;
let currentActiveLine = null;

const updateLyrics = () => {
    const currentTime = player.currentTime;
    
    // Encontra o índice da estrofe atual
    const nextStanzaIndex = lyrics.findIndex(stanza => {
        const nextStanzaTime = lyrics[lyrics.indexOf(stanza) + 1] ? lyrics[lyrics.indexOf(stanza) + 1].startTime : Infinity;
        return currentTime >= stanza.startTime && currentTime < nextStanzaTime;
    });
    
    // Se a estrofe mudou, atualiza o conteúdo da div
    if (nextStanzaIndex !== currentStanzaIndex) {
        currentStanzaIndex = nextStanzaIndex;
        lyricsDiv.innerHTML = ''; // Limpa o conteúdo anterior
        
        if (lyrics[currentStanzaIndex]) {
            lyrics[currentStanzaIndex].lines.forEach(line => {
                const p = document.createElement("p");
                p.innerText = line.text;
                lyricsDiv.appendChild(p);
                // Armazena o elemento DOM na linha para fácil acesso
                line.element = p;
            });
        }
    }
    
    // Encontra a linha de letra correspondente ao tempo atual
    if (currentStanzaIndex !== -1 && lyrics[currentStanzaIndex]) {
        const currentLine = lyrics[currentStanzaIndex].lines.filter(l => l.time <= currentTime).pop();
        
        // Se a linha atual for diferente da que está ativa...
        if (currentLine && currentLine.element !== currentActiveLine) {
            // Remove o destaque da linha anterior (se houver)
            if (currentActiveLine) {
                currentActiveLine.classList.remove('active');
            }
            
            // Adiciona o destaque à nova linha
            currentLine.element.classList.add('active');
            currentActiveLine = currentLine.element;
        }
    }
};

// Adiciona os event listeners
player.addEventListener("timeupdate", updateLyrics);

// Limpa o conteúdo e o destaque ao final da música
player.addEventListener("ended", () => {
    lyricsDiv.innerHTML = '';
});

// Limpa o conteúdo e o destaque ao procurar um novo tempo
player.addEventListener("seeked", () => {
    currentStanzaIndex = -1; // Reseta o índice da estrofe para forçar a re-renderização
    updateLyrics();
});