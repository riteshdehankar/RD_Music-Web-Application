console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2,'0')}:${String(remainingSeconds).padStart(2,'0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []

    for (let index = 0; index < as.length; index++) {
        let element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUL = document.querySelector(".songList ul")
    songUL.innerHTML = ""

    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" width="34" src="img/music.svg">
            <div class="info">
                <div>${song.replaceAll("%20"," ")}</div>
                <div>Harry</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg">
            </div>
        </li>`;
    }

    Array.from(document.querySelectorAll(".songList li")).forEach(li=>{
        li.addEventListener("click",()=>{
            playMusic(li.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    });

    return songs;
}

const playMusic = (track,pause=false)=>{
    currentSong.src = `/${currFolder}/` + track
    if (!pause){
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")

    Array.from(anchors).forEach(async e=>{
        if(e.href.includes("/songs") && !e.href.includes(".htaccess")){
            let folder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`/songs/${folder}/info.json`)
            let meta = await a.json();

            cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000"
                        stroke-width="1.5" stroke-linejoin="round"/>
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpg">
                <h2>${meta.title}</h2>
                <p>${meta.description}</p>
            </div>`
        }
    })

    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])   // autoplay continues
        })
    })
}

async function main() {
    await getSongs("songs/ncs")
    playMusic(songs[0], false)   // SO SONG STARTS AND CONTINUES
    await displayAlbums()

    play.addEventListener("click",()=>{
        if (currentSong.paused){
            currentSong.play()
            play.src = "img/pause.svg"
        } else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate",()=>{
        document.querySelector(".songtime").innerHTML =
        `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`

        document.querySelector(".circle").style.left =
            (currentSong.currentTime/currentSong.duration)*100 + "%"
    })

    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent = (e.offsetX/e.target.clientWidth)*100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration*percent)/100;
    })

    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    previous.addEventListener("click",()=>{
        let index = songs.indexOf(currentSong.src.split("/").pop())
        if(index > 0) playMusic(songs[index-1])
    })

    next.addEventListener("click",()=>{
        let index = songs.indexOf(currentSong.src.split("/").pop())
        if(index < songs.length-1) playMusic(songs[index+1])
    })

    document.querySelector(".range input").addEventListener("change",e=>{
        currentSong.volume = e.target.value/100
    })
    currentSong.addEventListener("ended", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());
    if (index < songs.length - 1) {
        playMusic(songs[index + 1]);
    }
});


    document.querySelector(".volume img").addEventListener("click",e=>{
        if(e.target.src.includes("volume")){
            e.target.src = e.target.src.replace("volume","mute")
            currentSong.volume = 0
            document.querySelector(".range input").value = 0
        } else {
            e.target.src = e.target.src.replace("mute","volume")
            currentSong.volume = .10
            document.querySelector(".range input").value = 10
        }
    })
}

main()
